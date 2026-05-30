from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class PredictRequest(BaseModel):
    MA_10: float = Field(..., description="10-day Moving Average", example=120.5)
    MA_20: float = Field(..., description="20-day Moving Average", example=118.2)
    MA_50: float = Field(..., description="50-day Moving Average", example=112.4)
    RSI: float = Field(..., description="Relative Strength Index (0-100)", example=62.5)
    MACD: float = Field(..., description="MACD indicator value", example=1.8)
    Daily_Return: float = Field(..., description="Daily percentage return of the stock", example=0.015)
    Volatility: float = Field(..., description="Rolling 20-day returns volatility", example=0.02)
    close: float = Field(..., description="Latest Close price", example=122.1)
    high: float = Field(..., description="Latest High price", example=123.5)
    low: float = Field(..., description="Latest Low price", example=120.8)
    open: float = Field(..., description="Latest Open price", example=121.0)
    volume: float = Field(..., description="Latest Volume traded", example=45000000.0)

class PredictResponse(BaseModel):
    current_price: float
    predicted_price: float
    confidence_score: float
    market_direction: str
    risk_level: str
    volatility: float
    prediction_date: datetime

class HistoryResponse(BaseModel):
    id: int
    prediction_date: datetime
    current_price: float
    predicted_price: float
    confidence_score: float
    market_direction: str
    risk_level: str
    actual_price: Optional[float] = None
    status: str
    accuracy: Optional[float] = None

    class Config:
        from_attributes = True

class ModelStatusResponse(BaseModel):
    version: str
    model_type: str
    training_date: datetime
    features: List[str]
    r2_score: float
    mse: float
    mae: float

class AnalyticsSummaryResponse(BaseModel):
    total_predictions: int
    resolved_predictions: int
    avg_accuracy: float
    direction_accuracy_percentage: float
    recent_trend: List[float]
