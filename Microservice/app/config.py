"""
Configuration management for the ML Microservice.
Handles environment variables and application settings.
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Configuration
    API_TITLE: str = "BookMyWorkshop ML Service"
    API_VERSION: str = "1.0.0"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    
    # Model Paths
    MODEL_DIR: str = "models"
    CATEGORY_CLASSIFIER_PATH: str = "models/category_classifier/model.pkl"
    
    # Data Paths
    DATA_DIR: str = "data"
    RAW_DATA_DIR: str = "data/raw"
    PROCESSED_DATA_DIR: str = "data/processed"
    
    # ML Configuration
    CONFIDENCE_THRESHOLD: float = 0.5
    
    # External APIs
    OPENAI_API_KEY: Optional[str] = None
    HF_API_TOKEN: Optional[str] = None
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore"
    }


settings = Settings()
