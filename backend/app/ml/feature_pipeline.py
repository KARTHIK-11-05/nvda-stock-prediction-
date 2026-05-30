import pandas as pd
import numpy as np
from ..utils.logger import logger

def calculate_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes technical indicators and returns a DataFrame structured exactly
    as the Random Forest model expects:
    ['MA_10', 'MA_20', 'MA_50', 'RSI', 'MACD', 'Daily_Return', 'Volatility', 
     'close', 'high', 'low', 'open', 'volume']
    """
    if df.empty or len(df) < 50:
        logger.error("Insufficient stock history to calculate 50-day moving averages.")
        raise ValueError("Need at least 50 days of historical stock data.")

    # Create a copy to prevent SettingWithCopyWarning
    df = df.copy()
    
    # 1. Moving Averages
    df['MA_10'] = df['Close'].rolling(window=10).mean()
    df['MA_20'] = df['Close'].rolling(window=20).mean()
    df['MA_50'] = df['Close'].rolling(window=50).mean()

    # 2. RSI (14 days)
    delta = df['Close'].diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(com=13, adjust=False).mean()
    avg_loss = loss.ewm(com=13, adjust=False).mean()
    rs = avg_gain / (avg_loss + 1e-9)
    df['RSI'] = 100 - (100 / (1 + rs))

    # 3. MACD (EMA 12 - EMA 26)
    ema_12 = df['Close'].ewm(span=12, adjust=False).mean()
    ema_26 = df['Close'].ewm(span=26, adjust=False).mean()
    df['MACD'] = ema_12 - ema_26

    # 4. Daily Return
    df['Daily_Return'] = df['Close'].pct_change()

    # 5. Volatility (rolling 20-day standard deviation of daily returns)
    df['Volatility'] = df['Daily_Return'].rolling(window=20).std()

    # 6. Map raw features to match exact case-sensitive model names
    df['close'] = df['Close']
    df['high'] = df['High']
    df['low'] = df['Low']
    df['open'] = df['Open']
    df['volume'] = df['Volume']

    # Keep exactly the 12 features in the exact training order
    feature_columns = [
        'MA_10', 'MA_20', 'MA_50', 'RSI', 'MACD', 'Daily_Return', 'Volatility',
        'close', 'high', 'low', 'open', 'volume'
    ]
    
    return df[feature_columns]

def prepare_inference_data(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Computes features, handles NaNs, and returns:
    1. Preprocessed feature matrix for prediction (clean df)
    2. Original raw rows corresponding to the features (for visualization reference)
    """
    # Calculate indicators
    features_df = calculate_technical_indicators(df)
    
    # Drop rows with NaNs (which occur at the beginning of the series due to windows)
    # Volatility needs 20 rows, MA_50 needs 50 rows.
    # Therefore, the first 50 rows will contain NaNs and will be dropped.
    non_nan_mask = features_df.notna().all(axis=1)
    
    clean_features = features_df[non_nan_mask]
    clean_raw = df[non_nan_mask]
    
    return clean_features, clean_raw
