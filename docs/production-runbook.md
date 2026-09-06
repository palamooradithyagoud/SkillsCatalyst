# SkillsCatalyst — Production Operational Runbook
**Document Version:** 1.0.0 (Phase 3.3 Production Baseline)  
**System Classification:** Single-Service FastAPI Backend + Next.js Frontend  
**Hosting Environment:** Railway (Backend Container) + Vercel / Cloudflare Pages / Railway (Frontend Next.js)  
**External Dependencies:** Supabase (PostgreSQL + Auth), Upstash Redis (Distributed Cache & Rate Limiting), Groq API (LLM Inference), YouTube Data API v3 (Curated Learning Fallback), Resend (Transactional Email)

---

## 1. Quick Emergency Reference

| Severity | Description | Immediate Action | Primary Metrics / Log Filter |
|---|---|---|---|
| **SEV-1** | Full Service Outage / Backend 5xx Spike | Check `/health`, Railway deployment health, rollback if bad deploy | `status:500`, `error_requests_total` in `/api/metrics` |
| **SEV-2** | Supabase Database Degradation / Unreachable | Verify Supabase status; system degrades to CSV search & local progress | `/health` -> `database: "error"` |
| **SEV-3** | Upstash Redis Down / Connection Timeout | Automatic fallback to process-local cache & in-memory sliding window rate limits | `/health` -> `redis: "error"`, `cache_errors_total` |
| **SEV-4** | Groq AI Rate Limited (429) or Outage | Automatic fallback model cascade (`llama-3.3-70b` → `llama-3.1-8b` → polite message) | `ai_errors_total`, `ai_timeouts_total` in `/api/metrics` |

---

## 2. Incident Triage Workflow

When an alert or user report occurs, follow this standard 4-step triage sequence:

### Step 1: Health Probe Check
Probe the backend health endpoint:
```bash
curl -i -s https://<backend-host>/health
```
**Expected Healthy Output (HTTP 200):**
```json
{
  "status": "ok",
  "environment": "production",
  "database": "ok",
  "redis": "ok"
}
```
**Interpretation:**
- If HTTP 500 or timeout: Backend process is dead, crashing on boot, or proxy/ingress failed.
- If `database: "error"`: Supabase connection failed or connection pool exhausted.
- If `redis: "error"`: Redis cache unreachable (backend continues operating using in-memory fallbacks).

### Step 2: System Telemetry & Metrics Probe
Query the real-time in-memory observability endpoint:
```bash
curl -s https://<backend-host>/api/metrics | jq .
```
Examine key health signals:
- `http.error_rate_pct`: If > 1%, investigate 5xx endpoints.
- `http.rate_limited_429`: Cumulative count of throttled clients.
- `http.latency_p95_ms` / `http.latency_p99_ms`: Normal is < 50ms for cached/static endpoints; > 1000ms indicates downstream blocking.
- `cache.hit_rate_pct`: Normal is > 60% after warmup.
- `ai.errors_total` and `ai.timeouts_total`: Evaluates external LLM pressure.

### Step 3: Log Inspection & Request Correlation Tracing
Every request passing through SkillsCatalyst is tagged with a UUID4 `X-Request-ID`.

1. **Locate the Request ID**:
   - If user reports an error screen: the modal/toast or error JSON body contains `"request_id": "<uuid>"`.
   - In browser DevTools Network tab: inspect response header `X-Request-ID`.
2. **Filter Logs in Railway**:
   In the Railway logs dashboard or CLI:
   ```bash
   railway logs | grep "<uuid>"
   ```
   All log lines associated with that request (request start, DB queries, external API calls, exception tracebacks, and response status) share the exact same `[<uuid>]` prefix:
   ```text
   2026-09-07 01:30:15,102 [INFO] backend.main [req_abc123]: GET /api/learning/search?query=python -> 200 OK (12.4ms)
   ```

---

## 3. Database Outage & Degradation Procedures (Supabase)

### Symptoms
- `/health` outputs `"database": "error"`.
- Log entries show `PostgreSQL connection failed`, `OperationalError: remaining connection slots are reserved`, or `httpx.ConnectTimeout` to Supabase REST.
- Endpoints requiring persistent writes (`/api/learning/save-progress`, `/auth/welcome-email`, `/api/practice/submit`) return HTTP 500.

### Immediate Degradation Behavior (Graceful Degradation)
SkillsCatalyst is engineered so that database downtime **does NOT** crash the application:
1. **Learning Search**: Operates normally using the bundled static CSV datasets (`data/youtube_learning_telugu.csv`) and cached entries.
2. **Practice Questions**: Operates normally using static company question banks (`data/company_questions.json`).
3. **Roadmap Generation**: Operates normally using static pre-computed templates.
4. **Video Progress**: The frontend `remoteSync.ts` saves progress locally in `localStorage` first. When the DB write fails, it queues and retries when connectivity restores without crashing video playback.

