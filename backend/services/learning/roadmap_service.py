"""
SkillsCatalyst - Learning Roadmap Service
Phase 2.1 Modular Architecture

Tier 3 Resolution: Groq AI LLM-powered structured roadmap generation
with 5-tier fallback when Groq is unavailable.
"""

import json
import logging
from fastapi import HTTPException
from pydantic import BaseModel
from backend.services.learning.content_guard import _validate_skill_query

logger = logging.getLogger(__name__)


class RoadmapRequest(BaseModel):
    skill: str
    # user_id intentionally excluded — roadmap generation is not user-specific


def _get_fallback_roadmap(skill: str) -> dict:
    """Returns static 5-tier roadmap when Groq AI is unavailable or fails."""
    return {
        "success": True,
        "roadmap": {
            "title": f"{skill} Learning Path",
            "tiers": [
                {"tier": 1, "name": "Primary Foundation", "description": "Core concepts and fundamentals.", "nodes": [f"{skill} Basics", "Environment Setup", "Core Syntax"]},
                {"tier": 2, "name": "Fast Track Acceleration", "description": "Practical implementation.", "nodes": ["Data Handling", "Modular Design", "Best Practices"]},
                {"tier": 3, "name": "Interview Preparation", "description": "Interview problem solving.", "nodes": ["Coding Challenges", "System Patterns", "Mock Questions"]},
                {"tier": 4, "name": "Applied Capstone Project", "description": "Portfolio projects.", "nodes": ["End-to-End App", "API Integration", "Deployment"]},
                {"tier": 5, "name": "Advanced Architecture", "description": "Performance & scaling.", "nodes": ["Optimization", "Security", "Scalability"]}
            ]
        }
    }


async def generate_skill_roadmap(req: RoadmapRequest) -> dict:
    """
    Tier 3 Resolution: Generate a 5-tier structured skill roadmap via Groq AI (Llama-3.3 70B).
    Tiers:
    1. Primary Foundation
    2. Fast Track Acceleration
    3. Interview Preparation
    4. Applied Capstone Project
    5. Advanced Architecture
    """
    skill = req.skill.strip()
    if not skill:
        raise HTTPException(status_code=400, detail="Skill prompt cannot be empty")

    is_valid, err_msg = _validate_skill_query(skill)
    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail={"error": "not_skill", "message": err_msg}
        )

    prompt = f"""
Generate a structured 5-tier learning & career roadmap for the topic/skill: "{skill}".

Respond ONLY with valid JSON in this exact structure:
{{
  "title": "{skill} Career Roadmap",
  "tiers": [
    {{
      "tier": 1,
      "name": "Primary Foundation",
      "description": "Core concepts and fundamental syntax/principles.",
      "nodes": ["Concept 1", "Concept 2", "Concept 3"]
    }},
    {{
      "tier": 2,
      "name": "Fast Track Acceleration",
      "description": "Intermediate techniques, libraries, and practical implementation.",
      "nodes": ["Topic 1", "Topic 2", "Topic 3"]
    }},
    {{
      "tier": 3,
      "name": "Interview Preparation",
      "description": "Common interview questions, problem solving, and system design patterns.",
      "nodes": ["Pattern 1", "Pattern 2", "Pattern 3"]
    }},
    {{
      "tier": 4,
      "name": "Applied Capstone Project",
      "description": "Real-world portfolio projects and production deployments.",
      "nodes": ["Project 1", "Project 2"]
    }},
    {{
      "tier": 5,
      "name": "Advanced Architecture",
      "description": "Deep performance optimization, internal mechanics, and enterprise architecture.",
      "nodes": ["Advanced 1", "Advanced 2"]
    }}
  ]
}}
"""
    sys_prompt = "You are SkillsCatalyst AI, an expert tech curriculum generator. Output JSON ONLY, no markdown ticks or extra text."

    try:
        from backend.services.groq_service import chat_with_groq
        raw_reply = chat_with_groq(prompt, system_prompt=sys_prompt)

        clean_json = raw_reply.strip()
        if clean_json.startswith("```"):
            lines = clean_json.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            clean_json = "\n".join(lines).strip()

        data = json.loads(clean_json)
        return {"success": True, "roadmap": data}
    except Exception as e:
        logger.info(f"Roadmap generation fallback triggered: {type(e).__name__}")
        return _get_fallback_roadmap(skill)
