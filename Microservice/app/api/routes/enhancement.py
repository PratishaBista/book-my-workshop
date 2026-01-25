"""
Text Enhancement API routes.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.enhancer import enhancer

router = APIRouter(prefix="/api/v1", tags=["enhancement"])

class EnhanceRequest(BaseModel):
    text: str

class EnhanceResponse(BaseModel):
    original_text: str
    enhanced_text: str

@router.post("/enhance", response_model=EnhanceResponse)
async def enhance_workshop_text(request: EnhanceRequest):
    """
    Polishes and improves the workshop description.
    Uses AI to fix grammar, tone, and sentence flow.
    """
    result = enhancer.enhance(request.text)
    return EnhanceResponse(
        original_text=request.text,
        enhanced_text=result
    )
