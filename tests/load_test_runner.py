"""
SkillsCatalyst - Production Weighted Concurrency Load Test Runner
Phase 3.3 Observability & Performance Testing

Simulates realistic weighted user behavior:
- 30% Learning Search (CSV curated + Redis cached)
- 30% Video Playback Progress Persistence (/api/learning/save-progress)
- 15% Practice Interview Questions (/api/practice/questions/amazon)
- 10% Health & Observability Metrics (/health, /api/metrics)
- 10% Roadmaps & Aptitude Topic lookup (/api/practice/aptitude/percentages)
- 5%  Platform Information (/api/support/info)

Tested Concurrency Levels: 10, 25, 50, 100, 250
Measures: Throughput (RPS), p50, p95, p99 Latencies, 200 OK, 429 Throttled, 5xx Errors.
"""

import os
import sys
import time
import uuid
import random
import asyncio
import httpx
import statistics
from pathlib import Path
from typing import List, Dict, Any

# Ensure project root in sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)

from unittest.mock import MagicMock, patch
from backend.main import app

# In-memory mock for non-destructive local database operations
class _MockQueryBuilder:
    def __init__(self):
        self._data = []
    def select(self, *args, **kwargs):
        return self
    def eq(self, *args, **kwargs):
        return self
    def limit(self, *args, **kwargs):
        return self
    def order(self, *args, **kwargs):
        return self
    def execute(self):
        res = MagicMock()
        res.data = []
        return res
    def upsert(self, *args, **kwargs):
        return self
    def insert(self, *args, **kwargs):
        return self

class _MockSupabaseClient:
    def __init__(self):
        self._tables = {}
    def table(self, name: str):
        if name not in self._tables:
            self._tables[name] = _MockQueryBuilder()
        return self._tables[name]

_mock_sb_instance = _MockSupabaseClient()

# Global patches for safe, zero-network load testing
patch("backend.routers.learning.get_supabase", return_value=_mock_sb_instance).start()
patch("backend.services.learning.progress_service._get_sb", return_value=_mock_sb_instance).start()
patch("backend.services.supabase_service.get_supabase", return_value=_mock_sb_instance).start()

# Target URL or in-process ASGI transport
TARGET_URL = os.getenv("TARGET_URL", "").strip()


def _get_random_client_headers() -> dict:
    """Generates unique client headers to simulate distributed traffic."""
    ip_suffix = random.randint(1, 250)
    guest_uuid = uuid.uuid4().hex[:12]
    return {
        "X-Forwarded-For": f"198.51.100.{ip_suffix}",
        "x-session-id": f"guest_load_{guest_uuid}",
        "User-Agent": "SkillsCatalyst-LoadTester/1.0",
    }


# Realistic weighted workload pool
WORKLOAD_POOL = [
    # 1. 30% Learning Search (CSV curated + Cached)
    {"method": "GET", "path": "/api/learning/search?query=java&language=telugu", "name": "Search (CSV Telugu)", "weight": 15},
    {"method": "GET", "path": "/api/learning/search?query=fastapi&language=english", "name": "Search (FastAPI Eng)", "weight": 15},
    
    # 2. 30% Video Progress Persistence
    {
        "method": "POST",
        "path": "/api/learning/save-progress",
        "name": "Progress Save (Video)",
        "weight": 30,
        "body_factory": lambda: {
            "playlist_id": "PL_load_benchmark",
            "video_id": f"vid_sim_{random.randint(1, 20)}",
            "last_position": round(random.uniform(10.0, 600.0), 1),
            "watch_time": random.randint(10, 500),
            "updated_at": "2026-09-07T01:30:00.000Z",
        }
    },

    # 3. 15% Practice Questions
    {"method": "GET", "path": "/api/practice/questions/amazon?limit=20", "name": "Practice Amazon Questions", "weight": 10},
    {"method": "GET", "path": "/api/practice/companies", "name": "Practice Company List", "weight": 5},

    # 4. 10% System Health & Metrics
    {"method": "GET", "path": "/health", "name": "Health Probe", "weight": 5},
    {"method": "GET", "path": "/api/metrics", "name": "Observability Metrics", "weight": 5},

    # 5. 10% Aptitude & Platform Status
    {"method": "GET", "path": "/api/practice/aptitude/percentages", "name": "Aptitude Topic Lookup", "weight": 10},

    # 6. 5% Support & Info
    {"method": "GET", "path": "/api/support/info", "name": "Support Info", "weight": 5},
]


def _build_request_sequence(total_requests: int) -> List[dict]:
    """Expands weighted workload pool into a deterministic request sequence."""
    weighted_items = []
    for item in WORKLOAD_POOL:
        weighted_items.extend([item] * item["weight"])
    
    sequence = []
    for i in range(total_requests):
        template = weighted_items[i % len(weighted_items)]
        req = {
            "method": template["method"],
            "path": template["path"],
            "name": template["name"],
            "body": template["body_factory"]() if "body_factory" in template else None,
        }
        sequence.append(req)
    return sequence


