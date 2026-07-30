import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, field_validator
from backend.services.groq_service import chat_with_groq

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai-mentor", tags=["ai-mentor"])


# ---------------------------------------------------------------------------
# Request / Response Models
# ---------------------------------------------------------------------------

class PromptRequest(BaseModel):
    prompt: str


class ResumeReviewRequest(BaseModel):
    resume_text: str
    target_role: str
    years_experience: Optional[str] = "1-3 years"
    company_type: Optional[str] = "Product-Based"
    job_description: Optional[str] = None

    @field_validator("resume_text")
    @classmethod
    def resume_text_must_be_meaningful(cls, v: str) -> str:
        if not v or len(v.strip()) < 50:
            raise ValueError(
                "resume_text is too short. Please provide at least 50 characters of resume content."
            )
        return v.strip()

    @field_validator("target_role")
    @classmethod
    def target_role_required(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("target_role cannot be empty.")
        return v.strip()


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/chat")
async def chat_mentor(req: PromptRequest):
    """General AI mentor chat endpoint."""
    logger.info(f"AI mentor chat request (prompt length={len(req.prompt)}).")
    response = chat_with_groq(req.prompt)
    return {"reply": response}


@router.post("/review-resume")
async def review_resume(req: ResumeReviewRequest):
    """
    Performs a full AI-powered resume review using Groq LLM.

    Accepts clean plain text (extracted by /api/resume/extract), plus
    context about the target role, experience level, and company type.
    Never receives or processes binary file data.
    """
    target_role = req.target_role
    years_exp = req.years_experience or "1-3 years"
    company_type = req.company_type or "Product-Based"
    job_desc = (
        f"\nJob Description:\n{req.job_description.strip()}"
        if req.job_description and req.job_description.strip()
        else ""
    )
    resume_text = req.resume_text

    logger.info(
        f"Resume review requested: role='{target_role}', company='{company_type}', "
        f"exp='{years_exp}', resume_chars={len(resume_text)}."
    )

    system_prompt = (
        "You are an expert ATS Resume Reviewer and Hiring Manager "
        "with 15+ years of experience across tech roles."
    )

    user_prompt = f"""Your task is to analyze a candidate's resume against a TARGET ROLE and provide a brutally honest, high-quality, actionable review.

INPUTS:
1. Resume Content (clean plain text extracted from candidate's document):
{resume_text}

2. Target Role (Job Title + optional Job Description):
Job Title: {target_role}{job_desc}
Claimed Seniority: {years_exp}
Target Company Type: {company_type}

---

EVALUATION FRAMEWORK:

1. ATS COMPATIBILITY
- Check keyword optimization for the target role
- Identify missing critical keywords
- Evaluate formatting issues that may break ATS
- Score ATS compatibility (0–10)

2. ROLE ALIGNMENT
- How well does the resume match the target role?
- Identify irrelevant content
- Highlight missing role-specific skills
- Score alignment (0–10)

3. IMPACT & ACHIEVEMENTS
- Are bullet points result-driven or task-based?
- Check for quantification (metrics, numbers, outcomes)
- Rewrite 3–5 weak bullets into strong impact statements
- Score impact (0–10)

4. STRUCTURE & CLARITY
- Evaluate readability and flow
- Section ordering effectiveness
- Conciseness and clarity
- Score structure (0–10)

5. SKILLS & PROJECTS ANALYSIS
- Are skills relevant and properly categorized?
- Are projects strong enough for the target role?
- Suggest improvements or missing projects

---

OUTPUT FORMAT:

## 🧠 Overall Verdict
- Short, direct evaluation (2–3 lines)
- Final Score: X/10
- Hire / No Hire / Borderline

## 📊 Section-wise Scores
- ATS Compatibility: X/10
- Role Alignment: X/10
- Impact: X/10
- Structure: X/10

## ❌ Critical Issues (Top 5)
- List major problems clearly

## 🔧 Bullet Fixes (Before → After)
- Rewrite at least 3 weak bullet points into strong, quantified versions

## 📈 Missing Keywords
- List important keywords missing for the target role

## 🚀 Improvement Plan
- Step-by-step actions to improve the resume

## ✨ Optional Advanced Suggestions
- Portfolio / GitHub / certifications / projects to add

---

STRICT RULES:
- Be brutally honest, avoid generic praise
- Give specific rewrites, not vague suggestions
- Focus on impact, metrics, and role relevance
- Assume this resume is competing at a top 10% level"""

    review_text = chat_with_groq(user_prompt, system_prompt=system_prompt)

    if not review_text or review_text.startswith("AI Mentor error:"):
        logger.error(f"Groq returned an error response: {review_text}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={
                "success": False,
                "message": "AI evaluator is temporarily unavailable. Please try again.",
            },
        )

    logger.info(f"Resume review completed ({len(review_text)} chars returned).")
    return {"review": review_text}
