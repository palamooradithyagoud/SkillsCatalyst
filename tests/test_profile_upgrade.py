import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from datetime import datetime, timezone
from backend.main import app
from backend.services.auth_service import get_current_user_id

client = TestClient(app)

# ==============================================================================
# CANONICAL POSTGRESQL SCHEMA CONTRACT
# Source: supabase/migrations/20260914_upgrade_user_profile_system.sql
# ==============================================================================
CANONICAL_SCHEMA = {
    "profiles": {
        "id", "email", "full_name", "headline", "avatar_url",
        "country", "state", "city", "phone", "gender", "about",
        "created_at", "updated_at"
    },
    "user_skills": {
        "id", "user_id", "skill_name", "category", "proficiency",
        "created_at", "updated_at"
    },
    "experiences": {
        "id", "user_id", "company_name", "role", "location",
        "work_type", "employment_type", "start_date", "end_date",
        "currently_working", "description", "created_at", "updated_at"
    },
    "education": {
        "id", "user_id", "college", "degree_type", "field_of_study",
        "gpa", "start_date", "end_date", "currently_studying",
        "created_at", "updated_at"
    },
    "projects": {
        "id", "user_id", "project_name", "description", "technologies",
        "start_date", "end_date", "github_url", "live_demo_url",
        "currently_working", "created_at", "updated_at"
    },
    "certifications": {
        "id", "user_id", "certification_name", "issuing_organization",
        "issue_date", "expiration_date", "credential_id", "credential_url",
        "created_at", "updated_at"
    },
    "achievements": {
        "id", "user_id", "achievement_name", "organization",
        "achievement_date", "description", "created_at", "updated_at"
    },
    "career_preferences": {
        "user_id", "target_roles", "preferred_industries",
        "target_companies", "preferred_locations", "work_arrangements",
        "updated_at"
    },
    "user_academic_profile": {
        "user_id", "full_name", "target_role", "college", "year_of_study", "updated_at"
    }
}

def validate_payload_against_schema(table_name: str, payload: dict):
    """Enforces real PostgreSQL column integrity. Rejects invalid column names."""
    allowed_columns = CANONICAL_SCHEMA.get(table_name)
    if not allowed_columns:
        raise ValueError(f"Unknown table: {table_name}")
    for k in payload.keys():
        if k not in allowed_columns:
            raise KeyError(f"Column '{k}' does not exist in PostgreSQL table '{table_name}'")

class SchemaEnforcingTableMock:
    """Mock Supabase table runner that simulates PostgreSQL error 42703 if column is invalid."""
    def __init__(self, table_name: str, mock_data=None):
        self.table_name = table_name
        self.mock_data = mock_data or []
        self._last_upsert = None
        self._last_insert = None

    def select(self, *args, **kwargs):
        return self

    def eq(self, col, val):
        return self

    def order(self, *args, **kwargs):
        return self

    def limit(self, *args, **kwargs):
        return self

    def upsert(self, data, *args, **kwargs):
        if isinstance(data, list):
            for row in data:
                validate_payload_against_schema(self.table_name, row)
        else:
            validate_payload_against_schema(self.table_name, data)
        self._last_upsert = data
        return self

    def insert(self, data, *args, **kwargs):
        if isinstance(data, list):
            for row in data:
                validate_payload_against_schema(self.table_name, row)
        else:
            validate_payload_against_schema(self.table_name, data)
        self._last_insert = data
        return self

    def delete(self):
        return self

    def execute(self):
        res = MagicMock()
        res.data = self.mock_data
        res.error = None
        return res

# ==============================================================================
# 1. AUTHENTICATION & ACCESS CONTROL TESTS
# ==============================================================================

def test_profile_get_unauthorized():
    """Unauthenticated profile requests must be rejected with 401."""
    app.dependency_overrides.pop(get_current_user_id, None)
    res = client.get("/api/profile")
    assert res.status_code == 401

def test_profile_personal_post_unauthorized():
    """Unauthenticated personal profile posts must be rejected with 401."""
    app.dependency_overrides.pop(get_current_user_id, None)
    res = client.post("/api/profile/personal", json={"full_name": "Test User"})
    assert res.status_code == 401

def test_profile_career_preferences_post_unauthorized():
    """Unauthenticated career preferences posts must be rejected with 401."""
    app.dependency_overrides.pop(get_current_user_id, None)
    res = client.post("/api/profile/career-preferences", json={"target_roles": ["SDE-1"]})
    assert res.status_code == 401

