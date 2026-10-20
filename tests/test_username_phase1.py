"""
tests/test_username_phase1.py
Comprehensive Phase 1 Test Suite for SkillsCatalyst:
- Username format validation & normalization
- Full name validation
- Reserved usernames enforcement
- Availability check endpoint (/api/profile/check-username)
- Profile personal update endpoint (/api/profile/personal)
- Duplicate username conflict handling (409)
- Anti-IDOR & authorization verification
- Migration contract & schema safety
- Google OAuth backward compatibility
"""

import os
import re
import unittest
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
from backend.main import app
from backend.services.validation_service import (
    validate_username,
    normalize_username,
    validate_full_name,
    RESERVED_USERNAMES,
)
from backend.services.auth_service import get_current_user_id, get_optional_user_id

client = TestClient(app)

MOCK_USER_ID = "4113d832-6ac1-402a-bd00-1fd7f2b7ab26"
OTHER_USER_ID = "99999999-9999-4999-a999-999999999999"


class TestUsernameValidation(unittest.TestCase):
    """1-10: Username & Full Name Validation Unit Tests"""

    def test_01_valid_usernames_accepted(self):
        valid_cases = [
            "adithya",
            "adithya_goud",
            "alex123",
            "user_name_99",
            "dev",
            "a" * 30,
        ]
        for username in valid_cases:
            is_valid, err = validate_username(username)
            self.assertTrue(is_valid, f"Expected '{username}' to be valid, got: {err}")
            self.assertIsNone(err)

    def test_02_empty_or_none_username_rejected(self):
        for empty in [None, "", "   ", "\t\n"]:
            is_valid, err = validate_username(empty)
            self.assertFalse(is_valid)
            self.assertEqual(err, "Username is required.")

    def test_03_short_username_rejected(self):
        for short in ["a", "ab", "  ab  "]:
            is_valid, err = validate_username(short)
            self.assertFalse(is_valid)
            self.assertIn("at least 3 characters", err)

    def test_04_long_username_rejected(self):
        long_username = "a" * 31
        is_valid, err = validate_username(long_username)
        self.assertFalse(is_valid)
        self.assertIn("cannot exceed 30 characters", err)

    def test_05_invalid_characters_rejected(self):
        invalid_cases = [
            "user name",
            "user-name",
            "user@name",
            "user.name",
            "user#name",
            "user!name",
            "user$name",
            "adithya🔥",
        ]
        for invalid in invalid_cases:
            is_valid, err = validate_username(invalid)
            self.assertFalse(is_valid, f"Expected '{invalid}' to be rejected")
            self.assertIn("letters, numbers, and underscores", err)

    def test_06_reserved_usernames_rejected_case_insensitively(self):
        reserved_cases = ["admin", "ADMIN", "Root", "api", "Settings", "Profile", "Login", "Signup"]
        for reserved in reserved_cases:
            is_valid, err = validate_username(reserved)
            self.assertFalse(is_valid, f"Expected reserved name '{reserved}' to be rejected")
            self.assertIn("reserved", err)

    def test_07_username_normalization(self):
        self.assertEqual(normalize_username("  Adithya_Goud  "), "adithya_goud")
        self.assertEqual(normalize_username("Alex_99"), "alex_99")
        self.assertEqual(normalize_username(""), "")
        self.assertEqual(normalize_username(None), "")

    def test_08_valid_full_name_accepted(self):
        valid_names = [
            "Palamoor Adithya Goud",
            "Alex Mercer",
            "Jane Doe",
            "Jean-Luc Picard",
            "Mary O'Connor",
            "Renée Dupont",
        ]
        for name in valid_names:
            is_valid, err = validate_full_name(name)
            self.assertTrue(is_valid, f"Expected '{name}' to be valid, got: {err}")
            self.assertIsNone(err)

    def test_09_empty_or_short_full_name_rejected(self):
        for empty in [None, "", "   "]:
            is_valid, err = validate_full_name(empty)
            self.assertFalse(is_valid)
            self.assertEqual(err, "Full name is required.")

        is_valid, err = validate_full_name("A")
        self.assertFalse(is_valid)
        self.assertIn("at least 2 characters", err)

    def test_10_long_full_name_rejected(self):
        long_name = "A" * 101
        is_valid, err = validate_full_name(long_name)
        self.assertFalse(is_valid)
        self.assertIn("cannot exceed 100 characters", err)


