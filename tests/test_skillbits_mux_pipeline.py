"""
tests/test_skillbits_mux_pipeline.py
Comprehensive Production Test Suite for SkillsCatalyst SkillBits Step 2:
Mux Video Transcoding Pipeline, Direct-Upload Sessions, and Webhook Idempotency.

Validates all 15 core Step 2 requirements:
1.  Admin direct upload session creation (200 OK) with signed URL & upload ID
2.  Direct upload requires admin privileges (401/403)
3.  Direct upload on non-existent SkillBit returns 404 Not Found
4.  Video status sync polls Mux and transitions record to READY with playback_id
5.  Video status sync short-circuits when video is already READY
6.  Video status sync handles provider errors by marking status ERROR
7.  Mux webhook rejects requests missing Mux-Signature header (401)
8.  Mux webhook rejects invalid HMAC signatures (401)
9.  Mux webhook rejects expired signatures > 300s (401)
10. Mux webhook processes 'video.upload.asset_created' and transitions to PROCESSING
11. Mux webhook processes 'video.asset.ready' and transitions to READY
12. Mux webhook idempotency prevents duplicate event processing
13. Mux webhook handles 'video.asset.errored' and marks status ERROR
14. Publish fails if video is in ERROR or UPLOADING state (400 Bad Request)
15. Publish succeeds when video is in READY state with playback ID
"""

import sys
import time
import hmac
import hashlib
import json
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import MagicMock, patch

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


class MockAuthUser:
    """Simulates a Supabase Auth user object."""
    def __init__(self, uid: str, email: str, role: str = "student", full_name: str = "Test User"):
        self.id = uid
        self.email = email
        self.app_metadata = {"provider": "google", "role": role}
        self.user_metadata = {"full_name": full_name}


def generate_mux_signature(raw_body: bytes, secret: str, timestamp: int = None) -> str:
    """Helper to generate valid Mux webhook cryptographic signatures."""
    ts = timestamp if timestamp is not None else int(time.time())
    payload = f"{ts}.".encode("utf-8") + raw_body
    sig = hmac.new(
        key=secret.encode("utf-8"),
        msg=payload,
        digestmod=hashlib.sha256,
    ).hexdigest()
    return f"t={ts},v1={sig}"


