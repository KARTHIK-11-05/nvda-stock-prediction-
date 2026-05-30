import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .database.connection import engine, Base
from .api.endpoints import router as api_router
from .api.websocket import router as ws_router
from .services.scheduler import start_scheduler
from .utils.config import settings
from .utils.logger import logger

# 1. Initialize SQLite Database
logger.info("Initializing SQLite database tables...")
Base.metadata.create_all(bind=engine)

# 2. Initialize FastAPI Application
app = FastAPI(
    title="NVIDIA Stock Prediction & AI Finance Dashboard API",
    description="Backend production-ready prediction engine with Random Forest models, real-time yfinance indicators, and WebSockets.",
    version="1.0.0"
)

# 3. Configure CORS policies
# Allow local React environment configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Include Routers
app.include_router(api_router, prefix="/api")
app.include_router(ws_router)

# serve built frontend static files if they exist (Production/Docker build)
current_dir = os.path.dirname(os.path.abspath(__file__))
workspace_root = os.path.dirname(os.path.dirname(current_dir))
frontend_dist_path = os.path.join(workspace_root, "frontend", "dist")

if os.path.exists(frontend_dist_path):
    app.mount("/", StaticFiles(directory=frontend_dist_path, html=True), name="static")
    logger.info(f"Mounted built frontend static files from {frontend_dist_path}")

# 5. Startup Events
@app.on_event("startup")
async def startup_event():
    logger.info("Application starting up...")
    # Start APScheduler for background training and prediction verification
    start_scheduler()
    logger.info("Application startup completed successfully.")

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "app": "NVIDIA Stock Prediction & AI Finance Dashboard",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    # Start Uvicorn when executed directly
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
