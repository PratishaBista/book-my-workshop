"""
Recommendation API routes.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from app.services.recommender import recommender

router = APIRouter(prefix="/api/v1", tags=["recommendation"])

class Candidate(BaseModel):
    id: int
    text: str

class RecommendRequest(BaseModel):
    source_text: str
    candidates: List[Candidate]

class RankedItem(BaseModel):
    id: int
    score: float

class RecommendResponse(BaseModel):
    recommendations: List[RankedItem]

@router.post("/recommend", response_model=RecommendResponse)
async def get_recommendations(request: RecommendRequest):
    """
    Ranks a list of candidate workshops based on their similarity to a source workshop.
    Expects 'source_text' (clicked workshop) and a list of 'candidates' (ID + Text).
    """
    if not recommender.model_loaded:
        raise HTTPException(status_code=503, detail="Recommender model not loaded.")
    
    # Extract candidates as list of dicts for the service
    candidate_list = [{"id": c.id, "text": c.text} for c in request.candidates]
    
    results = recommender.rank_workshops(request.source_text, candidate_list)
    
    return RecommendResponse(recommendations=results)
