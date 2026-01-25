"""
Classification API routes.
Handles category prediction endpoints.
"""
from fastapi import APIRouter, HTTPException
from app.api.schemas.requests import CategoryPredictionRequest, CategoryPredictionResponse
from app.services.classifier import classifier


router = APIRouter(prefix="/api/v1", tags=["classification"])


@router.post("/predict", response_model=CategoryPredictionResponse)
async def predict_category(request: CategoryPredictionRequest):
    """
    Predict workshop category based on title and description.
    
    - **title**: Workshop title (required)
    - **description**: Workshop description (required)
    
    Returns the predicted category with confidence metrics.
    """
    try:
        suggested_category, confidence_score, is_confident, original_prediction = classifier.predict(
            title=request.title,
            description=request.description
        )
        
        return CategoryPredictionResponse(
            suggested_category=suggested_category,
            confidence_score=confidence_score,
            is_confident=is_confident,
            original_prediction=original_prediction
        )
        
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
