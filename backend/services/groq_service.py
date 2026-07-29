from groq import Groq
from backend.config import GROQ_API_KEY

groq_client = None

if GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        print(f"Warning: Failed to initialize Groq client: {e}")

def chat_with_groq(prompt: str, system_prompt: str = "You are SkillPath AI Mentor, an expert career coach and tech interviewer.") -> str:
    if not groq_client:
        return "Groq AI key not configured."
    try:
        response = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=1024
        )
        return response.choices[0].message.content or "No response from AI."
    except Exception as e:
        print(f"Groq API Error: {e}")
        return f"AI Mentor error: {str(e)}"