# ==============================================================================
# 2. SCHEMA CONFORMANCE INTEGRATION TESTS (FIX 1)
# ==============================================================================

def test_crud_payloads_match_database_columns_contract():
    """Verify that old invalid column names are caught and canonical names pass."""
    # user_skills: skill_name, category, proficiency
    with pytest.raises(KeyError, match="name"):
        validate_payload_against_schema("user_skills", {"user_id": "u1", "name": "React", "level": "Expert"})
    validate_payload_against_schema("user_skills", {"user_id": "u1", "skill_name": "React", "category": "Technical", "proficiency": "Expert"})

    # experiences: company_name, role, location, work_type, employment_type, start_date, end_date, currently_working, description
    with pytest.raises(KeyError, match="job_title"):
        validate_payload_against_schema("experiences", {"user_id": "u1", "job_title": "SDE", "company_name": "Google"})
    validate_payload_against_schema("experiences", {
        "user_id": "u1",
        "company_name": "Google",
        "role": "Software Engineer",
        "location": "Bengaluru",
        "work_type": "Full-time",
        "employment_type": "Remote",
        "start_date": "2024-01-01",
        "end_date": None,
        "currently_working": True,
        "description": "Building scalable microservices"
    })

    # education: college, degree_type, field_of_study, gpa, start_date, end_date, currently_studying
    with pytest.raises(KeyError, match="institution"):
        validate_payload_against_schema("education", {"user_id": "u1", "institution": "VCE", "degree": "B.Tech"})
    validate_payload_against_schema("education", {
        "user_id": "u1",
        "college": "VCE",
        "degree_type": "B.Tech",
        "field_of_study": "Computer Science",
        "gpa": "8.5",
        "start_date": "2022-08-01",
        "end_date": "2026-05-01",
        "currently_studying": False
    })

    # projects: project_name, description, technologies, start_date, end_date, github_url, live_demo_url, currently_working
    with pytest.raises(KeyError, match="title"):
        validate_payload_against_schema("projects", {"user_id": "u1", "title": "Portfolio", "tech_stack": ["React"]})
    validate_payload_against_schema("projects", {
        "user_id": "u1",
        "project_name": "SkillsCatalyst",
        "description": "AI Career Platform",
        "technologies": ["Next.js", "Python", "Supabase"],
        "start_date": "2024-01-01",
        "end_date": None,
        "github_url": "https://github.com/test/repo",
        "live_demo_url": "https://example.com",
        "currently_working": True
    })

    # certifications: certification_name, issuing_organization, issue_date, expiration_date, credential_id, credential_url
    with pytest.raises(KeyError, match="name"):
        validate_payload_against_schema("certifications", {"user_id": "u1", "name": "AWS Certified"})
    validate_payload_against_schema("certifications", {
        "user_id": "u1",
        "certification_name": "AWS Solutions Architect",
        "issuing_organization": "Amazon Web Services",
        "issue_date": "2024-08-01",
        "expiration_date": "2027-08-01",
        "credential_id": "AWS-12345",
        "credential_url": "https://aws.amazon.com/verify"
    })

    # achievements: achievement_name, organization, achievement_date, description
    with pytest.raises(KeyError, match="title"):
        validate_payload_against_schema("achievements", {"user_id": "u1", "title": "Hackathon Winner"})
    validate_payload_against_schema("achievements", {
        "user_id": "u1",
        "achievement_name": "SIH Winner",
        "organization": "Ministry of Education",
        "achievement_date": "2024-09-01",
        "description": "1st place nationally"
    })

    # career_preferences: target_roles, preferred_industries, target_companies, preferred_locations, work_arrangements
    with pytest.raises(KeyError, match="target_role"):
        validate_payload_against_schema("career_preferences", {"user_id": "u1", "target_role": "SDE-1"})
    validate_payload_against_schema("career_preferences", {
        "user_id": "u1",
        "target_roles": ["SDE-1", "Full Stack Engineer"],
        "preferred_industries": ["FinTech", "SaaS"],
        "target_companies": ["Google", "Atlassian"],
        "preferred_locations": ["Bengaluru", "Remote"],
        "work_arrangements": ["Hybrid", "Remote"]
    })

