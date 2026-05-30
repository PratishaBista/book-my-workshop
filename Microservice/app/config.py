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
    REVIEW_SENTIMENT_DIR: str = "models/review_sentiment"
    OFFENSIVE_THRESHOLD: float = 0.5
    
    # Data Paths
    DATA_DIR: str = "data"
    RAW_DATA_DIR: str = "data/raw"
    PROCESSED_DATA_DIR: str = "data/processed"
    
    # ML Configuration
    CONFIDENCE_THRESHOLD: float = 0.5
    
    # Text enhancement (workshop descriptions)
    ENHANCEMENT_PROVIDER: str = "auto"  # auto | ollama | groq | openai | huggingface
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"
    GROQ_API_KEY: Optional[str] = None
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    OPENAI_MODEL: str = "gpt-4o-mini"
    HF_API_TOKEN: Optional[str] = None
    HF_ENHANCE_MODEL: str = "meta-llama/Llama-3.1-8B-Instruct"
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore"
    }


settings = Settings()
