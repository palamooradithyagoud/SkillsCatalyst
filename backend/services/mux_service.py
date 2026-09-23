"""
backend/services/mux_service.py
Low-level Mux Video API integration.
Handles Direct Upload generation, asset inspection, and cryptographic webhook signature verification.
Phase: Step 2 (Mux Ingestion Pipeline)
"""

import hmac
import hashlib
import time
import logging
from typing import Dict, Any, Optional
import httpx
from fastapi import HTTPException, status

from backend.config import (
    MUX_TOKEN_ID,
    MUX_TOKEN_SECRET,
    MUX_WEBHOOK_SECRET,
    IS_PRODUCTION,
)

logger = logging.getLogger("skillscatalyst.mux")

MUX_API_BASE = "https://api.mux.com/video/v1"
SIGNATURE_TOLERANCE_SECONDS = 300  # 5 minutes


class MuxConfigurationError(Exception):
    """Raised when MUX credentials are not properly configured."""
    pass


def _get_auth() -> tuple[str, str]:
    if not MUX_TOKEN_ID or not MUX_TOKEN_SECRET:
        logger.error("Mux API credentials missing in environment.")
        raise MuxConfigurationError("Mux video integration is not configured.")
    return (MUX_TOKEN_ID, MUX_TOKEN_SECRET)


async def create_direct_upload(skillbit_id: str, cors_origin: Optional[str] = None) -> Dict[str, Any]:
    """
    Creates a Mux Direct Upload session for a SkillBit.
    Returns temporary signed upload URL and upload ID.
    The caller (browser) uploads video bytes directly to Mux.
    """
    auth = _get_auth()
    url = f"{MUX_API_BASE}/uploads"

    # Mux expects cors_origin string (e.g. frontend domain or "*")
    origin = cors_origin.strip() if cors_origin and cors_origin.strip() else "*"

    payload = {
        "cors_origin": origin,
        "new_asset_settings": {
            "playback_policies": ["public"],
            "passthrough": str(skillbit_id).strip(),
        },
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload, auth=auth)

        if resp.status_code not in (200, 201):
            logger.error(f"Mux Direct Upload creation failed: HTTP {resp.status_code}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to initiate video upload session with video provider.",
            )

        resp_data = resp.json().get("data", {})
        upload_id = resp_data.get("id")
        upload_url = resp_data.get("url")
        status_val = resp_data.get("status", "waiting")

        if not upload_id or not upload_url:
            logger.error("Mux returned unexpected response format missing id or url.")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Invalid response format from video provider.",
            )

        return {
            "upload_id": upload_id,
            "upload_url": upload_url,
            "status": status_val,
        }

    except httpx.RequestError as e:
        logger.error(f"Network error communicating with Mux API: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to reach video ingestion service. Please try again later.",
        )


async def get_upload(upload_id: str) -> Dict[str, Any]:
    """Fetches details for a Mux Direct Upload."""
    auth = _get_auth()
    url = f"{MUX_API_BASE}/uploads/{upload_id}"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, auth=auth)

        if resp.status_code == 404:
            raise HTTPException(status_code=404, detail="Upload session not found on provider.")
        if resp.status_code != 200:
            logger.error(f"Failed to fetch Mux upload {upload_id}: HTTP {resp.status_code}")
            raise HTTPException(status_code=resp.status_code, detail="Failed to retrieve upload status from provider.")

        return resp.json().get("data", {})
    except httpx.RequestError as e:
        logger.error(f"Network error fetching Mux upload: {e}")
        raise HTTPException(status_code=503, detail="Video provider unavailable.")


async def get_asset(asset_id: str) -> Dict[str, Any]:
    """Fetches details for a Mux Asset (including playback_ids and duration)."""
    auth = _get_auth()
    url = f"{MUX_API_BASE}/assets/{asset_id}"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, auth=auth)

        if resp.status_code == 404:
            raise HTTPException(status_code=404, detail="Asset not found on video provider.")
        if resp.status_code != 200:
            logger.error(f"Failed to fetch Mux asset {asset_id}: HTTP {resp.status_code}")
            raise HTTPException(status_code=resp.status_code, detail="Failed to retrieve asset details from provider.")

        return resp.json().get("data", {})
    except httpx.RequestError as e:
        logger.error(f"Network error fetching Mux asset: {e}")
        raise HTTPException(status_code=503, detail="Video provider unavailable.")


def extract_playback_id(asset_data: Dict[str, Any]) -> Optional[str]:
    """Extracts the first public playback ID from a Mux asset object."""
    playback_ids = asset_data.get("playback_ids", [])
    for p in playback_ids:
        if isinstance(p, dict) and p.get("policy") == "public" and p.get("id"):
            return str(p["id"]).strip()
    # Fallback to any id if public not specified
    if playback_ids and isinstance(playback_ids[0], dict) and playback_ids[0].get("id"):
        return str(playback_ids[0]["id"]).strip()
    return None


def verify_webhook_signature(
    raw_body: bytes,
    signature_header: Optional[str],
    secret: Optional[str] = None,
) -> bool:
    """
    Verifies Mux webhook cryptographic HMAC-SHA256 signature from 'Mux-Signature' header.
    Format: 't=1565220904,v1=20c75c118...'
    Signed payload: f"{t}.{raw_body.decode('utf-8')}"
    """
    import backend.config as cfg
    webhook_secret = (
        secret
        or getattr(cfg, "MUX_WEBHOOK_SECRET", None)
        or MUX_WEBHOOK_SECRET
        or ""
    ).strip()

    # If webhook signing secret is not configured:
    if not webhook_secret:
        if IS_PRODUCTION:
            logger.critical("MUX_WEBHOOK_SECRET is not configured in production! Rejecting unverified webhook.")
            return False
        logger.warning("MUX_WEBHOOK_SECRET not configured. Bypassing signature check in development.")
        return True

    if not signature_header:
        logger.warning("Missing Mux-Signature header in webhook request.")
        return False

    try:
        # Parse timestamp and v1 signature from header
        parts = {}
        for item in signature_header.split(","):
            if "=" in item:
                k, v = item.split("=", 1)
                parts[k.strip()] = v.strip()

        timestamp_str = parts.get("t")
        received_sig = parts.get("v1")

        if not timestamp_str or not received_sig:
            logger.warning("Malformed Mux-Signature header format.")
            return False

        # Tolerance check to prevent replay attacks
        try:
            ts = int(timestamp_str)
            current_time = int(time.time())
            if abs(current_time - ts) > SIGNATURE_TOLERANCE_SECONDS:
                logger.warning(f"Mux webhook signature timestamp expired: ts={ts}, now={current_time}")
                return False
        except ValueError:
            logger.warning("Invalid timestamp format in Mux-Signature.")
            return False

        # Compute expected HMAC signature
        signed_payload = f"{timestamp_str}.".encode("utf-8") + raw_body
        expected_sig = hmac.new(
            key=webhook_secret.encode("utf-8"),
            msg=signed_payload,
            digestmod=hashlib.sha256,
        ).hexdigest()

        return hmac.compare_digest(expected_sig, received_sig)

    except Exception as e:
        logger.warning(f"Error during Mux webhook signature verification: {e}")
        return False
