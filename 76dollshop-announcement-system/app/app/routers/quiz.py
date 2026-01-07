from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.auth import get_current_user
from app.config import settings
from openai import OpenAI
import json

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


class QuizGenerateRequest(BaseModel):
    title: str
    content: str


@router.post("/generate")
async def generate_quiz(
    request: QuizGenerateRequest,
    current_user: str = Depends(get_current_user)
):
    """Generate quiz questions using ChatGPT"""
    if not settings.openai_api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")

    try:
        client = OpenAI(api_key=settings.openai_api_key)

        prompt = f"""根據以下公告內容，請生成 10 到 15 題的選擇題測驗，用來測試員工是否理解公告內容。

標題：{request.title}

內容：{request.content}

請以 JSON 格式回傳，結構如下：
{{"questions": [{{"question": "問題內容", "options": ["選項A", "選項B", "選項C", "選項D"], "correctAnswer": 0}}]}}
其中 correctAnswer 是正確答案的索引（0-3）。請只回傳 JSON，不要有其他文字。"""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )

        chat_response = response.choices[0].message.content.strip()

        # Remove markdown code blocks if present
        if chat_response.startswith("```json"):
            chat_response = chat_response[7:]
        elif chat_response.startswith("```"):
            chat_response = chat_response[3:]

        if chat_response.endswith("```"):
            chat_response = chat_response[:-3]

        chat_response = chat_response.strip()

        # Parse JSON
        quiz_data = json.loads(chat_response)

        return quiz_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")
