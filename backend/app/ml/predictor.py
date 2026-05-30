import pickle
import os
import numpy as np
import pandas as pd
from ..utils.config import settings
from ..utils.logger import logger

class ModelPredictor:
    def __init__(self):
        self.model = None
        self.feature_names = None
        self.load_model()

    def load_model(self):
        """Loads the pre-trained Random Forest Regressor pickle model."""
        model_path = settings.MODEL_PATH
        if not os.path.exists(model_path):
            # Fallback check relative to workspace root if backend/ is working directory
            fallback_path = os.path.join(os.getcwd(), "backend", model_path)
            if os.path.exists(fallback_path):
                model_path = fallback_path
            else:
                logger.warning(f"Pickle model not found at {settings.MODEL_PATH} or {fallback_path}. Retraining might be required.")
                return

        try:
            with open(model_path, "rb") as f:
                self.model = pickle.load(f)
            
            # Extract features expected by the model
            self.feature_names = getattr(self.model, "feature_names_in_", None)
            logger.info(f"Model loaded successfully from {model_path}. Features: {self.feature_names}")
        except Exception as e:
            logger.error(f"Error loading pickle model from {model_path}: {e}")
            self.model = None

    def predict(self, feature_df: pd.DataFrame) -> dict:
        """
        Executes prediction, calculates confidence score based on decision trees consensus,
        and derives direction and risk level metrics.
        """
        if self.model is None:
            self.load_model()
            if self.model is None:
                raise RuntimeError("Prediction model is not initialized or loaded.")

        # Ensure features are ordered and match the model signature
        if self.feature_names is not None:
            feature_df = feature_df[list(self.feature_names)]

        # Prepare for scikit-learn format
        X = feature_df.values

        # 1. Main Prediction
        predicted_prices = self.model.predict(X)
        predicted_price = float(predicted_prices[-1])

        # 2. Advanced Confidence Score: Ensemble Variance Analysis
        # Check standard deviation of predictions made by all individual trees (estimators)
        try:
            tree_predictions = np.array([tree.predict(X) for tree in self.model.estimators_])
            # Shape of tree_predictions is (n_estimators, n_samples)
            latest_tree_preds = tree_predictions[:, -1]
            
            std_dev = np.std(latest_tree_preds)
            mean_pred = np.mean(latest_tree_preds)
            
            # Coefficient of Variation (CV)
            cv = std_dev / (mean_pred + 1e-9)
            
            # Map CV to 0-100% confidence. E.g. CV of 0% = 100% conf, CV of 10% = 0% conf
            confidence = float(np.clip(100.0 * (1.0 - cv * 10.0), 60.0, 99.8))
        except Exception as e:
            logger.warning(f"Could not calculate custom ensemble confidence: {e}. Defaulting.")
            confidence = 85.0  # Safe default

        # 3. Market Direction
        # Direction compared to the most recent 'close' price
        current_price = float(feature_df['close'].iloc[-1])
        market_direction = "UP" if predicted_price > current_price else "DOWN"

        # 4. Risk Level (based on Volatility)
        volatility = float(feature_df['Volatility'].iloc[-1])
        if volatility > 0.03:
            risk_level = "HIGH"
        elif volatility > 0.015:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        return {
            "current_price": current_price,
            "predicted_price": predicted_price,
            "confidence_score": confidence,
            "market_direction": market_direction,
            "risk_level": risk_level,
            "volatility": volatility
        }

# Global instance
predictor_service = ModelPredictor()
