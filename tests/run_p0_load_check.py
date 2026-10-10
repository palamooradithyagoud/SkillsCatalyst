import asyncio
import time
import statistics
import sys
from pathlib import Path

_root = Path(__file__).resolve().parent.parent
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

import httpx
from fastapi import FastAPI, HTTPException


async def run_load_check():
    print("=" * 80)
    print("SKILLSCATALYST P0-1: 1-WORKER CONCURRENCY LOAD CHECK")
    print("Workload: 20 Concurrent AI Requests (Mocked Groq 3.0s, Mocked Supabase 0.12s)")
    print("Concurrent Health Polling: Poll /health every 100ms")
    print("=" * 80)

    groq_delay = 3.0
    db_delay = 0.12

    # ─────────────────────────────────────────────────────────────────────────
    # 1. BEFORE (Base 1d15718): Synchronous Execution on Single Event Loop
    # ─────────────────────────────────────────────────────────────────────────
    base_app = FastAPI()

    @base_app.get("/health")
    def base_health():
        # Live Redis ping simulation on event loop (blocking I/O)
        time.sleep(0.008)
        return {"status": "healthy"}

    @base_app.post("/api/ai-mentor/chat")
    async def base_ai_chat():
        # Synchronous DB query on single event loop
        time.sleep(db_delay)
        # Synchronous Groq call on single event loop
        time.sleep(groq_delay)
        return {"reply": "AI response"}

    b_probes_attempted = 0
    b_probes_completed = 0
    b_probes_stalled = 0
    b_longest_stall_ms = 0.0

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=base_app), base_url="http://test") as client:
        stop_polling = asyncio.Event()

        async def poll_health_before():
            nonlocal b_probes_attempted, b_probes_completed, b_probes_stalled, b_longest_stall_ms
            while not stop_polling.is_set():
                b_probes_attempted += 1
                t0 = time.perf_counter()
                try:
                    resp = await client.get("/health")
                    latency_ms = (time.perf_counter() - t0) * 1000.0
                    b_probes_completed += 1
                    if latency_ms > b_longest_stall_ms:
                        b_longest_stall_ms = latency_ms
                    if latency_ms > 250.0:
                        b_probes_stalled += 1
                except Exception:
                    b_probes_stalled += 1
                await asyncio.sleep(0.1)

        poll_task = asyncio.create_task(poll_health_before())

        # Fire 20 concurrent AI requests
        t_ai_start = time.perf_counter()
        ai_tasks = [asyncio.create_task(client.post("/api/ai-mentor/chat")) for _ in range(20)]
        await asyncio.gather(*ai_tasks)
        b_ai_total_time = (time.perf_counter() - t_ai_start) * 1000.0

        stop_polling.set()
        await poll_task

    # ─────────────────────────────────────────────────────────────────────────
    # 2. AFTER (Branch): Threadpool Offloaded + Semaphore (Capacity 6, 5s timeout)
    # ─────────────────────────────────────────────────────────────────────────
    branch_app = FastAPI()
    from backend.services.groq_service import init_ai_semaphore, run_bounded_ai_call

    # Initialize semaphore to capacity 6
    ai_sem = init_ai_semaphore(max_concurrent=6)

    @branch_app.get("/health")
    def branch_health():
        # Zero network I/O: pure memory read
        return {"status": "healthy"}

    def _sync_groq_workload():
        time.sleep(db_delay)
        time.sleep(groq_delay)
        return "AI response"

    @branch_app.post("/api/ai-mentor/chat")
    async def branch_ai_chat():
        reply = await run_bounded_ai_call(
            _sync_groq_workload,
            acquire_timeout=5.0,
            ceiling_timeout=25.0,
        )
        return {"reply": reply}

    a_probes_attempted = 0
    a_probes_completed = 0
    a_probes_stalled = 0
    a_health_latencies = []

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=branch_app), base_url="http://test") as client:
        stop_polling = asyncio.Event()

        async def poll_health_after():
            nonlocal a_probes_attempted, a_probes_completed, a_probes_stalled
            while not stop_polling.is_set():
                a_probes_attempted += 1
                t0 = time.perf_counter()
                try:
                    resp = await client.get("/health")
                    latency_ms = (time.perf_counter() - t0) * 1000.0
                    a_health_latencies.append(latency_ms)
                    a_probes_completed += 1
                    if latency_ms > 250.0:
                        a_probes_stalled += 1
                except Exception:
                    a_probes_stalled += 1
                await asyncio.sleep(0.1)

        poll_task = asyncio.create_task(poll_health_after())

        ai_durations = []
        ai_503_count = 0
        ai_200_count = 0

        async def send_branch_ai():
            nonlocal ai_503_count, ai_200_count
            t0 = time.perf_counter()
            try:
                resp = await client.post("/api/ai-mentor/chat")
                elapsed = (time.perf_counter() - t0) * 1000.0
                ai_durations.append(elapsed)
                if resp.status_code == 200:
                    ai_200_count += 1
                elif resp.status_code == 503:
                    ai_503_count += 1
                return resp
            except Exception as e:
                elapsed = (time.perf_counter() - t0) * 1000.0
                ai_durations.append(elapsed)
                raise

        t_ai_start = time.perf_counter()
        ai_tasks = [asyncio.create_task(send_branch_ai()) for _ in range(20)]
        await asyncio.gather(*ai_tasks)
        a_ai_total_time = (time.perf_counter() - t_ai_start) * 1000.0

        stop_polling.set()
        await poll_task

    # Compute percentiles for after (which has sufficient sample size)
    s = sorted(a_health_latencies)
    n = len(s)
    a_p50 = statistics.median(s) if n else 0.0
    a_p95 = s[min(int(0.95 * n), n - 1)] if n else 0.0
    a_p99 = s[min(int(0.99 * n), n - 1)] if n else 0.0
    a_max = max(s) if n else 0.0

    ai_s = sorted(ai_durations)
    ai_min = min(ai_s) if ai_s else 0.0
    ai_median = statistics.median(ai_s) if ai_s else 0.0
    ai_max = max(ai_s) if ai_s else 0.0

    print("\n" + "-" * 80)
    print("LOAD CHECK RESULTS:")
    print("-" * 80)
    print("BEFORE (Base 1d15718):")
    print(f"  Health Probes Attempted : {b_probes_attempted}")
    print(f"  Health Probes Completed : {b_probes_completed}")
    print(f"  Health Probes Stalled   : {b_probes_stalled} (> 250ms threshold)")
    print(f"  Longest Observed Stall  : {b_longest_stall_ms:.2f} ms ({b_longest_stall_ms/1000.0:.2f}s)")
    print(f"  Total AI Batch Time     : {b_ai_total_time:.2f} ms ({b_ai_total_time/1000.0:.2f}s)")
    print(f"  Note: With only {b_probes_completed} probe completed during the 62s block, percentiles are omitted.")

    print("\nAFTER (Branch fix/p0-1-event-loop-blocking):")
    print(f"  Health Probes Attempted : {a_probes_attempted}")
    print(f"  Health Probes Completed : {a_probes_completed}")
    print(f"  Health Probes Stalled   : {a_probes_stalled} (> 250ms threshold)")
    print(f"  /health p50 Latency     : {a_p50:.2f} ms")
    print(f"  /health p95 Latency     : {a_p95:.2f} ms")
    print(f"  /health p99 Latency     : {a_p99:.2f} ms")
    print(f"  /health max Latency     : {a_max:.2f} ms")
    print(f"  AI Requests Completed   : {len(ai_durations)} total (200 OK: {ai_200_count}, 503 Capacity Bound: {ai_503_count})")
    print(f"  AI Durations (min/med/max): {ai_min:.2f} ms / {ai_median:.2f} ms / {ai_max:.2f} ms")
    print("-" * 80)

    # Acceptance verification
    assert a_p95 < 100.0, f"AFTER /health p95 ({a_p95}ms) did not meet < 100ms acceptance threshold"
    assert a_probes_stalled == 0, f"AFTER /health had {a_probes_stalled} stalls exceeding 250ms"
    print("ACCEPTANCE CRITERIA SATISFIED: AFTER /health p95 < 100ms and zero probe timeouts.")


if __name__ == "__main__":
    asyncio.run(run_load_check())
