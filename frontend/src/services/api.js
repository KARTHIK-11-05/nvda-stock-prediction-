const getApiBaseUrl = () => {
  const protocol = window.location.protocol;
  const host = window.location.host;
  return `${protocol}//${host}/api`;
};

const getWsBaseUrl = () => {
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  return `${wsProtocol}//${host}/ws/stock`;
};

const API_BASE_URL = getApiBaseUrl();
const WS_BASE_URL = getWsBaseUrl();

export const apiService = {
  /**
   * Fetches live NVIDIA stock data, technical indicators, and latest predictions.
   */
  async getLiveStockData() {
    const res = await fetch(`${API_BASE_URL}/stock/live`);
    if (!res.ok) throw new Error("Failed to fetch live stock data");
    return res.json();
  },

  /**
   * Performs model predictions using customized input parameters (What-if scenario analysis).
   */
  async predictCustomFeatures(features) {
    const res = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(features),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Prediction failure");
    }
    return res.json();
  },

  /**
   * Fetches prediction logs history.
   */
  async getPredictionHistory(limit = 50) {
    const res = await fetch(`${API_BASE_URL}/history?limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch prediction history");
    return res.json();
  },

  /**
   * Fetches historical performance statistics (MAE, MSE, direction accuracy).
   */
  async getHistoryAnalytics() {
    const res = await fetch(`${API_BASE_URL}/history/analytics`);
    if (!res.ok) throw new Error("Failed to fetch history analytics");
    return res.json();
  },

  /**
   * Fetches the current Model status, training configurations and metrics.
   */
  async getModelStatus() {
    const res = await fetch(`${API_BASE_URL}/model/status`);
    if (!res.ok) throw new Error("Failed to fetch model status");
    return res.json();
  },

  /**
   * Triggers model retraining.
   */
  async triggerRetrainModel() {
    const res = await fetch(`${API_BASE_URL}/retrain`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to trigger model retraining");
    return res.json();
  },

  /**
   * Opens a WebSocket connection.
   */
  connectWebSocket(onMessage, onError, onClose) {
    const ws = new WebSocket(WS_BASE_URL);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error("WebSocket message parsing error:", err);
      }
    };

    ws.onerror = (err) => {
      if (onError) onError(err);
    };

    ws.onclose = () => {
      if (onClose) onClose();
    };

    return ws;
  }
};