class TestCheckUsernameEndpoint(unittest.TestCase):
    """11-16: GET /api/profile/check-username Endpoint Tests"""

    def test_11_check_username_empty(self):
        res = client.get("/api/profile/check-username?username=")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["available"])
        self.assertEqual(data["message"], "Username is required.")

    def test_12_check_username_invalid_format(self):
        res = client.get("/api/profile/check-username?username=ab")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["available"])
        self.assertIn("at least 3 characters", data["message"])

    def test_13_check_username_reserved(self):
        res = client.get("/api/profile/check-username?username=ADMIN")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["available"])
        self.assertIn("reserved", data["message"])

    @patch("backend.routers.profile.get_supabase")
    def test_14_check_username_available(self, mock_get_sb):
        mock_sb = MagicMock()
        mock_query = MagicMock()
        mock_query.ilike.return_value.limit.return_value.execute.return_value.data = []
        mock_sb.from_.return_value.select.return_value = mock_query
        mock_get_sb.return_value = mock_sb

        res = client.get("/api/profile/check-username?username=fresh_user_123")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["available"])
        self.assertEqual(data["username"], "fresh_user_123")

    @patch("backend.routers.profile.get_supabase")
    def test_15_check_username_already_taken(self, mock_get_sb):
        mock_sb = MagicMock()
        mock_query = MagicMock()
        # Returns an existing user with a different ID
        mock_query.ilike.return_value.limit.return_value.execute.return_value.data = [
            {"id": OTHER_USER_ID, "username": "existing_coder"}
        ]
        mock_sb.from_.return_value.select.return_value = mock_query
        mock_get_sb.return_value = mock_sb

        res = client.get("/api/profile/check-username?username=existing_coder")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["available"])
        self.assertIn("already taken", data["message"])

    @patch("backend.routers.profile.get_supabase")
    def test_16_check_username_own_username_is_available(self, mock_get_sb):
        # When checking own username, it should report available
        app.dependency_overrides[get_optional_user_id] = lambda: MOCK_USER_ID
        try:
            mock_sb = MagicMock()
            mock_query = MagicMock()
            mock_query.ilike.return_value.limit.return_value.execute.return_value.data = [
                {"id": MOCK_USER_ID, "username": "my_current_username"}
            ]
            mock_sb.from_.return_value.select.return_value = mock_query
            mock_get_sb.return_value = mock_sb

            res = client.get("/api/profile/check-username?username=my_current_username")
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertTrue(data["available"])
        finally:
            app.dependency_overrides.pop(get_optional_user_id, None)


