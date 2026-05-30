"""
BookMyWorkshop ML Microservice
FastAPI application for machine learning inference.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import health, enhancement, recommendation, sentiment

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
app.include_router(enhancement.router)
app.include_router(recommendation.router)
app.include_router(sentiment.router)





@app.post("/enhance")
async def enhance_legacy(request: dict):
    """Legacy endpoint used by Client-Host (same as /api/v1/enhance)."""
    from app.api.routes.enhancement import EnhanceRequest, enhance_workshop_text

    req = EnhanceRequest(text=request.get("text", ""))
    return await enhance_workshop_text(req)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True  # Enable auto-reload during development
    )
