"""
Trust & Safety / Identity Verification API routes.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.integrity import integrity_engine

router = APIRouter(prefix="/api/v1", tags=["verification"])

class TrustAnalysisRequest(BaseModel):
    registration_text: str
    document_text: str
    website_text: Optional[str] = None

class TrustCheckResult(BaseModel):
    name: str
    score: float
    message: str
    passed: bool

class TrustAnalysisResponse(BaseModel):
    overallScore: float
    summary: str
    checks: List[TrustCheckResult]

@router.post("/verify-consistency", response_model=TrustAnalysisResponse)
async def verify_identity_consistency(request: TrustAnalysisRequest):
    """
    NLP Information Consistency Check:
    Analyzes host registration data vs uploaded documents to assign a Trust Score.
    """
    try:
        results = integrity_engine.check_consistency(
            request.registration_text, 
            request.document_text, 
            request.website_text
        )
        return results
    except Exception as e:
        print(f"Verification Error: {e}")
        raise HTTPException(status_code=500, detail="Trust Analysis Engine failed.")
