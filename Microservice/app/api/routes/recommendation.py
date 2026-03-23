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
    source_text: str = ""
    user_interests: str # e.g. "Pottery Cooking"
    candidates: List[Candidate]

class RankedItem(BaseModel):
    id: int
    score: float

class RecommendResponse(BaseModel):
    recommendations: List[RankedItem]

@router.post("/recommend", response_model=RecommendResponse)
async def get_recommendations(request: RecommendRequest):
    """
    Ranks workshops based on the user's specific interests using custom TF-IDF.
    """
    if not recommender.model_loaded:
        # If model isn't trained yet, return original order
        return RecommendResponse(recommendations=[{"id": c.id, "score": 0.0} for c in request.candidates])
    
    candidate_list = [{"id": c.id, "text": f"{c.text}"} for c in request.candidates]
    
    results = recommender.rank_for_user(request.user_interests, candidate_list)
    
    return RecommendResponse(recommendations=results)
