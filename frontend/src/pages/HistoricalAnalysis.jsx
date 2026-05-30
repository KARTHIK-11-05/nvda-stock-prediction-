import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { apiService } from '../services/api';

export default function HistoricalAnalysis() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await apiService.getPredictionHistory(100);
      setHistory(res);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load prediction history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-slate-800/40 border border-slate-700/50 rounded-2xl"></div>
        <div className="h-96 bg-slate-800/40 border border-slate-700/50 rounded-2xl"></div>
      </div>
    );
  }

  // Filter resolved records for comparison chart
  const resolvedData = [...history]
    .filter(item => item.status === "RESOLVED")
    .reverse() // Chronological order
    .map(item => ({
      date: new Date(item.prediction_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}),
      "Predicted Price": item.predicted_price,
      "Actual Price": item.actual_price
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Historical Prediction Analysis
        </h2>
        <p className="text-slate-400 text-sm">Compare past machine learning predictions against actual market closed prices.</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Chart comparing predicted vs actual */}
      {resolvedData.length > 0 && (
        <div className="glass-panel p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold">Predicted Close vs. Actual Close Price</h3>
            <p className="text-slate-400 text-xs">Evaluates ML forecasting accuracy over the most recent resolved trading days.</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resolvedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" stroke="#64748B" style={{ fontSize: 10 }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748B" style={{ fontSize: 10 }} />
                <Tooltip content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass-panel p-3 border border-slate-700/50 text-xs">
                        <p className="font-semibold text-slate-300 mb-1">{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} style={{ color: entry.color }} className="my-0.5">
                            {entry.name}: <span className="font-bold font-mono text-slate-100">${entry.value.toFixed(2)}</span>
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }} />
                <Legend style={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Predicted Price" stroke="#00F2FE" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Actual Price" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Prediction History Table */}
      <div className="glass-panel overflow-hidden border border-slate-800">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/10">
          <h3 className="text-lg font-bold">Prediction History Logs</h3>
          <span className="text-xs text-slate-400 font-mono font-bold">Total Logs: {history.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider bg-slate-900/30">
                <th className="p-4">Prediction Date</th>
                <th className="p-4">Current Close</th>
                <th className="p-4">Predicted Close</th>
                <th className="p-4">Market Direction</th>
                <th className="p-4">Confidence</th>
                <th className="p-4">Actual Close</th>
                <th className="p-4">Prediction Accuracy</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-medium">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 font-semibold">
                    No predictions compiled in history database yet.
                  </td>
                </tr>
              ) : (
                history.map((record) => {
                  const dateStr = new Date(record.prediction_date).toLocaleString();
                  const isUp = record.market_direction === "UP";
                  const isResolved = record.status === "RESOLVED";

                  return (
                    <tr key={record.id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="p-4 text-slate-300 font-semibold flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {dateStr}
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-200">${record.current_price.toFixed(2)}</td>
                      <td className="p-4 font-mono font-bold text-cyan-400">${record.predicted_price.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {record.market_direction}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-200">{record.confidence_score.toFixed(1)}%</td>
                      <td className="p-4 font-mono font-bold text-slate-300">
                        {record.actual_price ? `$${record.actual_price.toFixed(2)}` : '—'}
                      </td>
                      <td className="p-4 font-mono">
                        {record.accuracy ? (
                          <span className="text-emerald-400 font-bold glow-text-green">{(record.accuracy * 100).toFixed(2)}%</span>
                        ) : (
                          <span className="text-slate-500 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-slate-500" /> Pending Close
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${isResolved ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-slate-800/50 text-slate-400 border border-slate-800'}`}>
                          {isResolved && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
