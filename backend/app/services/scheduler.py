from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
import pandas as pd
import yfinance as yf
from sqlalchemy.orm import Session

from ..database.connection import SessionLocal
from ..database.models import PredictionHistory
from ..api.endpoints import retrain_model_pipeline
from ..utils.logger import logger

def resolve_pending_predictions():
    """
    Checks the database for 'PENDING' predictions made in the past,
    looks up their actual close prices using yfinance,
    and updates the database records with actual prices and accuracies.
    """
    db: Session = SessionLocal()
    try:
        logger.info("Running pending predictions resolution job...")
        # Get all pending predictions that are at least 1 day old
        one_day_ago = datetime.utcnow() - timedelta(days=1)
        pending_records = db.query(PredictionHistory).filter(
            PredictionHistory.status == "PENDING",
            PredictionHistory.prediction_date <= one_day_ago
        ).all()
        
        if not pending_records:
            logger.info("No pending predictions need resolution.")
            return

        logger.info(f"Attempting to resolve {len(pending_records)} pending predictions...")
        
        # Download recent NVDA stock prices to map actual values
        ticker = yf.Ticker("NVDA")
        # Fetch last 5 days to be safe
        history_df = ticker.history(period="5d")
        if history_df.empty:
            logger.warning("Could not download recent yfinance history to resolve predictions.")
            return
            
        # Clean history index and convert to date strings
        history_df = history_df.reset_index()
        if 'Date' in history_df.columns:
            history_df['Date_Str'] = history_df['Date'].dt.strftime('%Y-%m-%d')
        elif 'Datetime' in history_df.columns:
            history_df['Date_Str'] = history_df['Datetime'].dt.strftime('%Y-%m-%d')
        else:
            logger.warning("yfinance history format is invalid.")
            return

        for record in pending_records:
            # Predictions represent predicting the closing price of the next trading day
            # Target trading date would be roughly prediction_date + 1 day (ignoring weekends)
            # Find the first trading day >= prediction_date + 1 day
            target_date_threshold = (record.prediction_date + timedelta(days=1)).date()
            
            # Filter history records after target threshold
            available_dates = history_df[pd.to_datetime(history_df['Date']).dt.date >= target_date_threshold]
            
            if available_dates.empty:
                # No trading day actual price available yet
                continue
                
            # Get the closest available trading day's close price
            actual_row = available_dates.iloc[0]
            actual_price = float(actual_row['Close'])
            
            # Compute accuracy: 1 - abs(predicted - actual) / actual
            accuracy = 1.0 - abs(record.predicted_price - actual_price) / actual_price
            # Bound accuracy to [0, 1]
            accuracy = max(0.0, min(1.0, accuracy))
            
            record.actual_price = round(actual_price, 2)
            record.accuracy = round(accuracy, 4)
            record.status = "RESOLVED"
            logger.info(f"Resolved prediction ID {record.id}: Predicted={record.predicted_price}, Actual={record.actual_price}, Accuracy={accuracy*100.0:.2f}%")
            
        db.commit()
    except Exception as e:
        logger.error(f"Error during predictions resolution job: {e}")
        db.rollback()
    finally:
        db.close()

def run_weekly_retraining():
    """Trigger weekly model training."""
    db: Session = SessionLocal()
    try:
        logger.info("Running scheduled weekly model retraining...")
        retrain_model_pipeline(db)
    except Exception as e:
        logger.error(f"Scheduled model retraining failed: {e}")
    finally:
        db.close()

def start_scheduler():
    """Initializes and runs the background scheduler."""
    scheduler = BackgroundScheduler()
    
    # 1. Resolve pending predictions nightly (e.g., every day at 11 PM)
    # For robust demonstration, let's run it every 12 hours
    scheduler.add_job(
        resolve_pending_predictions,
        'interval',
        hours=12,
        id='resolve_predictions_job',
        next_run_time=datetime.now() + timedelta(seconds=10) # Run first resolution in 10 seconds
    )
    
    # 2. Retrain model weekly
    scheduler.add_job(
        run_weekly_retraining,
        'interval',
        days=7,
        id='model_retrain_job'
    )
    
    scheduler.start()
    logger.info("APScheduler Background Tasks successfully started.")
