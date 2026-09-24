"""
backend/models/notification.py
Pydantic data models for Web Push Subscriptions, In-App Notifications, and Preferences.
"""

from enum import Enum
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, HttpUrl, field_validator


class NotificationType(str, Enum):
    STREAK = "streak"
    EVENT = "event"
    SCHOLARSHIP = "scholarship"
    MENTOR = "mentor"
    RESUME = "resume"


class PushSubscriptionKeys(BaseModel):
    p256dh: str = Field(..., description="P-256 client public key (base64url)")
    auth: str = Field(..., description="Auth authentication secret (base64url)")


class PushSubscriptionPayload(BaseModel):
    endpoint: str = Field(..., description="Unique browser push service endpoint URL")
    keys: PushSubscriptionKeys = Field(..., description="Client cryptography keys")
    user_agent: Optional[str] = Field(default="", description="Browser User-Agent for device differentiation")

    @field_validator("endpoint")
    @classmethod
    def validate_endpoint(cls, v: str) -> str:
        s = v.strip()
        if not s.startswith("https://") and not s.startswith("http://localhost"):
            raise ValueError("Push endpoint must use HTTPS scheme")
        return s


class PushSubscriptionDeleteRequest(BaseModel):
    endpoint: str = Field(..., description="Push subscription endpoint to remove")


class NotificationPreferencesUpdate(BaseModel):
    streak_enabled: Optional[bool] = None
    events_enabled: Optional[bool] = None
    scholarships_enabled: Optional[bool] = None


class NotificationPreferencesResponse(BaseModel):
    streak_enabled: bool = True
    events_enabled: bool = True
    scholarships_enabled: bool = True


class NotificationItemResponse(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    body: str
    url: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    is_read: bool = False
    sent_at: Optional[str] = None
    created_at: str


class NotificationListResponse(BaseModel):
    total: int
    unread_count: int
    notifications: List[NotificationItemResponse]


class SendNotificationRequest(BaseModel):
    user_id: str
    notification_type: NotificationType
    title: str = Field(..., min_length=1, max_length=150)
    body: str = Field(..., min_length=1, max_length=500)
    url: Optional[str] = Field(default=None, max_length=300)
    metadata: Optional[Dict[str, Any]] = None

    @field_validator("url")
    @classmethod
    def validate_safe_url(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        s = v.strip()
        # Security invariant: Allow relative paths or approved domain prefixes only
        if s.startswith("/"):
            return s
        if s.startswith("http://localhost:3000") or s.startswith("https://www.skillscatalyst.in") or s.startswith("https://skillscatalyst.in"):
            return s
        raise ValueError("Notification target URL must be an internal path or official SkillsCatalyst domain")