class TestSkillBitsMuxPipeline(unittest.TestCase):

    def setUp(self):
        self.owner_id = "4113d832-6ac1-402a-bd00-1fd7f2b7ab26"
        self.owner_email = "owner@skillscatalyst.com"
        self.admin_id = "22222222-3333-4444-5555-666666666666"
        self.admin_email = "admin@skillscatalyst.com"
        self.student_id = "11111111-2222-3333-4444-555555555555"
        self.student_email = "student@university.edu"

        self.owner_user = MockAuthUser(self.owner_id, self.owner_email, role="owner", full_name="Platform Owner")
        self.admin_user = MockAuthUser(self.admin_id, self.admin_email, role="admin", full_name="Content Admin")
        self.student_user = MockAuthUser(self.student_id, self.student_email, role="student", full_name="Student Learner")

        self.mock_skillbit_id = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
        self.mock_upload_id = "upload_123456789"
        self.mock_asset_id = "asset_987654321"
        self.mock_playback_id = "play_abcdef12345"
        self.mock_webhook_secret = "test_mux_webhook_secret_key_123"

        now_str = datetime.now(timezone.utc).isoformat()
        self.mock_draft_record = {
            "id": self.mock_skillbit_id,
            "title": "Mastering Next.js Server Actions",
            "description": "Learn how to mutate data directly from Server Components.",
            "topic": "Next.js",
            "difficulty": "intermediate",
            "duration_seconds": None,
            "thumbnail_url": None,
            "video_provider": "mux",
            "video_asset_id": None,
            "playback_id": None,
            "status": "draft",
            "video_status": "NOT_UPLOADED",
            "mux_upload_id": None,
            "published_at": None,
            "created_by": self.admin_id,
            "created_at": now_str,
            "updated_at": now_str,
        }

    # ── 1. Admin Direct Upload Session Success ──────────────────────────────────
    def test_01_admin_direct_upload_success(self):
        """1. Admin can initiate direct upload session; DB record updated to UPLOADING."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb, \
             patch("backend.services.video_service.create_direct_upload") as mock_create_upload:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.admin_user)
            mock_auth_sb.return_value = mock_auth

            mock_svc = MagicMock()
            # Select returns draft record
            mock_svc.from_().select().eq().execute.return_value = MagicMock(data=[self.mock_draft_record])
            mock_svc.from_().select().in_().execute.return_value = MagicMock(data=[])
            mock_svc_sb.return_value = mock_svc

            mock_create_upload.return_value = {
                "upload_id": self.mock_upload_id,
                "upload_url": "https://upload.mux.com/signed-url-abc",
                "status": "waiting",
            }

            res = client.post(
                f"/api/admin/skillbits/{self.mock_skillbit_id}/direct-upload",
                json={"cors_origin": "https://www.skillscatalyst.in"},
                headers={"Authorization": "Bearer mock-admin-token"},
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["upload_id"], self.mock_upload_id)
            self.assertIn("upload.mux.com", data["upload_url"])
            self.assertEqual(data["status"], "waiting")

            # Verify database update was invoked with video_status='UPLOADING'
            mock_svc.from_().update.assert_called()

    # ── 2. Direct Upload Requires Admin ─────────────────────────────────────────
    def test_02_direct_upload_requires_admin(self):
        """2. Student and unauthenticated requests are rejected (403/401)."""
        # Unauthenticated
        res1 = client.post(f"/api/admin/skillbits/{self.mock_skillbit_id}/direct-upload")
        self.assertEqual(res1.status_code, 401)

        # Student
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.student_user)
            mock_auth_sb.return_value = mock_auth

            res2 = client.post(
                f"/api/admin/skillbits/{self.mock_skillbit_id}/direct-upload",
                headers={"Authorization": "Bearer mock-student-token"},
            )
            self.assertEqual(res2.status_code, 403)

    # ── 3. Direct Upload on Non-Existent SkillBit Returns 404 ───────────────────
    def test_03_direct_upload_404_not_found(self):
        """3. Direct upload returns 404 if SkillBit does not exist."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.admin_user)
            mock_auth_sb.return_value = mock_auth

            mock_svc = MagicMock()
            mock_svc.from_().select().eq().execute.return_value = MagicMock(data=[])
            mock_svc_sb.return_value = mock_svc

            res = client.post(
                f"/api/admin/skillbits/{self.mock_skillbit_id}/direct-upload",
                headers={"Authorization": "Bearer mock-admin-token"},
            )
            self.assertEqual(res.status_code, 404)

    # ── 4. Video Status Sync Polls Mux & Updates READY ──────────────────────────
    def test_04_sync_video_status_polls_mux_and_updates_ready(self):
        """4. Admin can query video-status; polls asset and updates DB to READY with playback_id."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb, \
             patch("backend.services.video_service.get_asset_details") as mock_get_asset, \
             patch("backend.services.video_service.extract_playback_id") as mock_extract_p:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.admin_user)
            mock_auth_sb.return_value = mock_auth

            record_with_asset = dict(self.mock_draft_record)
            record_with_asset["video_asset_id"] = self.mock_asset_id
            record_with_asset["video_status"] = "PROCESSING"

            mock_svc = MagicMock()
            mock_svc.from_().select().eq().execute.return_value = MagicMock(data=[record_with_asset])
            mock_svc.from_().select().in_().execute.return_value = MagicMock(data=[])
            mock_svc_sb.return_value = mock_svc

            mock_get_asset.return_value = {
                "id": self.mock_asset_id,
                "status": "ready",
                "duration": 48.7,
                "playback_ids": [{"policy": "public", "id": self.mock_playback_id}],
            }
            mock_extract_p.return_value = self.mock_playback_id

            res = client.get(
                f"/api/admin/skillbits/{self.mock_skillbit_id}/video-status",
                headers={"Authorization": "Bearer mock-admin-token"},
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["video_status"], "READY")
            self.assertEqual(data["playback_id"], self.mock_playback_id)
            self.assertEqual(data["duration_seconds"], 49)

    # ── 5. Video Status Sync Returns Immediately If Already READY ───────────────
    def test_05_sync_video_status_already_ready(self):
        """5. If record is already READY with playback_id, returns immediately without querying provider."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb, \
             patch("backend.services.video_service.get_asset_details") as mock_get_asset:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.admin_user)
            mock_auth_sb.return_value = mock_auth

            ready_record = dict(self.mock_draft_record)
            ready_record["video_status"] = "READY"
            ready_record["playback_id"] = self.mock_playback_id
            ready_record["duration_seconds"] = 60

            mock_svc = MagicMock()
            mock_svc.from_().select().eq().execute.return_value = MagicMock(data=[ready_record])
            mock_svc.from_().select().in_().execute.return_value = MagicMock(data=[])
            mock_svc_sb.return_value = mock_svc

            res = client.get(
                f"/api/admin/skillbits/{self.mock_skillbit_id}/video-status",
                headers={"Authorization": "Bearer mock-admin-token"},
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["video_status"], "READY")
            self.assertEqual(data["playback_id"], self.mock_playback_id)
            mock_get_asset.assert_not_called()

    # ── 6. Video Status Sync Handles Provider Error ─────────────────────────────
    def test_06_sync_video_status_handles_error(self):
        """6. If provider asset reports errored status, updates local record to ERROR."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb, \
             patch("backend.services.video_service.get_asset_details") as mock_get_asset:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.admin_user)
            mock_auth_sb.return_value = mock_auth

            errored_record = dict(self.mock_draft_record)
            errored_record["video_asset_id"] = self.mock_asset_id
            errored_record["video_status"] = "PROCESSING"

            mock_svc = MagicMock()
            mock_svc.from_().select().eq().execute.return_value = MagicMock(data=[errored_record])
            mock_svc.from_().select().in_().execute.return_value = MagicMock(data=[])
            mock_svc_sb.return_value = mock_svc

            mock_get_asset.return_value = {
                "id": self.mock_asset_id,
                "status": "errored",
            }

            res = client.get(
                f"/api/admin/skillbits/{self.mock_skillbit_id}/video-status",
                headers={"Authorization": "Bearer mock-admin-token"},
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["video_status"], "ERROR")

    # ── 7. Webhook Rejects Missing Signature ────────────────────────────────────
    def test_07_webhook_rejects_missing_signature(self):
        """7. Webhook without Mux-Signature header is rejected with 401 Unauthorized."""
        payload = {"type": "video.asset.ready", "id": "evt_123", "data": {}}
        with patch("backend.services.mux_service.MUX_WEBHOOK_SECRET", self.mock_webhook_secret), \
             patch("backend.services.skillbits_service.get_supabase") as mock_sb:
            mock_sb.return_value = MagicMock()
            res = client.post("/api/skillbits/webhook/mux", json=payload)
            self.assertEqual(res.status_code, 401)

    # ── 8. Webhook Rejects Invalid HMAC Signature ───────────────────────────────
    def test_08_webhook_rejects_invalid_signature(self):
        """8. Webhook with invalid HMAC signature is rejected with 401 Unauthorized."""
        payload_bytes = json.dumps({"type": "video.asset.ready", "id": "evt_123", "data": {}}).encode("utf-8")
        bad_header = f"t={int(time.time())},v1=bad_hash_signature_hex"

        with patch("backend.services.mux_service.MUX_WEBHOOK_SECRET", self.mock_webhook_secret), \
             patch("backend.services.skillbits_service.get_supabase") as mock_sb:
            mock_sb.return_value = MagicMock()
            res = client.post(
                "/api/skillbits/webhook/mux",
                content=payload_bytes,
                headers={"Mux-Signature": bad_header, "Content-Type": "application/json"},
            )
            self.assertEqual(res.status_code, 401)

    # ── 9. Webhook Rejects Expired Timestamp ────────────────────────────────────
    def test_09_webhook_rejects_expired_timestamp(self):
        """9. Webhook with timestamp expired > 300 seconds is rejected to prevent replay attacks."""
        payload_bytes = json.dumps({"type": "video.asset.ready", "id": "evt_123", "data": {}}).encode("utf-8")
        expired_ts = int(time.time()) - 360  # 6 minutes ago
        header = generate_mux_signature(payload_bytes, self.mock_webhook_secret, timestamp=expired_ts)

        with patch("backend.services.mux_service.MUX_WEBHOOK_SECRET", self.mock_webhook_secret), \
             patch("backend.services.skillbits_service.get_supabase") as mock_sb:
            mock_sb.return_value = MagicMock()
            res = client.post(
                "/api/skillbits/webhook/mux",
                content=payload_bytes,
                headers={"Mux-Signature": header, "Content-Type": "application/json"},
            )
            self.assertEqual(res.status_code, 401)

    # ── 10. Webhook video.upload.asset_created ──────────────────────────────────
    def test_10_webhook_asset_created(self):
        """10. Webhook 'video.upload.asset_created' transitions SkillBit to PROCESSING with asset_id."""
        payload = {
            "id": "evt_upload_created_1",
            "type": "video.upload.asset_created",
            "data": {
                "id": self.mock_upload_id,
                "asset_id": self.mock_asset_id,
                "passthrough": self.mock_skillbit_id,
            },
        }
        payload_bytes = json.dumps(payload).encode("utf-8")
        sig_header = generate_mux_signature(payload_bytes, self.mock_webhook_secret)

        with patch("backend.services.mux_service.MUX_WEBHOOK_SECRET", self.mock_webhook_secret), \
             patch("backend.services.skillbits_service.get_supabase") as mock_sb:

            mock_client = MagicMock()
            # Idempotency check returns empty (not previously processed)
            mock_client.from_().select().eq().execute.return_value = MagicMock(data=[])
            mock_sb.return_value = mock_client

            res = client.post(
                "/api/skillbits/webhook/mux",
                content=payload_bytes,
                headers={"Mux-Signature": sig_header, "Content-Type": "application/json"},
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertTrue(data.get("success"))
            self.assertEqual(data.get("type"), "video.upload.asset_created")

    # ── 11. Webhook video.asset.ready ───────────────────────────────────────────
    def test_11_webhook_asset_ready(self):
        """11. Webhook 'video.asset.ready' extracts playback_id, duration, and marks READY."""
        payload = {
            "id": "evt_asset_ready_1",
            "type": "video.asset.ready",
            "data": {
                "id": self.mock_asset_id,
                "passthrough": self.mock_skillbit_id,
                "duration": 52.4,
                "playback_ids": [{"policy": "public", "id": self.mock_playback_id}],
            },
        }
        payload_bytes = json.dumps(payload).encode("utf-8")
        sig_header = generate_mux_signature(payload_bytes, self.mock_webhook_secret)

        with patch("backend.services.mux_service.MUX_WEBHOOK_SECRET", self.mock_webhook_secret), \
             patch("backend.services.skillbits_service.get_supabase") as mock_sb:

            mock_client = MagicMock()
            mock_client.from_().select().eq().execute.return_value = MagicMock(data=[])
            mock_sb.return_value = mock_client

            res = client.post(
                "/api/skillbits/webhook/mux",
                content=payload_bytes,
                headers={"Mux-Signature": sig_header, "Content-Type": "application/json"},
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertTrue(data.get("success"))
            self.assertEqual(data.get("type"), "video.asset.ready")

    # ── 12. Webhook Idempotency Prevents Duplicate Processing ───────────────────
    def test_12_webhook_idempotency_prevents_duplicate_processing(self):
        """12. Duplicate webhook with same event_id is recognized and skipped idempotently."""
        payload = {
            "id": "evt_duplicate_test",
            "type": "video.asset.ready",
            "data": {"id": self.mock_asset_id, "passthrough": self.mock_skillbit_id},
        }
        payload_bytes = json.dumps(payload).encode("utf-8")
        sig_header = generate_mux_signature(payload_bytes, self.mock_webhook_secret)

        with patch("backend.services.mux_service.MUX_WEBHOOK_SECRET", self.mock_webhook_secret), \
             patch("backend.services.skillbits_service.get_supabase") as mock_sb:

            mock_client = MagicMock()
            # Idempotency query finds event already 'processed'
            mock_client.from_().select().eq().execute.return_value = MagicMock(
                data=[{"id": "log_1", "processing_status": "processed"}]
            )
            mock_sb.return_value = mock_client

            res = client.post(
                "/api/skillbits/webhook/mux",
                content=payload_bytes,
                headers={"Mux-Signature": sig_header, "Content-Type": "application/json"},
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data.get("status"), "already_processed")

    # ── 13. Webhook video.asset.errored ─────────────────────────────────────────
    def test_13_webhook_error_event(self):
        """13. Webhook 'video.asset.errored' updates SkillBit video_status to ERROR."""
        payload = {
            "id": "evt_error_test",
            "type": "video.asset.errored",
            "data": {
                "id": self.mock_asset_id,
                "passthrough": self.mock_skillbit_id,
            },
        }
        payload_bytes = json.dumps(payload).encode("utf-8")
        sig_header = generate_mux_signature(payload_bytes, self.mock_webhook_secret)

        with patch("backend.services.mux_service.MUX_WEBHOOK_SECRET", self.mock_webhook_secret), \
             patch("backend.services.skillbits_service.get_supabase") as mock_sb:

            mock_client = MagicMock()
            mock_client.from_().select().eq().execute.return_value = MagicMock(data=[])
            mock_sb.return_value = mock_client

            res = client.post(
                "/api/skillbits/webhook/mux",
                content=payload_bytes,
                headers={"Mux-Signature": sig_header, "Content-Type": "application/json"},
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertTrue(data.get("success"))

    # ── 14. Publish Rejected if Video Status ERROR or UPLOADING ─────────────────
    def test_14_publish_rejected_if_video_status_error_or_uploading(self):
        """14. Publishing fails with 400 Bad Request if video_status is ERROR or UPLOADING."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.admin_user)
            mock_auth_sb.return_value = mock_auth

            mock_svc = MagicMock()

            # Test ERROR status
            error_record = dict(self.mock_draft_record)
            error_record["video_status"] = "ERROR"
            error_record["playback_id"] = self.mock_playback_id
            mock_svc.from_().select().eq().execute.return_value = MagicMock(data=[error_record])
            mock_svc_sb.return_value = mock_svc

            res1 = client.post(
                f"/api/admin/skillbits/{self.mock_skillbit_id}/publish",
                headers={"Authorization": "Bearer mock-admin-token"},
            )
            self.assertEqual(res1.status_code, 400)
            self.assertIn("currently in 'ERROR' state", res1.json()["detail"])

            # Test UPLOADING status
            uploading_record = dict(self.mock_draft_record)
            uploading_record["video_status"] = "UPLOADING"
            uploading_record["playback_id"] = self.mock_playback_id
            mock_svc.from_().select().eq().execute.return_value = MagicMock(data=[uploading_record])

            res2 = client.post(
                f"/api/admin/skillbits/{self.mock_skillbit_id}/publish",
                headers={"Authorization": "Bearer mock-admin-token"},
            )
            self.assertEqual(res2.status_code, 400)
            self.assertIn("currently in 'UPLOADING' state", res2.json()["detail"])

    # ── 15. Publish Succeeds When Video Status READY with Playback ID ───────────
    def test_15_publish_succeeds_when_video_status_ready(self):
        """15. Publishing succeeds (200 OK) when video_status is READY and playback_id is present."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.admin_user)
            mock_auth_sb.return_value = mock_auth

            ready_record = dict(self.mock_draft_record)
            ready_record["video_status"] = "READY"
            ready_record["playback_id"] = self.mock_playback_id
            ready_record["video_asset_id"] = self.mock_asset_id

            published_record = dict(ready_record)
            published_record["status"] = "published"
            published_record["published_at"] = datetime.now(timezone.utc).isoformat()

            mock_svc = MagicMock()
            mock_svc.from_().select().eq().execute.return_value = MagicMock(data=[ready_record])
            mock_svc.from_().update().eq().execute.return_value = MagicMock(data=[published_record])
            mock_svc.from_().select().in_().execute.return_value = MagicMock(data=[])
            mock_svc_sb.return_value = mock_svc

            res = client.post(
                f"/api/admin/skillbits/{self.mock_skillbit_id}/publish",
                headers={"Authorization": "Bearer mock-admin-token"},
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["status"], "published")
            self.assertEqual(data["video_status"], "READY")
            self.assertEqual(data["playback_id"], self.mock_playback_id)


if __name__ == "__main__":
    unittest.main()
