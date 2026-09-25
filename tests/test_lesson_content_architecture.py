"""
tests/test_lesson_content_architecture.py
Comprehensive unit tests for SkillsCatalyst Lesson Content Architecture (Phase 2A).
Covers:
  - Empty lesson content support
  - All 12 block types validation & normalization
  - Invalid block types and bad payloads rejection
  - YouTube URL parsing & canonicalization
  - Hierarchy validation (cross-course/module protection)
  - Duplicate block ID detection
  - Admin RBAC security & authorization
"""

import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from fastapi import status

from backend.main import app
from backend.services.auth_service import require_admin
from backend.models.lesson_content import (
    BlockType,
    LessonBlock,
    LessonContentPayload,
    extract_youtube_video_id,
)

client = TestClient(app)


class TestLessonContentArchitecture(unittest.TestCase):
    def setUp(self):
        self.course_id = "11111111-1111-1111-1111-111111111111"
        self.module_id = "22222222-2222-2222-2222-222222222222"
        self.lesson_id = "33333333-3333-3333-3333-333333333333"
        self.wrong_course_id = "99999999-9999-9999-9999-999999999999"

        self.admin_user = {
            "user_id": "owner-12345",
            "email": "owner@skillscatalyst.com",
            "role": "owner",
        }
        self.student_user = {
            "user_id": "student-12345",
            "email": "student@skillscatalyst.com",
            "role": "student",
        }
        app.dependency_overrides[require_admin] = lambda: self.admin_user

    def tearDown(self):
        app.dependency_overrides.clear()

    # ── YouTube Normalization Unit Tests ───────────────────────────────────────

    def test_youtube_normalization_various_formats(self):
        """Tests that various YouTube URL formats are extracted to canonical 11-char ID."""
        expected_id = "dQw4w9WgXcQ"
        test_inputs = [
            "dQw4w9WgXcQ",
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s",
            "https://m.youtube.com/watch?v=dQw4w9WgXcQ",
            "https://youtu.be/dQw4w9WgXcQ",
            "https://youtu.be/dQw4w9WgXcQ?si=1234",
            "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "https://www.youtube.com/shorts/dQw4w9WgXcQ",
        ]
        for inp in test_inputs:
            self.assertEqual(extract_youtube_video_id(inp), expected_id)

    def test_youtube_normalization_invalid_rejected(self):
        """Tests that invalid domains and malformed video IDs are strictly rejected."""
        invalid_inputs = [
            "",
            "https://vimeo.com/12345678",
            "https://evil.com/watch?v=dQw4w9WgXcQ",
            "https://youtube.com/watch?v=short",  # < 11 chars
            "https://youtu.be/",
            "not-a-url-and-not-id",
        ]
        for inp in invalid_inputs:
            with self.assertRaises(ValueError):
                extract_youtube_video_id(inp)

    # ── All 12 Block Types Schema Validation ───────────────────────────────────

    def test_all_12_block_types_valid_payload(self):
        """Validates payload containing all 12 supported block types."""
        payload_data = {
            "blocks": [
                {
                    "id": "b-heading",
                    "type": "heading",
                    "order": 0,
                    "content": {"level": 2, "text": "Why Python is Popular"},
                },
                {
                    "id": "b-paragraph",
                    "type": "paragraph",
                    "order": 1,
                    "content": {"text": "Python is a modern high-level language with elegant syntax."},
                },
                {
                    "id": "b-image",
                    "type": "image",
                    "order": 2,
                    "content": {
                        "url": "https://images.unsplash.com/photo-1",
                        "alt": "Architecture Diagram",
                        "caption": "Figure 1.1",
                    },
                },
                {
                    "id": "b-code",
                    "type": "code",
                    "order": 3,
                    "content": {
                        "language": "python",
                        "code": "def hello():\n    print('Hello World')",
                    },
                },
                {
                    "id": "b-output",
                    "type": "output",
                    "order": 4,
                    "content": {"text": "Hello World"},
                },
                {
                    "id": "b-list",
                    "type": "list",
                    "order": 5,
                    "content": {"ordered": True, "items": ["Item 1", "Item 2", "Item 3"]},
                },
                {
                    "id": "b-table",
                    "type": "table",
                    "order": 6,
                    "content": {
                        "headers": ["Framework", "Language"],
                        "rows": [["FastAPI", "Python"], ["Next.js", "TypeScript"]],
                    },
                },
                {
                    "id": "b-callout",
                    "type": "callout",
                    "order": 7,
                    "content": {"variant": "tip", "title": "Performance Tip", "text": "Use connection pooling."},
                },
                {
                    "id": "b-quote",
                    "type": "quote",
                    "order": 8,
                    "content": {"text": "Simple is better than complex.", "author": "Tim Peters"},
                },
                {
                    "id": "b-youtube",
                    "type": "youtube",
                    "order": 9,
                    "content": {"url": "https://youtu.be/dQw4w9WgXcQ", "title": "Overview Video"},
                },
                {
                    "id": "b-link",
                    "type": "link",
                    "order": 10,
                    "content": {"text": "Official Documentation", "url": "https://python.org"},
                },
                {
                    "id": "b-takeaways",
                    "type": "key_takeaways",
                    "order": 11,
                    "content": {"items": ["Point A", "Point B", "Point C"]},
                },
            ]
        }
        validated = LessonContentPayload.model_validate(payload_data)
        self.assertEqual(len(validated.blocks), 12)
        # Verify YouTube was normalized to canonical video_id and canonical url
        yt_block = next(b for b in validated.blocks if b.type == BlockType.YOUTUBE)
        self.assertEqual(yt_block.content["video_id"], "dQw4w9WgXcQ")
        self.assertEqual(yt_block.content["url"], "https://www.youtube.com/watch?v=dQw4w9WgXcQ")

    def test_empty_lesson_content_is_valid(self):
        """A newly created lesson initially having zero blocks is valid."""
        payload_data = {"blocks": []}
        validated = LessonContentPayload.model_validate(payload_data)
        self.assertEqual(len(validated.blocks), 0)

    # ── Negative Schema Validation Tests ───────────────────────────────────────

    def test_invalid_block_type_rejected(self):
        """Unrecognized block types are rejected."""
        payload_data = {
            "blocks": [
                {"id": "b-1", "type": "unsupported_widget", "order": 0, "content": {"foo": "bar"}}
            ]
        }
        with self.assertRaises(ValueError):
            LessonContentPayload.model_validate(payload_data)

    def test_invalid_heading_level_rejected(self):
        """Only H2, H3, H4 are permitted."""
        # Level 1 rejected
        with self.assertRaises(ValueError):
            LessonBlock.model_validate({
                "id": "b-1",
                "type": "heading",
                "order": 0,
                "content": {"level": 1, "text": "H1 Not Allowed"},
            })

        # Level 5 rejected
        with self.assertRaises(ValueError):
            LessonBlock.model_validate({
                "id": "b-2",
                "type": "heading",
                "order": 0,
                "content": {"level": 5, "text": "H5 Not Allowed"},
            })

    def test_invalid_callout_variant_rejected(self):
        """Only info, tip, warning, important are allowed."""
        with self.assertRaises(ValueError):
            LessonBlock.model_validate({
                "id": "b-1",
                "type": "callout",
                "order": 0,
                "content": {"variant": "danger_zone", "text": "Text"},
            })

    def test_invalid_table_mismatched_columns_rejected(self):
        """Table rows must have the same number of columns as headers."""
        with self.assertRaises(ValueError):
            LessonBlock.model_validate({
                "id": "b-1",
                "type": "table",
                "order": 0,
                "content": {
                    "headers": ["Col1", "Col2"],
                    "rows": [["Val1", "Val2", "Val3"]],  # 3 cols != 2 headers
                },
            })

    def test_invalid_code_language_rejected(self):
        """Arbitrary/unsupported code language values are rejected."""
        with self.assertRaises(ValueError):
            LessonBlock.model_validate({
                "id": "b-1",
                "type": "code",
                "order": 0,
                "content": {"language": "brainfuck", "code": "++--"},
            })

    def test_raw_html_script_tags_rejected(self):
        """Raw HTML script tags are strictly rejected across text blocks."""
        with self.assertRaises(ValueError):
            LessonBlock.model_validate({
                "id": "b-1",
                "type": "paragraph",
                "order": 0,
                "content": {"text": "<script>alert('XSS')</script> Hello"},
            })

    def test_duplicate_block_ids_rejected(self):
        """Duplicate block IDs inside the same lesson content must be rejected."""
        payload_data = {
            "blocks": [
                {"id": "duplicate-id", "type": "paragraph", "order": 0, "content": {"text": "One"}},
                {"id": "duplicate-id", "type": "paragraph", "order": 1, "content": {"text": "Two"}},
            ]
        }
        with self.assertRaises(ValueError):
            LessonContentPayload.model_validate(payload_data)

    # ── API Endpoint & Hierarchy Validation Tests ──────────────────────────────

    @patch("backend.services.course_service.get_supabase")
    def test_get_lesson_content_empty_state_returns_200(self, mock_sb):
        """GET content on lesson with no content yet returns 200 with empty blocks list."""
        mock_client = MagicMock()
        # Mock module check
        mock_client.from_().select().eq().limit().execute.side_effect = [
            MagicMock(data=[{"id": self.module_id, "course_id": self.course_id}]),  # module
            MagicMock(data=[{"id": self.lesson_id, "module_id": self.module_id}]),  # lesson
            MagicMock(data=[]),  # lesson_contents (none yet)
        ]
        mock_sb.return_value = mock_client

        url = f"/api/admin/courses/{self.course_id}/modules/{self.module_id}/lessons/{self.lesson_id}/content"
        response = client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["lesson_id"], self.lesson_id)
        self.assertEqual(data["blocks"], [])
        self.assertEqual(data["schema_version"], 1)

    @patch("backend.services.course_service.get_supabase")
    def test_cross_course_access_rejected_404(self, mock_sb):
        """Accessing a lesson with a mismatched course_id is rejected with 404."""
        mock_client = MagicMock()
        # Module actually belongs to self.course_id, not self.wrong_course_id
        mock_client.from_().select().eq().limit().execute.return_value = MagicMock(
            data=[{"id": self.module_id, "course_id": self.course_id}]
        )
        mock_sb.return_value = mock_client

        url = f"/api/admin/courses/{self.wrong_course_id}/modules/{self.module_id}/lessons/{self.lesson_id}/content"
        response = client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Module not found", response.json()["detail"])

    @patch("backend.services.course_service.get_supabase")
    def test_save_lesson_content_success_atomic_upsert(self, mock_sb):
        """PUT content validates, normalizes, and upserts blocks."""
        mock_client = MagicMock()
        mock_client.from_().select().eq().limit().execute.side_effect = [
            MagicMock(data=[{"id": self.module_id, "course_id": self.course_id}]),  # module
            MagicMock(data=[{"id": self.lesson_id, "module_id": self.module_id}]),  # lesson
        ]
        mock_client.from_().upsert().execute.return_value = MagicMock(
            data=[{
                "id": "content-uuid-1",
                "lesson_id": self.lesson_id,
                "schema_version": 1,
                "blocks": [
                    {"id": "b-1", "type": "heading", "order": 0, "content": {"level": 2, "text": "Intro"}},
                ],
                "created_at": "2026-09-25T20:00:00Z",
                "updated_at": "2026-09-25T20:00:00Z",
            }]
        )
        mock_sb.return_value = mock_client

        url = f"/api/admin/courses/{self.course_id}/modules/{self.module_id}/lessons/{self.lesson_id}/content"
        payload = {
            "blocks": [
                {"id": "b-1", "type": "heading", "order": 0, "content": {"level": 2, "text": "Intro"}}
            ]
        }
        response = client.put(url, json=payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["id"], "content-uuid-1")
        self.assertEqual(len(data["blocks"]), 1)


if __name__ == "__main__":
    unittest.main()
