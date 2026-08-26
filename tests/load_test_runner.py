import asyncio
import time
import httpx
import statistics
from typing import List, Dict, Any

BASE_URL = "http://127.0.0.1:8000"

ENDPOINTS = [
    ("GET", "/api/learning/search?query=java&language=telugu", "Learning Search (CSV)"),
    ("GET", "/api/learning/search?query=fastapi&language=english", "Learning Search (Redis Cached)"),
    ("GET", "/health", "Health Check"),
    ("POST", "/api/learning/save-progress", "Save Progress (Guest)", {
        "playlist_id": "PL_load_test",
        "video_id": "vid_load_test",
        "last_position": 60.0,
        "watch_time": 60,
    }),
]


async def run_single_request(client: httpx.AsyncClient, method: str, path: str, name: str, body: dict = None) -> Dict[str, Any]:
    start = time.time()
    try:
        if method == "GET":
            resp = await client.get(f"{BASE_URL}{path}")
        else:
            resp = await client.post(f"{BASE_URL}{path}", json=body, headers={"x-session-id": "guest_loadtest_session"})
        latency_ms = (time.time() - start) * 1000
        return {
            "name": name,
            "status_code": resp.status_code,
            "latency_ms": latency_ms,
            "success": resp.status_code < 400 or resp.status_code == 429,
            "is_429": resp.status_code == 429,
        }
    except Exception as e:
        latency_ms = (time.time() - start) * 1000
        return {
            "name": name,
            "status_code": 0,
            "latency_ms": latency_ms,
            "success": False,
            "is_429": False,
            "error": str(e),
        }


async def benchmark_concurrency(concurrency: int, total_requests: int):
    print(f"\n--- Running Benchmark: Concurrency = {concurrency}, Total Requests = {total_requests} ---")
    limits = httpx.Limits(max_connections=concurrency + 50, max_keepalive_connections=concurrency)
    timeout = httpx.Timeout(10.0)

    async with httpx.AsyncClient(limits=limits, timeout=timeout) as client:
        # Pre-seed cache for non-CSV search
        await client.get(f"{BASE_URL}/api/learning/search?query=fastapi&language=english")

        tasks = []
        start_time = time.time()

        for i in range(total_requests):
            ep = ENDPOINTS[i % len(ENDPOINTS)]
            method, path, name = ep[0], ep[1], ep[2]
            body = ep[3] if len(ep) > 3 else None
            tasks.append(run_single_request(client, method, path, name, body))

        # Run concurrently in chunks of concurrency
        sem = asyncio.Semaphore(concurrency)

        async def sem_task(t):
            async with sem:
                return await t

        results = await asyncio.gather(*[sem_task(t) for t in tasks])
        total_time = time.time() - start_time

    # Calculate statistics
    latencies = [r["latency_ms"] for r in results]
    success_count = sum(1 for r in results if r["status_code"] in (200, 201))
    rate_limited_count = sum(1 for r in results if r["is_429"])
    error_count = sum(1 for r in results if r["status_code"] not in (200, 201, 429))

    p50 = round(statistics.median(latencies), 2)
    latencies_sorted = sorted(latencies)
    p95 = round(latencies_sorted[int(len(latencies) * 0.95)], 2)
    p99 = round(latencies_sorted[int(len(latencies) * 0.99)], 2)
    rps = round(total_requests / total_time, 2)

    print(f"Total Time:      {round(total_time, 2)}s")
    print(f"Requests / Sec:  {rps} req/s")
    print(f"p50 Latency:     {p50} ms")
    print(f"p95 Latency:     {p95} ms")
    print(f"p99 Latency:     {p99} ms")
    print(f"200 OK:          {success_count} / {total_requests}")
    print(f"429 RateLimit:   {rate_limited_count}")
    print(f"5xx/Errors:      {error_count}")

    return {
        "concurrency": concurrency,
        "total_requests": total_requests,
        "rps": rps,
        "p50": p50,
        "p95": p95,
        "p99": p99,
        "success": success_count,
        "rate_limited": rate_limited_count,
        "errors": error_count,
    }


async def main():
    print("=== Starting SkillsCatalyst Production Load Test Suite ===")
    concurrency_levels = [
        (50, 150),
        (100, 300),
        (250, 500),
        (500, 1000),
    ]

    report = []
    for c, reqs in concurrency_levels:
        res = await benchmark_concurrency(concurrency=c, total_requests=reqs)
        report.append(res)
        await asyncio.sleep(1.0)

    print("\n" + "=" * 80)
    print("=== SUMMARY BENCHMARK TABLE ===")
    print("=" * 80)
    print(f"{'Concurrency':<12} | {'Requests':<9} | {'RPS (req/s)':<12} | {'p50 (ms)':<9} | {'p95 (ms)':<9} | {'p99 (ms)':<9} | {'429s':<6} | {'Errors':<6}")
    print("-" * 80)
    for r in report:
        print(f"{r['concurrency']:<12} | {r['total_requests']:<9} | {r['rps']:<12} | {r['p50']:<9} | {r['p95']:<9} | {r['p99']:<9} | {r['rate_limited']:<6} | {r['errors']:<6}")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(main())
