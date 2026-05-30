import React, { useState } from 'react';
import { Cpu, RefreshCw, Sparkles, TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';
import { apiService } from '../services/api';

export default function LivePrediction() {
  const [features, setFeatures] = useState({
    close: 122.1,
    open: 121.0,
    high: 123.5,
    low: 120.8,
    volume: 45000000,
    MA_10: 120.5,
    MA_20: 118.2,
    MA_50: 112.4,
    RSI: 62.5,
    MACD: 1.8,
    Daily_Return: 0.015,
    Volatility: 0.02
  });

  const [loading, setLoading] = useState(false);
  const [liveLoading, setLiveLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const handleSliderChange = (name, val) => {
    setFeatures((prev) => ({
      ...prev,
      [name]: parseFloat(val)
    }));
  };

  const loadLiveValues = async () => {
    try {
      setLiveLoading(true);
      setError(null);
      const data = await apiService.getLiveStockData();
      
      const lastRow = data.chart_history[data.chart_history.length - 1];
      
      setFeatures({
        close: lastRow.close,
        open: lastRow.open,
        high: lastRow.high,
        low: lastRow.low,
        volume: lastRow.volume,
        MA_10: lastRow.MA_10,
        MA_20: lastRow.MA_20,
        MA_50: lastRow.MA_50,
        RSI: lastRow.RSI,
        MACD: lastRow.MACD,
        Daily_Return: data.ticker.indicators?.Daily_Return || 0.005,
        Volatility: data.ticker.indicators?.Volatility || 0.018
      });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch live parameters from server. Using defaults.");
    } finally {
      setLiveLoading(false);
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.predictCustomFeatures(features);
      setPrediction(res);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to compile custom prediction.");
    } finally {
      setLoading(false);
    }
  };

  const isUp = prediction?.market_direction === "UP";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            What-If Scenario AI Simulator
          </h2>
          <p className="text-slate-400 text-sm">Simulate stock price movements by tweaking technical and pricing indicators.</p>
        </div>
        <button 
          onClick={loadLiveValues}
          disabled={liveLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-cyan-500/10"
        >
          <RefreshCw className={`w-4 h-4 ${liveLoading ? 'animate-spin' : ''}`} />
          {liveLoading ? 'Loading Live Data...' : 'Preload Live Values'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Slider Controls */}
        <form onSubmit={handlePredict} className="lg:col-span-2 glass-panel p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-cyan-400">
              <Cpu className="w-5 h-5 text-cyan-400" />
              Adjust Simulator Features
            </h3>
            <span className="text-xs text-slate-500 font-semibold uppercase">12 Input Parameters</span>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Column A: Prices (OHLC) */}
            <div className="space-y-5">
              <h4 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">Stock Price & Volume</h4>
              
              {/* Close Price */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Close Price ($)</span>
                  <span className="font-mono text-cyan-400 font-bold">${features.close.toFixed(2)}</span>
                </div>
                <input type="range" min="50" max="250" step="0.5" value={features.close} onChange={(e) => handleSliderChange('close', e.target.value)} className="w-full accent-cyan-400" />
              </div>

              {/* Open Price */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Open Price ($)</span>
                  <span className="font-mono text-slate-300">${features.open.toFixed(2)}</span>
                </div>
                <input type="range" min="50" max="250" step="0.5" value={features.open} onChange={(e) => handleSliderChange('open', e.target.value)} className="w-full accent-slate-600" />
              </div>

              {/* High Price */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">High Price ($)</span>
                  <span className="font-mono text-slate-300">${features.high.toFixed(2)}</span>
                </div>
                <input type="range" min="50" max="250" step="0.5" value={features.high} onChange={(e) => handleSliderChange('high', e.target.value)} className="w-full accent-slate-600" />
              </div>

              {/* Low Price */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Low Price ($)</span>
                  <span className="font-mono text-slate-300">${features.low.toFixed(2)}</span>
                </div>
                <input type="range" min="50" max="250" step="0.5" value={features.low} onChange={(e) => handleSliderChange('low', e.target.value)} className="w-full accent-slate-600" />
              </div>

              {/* Volume */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Volume (Shares)</span>
                  <span className="font-mono text-slate-300">{(features.volume / 1000000).toFixed(1)}M</span>
                </div>
                <input type="range" min="10000000" max="200000000" step="1000000" value={features.volume} onChange={(e) => handleSliderChange('volume', e.target.value)} className="w-full accent-slate-600" />
              </div>
            </div>

            {/* Column B: Moving Averages & Oscillators */}
            <div className="space-y-5">
              <h4 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">Technical Indicators</h4>
              
              {/* MA 10 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">MA 10 ($)</span>
                  <span className="font-mono text-slate-300">${features.MA_10.toFixed(2)}</span>
                </div>
                <input type="range" min="50" max="250" step="0.5" value={features.MA_10} onChange={(e) => handleSliderChange('MA_10', e.target.value)} className="w-full accent-slate-600" />
              </div>

              {/* MA 50 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">MA 50 ($)</span>
                  <span className="font-mono text-slate-300">${features.MA_50.toFixed(2)}</span>
                </div>
                <input type="range" min="50" max="250" step="0.5" value={features.MA_50} onChange={(e) => handleSliderChange('MA_50', e.target.value)} className="w-full accent-slate-600" />
              </div>

              {/* RSI */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">RSI (Relative Strength)</span>
                  <span className={`font-mono font-bold ${features.RSI > 70 ? 'text-rose-400' : features.RSI < 30 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                    {features.RSI.toFixed(1)}
                  </span>
                </div>
                <input type="range" min="5" max="95" step="0.5" value={features.RSI} onChange={(e) => handleSliderChange('RSI', e.target.value)} className="w-full accent-cyan-400" />
              </div>

              {/* MACD */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">MACD Momentum</span>
                  <span className="font-mono text-slate-300">{features.MACD.toFixed(2)}</span>
                </div>
                <input type="range" min="-10" max="10" step="0.1" value={features.MACD} onChange={(e) => handleSliderChange('MACD', e.target.value)} className="w-full accent-slate-600" />
              </div>

              {/* Volatility */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Volatility (Rolling Return Std)</span>
                  <span className="font-mono text-slate-300">{(features.Volatility * 100).toFixed(2)}%</span>
                </div>
                <input type="range" min="0.005" max="0.1" step="0.001" value={features.Volatility} onChange={(e) => handleSliderChange('Volatility', e.target.value)} className="w-full accent-slate-600" />
              </div>
            </div>

          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-500 hover:to-purple-700 text-white rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-blue-500/20 text-center flex items-center justify-center gap-2 cursor-pointer border border-white/10"
          >
            <Sparkles className="w-5 h-5 text-white" />
            {loading ? 'Executing AI Quantitative Run...' : 'Simulate Artificial Intelligence Run'}
          </button>
        </form>

        {/* Right Col: AI Inference Panel */}
        <div className="space-y-6">
          
          {/* Prediction Result panel */}
          <div className="glass-panel p-6 relative overflow-hidden flex flex-col justify-between min-h-[350px] pulse-glow-cyan">
            <div>
              <h3 className="text-lg font-bold border-b border-slate-800 pb-3 text-slate-200 uppercase tracking-wider text-xs">
                Inference Result
              </h3>
              
              {!prediction && !loading && (
                <div className="h-48 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-4 bg-slate-800/40 rounded-full border border-slate-700/50">
                    <Cpu className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-slate-500 text-xs font-semibold max-w-[200px]">
                    Configure sliders and trigger simulation run to receive AI forecasts.
                  </p>
                </div>
              )}

              {loading && (
                <div className="h-48 flex flex-col items-center justify-center text-center space-y-4">
                  <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
                  <p className="text-slate-400 text-xs font-semibold">
                    Calculating multi-tree ensemble consensus...
                  </p>
                </div>
              )}

              {prediction && !loading && (
                <div className="space-y-6 mt-6 animate-fadeIn">
                  
                  {/* Predicted Close */}
                  <div className="text-center">
                    <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold block mb-1">Simulated Close Forecast</span>
                    <h2 className="text-4xl font-extrabold font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                      ${prediction.predicted_price.toFixed(2)}
                    </h2>
                  </div>

                  {/* Buy/Sell indicator */}
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-semibold">Directional Signal</span>
                    <div className="flex items-center gap-1.5">
                      {isUp ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-bold text-sm glow-text-green">BULLISH BUY</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4 text-rose-400" />
                          <span className="text-rose-400 font-bold text-sm">BEARISH SELL</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Confidence metrics */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-semibold">Ensemble Consensus:</span>
                      <span className="text-emerald-400 font-bold font-mono">{prediction.confidence_score.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-500" 
                        style={{ width: `${prediction.confidence_score}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Volatility / Risk */}
                  <div className="flex justify-between text-xs pt-2 border-t border-slate-800 text-slate-400">
                    <span>Simulated Risk:</span>
                    <span className={`font-bold ${prediction.risk_level === 'HIGH' ? 'text-rose-400' : prediction.risk_level === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {prediction.risk_level} RISK
                    </span>
                  </div>

                </div>
              )}
            </div>

            {prediction && !loading && (
              <div className="text-[10px] text-slate-500 text-center mt-4">
                Note: Predictions represent future target values under ideal simulated conditions.
              </div>
            )}
          </div>

          {/* Quick instructions / Help */}
          <div className="glass-panel p-6 space-y-4">
            <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              How the AI Responds
            </h4>
            <div className="text-xs space-y-3 text-slate-400 leading-relaxed">
              <p>
                <strong className="text-emerald-400">RSI & Momentum:</strong> Lower RSI values (&lt;30) combined with standard pricing usually yield higher predicted growth because the model identifies oversold support.
              </p>
              <p>
                <strong className="text-rose-400">High Volatility:</strong> Higher simulated volatility values increase uncertainty, lowering the ensemble consensus confidence score.
              </p>
              <p>
                <strong className="text-cyan-400">Moving Averages:</strong> When the simulated price sits significantly above the Moving Averages, the Random Forest model captures powerful trend momentum.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
