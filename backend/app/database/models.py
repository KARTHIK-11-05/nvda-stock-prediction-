from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean
from datetime import datetime
from .connection import Base

class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    prediction_date = Column(DateTime, default=datetime.utcnow, index=True)
    current_price = Column(Float, nullable=False)
    predicted_price = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)
    market_direction = Column(String, nullable=False)  # "UP" or "DOWN"
    risk_level = Column(String, nullable=False)        # "LOW", "MEDIUM", "HIGH"
    actual_price = Column(Float, nullable=True)        # Set when target date is resolved
    status = Column(String, default="PENDING")         # "PENDING" or "RESOLVED"
    accuracy = Column(Float, nullable=True)            # 1 - abs(predicted - actual)/actual

class ModelMetrics(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    training_date = Column(DateTime, default=datetime.utcnow)
    version = Column(String, nullable=False)
    r2_score = Column(Float, nullable=False)
    mse = Column(Float, nullable=False)
    mae = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