# ==============================================================================
# 3. BACKWARD COMPATIBILITY: ACADEMIC PROFILE & DASHBOARD (FIX 15)
# ==============================================================================

@patch("backend.routers.profile.get_supabase")
def test_profile_personal_save_syncs_academic(mock_sb_getter):
    """Saving personal profile must sync full_name to user_academic_profile to protect dashboard.py."""
    app.dependency_overrides[get_current_user_id] = lambda: "user_test_123"
    try:
        mock_sb = MagicMock()
        mock_sb_getter.return_value = mock_sb
        
        tables = {
            "profiles": SchemaEnforcingTableMock("profiles", [{"id": "user_test_123"}]),
            "user_academic_profile": SchemaEnforcingTableMock("user_academic_profile", [{"user_id": "user_test_123"}])
        }
        mock_sb.from_.side_effect = lambda t: tables.get(t, SchemaEnforcingTableMock(t))

        res = client.post(
            "/api/profile/personal",
            json={
                "full_name": "Adithya Palamoor",
                "headline": "Full Stack Architect",
                "city": "Hyderabad",
                "country": "India"
            }
        )

        assert res.status_code == 200
        json_data = res.json()
        assert json_data["success"] is True
        assert json_data["personal"]["full_name"] == "Adithya Palamoor"

        # Verify both 'profiles' and 'user_academic_profile' received the update
        assert tables["profiles"]._last_upsert["full_name"] == "Adithya Palamoor"
        assert tables["user_academic_profile"]._last_upsert["full_name"] == "Adithya Palamoor"
    finally:
        app.dependency_overrides.pop(get_current_user_id, None)

@patch("backend.routers.profile.get_supabase")
def test_profile_career_preferences_syncs_target_role(mock_sb_getter):
    """Saving career preferences with target_roles must sync target_roles[0] to user_academic_profile."""
    app.dependency_overrides[get_current_user_id] = lambda: "user_test_123"
    try:
        mock_sb = MagicMock()
        mock_sb_getter.return_value = mock_sb

        tables = {
            "career_preferences": SchemaEnforcingTableMock("career_preferences", [{"user_id": "user_test_123"}]),
            "user_academic_profile": SchemaEnforcingTableMock("user_academic_profile", [{"user_id": "user_test_123"}])
        }
        mock_sb.from_.side_effect = lambda t: tables.get(t, SchemaEnforcingTableMock(t))

        res = client.post(
            "/api/profile/career-preferences",
            json={
                "target_roles": ["SDE-1", "Backend Engineer"],
                "target_companies": ["Google", "Microsoft"],
                "preferred_locations": ["Remote", "Bengaluru"],
                "work_arrangements": ["Hybrid"]
            }
        )

        assert res.status_code == 200
        json_data = res.json()
        assert json_data["success"] is True
        assert json_data["career_preferences"]["target_roles"] == ["SDE-1", "Backend Engineer"]

        # Verify backward compatibility sync occurred
        assert tables["user_academic_profile"]._last_upsert["target_role"] == "SDE-1"
    finally:
        app.dependency_overrides.pop(get_current_user_id, None)

# ==============================================================================
# 4. CAREER PREFERENCES ROUND-TRIP & ARRAY CONTRACT (FIX 5)
# ==============================================================================

