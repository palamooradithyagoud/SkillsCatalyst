"""
backend/models/mood.py
Pydantic data models for SkillsCatalyst Daily Mood Tracker and Calendar system.
"""

from enum import Enum
from typing import Optional, List, Dict
from pydantic import BaseModel, Field


class MoodType(str, Enum):
    happy = "happy"
    angry = "angry"
    sleepy = "sleepy"
    bored = "bored"
    calm = "calm"
    wacky = "wacky"
    pouty = "pouty"


class LogMoodRequest(BaseModel):
    mood: MoodType
    log_date: Optional[str] = Field(
        default=None,
        description="Date in YYYY-MM-DD format. Defaults to today's date if omitted.",
        pattern=r"^\d{4}-\d{2}-\d{2}$"
    )
    note: Optional[str] = Field(default=None, max_length=1000)


class MoodLogResponse(BaseModel):
    id: str
    user_id: str
    log_date: str
    mood: MoodType
    note: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class MonthlyMoodSummaryResponse(BaseModel):
    year: int
    month: int
    logs: List[MoodLogResponse] = []
    predominant_mood: Optional[str] = None
    total_logged: int = 0
    mood_counts: Dict[str, int] = Field(default_factory=dict)
