"""
SkillsCatalyst - Video Progress Persistence Load & Saturation Benchmark
Phase 3.3 Observability & Performance Testing (Section 20)

Specifically measures video progress writes/sec, latency distribution,
and saturation limits when multiple concurrent learners stream videos and
synchronize progress (/api/learning/save-progress).

Tested Concurrency Levels: 10, 25, 50, 100, 250 active viewers
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

TARGET_URL = os.getenv("TARGET_URL", "").strip()


async def simulate_progress_save(client: httpx.AsyncClient, viewer_id: str, video_id: str, position: float) -> Dict[str, Any]:
    payload = {
        "playlist_id": "PL_video_load_benchmark",
        "video_id": video_id,
        "last_position": position,
        "watch_time": int(position),
        "updated_at": "2026-09-07T01:30:00.000Z",
    }
    headers = {
        "x-session-id": viewer_id,
        "X-Forwarded-For": f"10.0.{hash(viewer_id) % 250}.{random.randint(1, 250)}",
    }
    start = time.perf_counter()
    try:
        resp = await client.post("/api/learning/save-progress", json=payload, headers=headers)
        latency_ms = (time.perf_counter() - start) * 1000
        return {
            "status_code": resp.status_code,
            "latency_ms": latency_ms,
            "success": resp.status_code == 200,
            "rate_limited": resp.status_code == 429,
            "error": resp.status_code >= 500,
        }
    except Exception as e:
        latency_ms = (time.perf_counter() - start) * 1000
        return {
            "status_code": 0,
            "latency_ms": latency_ms,
            "success": False,
            "rate_limited": False,
            "error": True,
            "exception": str(e),
        }


async def benchmark_video_viewers(viewers: int, writes_per_viewer: int = 5) -> Dict[str, Any]:
    total_writes = viewers * writes_per_viewer
    print(f"\n[VIDEO PROGRESS] Simulating {viewers} active viewers ({writes_per_viewer} writes each = {total_writes} total writes)...")

    if TARGET_URL:
        transport = None
        base_url = TARGET_URL
    else:
        transport = httpx.ASGITransport(app=app)
        base_url = "http://testserver"

    limits = httpx.Limits(max_connections=viewers + 50, max_keepalive_connections=viewers)
    timeout = httpx.Timeout(15.0)

    # Pre-generate viewer sessions
    viewer_sessions = [f"guest_viewer_{uuid.uuid4().hex[:8]}" for _ in range(viewers)]

    async with httpx.AsyncClient(transport=transport, base_url=base_url, limits=limits, timeout=timeout) as client:
        sem = asyncio.Semaphore(viewers)

        async def viewer_lifecycle(vid_session: str):
            results = []
            video_id = f"vid_course_{random.randint(1, 10)}"
            curr_pos = random.uniform(10.0, 50.0)
            for _ in range(writes_per_viewer):
                curr_pos += 10.0  # +10s playback progress
                async with sem:
                    res = await simulate_progress_save(client, vid_session, video_id, curr_pos)
                results.append(res)
            return results

        t_start = time.perf_counter()
        nested_results = await asyncio.gather(*[viewer_lifecycle(sid) for sid in viewer_sessions])
        total_duration_sec = time.perf_counter() - t_start

    flattened = [r for sub in nested_results for r in sub]
    latencies = [r["latency_ms"] for r in flattened]
    success_count = sum(1 for r in flattened if r["success"])
    rate_limited_count = sum(1 for r in flattened if r["rate_limited"])
    error_count = sum(1 for r in flattened if r["error"])

    latencies_sorted = sorted(latencies)
    n = len(latencies_sorted)
    p50 = round(statistics.median(latencies), 2)
    p95 = round(latencies_sorted[min(int(n * 0.95), n - 1)], 2)
    p99 = round(latencies_sorted[min(int(n * 0.99), n - 1)], 2)
    writes_per_sec = round(total_writes / total_duration_sec, 1)

    print(f"  Duration:         {round(total_duration_sec, 2)}s")
    print(f"  Write Throughput: {writes_per_sec} writes/sec")
    print(f"  Latency p50: {p50} ms | p95: {p95} ms | p99: {p99} ms")
    print(f"  200 OK: {success_count}/{total_writes} | 429: {rate_limited_count} | 5xx: {error_count}")

    return {
        "viewers": viewers,
        "total_writes": total_writes,
        "duration_s": round(total_duration_sec, 2),
        "writes_per_sec": writes_per_sec,
        "p50_ms": p50,
        "p95_ms": p95,
        "p99_ms": p99,
        "success": success_count,
        "rate_limited": rate_limited_count,
        "errors": error_count,
    }


async def main():
    print("================================================================================")
    print(" SkillsCatalyst Dedicated Video Progress Write Throughput & Saturation Test")
    print("================================================================================")

    viewer_levels = [10, 25, 50, 100, 250]
    summary = []

    for v in viewer_levels:
        res = await benchmark_video_viewers(viewers=v, writes_per_viewer=5)
        summary.append(res)
        await asyncio.sleep(0.5)

    print("\n" + "=" * 80)
    print(f"{'Active Viewers':<16} | {'Total Writes':<14} | {'Writes/Sec':<12} | {'p50 (ms)':<9} | {'p95 (ms)':<9} | {'p99 (ms)':<9} | {'Errors':<7}")
    print("-" * 80)
    for row in summary:
        print(f"{row['viewers']:<16} | {row['total_writes']:<14} | {row['writes_per_sec']:<12} | {row['p50_ms']:<9} | {row['p95_ms']:<9} | {row['p99_ms']:<9} | {row['errors']:<7}")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(main())
