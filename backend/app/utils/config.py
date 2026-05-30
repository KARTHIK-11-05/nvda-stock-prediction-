import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./predictions.db"
    MODEL_PATH: str = "model/nvda_model.pkl"
    RETRAIN_SCHEDULE_DAYS: int = 7
    CORS_ORIGINS: List[str] = ["*"]
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
