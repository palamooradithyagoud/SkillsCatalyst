import uuid
from locust import HttpUser, task, between


class SkillsCatalystUser(HttpUser):
    wait_time = between(0.1, 0.5)

    def on_start(self):
        """Assign unique client IP and session token to simulate real distributed traffic."""
        user_suffix = uuid.uuid4().hex[:6]
        self.session_id = f"guest_loadtest_{user_suffix}"
        self.client.headers.update({
            "X-Forwarded-For": f"198.51.100.{hash(user_suffix) % 250 + 1}",
            "x-session-id": self.session_id,
        })

    @task(4)
    def search_curated_learning(self):
        """High-frequency curated search (CSV backed)."""
        self.client.get("/api/learning/search?query=java&language=telugu", name="/api/learning/search [CSV-Telugu]")

    @task(3)
    def search_cached_learning(self):
        """Search query cached in Upstash Redis."""
        self.client.get("/api/learning/search?query=fastapi&language=english", name="/api/learning/search [Redis-Cached]")

    @task(2)
    def health_check(self):
        """System health and telemetry check."""
        self.client.get("/health", name="/health")

    @task(1)
    def guest_progress_save(self):
        """Guest playback progress verification."""
        self.client.post(
            "/api/learning/save-progress",
            json={
                "playlist_id": "PL_demo_load",
                "video_id": "vid_demo_load",
                "last_position": 45.0,
                "watch_time": 45,
            },
            headers={"x-session-id": self.session_id},
            name="/api/learning/save-progress [Guest]"
        )
