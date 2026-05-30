import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw, Layers, ShieldAlert, Cpu, Award } from 'lucide-react';
import { apiService } from '../services/api';

export default function Dashboard({ liveUpdate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    try {
      setUpdating(true);
      const res = await apiService.getLiveStockData();
      setData(res);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch live stock data.");
      setLoading(false);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update whenever parent WebSocket triggers a stream update
  useEffect(() => {
    if (liveUpdate && liveUpdate.type === "STOCK_UPDATE") {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          ticker: {
            ...prev.ticker,
            price: liveUpdate.price,
            change: liveUpdate.change,
            change_pct: liveUpdate.change_pct,
            high: liveUpdate.high,
            low: liveUpdate.low,
            open: liveUpdate.open,
            volume: liveUpdate.volume
          },
          prediction: {
            ...prev.prediction,
            predicted_price: liveUpdate.prediction.predicted_price,
            confidence_score: liveUpdate.prediction.confidence_score,
            market_direction: liveUpdate.prediction.market_direction,
            risk_level: liveUpdate.prediction.risk_level
          }
        };
      });
    }
  }, [liveUpdate]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-800/40 border border-slate-700/50 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-800/40 border border-slate-700/50 rounded-2xl"></div>
          <div className="h-96 bg-slate-800/40 border border-slate-700/50 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel glass-panel-glow-purple p-8 text-center max-w-xl mx-auto my-12">
        <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <h3 className="text-2xl font-bold mb-2">Service Offline</h3>
        <p className="text-slate-400 mb-6">{error}</p>
        <button onClick={loadData} className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl hover:from-blue-600 hover:to-cyan-600 font-semibold transition-all">
          Retry Connection
        </button>
      </div>
    );
  }

  const { ticker, prediction, chart_history } = data;
  const isUp = prediction.market_direction === "UP";
  const tickerIsUp = ticker.change >= 0;

  // Custom tooltips for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-4 border border-slate-700/50 text-xs">
          <p className="font-semibold text-slate-300 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="my-1">
              {entry.name}: <span className="font-bold font-mono text-slate-100">${entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            NVIDIA Market AI
          </h2>
          <p className="text-slate-400 text-sm">Real-time prediction and quantitative stock indicators.</p>
        </div>
        <button 
          onClick={loadData} 
          disabled={updating}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 rounded-xl text-sm font-semibold transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />
          {updating ? 'Syncing...' : 'Force Sync'}
        </button>
      </div>

      {/* Grid: 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* NVIDIA Ticker Price Card */}
        <div className="glass-panel p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className={`absolute top-0 left-0 w-2 h-full ${tickerIsUp ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">NVDA Live Price</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tickerIsUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {tickerIsUp ? 'Live' : 'Live'}
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold font-mono tracking-tight glow-text-cyan">${ticker.price.toFixed(2)}</h3>
            <div className="flex items-center gap-1.5 mt-2 text-sm font-semibold">
              {tickerIsUp ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
              <span className={tickerIsUp ? 'text-emerald-400' : 'text-rose-400'}>
                {tickerIsUp ? '+' : ''}{ticker.change.toFixed(2)} ({ticker.change_pct.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Prediction Target Price Card */}
        <div className={`glass-panel p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 ${isUp ? 'glass-panel-glow-green' : 'glass-panel-glow-blue'}`}>
          <div className={`absolute top-0 left-0 w-2 h-full ${isUp ? 'bg-emerald-500' : 'bg-cyan-500'}`}></div>
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">AI Predicted Close</span>
            <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 font-semibold">
              ${prediction.predicted_price.toFixed(2)}
            </h3>
            <p className="text-slate-400 text-xs mt-2">Target Date: Next Trading Day Close</p>
          </div>
        </div>

        {/* Buying/Selling neural Signal Card */}
        <div className="glass-panel p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">AI Recommendation</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isUp ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
              {isUp ? (
                <span className="text-2xl font-black text-emerald-400 glow-text-green">BUY</span>
              ) : (
                <span className="text-2xl font-black text-rose-400">SELL</span>
              )}
            </div>
            <div>
              <div className="text-xs text-slate-400">Predicted trend</div>
              <div className={`text-sm font-semibold flex items-center gap-1 mt-0.5 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isUp ? <TrendingUp className="w-4.5 h-4.5" /> : <TrendingDown className="w-4.5 h-4.5" />}
                {isUp ? 'BULLISH MOVEMENT' : 'BEARISH CORRECTION'}
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Confidence Card */}
        <div className="glass-panel p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Ensemble Confidence</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1">
              <h3 className="text-3xl font-extrabold font-mono tracking-tight text-emerald-400 glow-text-green">{prediction.confidence_score.toFixed(1)}%</h3>
            </div>
            {/* Horizontal progress bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${prediction.confidence_score}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Chart Section & Key Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Price History Area Chart */}
        <div className="glass-panel p-6 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">Historical Price & SMA Trend</h3>
              <p className="text-slate-400 text-xs">Comparison of close price vs. rolling 10-day, 20-day, 50-day SMA.</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-cyan-400 rounded-full"></span>Close</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-400 rounded-full"></span>MA(10)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-purple-500 rounded-full"></span>MA(50)</span>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart_history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F2FE" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00F2FE" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMA10" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" stroke="#64748B" style={{ fontSize: 10 }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748B" style={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area name="Close Price" type="monotone" dataKey="close" stroke="#00F2FE" strokeWidth={2} fillOpacity={1} fill="url(#colorClose)" />
                <Area name="SMA 10" type="monotone" dataKey="MA_10" stroke="#10B981" strokeWidth={1.5} fillOpacity={1} fill="url(#colorMA10)" />
                <Area name="SMA 50" type="monotone" dataKey="MA_50" stroke="#8B5CF6" strokeWidth={1.5} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Technical Gauge Panel */}
        <div className="glass-panel p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold">Technical Indicators</h3>
            <p className="text-slate-400 text-xs">Real-time oscillators and volume metrics.</p>
          </div>

          <div className="space-y-6">
            
            {/* RSI Gauge */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-slate-300">Relative Strength Index (RSI)</span>
                <span className={`font-mono ${ticker.indicators?.RSI > 70 ? 'text-rose-400' : ticker.indicators?.RSI < 30 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {ticker.indicators?.RSI || chart_history[chart_history.length - 1].RSI}
                </span>
              </div>
              <div className="relative pt-1">
                <div className="flex h-2 overflow-hidden text-xs bg-slate-800 rounded-full">
                  <div style={{ width: `${ticker.indicators?.RSI || chart_history[chart_history.length - 1].RSI}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-emerald-500 via-cyan-400 to-rose-500 transition-all duration-1000"></div>
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 font-bold mt-1.5">
                  <span>30 (OVERSOLD)</span>
                  <span>50 (NEUTRAL)</span>
                  <span>70 (OVERBOUGHT)</span>
                </div>
              </div>
            </div>

            {/* MACD Gauge */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-slate-300">MACD Value</span>
                <span className={`font-mono ${(ticker.indicators?.MACD || chart_history[chart_history.length - 1].MACD) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {(ticker.indicators?.MACD || chart_history[chart_history.length - 1].MACD).toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Momentum:</span>
                  <span className={(ticker.indicators?.MACD || chart_history[chart_history.length - 1].MACD) >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                    {(ticker.indicators?.MACD || chart_history[chart_history.length - 1].MACD) >= 0 ? 'BULLISH IMPULSE' : 'BEARISH IMPULSE'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Daily Volatility:</span>
                  <span className="font-mono text-slate-200">
                    {((ticker.indicators?.Volatility || chart_history[chart_history.length - 1].Volatility) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* General Ticker Data details */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">Live Session Range</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-900/30 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Session High</span>
                  <span className="font-bold font-mono text-slate-200">${ticker.high.toFixed(2)}</span>
                </div>
                <div className="p-3 bg-slate-900/30 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Session Low</span>
                  <span className="font-bold font-mono text-slate-200">${ticker.low.toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Volume Bar Chart */}
      <div className="glass-panel p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold">Traded Volume</h3>
          <p className="text-slate-400 text-xs">Daily shares traded history over the last 30 sessions.</p>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart_history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="date" stroke="#64748B" style={{ fontSize: 9 }} />
              <YAxis stroke="#64748B" style={{ fontSize: 9 }} tickFormatter={(val) => `${(val / 1e6).toFixed(0)}M`} />
              <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="glass-panel p-3 border border-slate-700/50 text-xs">
                      <p className="font-semibold text-slate-300 mb-1">{label}</p>
                      <p className="font-bold text-cyan-400 font-mono">Volume: {payload[0].value.toLocaleString()} shares</p>
                    </div>
                  );
                }
                return null;
              }} />
              <Bar name="Volume" dataKey="volume" fill="#8B5CF6" radius={[4, 4, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