async def run_single_request(client: httpx.AsyncClient, req: dict) -> Dict[str, Any]:
    headers = _get_random_client_headers()
    start = time.perf_counter()
    try:
        if req["method"] == "GET":
            resp = await client.get(req["path"], headers=headers)
        else:
            resp = await client.post(req["path"], json=req["body"], headers=headers)
        latency_ms = (time.perf_counter() - start) * 1000
        return {
            "name": req["name"],
            "status_code": resp.status_code,
            "latency_ms": latency_ms,
            "is_success": resp.status_code in (200, 201),
            "is_429": resp.status_code == 429,
            "is_error": resp.status_code >= 500,
        }
    except Exception as e:
        latency_ms = (time.perf_counter() - start) * 1000
        return {
            "name": req["name"],
            "status_code": 0,
            "latency_ms": latency_ms,
            "is_success": False,
            "is_429": False,
            "is_error": True,
            "error": str(e),
        }


async def benchmark_concurrency_level(concurrency: int, total_requests: int) -> Dict[str, Any]:
    print(f"\n[LOAD] Benchmarking Concurrency = {concurrency} users | Total Requests = {total_requests}...")
    
    # Configure client
    if TARGET_URL:
        transport = None
        base_url = TARGET_URL
    else:
        transport = httpx.ASGITransport(app=app)
        base_url = "http://testserver"

    limits = httpx.Limits(max_connections=concurrency + 50, max_keepalive_connections=concurrency)
    timeout = httpx.Timeout(15.0)

    requests_to_run = _build_request_sequence(total_requests)

    async with httpx.AsyncClient(transport=transport, base_url=base_url, limits=limits, timeout=timeout) as client:
        # Warmup probe
        await client.get("/health")

        sem = asyncio.Semaphore(concurrency)

        async def worker(item):
            async with sem:
                return await run_single_request(client, item)

        t_start = time.perf_counter()
        results = await asyncio.gather(*[worker(req) for req in requests_to_run])
        total_duration_sec = time.perf_counter() - t_start

    # Metrics computation
    latencies = [r["latency_ms"] for r in results]
    success_count = sum(1 for r in results if r["is_success"])
    rate_limited_count = sum(1 for r in results if r["is_429"])
    error_count = sum(1 for r in results if r["is_error"])
    error_rate_pct = round(((rate_limited_count + error_count) / total_requests) * 100.0, 2)

    latencies_sorted = sorted(latencies)
    n = len(latencies_sorted)
    p50 = round(statistics.median(latencies), 2)
    p95 = round(latencies_sorted[min(int(n * 0.95), n - 1)], 2)
    p99 = round(latencies_sorted[min(int(n * 0.99), n - 1)], 2)
    rps = round(total_requests / total_duration_sec, 1)

    print(f"  Duration:   {round(total_duration_sec, 2)}s")
    print(f"  Throughput: {rps} req/s")
    print(f"  p50: {p50} ms | p95: {p95} ms | p99: {p99} ms")
    print(f"  Success: {success_count}/{total_requests} (200 OK)")
    print(f"  429 RateLimited: {rate_limited_count} | 5xx Errors: {error_count}")
    print(f"  Error Rate: {error_rate_pct}%")

    return {
        "concurrency": concurrency,
        "total_requests": total_requests,
        "duration_s": round(total_duration_sec, 2),
        "rps": rps,
        "p50_ms": p50,
        "p95_ms": p95,
        "p99_ms": p99,
        "success_count": success_count,
        "rate_limited_429": rate_limited_count,
        "error_5xx": error_count,
        "error_rate_pct": error_rate_pct,
    }


async def main():
    print("================================================================================")
    print(" SkillsCatalyst Production Concurrency Load Testing & Saturation Benchmark")
    print(" Workload Mix: 30% Learning Search, 30% Progress Save, 15% Practice, 10% Health")
    print("================================================================================")

    # Realistic benchmark matrix across load levels
    levels = [
        (10, 100),
        (25, 250),
        (50, 500),
        (100, 800),
        (250, 1250),
    ]

    summary = []
    for c, reqs in levels:
        res = await benchmark_concurrency_level(concurrency=c, total_requests=reqs)
        summary.append(res)
        await asyncio.sleep(0.5)

    print("\n" + "=" * 90)
    print(f"{'Concurrency':<12} | {'Requests':<9} | {'RPS':<10} | {'p50 (ms)':<9} | {'p95 (ms)':<9} | {'p99 (ms)':<9} | {'429':<5} | {'5xx':<5} | {'Error %':<7}")
    print("-" * 90)
    for row in summary:
        print(f"{row['concurrency']:<12} | {row['total_requests']:<9} | {row['rps']:<10} | {row['p50_ms']:<9} | {row['p95_ms']:<9} | {row['p99_ms']:<9} | {row['rate_limited_429']:<5} | {row['error_5xx']:<5} | {row['error_rate_pct']:<7}%")
    print("=" * 90)


if __name__ == "__main__":
    asyncio.run(main())
