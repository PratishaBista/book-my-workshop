"""
Text Enhancement API routes.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.enhancer import enhancer

router = APIRouter(prefix="/api/v1", tags=["enhancement"])


class EnhanceRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)


class EnhanceResponse(BaseModel):
    original_text: str
    enhanced_text: str
    provider: str | None = None
    unchanged: bool = False


def _build_response(original: str, outcome) -> EnhanceResponse:
    unchanged = outcome.text.strip() == original.strip()
    return EnhanceResponse(
        original_text=original,
        enhanced_text=outcome.text,
        provider=outcome.provider,
        unchanged=unchanged,
    )


@router.post("/enhance", response_model=EnhanceResponse)
async def enhance_workshop_text(request: EnhanceRequest):
    """Polish workshop description via Ollama, Groq, OpenAI, or Hugging Face."""
    original = request.text.strip()
    outcome = enhancer.enhance(original)

    if not outcome.ok:
        raise HTTPException(status_code=503, detail=outcome.error or "Enhancement unavailable.")

    if outcome.text.strip() == original:
        raise HTTPException(
            status_code=422,
            detail=f"Model ({outcome.provider}) did not change the text. Try writing a bit more detail first.",
        )

    return _build_response(original, outcome)
