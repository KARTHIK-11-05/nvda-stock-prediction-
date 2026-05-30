from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
from ..services.stock_service import stock_service
from ..ml.predictor import predictor_service
from ..utils.logger import logger

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.warning(f"Error broadcasting to connection, disconnecting client: {e}")
                self.disconnect(connection)

manager = ConnectionManager()

@router.websocket("/ws/stock")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            try:
                # 1. Fetch live stock information
                ticker_info = stock_service.get_live_ticker_info()
                
                # 2. Extract technical features
                features_df, _ = stock_service.get_live_features_and_raw()
                latest_features = features_df.tail(1)
                
                # 3. Predict next close price
                pred_result = predictor_service.predict(latest_features)
                
                # Create broadcast structure
                payload = {
                    "type": "STOCK_UPDATE",
                    "price": ticker_info["price"],
                    "prev_close": ticker_info["prev_close"],
                    "change": ticker_info["change"],
                    "change_pct": ticker_info["change_pct"],
                    "high": ticker_info["high"],
                    "low": ticker_info["low"],
                    "open": ticker_info["open"],
                    "volume": ticker_info["volume"],
                    "pe_ratio": ticker_info.get("pe_ratio", 75.4),
                    "market_cap": ticker_info.get("market_cap", 3e12),
                    "fifty_two_week_high": ticker_info["fifty_two_week_high"],
                    "fifty_two_week_low": ticker_info["fifty_two_week_low"],
                    "indicators": {
                        "RSI": round(float(latest_features['RSI'].iloc[-1]), 2),
                        "MACD": round(float(latest_features['MACD'].iloc[-1]), 2),
                        "MA_10": round(float(latest_features['MA_10'].iloc[-1]), 2),
                        "MA_20": round(float(latest_features['MA_20'].iloc[-1]), 2),
                        "MA_50": round(float(latest_features['MA_50'].iloc[-1]), 2),
                        "Daily_Return": round(float(latest_features['Daily_Return'].iloc[-1]), 4),
                        "Volatility": round(float(latest_features['Volatility'].iloc[-1]), 4)
                    },
                    "prediction": {
                        "predicted_price": round(pred_result["predicted_price"], 2),
                        "confidence_score": round(pred_result["confidence_score"], 1),
                        "market_direction": pred_result["market_direction"],
                        "risk_level": pred_result["risk_level"]
                    }
                }
                
                await websocket.send_text(json.dumps(payload))
            except Exception as e:
                logger.error(f"Error compiling websocket live payload: {e}")
                # Send error payload
                await websocket.send_text(json.dumps({"type": "ERROR", "message": "Failed to compile live stock stream"}))

            # Stream interval: every 5 seconds
            await asyncio.sleep(5)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket execution encountered an error: {e}")
        manager.disconnect(websocket)