class TestSavePersonalProfileEndpoint(unittest.TestCase):
    """17-24: POST /api/profile/personal Endpoint Tests"""

    def test_17_unauthenticated_request_rejected_401(self):
        res = client.post("/api/profile/personal", json={"full_name": "Test User"})
        self.assertEqual(res.status_code, 401)

    def test_18_invalid_full_name_rejected_422(self):
        app.dependency_overrides[get_current_user_id] = lambda: MOCK_USER_ID
        try:
            res = client.post("/api/profile/personal", json={"full_name": "   "})
            self.assertEqual(res.status_code, 422)
            self.assertIn("Full name is required", res.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user_id, None)

    def test_19_invalid_username_format_rejected_422(self):
        app.dependency_overrides[get_current_user_id] = lambda: MOCK_USER_ID
        try:
            res = client.post("/api/profile/personal", json={
                "full_name": "Adithya Goud",
                "username": "bad username!",
            })
            self.assertEqual(res.status_code, 422)
            self.assertIn("letters, numbers, and underscores", res.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user_id, None)

    def test_20_reserved_username_rejected_422(self):
        app.dependency_overrides[get_current_user_id] = lambda: MOCK_USER_ID
        try:
            res = client.post("/api/profile/personal", json={
                "full_name": "Adithya Goud",
                "username": "admin",
            })
            self.assertEqual(res.status_code, 422)
            self.assertIn("reserved", res.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user_id, None)

    @patch("backend.routers.profile.get_supabase")
    def test_21_duplicate_username_conflict_409(self, mock_get_sb):
        app.dependency_overrides[get_current_user_id] = lambda: MOCK_USER_ID
        try:
            mock_sb = MagicMock()
            mock_query = MagicMock()
            # Another user already owns this username
            mock_query.ilike.return_value.neq.return_value.limit.return_value.execute.return_value.data = [
                {"id": OTHER_USER_ID, "username": "taken_username"}
            ]
            mock_sb.from_.return_value.select.return_value = mock_query
            mock_get_sb.return_value = mock_sb

            res = client.post("/api/profile/personal", json={
                "full_name": "Adithya Goud",
                "username": "taken_username",
            })
            self.assertEqual(res.status_code, 409)
            self.assertIn("already taken", res.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user_id, None)

    @patch("backend.services.certificate_service.is_user_identity_locked", return_value=False)
    @patch("backend.routers.profile.get_supabase")
    def test_22_valid_personal_profile_saved_successfully(self, mock_get_sb, mock_locked):
        app.dependency_overrides[get_current_user_id] = lambda: MOCK_USER_ID
        try:
            mock_sb = MagicMock()
            # No conflicting user
            mock_query = MagicMock()
            mock_query.ilike.return_value.neq.return_value.limit.return_value.execute.return_value.data = []
            mock_sb.from_.return_value.select.return_value = mock_query

            # Upsert succeeds
            mock_sb.from_.return_value.upsert.return_value.execute.return_value = MagicMock(data=[])
            # Auth admin update succeeds
            mock_sb.auth.admin.update_user_by_id.return_value = MagicMock()

            mock_get_sb.return_value = mock_sb

            res = client.post("/api/profile/personal", json={
                "full_name": "Adithya Goud",
                "username": "adithya_goud",
                "headline": "Full-Stack Engineer",
                "country": "India",
            })
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["personal"]["username"], "adithya_goud")
        finally:
            app.dependency_overrides.pop(get_current_user_id, None)

    @patch("backend.services.certificate_service.is_user_identity_locked", return_value=False)
    @patch("backend.routers.profile.get_supabase")
    def test_23_update_without_username_preserves_nullable_username(self, mock_get_sb, mock_locked):
        app.dependency_overrides[get_current_user_id] = lambda: MOCK_USER_ID
        try:
            mock_sb = MagicMock()
            mock_sb.from_.return_value.upsert.return_value.execute.return_value = MagicMock(data=[])
            mock_get_sb.return_value = mock_sb

            res = client.post("/api/profile/personal", json={
                "full_name": "Alex Mercer Updated",
                "headline": "Student",
            })
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertTrue(data["success"])
            self.assertIsNone(data["personal"].get("username"))
        finally:
            app.dependency_overrides.pop(get_current_user_id, None)

    def test_24_protected_fields_ignored_in_personal_profile(self):
        # Verifies that sending role or is_admin or email in PersonalProfileModel
        # cannot mass-assign unauthorized attributes
        from backend.routers.profile import PersonalProfileModel
        payload = {
            "full_name": "Hacker",
            "role": "admin",
            "is_admin": True,
            "email": "hacked@example.com",
            "subscription_tier": "enterprise",
        }
        model = PersonalProfileModel(**payload)
        # Verify model only accepts personal fields and ignores or doesn't expose system privileges
        self.assertEqual(model.full_name, "Hacker")
        self.assertFalse(hasattr(model, "is_admin"))
        self.assertFalse(hasattr(model, "subscription_tier"))

    @patch("backend.routers.profile.get_supabase")
    def test_24b_update_name_and_college_persists_to_database(self, mock_get_sb):
        # Explicit test for user requirement: make sure name and college are stored in the database
        app.dependency_overrides[get_current_user_id] = lambda: MOCK_USER_ID
        try:
            mock_sb = MagicMock()
            upsert_calls = {}

            def mock_from(table_name):
                mock_table = MagicMock()
                def mock_upsert(data, **kwargs):
                    upsert_calls[table_name] = data
                    res = MagicMock()
                    res.execute.return_value = MagicMock(data=[data])
                    return res
                mock_table.upsert = mock_upsert
                mock_table.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
                return mock_table

            mock_sb.from_.side_effect = mock_from
            mock_get_sb.return_value = mock_sb

            res = client.post("/api/profile/personal", json={
                "full_name": "Palamoor Adithya Goud",
                "college": "JNTU College of Engineering",
                "headline": "Software Engineer",
            })

            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["personal"]["full_name"], "Palamoor Adithya Goud")
            self.assertEqual(data["personal"]["college"], "JNTU College of Engineering")

            # Verify profiles table was updated with both name and college
            self.assertIn("profiles", upsert_calls)
            self.assertEqual(upsert_calls["profiles"]["full_name"], "Palamoor Adithya Goud")
            self.assertEqual(upsert_calls["profiles"]["college"], "JNTU College of Engineering")

            # Verify user_academic_profile table was synchronized with both name and college
            self.assertIn("user_academic_profile", upsert_calls)
            self.assertEqual(upsert_calls["user_academic_profile"]["full_name"], "Palamoor Adithya Goud")
            self.assertEqual(upsert_calls["user_academic_profile"]["college"], "JNTU College of Engineering")
        finally:
            app.dependency_overrides.pop(get_current_user_id, None)

    @patch("backend.routers.profile.get_supabase")
    def test_24c_missing_username_column_raises_503_never_silently_discards(self, mock_get_sb):
        """Verifies that missing 'username' column in profiles table returns HTTP 503 and never silently succeeds."""
        app.dependency_overrides[get_current_user_id] = lambda: MOCK_USER_ID
        try:
            mock_sb = MagicMock()
            mock_query = MagicMock()
            mock_query.ilike.return_value.neq.return_value.limit.return_value.execute.return_value.data = []
            mock_sb.from_.return_value.select.return_value = mock_query

            mock_sb.from_.return_value.upsert.return_value.execute.side_effect = Exception(
                "Could not find the 'username' column of 'profiles' in the schema cache"
            )
            mock_get_sb.return_value = mock_sb

            res = client.post("/api/profile/personal", json={
                "full_name": "Adithya Goud",
                "username": "adithya_goud",
            })
            self.assertEqual(res.status_code, 503)
            self.assertIn("username column is unavailable", res.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user_id, None)

    @patch("backend.routers.profile.get_supabase")
    def test_24d_missing_college_column_raises_503_never_silently_discards(self, mock_get_sb):
        """Verifies that missing 'college' column in profiles table returns HTTP 503 and never silently succeeds."""
        app.dependency_overrides[get_current_user_id] = lambda: MOCK_USER_ID
        try:
            mock_sb = MagicMock()
            mock_sb.from_.return_value.upsert.return_value.execute.side_effect = Exception(
                "column profiles.college does not exist"
            )
            mock_get_sb.return_value = mock_sb

            res = client.post("/api/profile/personal", json={
                "full_name": "Adithya Goud",
                "college": "Stanford University",
            })
            self.assertEqual(res.status_code, 503)
            self.assertIn("college column is unavailable", res.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user_id, None)

    @patch("backend.routers.profile.get_supabase")
    def test_24e_database_duplicate_username_constraint_raises_409(self, mock_get_sb):
        """Verifies that database unique constraint violation on profiles.username returns HTTP 409."""
        app.dependency_overrides[get_current_user_id] = lambda: MOCK_USER_ID
        try:
            mock_sb = MagicMock()
            mock_query = MagicMock()
            mock_query.ilike.return_value.neq.return_value.limit.return_value.execute.return_value.data = []
            mock_sb.from_.return_value.select.return_value = mock_query

            mock_sb.from_.return_value.upsert.return_value.execute.side_effect = Exception(
                "duplicate key value violates unique constraint 'idx_profiles_username_lower'"
            )
            mock_get_sb.return_value = mock_sb

            res = client.post("/api/profile/personal", json={
                "full_name": "Adithya Goud",
                "username": "taken_username",
            })
            self.assertEqual(res.status_code, 409)
            self.assertIn("already taken", res.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user_id, None)

    @patch("backend.routers.profile.get_supabase")
    def test_24f_database_unexpected_error_raises_500(self, mock_get_sb):
        """Verifies that unexpected database errors return HTTP 500 without masking."""
        app.dependency_overrides[get_current_user_id] = lambda: MOCK_USER_ID
        try:
            mock_sb = MagicMock()
            mock_sb.from_.return_value.upsert.return_value.execute.side_effect = Exception(
                "Connection terminated unexpectedly"
            )
            mock_get_sb.return_value = mock_sb

            res = client.post("/api/profile/personal", json={
                "full_name": "Adithya Goud",
            })
            self.assertEqual(res.status_code, 500)
            self.assertIn("Failed to save personal profile", res.json()["detail"])
        finally:
            app.dependency_overrides.pop(get_current_user_id, None)