### Recovery Actions
1. **Check Supabase Status**: Visit [status.supabase.com](https://status.supabase.com).
2. **Check Connection Pool**:
   - Supabase free/pro tiers have connection limits. Ensure backend environment uses the Supabase **Transaction Pooler** (port `6543`) rather than direct Session connection (port `5432`).
   - Check if dangling connections or unclosed sessions exist in the Supabase Dashboard SQL Editor:
     ```sql
     SELECT count(*), state FROM pg_stat_activity GROUP BY state;
     ```
3. **Restart Backend Service**:
   If the database connection pool in the backend process became corrupted:
   ```bash
   railway restart
   ```

---

## 4. Redis Cache Outage Procedures (Upstash)

### Symptoms
- `/health` outputs `"redis": "error"`.
- Logs show `redis.exceptions.ConnectionError` or `ConnectionRefusedError`.

### Degraded State Verification
- The backend automatically detects Redis disconnection and falls back to:
  1. `backend.services.cache.InMemoryCache`: In-process LRU cache with TTL expiration.
  2. `backend.middleware.rate_limiter.InMemoryRateLimiter`: Sliding window rate limiting stored in process memory.
- **Zero user-facing 500 errors** will be thrown due to Redis being down.

### Recovery Actions
1. Verify Upstash Redis credentials in environment variables (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` or `REDIS_URL`).
2. If Upstash monthly command quota is exceeded, upgrade quota or leave backend running in in-memory fallback mode (adequate for single-dyno deployments up to 250 concurrent users).
3. Once Redis is reachable again, the client automatically reconnects on the next probe.

---

## 5. AI Provider Outage Procedures (Groq API)

### Symptoms
- `/api/metrics` displays increasing `ai.errors_total` or `ai.rate_limited_429`.
- Users report roadmaps or AI explanations taking > 15s or failing.

### System Fallback Mechanism
SkillsCatalyst implements an automatic multi-tier fallback:
1. **Primary Model**: `llama-3.3-70b-versatile` (high reasoning capability).
2. **Fast Fallback Model**: If Groq returns 429 (Rate Limit) or 503 (Overloaded), the backend automatically retries once against `llama-3.1-8b-instant` (lower latency, distinct quota pool).
3. **Graceful Error Catch**: If both fail or timeout exceeds 15 seconds, the backend returns a clean JSON error response with status 200/503 containing a curated static fallback roadmap/answer with `X-Request-ID` attached.

### Operational Actions
1. Check [status.groq.com](https://status.groq.com).
2. If API key quota is depleted, update `GROQ_API_KEY` in Railway Environment Variables.
3. Railway automatically redeploys within ~30 seconds of environment variable modification.

---

## 6. Deployment & Rollback Drill

### Standard Deployment Verification (Post-Deploy Smoke Check)
Whenever a new commit is merged to `main` and deployed to Railway:
```bash
# 1. Health Probe
curl -f -s https://<backend-host>/health || echo "HEALTH FAILED"

# 2. Search Verification (Static + Cached)
curl -f -s "https://<backend-host>/api/learning/search?query=python&language=english" | jq '.total'

# 3. Practice Verification
curl -f -s "https://<backend-host>/api/practice/questions/amazon" | jq '.company'

# 4. Metrics Check
curl -f -s "https://<backend-host>/api/metrics" | jq '.uptime_seconds'
```

### Emergency Rollback Procedure (Target Time: < 60 seconds)
If a deployment introduces a critical regression or fatal crash:
1. **Via Railway Dashboard**:
   - Navigate to **Project** → **backend** service.
   - Click the **Deployments** tab.
   - Locate the previous known-good deployment (e.g., tagged `commit 19f62b7`).
   - Click the three dots (`...`) next to that deployment and select **Rollback**.
   - Railway will re-route traffic to the previous Docker image within 15–30 seconds without rebuilding.
2. **Via Git Rollback**:
   ```bash
   git revert HEAD --no-edit
   git push origin main
   ```
3. **Database Migration Safety Rule**:
   - SkillsCatalyst strictly adheres to the **Expand / Contract** migration pattern.
   - New database columns must be added as `NULLABLE` or with `DEFAULT` values.
   - Never delete or rename active database columns in the same deployment as application code changes. This guarantees that rolling back backend application code will never break against the database schema.

---

## 7. Scaling Limits & Resource Ceilings

Based on empirical Phase 3.3 load testing benchmarks:
- **Max Safe Single-Dyno Concurrency**: **100 concurrent active users** (0% error rate, p95 latency < 50ms).
- **Saturation Point**: **250 concurrent users** on a single worker causes latency to rise (p95 > 250ms) and triggers rate-limit throttling (HTTP 429) for aggressive write spikes.
- **Scaling Action**: When sustained active users exceed 100 or CPU utilization on Railway exceeds 70%, increase Railway replica count from 1 to 2+ containers and configure Redis for shared state.
