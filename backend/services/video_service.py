"""
backend/services/video_service.py
Provider-agnostic video service facade for SkillsCatalyst.
Delegates to specific provider implementations (currently Mux Video).
Phase: Step 2 (SkillBits Mux Video Integration)
"""

from typing import Dict, Any, Optional
from backend.services import mux_service


async def create_direct_upload(skillbit_id: str, cors_origin: Optional[str] = None) -> Dict[str, Any]:
    """Initiates a direct video upload session for a SkillBit."""
    return await mux_service.create_direct_upload(skillbit_id=skillbit_id, cors_origin=cors_origin)


async def get_upload_status(upload_id: str) -> Dict[str, Any]:
    """Retrieves upload status from the video provider."""
    return await mux_service.get_upload(upload_id=upload_id)


async def get_asset_details(asset_id: str) -> Dict[str, Any]:
    """Retrieves asset status, duration, and playback info from the video provider."""
    return await mux_service.get_asset(asset_id=asset_id)


def extract_playback_id(asset_data: Dict[str, Any]) -> Optional[str]:
    """Extracts the public streaming playback ID from asset metadata."""
    return mux_service.extract_playback_id(asset_data)


def verify_webhook_authenticity(raw_body: bytes, signature_header: Optional[str]) -> bool:
    """Verifies cryptographic signature for incoming provider webhooks."""
    return mux_service.verify_webhook_signature(raw_body, signature_header)