class TestDatabaseMigrationContract(unittest.TestCase):
    """25-28: Schema, Migration & Trigger Safety Tests"""

    def test_25_migration_file_exists_and_contains_required_statements(self):
        migration_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "supabase",
            "migrations",
            "20261023_add_username_to_profiles.sql",
        )
        self.assertTrue(os.path.exists(migration_path), f"Missing migration file at: {migration_path}")

        with open(migration_path, "r", encoding="utf-8") as f:
            content = f.read()

        # 1. Adds username column
        self.assertIn("ADD COLUMN IF NOT EXISTS username TEXT NULL", content)
        # 2. Case-insensitive unique index
        self.assertIn("idx_profiles_username_lower", content)
        self.assertIn("LOWER(TRIM(username))", content)
        # 3. Partial index condition
        self.assertIn("WHERE username IS NOT NULL AND TRIM(username) <> ''", content)
        # 4. Format constraint
        self.assertIn("chk_profiles_username_format", content)
        self.assertIn("^[a-zA-Z0-9_]{3,30}$", content)

    def test_26_trigger_handle_new_user_preserves_manually_edited_name(self):
        migration_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "supabase",
            "migrations",
            "20261023_add_username_to_profiles.sql",
        )
        with open(migration_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Ensures that on conflict, existing full_name is NOT overwritten by OAuth metadata
        match = re.search(r"full_name\s*=\s*CASE\s+WHEN\s+profiles\.full_name\s+IS\s+NULL", content)
        self.assertIsNotNone(match, "Trigger must protect manually edited full_name from being overwritten")

    def test_27_master_schema_includes_username(self):
        master_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "supabase",
            "production",
            "01_user_profiles_and_portfolio.sql",
        )
        self.assertTrue(os.path.exists(master_path), f"Missing master schema file at: {master_path}")

        with open(master_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("username TEXT NULL", content)
        self.assertIn("idx_profiles_username_lower", content)

    def test_28_google_oauth_compatibility_nullable_username(self):
        # Verifies that a user profile created with username=None is valid
        # and doesn't violate database constraints or validation rules
        from backend.routers.profile import PersonalProfileModel
        oauth_user = PersonalProfileModel(full_name="Google User", username=None)
        self.assertEqual(oauth_user.full_name, "Google User")
        self.assertIsNone(oauth_user.username)


if __name__ == "__main__":
    unittest.main()
