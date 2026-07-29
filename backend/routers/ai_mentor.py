from fastapi import APIRouter
from pydantic import BaseModel
from backend.services.groq_service import chat_with_groq

router = APIRouter(prefix="/api/ai-mentor", tags=["ai-mentor"])

class PromptRequest(BaseModel):
    prompt: str

@router.post("/chat")
def chat_mentor(req: PromptRequest):
    response = chat_with_groq(req.prompt)
    return {"reply": response}
