"""
Review sentiment API routes.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.sentiment import sentiment_analyzer


router = APIRouter(prefix="/api/v1", tags=["sentiment"])


class ReviewSentimentRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000, description="Review comment text")


class ReviewSentimentResponse(BaseModel):
    is_offensive: bool
    offensive_score: float = Field(..., ge=0.0, le=1.0)
    label: str


@router.post("/analyze-review", response_model=ReviewSentimentResponse)
async def analyze_review(request: ReviewSentimentRequest):
    """
    Analyze a review comment for offensive content.
    Higher offensive_score indicates stronger likelihood of offensive language.
    """
    try:
        is_offensive, score = sentiment_analyzer.analyze(request.text)
        return ReviewSentimentResponse(
            is_offensive=is_offensive,
            offensive_score=round(score, 4),
            label="offensive" if is_offensive else "clean",
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")
