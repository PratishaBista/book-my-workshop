"""
Pydantic schemas for API request/response validation.
"""
from pydantic import BaseModel, Field


class CategoryPredictionRequest(BaseModel):
    """Request schema for category prediction."""
    title: str = Field(..., min_length=1, max_length=200, description="Workshop title")
    description: str = Field(..., min_length=1, description="Workshop description")


class CategoryPredictionResponse(BaseModel):
    """Response schema for category prediction."""
    suggested_category: str = Field(..., description="Predicted category name")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence score (0-1)")
    is_confident: bool = Field(..., description="Whether the model is confident in its prediction")
    original_prediction: str = Field(..., description="Raw model prediction before threshold check")


class HealthCheckResponse(BaseModel):
    """Health check response schema."""
    status: str
    model_loaded: bool
    version: str
