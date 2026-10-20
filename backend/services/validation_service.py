"""
backend/services/validation_service.py
Authoritative validation service for user profiles, registration, and usernames.
Enforces consistent format, length, and reserved-word restrictions.
"""

import re
from typing import Tuple, Optional

# Username Policy: 3 to 30 characters, ASCII letters, numbers, and underscores only
USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9_]{3,30}$")

# Strictly reserved platform usernames to prevent impersonation or routing collisions
RESERVED_USERNAMES = frozenset({
    "admin",
    "administrator",
    "root",
    "system",
    "support",
    "owner",
    "api",
    "auth",
    "login",
    "signup",
    "register",
    "null",
    "undefined",
    "skillscatalyst",
    "guest",
    "test",
    "official",
    "help",
    "terms",
    "privacy",
    "dashboard",
    "settings",
    "profile",
    "explore",
    "learning",
})


def normalize_username(username: Optional[str]) -> str:
    """Normalizes username by stripping leading/trailing whitespace and lowercasing."""
    if not username:
        return ""
    return str(username).strip().lower()


def validate_username(username: Optional[str]) -> Tuple[bool, Optional[str]]:
    """
    Validates a proposed username against platform rules:
    - Must not be empty.
    - Must be between 3 and 30 characters long.
    - Must only contain ASCII letters (a-z, A-Z), digits (0-9), and underscores (_).
    - Must not be in the reserved usernames list (case-insensitive).
    Returns (is_valid, error_message).
    """
    if username is None:
        return False, "Username is required."

    cleaned = str(username).strip()
    if not cleaned:
        return False, "Username is required."

    if len(cleaned) < 3:
        return False, "Username must be at least 3 characters long."

    if len(cleaned) > 30:
        return False, "Username cannot exceed 30 characters."

    if not USERNAME_REGEX.match(cleaned):
        return False, "Username can only contain letters, numbers, and underscores."

    if cleaned.lower() in RESERVED_USERNAMES:
        return False, f"The username '{cleaned}' is reserved. Please choose another."

    return True, None


def validate_full_name(full_name: Optional[str]) -> Tuple[bool, Optional[str]]:
    """
    Validates a user's full name:
    - Required.
    - Cannot be whitespace-only.
    - Minimum 2 characters, maximum 100 characters.
    - Does not impose restrictive character sets to support international names.
    Returns (is_valid, error_message).
    """
    if full_name is None:
        return False, "Full name is required."

    cleaned = str(full_name).strip()
    if not cleaned:
        return False, "Full name is required."

    if len(cleaned) < 2:
        return False, "Full name must be at least 2 characters long."

    if len(cleaned) > 100:
        return False, "Full name cannot exceed 100 characters."

    return True, None
