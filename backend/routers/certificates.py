"""
backend/routers/certificates.py
Phase 7 — Certificates Router.
Provides:
  1. Student certificates list (GET /api/certificates)
  2. Single certificate retrieval (GET /api/certificates/{certificate_id})
  3. Safe public certificate verification (GET /api/public/certificates/{verification_id})
"""

from typing import List
from fastapi import APIRouter, Depends, status

from backend.services.auth_service import get_current_user_id
from backend.models.certificate import (
    CertificateResponse,
    PublicCertificateVerificationResponse,
)
from backend.services.certificate_service import (
    get_student_certificates,
    get_student_certificate_by_id,
    verify_certificate_public,
)

router = APIRouter(tags=["certificates"])


# ── Student Certificate Endpoints ────────────────────────────────────────────

@router.get(
    "/api/certificates",
    status_code=status.HTTP_200_OK,
    response_model=List[CertificateResponse],
)
def list_student_certificates_endpoint(
    user_id: str = Depends(get_current_user_id),
) -> List[CertificateResponse]:
    """
    Returns all certificates issued to the authenticated student across all courses.
    Cross-user isolation: students can only ever see their own certificates.
    """
    certs = get_student_certificates(user_id=user_id)
    return [CertificateResponse(**c) for c in certs]


@router.get(
    "/api/certificates/{certificate_id}",
    status_code=status.HTTP_200_OK,
    response_model=CertificateResponse,
)
def get_student_certificate_endpoint(
    certificate_id: str,
    user_id: str = Depends(get_current_user_id),
) -> CertificateResponse:
    """
    Returns a specific certificate owned by the authenticated student.
    Returns 404 if not found or if belonging to another student.
    """
    cert = get_student_certificate_by_id(user_id=user_id, certificate_id=certificate_id)
    return CertificateResponse(**cert)


# ── Public Verification Endpoint ─────────────────────────────────────────────

@router.get(
    "/api/public/certificates/{verification_id}",
    status_code=status.HTTP_200_OK,
    response_model=PublicCertificateVerificationResponse,
)
def public_verify_certificate_endpoint(
    verification_id: str,
) -> PublicCertificateVerificationResponse:
    """
    Publicly verifies a certificate using its unique verification ID.
    Requires NO authentication.
    Strictly returns safe public fields; NEVER exposes auth IDs, emails,
    private profile fields, internal IDs, quiz details, or progress records.
    """
    res = verify_certificate_public(verification_id=verification_id)
    return PublicCertificateVerificationResponse(**res)
