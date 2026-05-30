"""
Health check and monitoring routes.
"""
from fastapi import APIRouter
from app.api.schemas.requests import HealthCheckResponse
from app.config import settings


router = APIRouter(tags=["health"])


@router.get("/", response_model=HealthCheckResponse)
@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """
    Health check endpoint.
    Returns service status and model availability.
    """
    return HealthCheckResponse(
        status="healthy",
        model_loaded=True,
        version=settings.API_VERSION
    )
