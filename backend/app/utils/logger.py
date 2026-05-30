import logging
import sys

# Define logging format
logging_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# Configure root logger
logging.basicConfig(
    level=logging.INFO,
    format=logging_format,
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("app.log", encoding="utf-8")
    ]
)

logger = logging.getLogger("NVDA-AI-Dashboard")