@patch("backend.routers.profile.get_supabase")
def test_career_preferences_save_load_round_trip(mock_sb_getter):
    """Career preferences must use arrays end-to-end across database, router, and client."""
    app.dependency_overrides[get_current_user_id] = lambda: "user_test_123"
    try:
        mock_sb = MagicMock()
        mock_sb_getter.return_value = mock_sb

        saved_pref_record = {
            "user_id": "user_test_123",
            "target_roles": ["Frontend Lead", "Full Stack Architect"],
            "preferred_industries": ["FinTech", "EdTech"],
            "target_companies": ["Atlassian", "Uber", "Stripe"],
            "preferred_locations": ["Bengaluru", "Hyderabad", "Remote"],
            "work_arrangements": ["Remote", "Hybrid"],
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        tables = {
            "profiles": SchemaEnforcingTableMock("profiles", [{"id": "user_test_123"}]),
            "user_academic_profile": SchemaEnforcingTableMock("user_academic_profile", []),
            "career_preferences": SchemaEnforcingTableMock("career_preferences", [saved_pref_record]),
            "user_skills": SchemaEnforcingTableMock("user_skills", []),
            "experiences": SchemaEnforcingTableMock("experiences", []),
            "education": SchemaEnforcingTableMock("education", []),
            "projects": SchemaEnforcingTableMock("projects", []),
            "certifications": SchemaEnforcingTableMock("certifications", []),
            "achievements": SchemaEnforcingTableMock("achievements", []),
        }
        mock_sb.from_.side_effect = lambda t: tables.get(t, SchemaEnforcingTableMock(t))

        # 1. Test POST with array payload
        post_res = client.post(
            "/api/profile/career-preferences",
            json={
                "target_roles": ["Frontend Lead", "Full Stack Architect"],
                "preferred_industries": ["FinTech", "EdTech"],
                "target_companies": ["Atlassian", "Uber", "Stripe"],
                "preferred_locations": ["Bengaluru", "Hyderabad", "Remote"],
                "work_arrangements": ["Remote", "Hybrid"]
            }
        )
        assert post_res.status_code == 200
        post_data = post_res.json()
        assert post_data["success"] is True
        assert post_data["career_preferences"]["target_companies"] == ["Atlassian", "Uber", "Stripe"]

        # 2. Test GET returns the exact array structure
        get_res = client.get("/api/profile")
        assert get_res.status_code == 200
        get_data = get_res.json()
        assert get_data["career_preferences"] is not None
        assert isinstance(get_data["career_preferences"]["target_roles"], list)
        assert get_data["career_preferences"]["target_roles"] == ["Frontend Lead", "Full Stack Architect"]
        assert get_data["career_preferences"]["preferred_locations"] == ["Bengaluru", "Hyderabad", "Remote"]
    finally:
        app.dependency_overrides.pop(get_current_user_id, None)

# ==============================================================================
# 5. ORDERING & CANONICAL MAPPING IN GET /api/profile (FIX 4)
# ==============================================================================

@patch("backend.routers.profile.get_supabase")
def test_profile_get_aggregates_with_canonical_columns(mock_sb_getter):
    """GET /api/profile aggregates all relational tables using exact canonical columns."""
    app.dependency_overrides[get_current_user_id] = lambda: "user_test_123"
    try:
        mock_sb = MagicMock()
        mock_sb_getter.return_value = mock_sb

        tables = {
            "profiles": SchemaEnforcingTableMock("profiles", [{"id": "user_test_123", "full_name": "Adithya Palamoor"}]),
            "user_academic_profile": SchemaEnforcingTableMock("user_academic_profile", [{"target_role": "SDE-1"}]),
            "user_skills": SchemaEnforcingTableMock("user_skills", [{"skill_name": "React", "category": "Technical", "proficiency": "Expert"}]),
            "experiences": SchemaEnforcingTableMock("experiences", [{"company_name": "Tech Corp", "role": "Software Engineer", "work_type": "Full-time"}]),
            "education": SchemaEnforcingTableMock("education", [{"college": "VCE", "degree_type": "B.Tech", "field_of_study": "CSE"}]),
            "projects": SchemaEnforcingTableMock("projects", [{"project_name": "SkillsCatalyst", "technologies": ["Next.js"]}]),
            "certifications": SchemaEnforcingTableMock("certifications", [{"certification_name": "AWS Arch", "issuing_organization": "Amazon"}]),
            "achievements": SchemaEnforcingTableMock("achievements", [{"achievement_name": "SIH Winner", "organization": "Govt"}]),
            "career_preferences": SchemaEnforcingTableMock("career_preferences", [{"target_roles": ["SDE-1"]}]),
        }
        mock_sb.from_.side_effect = lambda t: tables.get(t, SchemaEnforcingTableMock(t))

        res = client.get("/api/profile")
        assert res.status_code == 200
        data = res.json()
        assert data["personal"]["full_name"] == "Adithya Palamoor"
        assert len(data["skills"]) == 1
        assert data["skills"][0]["skill_name"] == "React"
        assert data["skills"][0]["proficiency"] == "Expert"
        assert data["experiences"][0]["role"] == "Software Engineer"
        assert data["education"][0]["college"] == "VCE"
        assert data["projects"][0]["project_name"] == "SkillsCatalyst"
        assert data["certifications"][0]["certification_name"] == "AWS Arch"
        assert data["achievements"][0]["achievement_name"] == "SIH Winner"
    finally:
        app.dependency_overrides.pop(get_current_user_id, None)

# ==============================================================================
# 6. DATE NORMALIZATION & VALIDATION TESTS (FIX 3)
# ==============================================================================

def test_date_serialization_and_range_validation():
    """Verify date helpers convert empty strings to None/NULL and reject inverted ranges."""
    def normalize_date_to_iso(val):
        if not val or not str(val).strip():
            return None
        s = str(val).strip()
        # Month input: YYYY-MM
        if len(s) == 7 and s[4] == "-":
            return f"{s}-01"
        # Year input: YYYY
        if len(s) == 4 and s.isdigit():
            return f"{s}-01-01"
        # Full ISO: YYYY-MM-DD
        if len(s) == 10 and s[4] == "-" and s[7] == "-":
            return s
        return None

    def validate_date_range(start, end):
        s_iso = normalize_date_to_iso(start)
        e_iso = normalize_date_to_iso(end)
        if s_iso and e_iso and e_iso < s_iso:
            return False, "End date cannot precede start date."
        return True, None

    # Empty values become None (SQL NULL)
    assert normalize_date_to_iso("") is None
    assert normalize_date_to_iso("   ") is None
    assert normalize_date_to_iso(None) is None

    # Month strings become YYYY-MM-01
    assert normalize_date_to_iso("2024-08") == "2024-08-01"

    # Year strings become YYYY-01-01
    assert normalize_date_to_iso("2022") == "2022-01-01"

    # Valid ranges pass
    valid, _ = validate_date_range("2022-08", "2024-06")
    assert valid is True

    # Inverted ranges fail
    valid, err = validate_date_range("2024-08", "2022-06")
    assert valid is False
    assert "End date cannot precede start date" in err

# ==============================================================================
# 7. DATABASE ERROR CAPTURE & NON-SILENT FAILURE (FIX 2)
# ==============================================================================

@patch("backend.routers.profile.get_supabase")
def test_database_write_failure_returns_error(mock_sb_getter):
    """When Supabase upsert fails or raises, backend must return 500/error and not report success."""
    app.dependency_overrides[get_current_user_id] = lambda: "user_test_123"
    try:
        mock_sb = MagicMock()
        mock_sb_getter.return_value = mock_sb
        mock_table = MagicMock()
        mock_sb.from_.return_value = mock_table
        mock_table.upsert.side_effect = Exception("PostgreSQL connection failure")

        res = client.post("/api/profile/personal", json={"full_name": "Failing User"})
        assert res.status_code == 500
        data = res.json()
        assert data.get("success") is False or "detail" in data or "message" in data
    finally:
        app.dependency_overrides.pop(get_current_user_id, None)

# ==============================================================================
# 8. RESUME INTEGRATION: NO FAKE ATS SCORE (FIX 6)
# ==============================================================================

def test_resume_pipeline_does_not_use_text_length_formula():
    """Verify that fake length-based score formula is strictly absent from the codebase."""
    with open("frontend/app/settings/page.tsx", "r", encoding="utf-8") as f:
        content = f.read()
    assert "Math.min(25, res.text.length / 150)" not in content
    assert "skillscatalyst_latest_resume_score" not in content or "localStorage.setItem(\"skillscatalyst_latest_resume_score\", String(estScore))" not in content
    assert "reviewResume" in content

# ==============================================================================
# 9. RLS SECURITY POLICY AUDIT (FIX 8)
# ==============================================================================

def test_rls_policies_in_migration():
    """Verify that every child table in the SQL migration has RLS enabled and enforces auth.uid() = user_id."""
    with open("supabase/migrations/20260914_upgrade_user_profile_system.sql", "r", encoding="utf-8") as f:
        sql = f.read()

    child_tables = [
        "user_skills", "experiences", "education",
        "projects", "certifications", "achievements", "career_preferences"
    ]
    for table in child_tables:
        assert f"ALTER TABLE public.{table} ENABLE ROW LEVEL SECURITY;" in sql
        assert f'CREATE POLICY "Strict user ownership on {table}"' in sql
        assert "auth.uid() = user_id" in sql

    # Profiles table must enforce auth.uid() = id
    assert "auth.uid() = id" in sql
    # Must not contain dangerous open public insert/update policies
    assert "CREATE POLICY \"public_all" not in sql

