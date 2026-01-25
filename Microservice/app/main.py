"""
BookMyWorkshop ML Microservice
FastAPI application for machine learning inference.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import classification, health, enhancement, recommendation


# Initialize FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description="Machine Learning microservice for workshop categorization and content enhancement",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(classification.router)
app.include_router(enhancement.router)
app.include_router(recommendation.router)


# Legacy endpoint for backwards compatibility
# TODO: Migrate C# API to use /api/v1/predict instead
@app.post("/predict")
async def predict_legacy(request: dict):
    """Legacy endpoint - redirects to new API structure."""
    from app.api.schemas.requests import CategoryPredictionRequest
    from app.api.routes.classification import predict_category
    
    req = CategoryPredictionRequest(**request)
    return await predict_category(req)


@app.post("/enhance")
async def enhance_legacy(request: dict):
    """Legacy endpoint for text enhancement."""
    from app.api.routes.enhancement import enhance_workshop_text
    from app.api.routes.enhancement import EnhanceRequest
    
    req = EnhanceRequest(**request)
    return await enhance_workshop_text(req)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True  # Enable auto-reload during development
    )
