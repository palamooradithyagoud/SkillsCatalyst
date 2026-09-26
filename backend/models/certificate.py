"""
backend/models/certificate.py
Phase 7 — Pydantic Models for Course-Specific Certificates, Templates,
Issuance, Eligibility, and Public Verification.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class CertificateTemplateCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Template display name")
    description: Optional[str] = Field(None, max_length=500, description="Optional design notes or description")
    background_media_url: str = Field(..., min_length=5, description="Storage public URL or SVG data URL")
    design_theme: str = Field("skillscatalyst_official", description="Theme identifier (e.g. skillscatalyst_official, professional_blue, modern_gold, technical_dark)")
    is_active: bool = Field(True, description="Whether this template is available for course assignment")


class CertificateTemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    background_media_url: Optional[str] = Field(None, min_length=5)
    design_theme: Optional[str] = None
    is_active: Optional[bool] = None


class CertificateTemplateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: Optional[str] = None
    background_media_url: str
    design_theme: str
    is_active: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class CourseCertificateConfigUpdate(BaseModel):
    enabled: bool = Field(..., description="Whether this course issues certificates upon completion")
    certificate_template_id: Optional[str] = Field(None, description="UUID of the certificate template to use")


class CourseCertificateConfigResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    course_id: str
    enabled: bool
    certificate_template_id: Optional[str] = None
    template_name: Optional[str] = None
    design_theme: Optional[str] = None
    background_media_url: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class CertificateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    certificate_number: str
    verification_id: str
    course_id: str
    course_title: str
    student_name: str
    college_name: str
    score: int
    issued_at: str
    status: str
    design_theme: str
    background_media_url: str
    verification_url: str
    created_at: Optional[str] = None


class PublicCertificateVerificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    is_valid: bool
    message: Optional[str] = None
    certificate_number: Optional[str] = None
    verification_id: Optional[str] = None
    student_name: Optional[str] = None
    college_name: Optional[str] = None
    course_title: Optional[str] = None
    score: Optional[int] = None
    issued_at: Optional[str] = None
    status: Optional[str] = None
    design_theme: Optional[str] = None
    background_media_url: Optional[str] = None
    verification_url: Optional[str] = None


class CertificateEligibilityResponse(BaseModel):
    course_id: str
    course_title: str
    certificate_enabled: bool
    all_lessons_completed: bool
    all_quizzes_passed: bool
    all_modules_completed: bool
    course_completed: bool
    course_score: Optional[int] = None
    can_issue_certificate: bool
    certificate_already_issued: bool
    existing_certificate_id: Optional[str] = None
    existing_certificate_number: Optional[str] = None
    student_full_name: str
    student_college: str
    is_identity_locked: bool
    reason_ineligible: Optional[str] = None


class UpdateCertificateIdentityRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="Authoritative full legal name for certificates")
    college: str = Field(..., min_length=2, max_length=200, description="Authoritative college / institution name for certificates")


class CertificatePreviewData(BaseModel):
    student_name: str = "John Doe"
    college_name: str = "Example Institute of Technology"
    course_title: str
    score: int = 92
    issued_date: str
    certificate_id: str = "SC-CERT-2026-DEMO"
    verification_url: str
    design_theme: str
    background_media_url: str
