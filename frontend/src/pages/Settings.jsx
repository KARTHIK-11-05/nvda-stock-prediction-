import React, { useState } from 'react';
import { Database, ShieldAlert, Cpu, Settings as SettingsIcon, Link2, Info } from 'lucide-react';

export default function Settings() {
  const [wsFrequency, setWsFrequency] = useState(5);
  const [enableCache, setEnableCache] = useState(true);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          System settings
        </h2>
        <p className="text-slate-400 text-sm">Configure backend database hooks, prediction caching systems, and WebSocket feed frequencies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* API Settings */}
        <div className="glass-panel p-6 space-y-6">
          <h3 className="text-md font-bold flex items-center gap-2 text-cyan-400">
            <SettingsIcon className="w-5 h-5" />
            Inference & Cache Configurations
          </h3>

          <div className="space-y-4 text-xs font-semibold">
            
            {/* WS Refresh Frequency */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-300">Live Stream Broadcast Delay</span>
                <span className="text-cyan-400 font-bold">{wsFrequency} Seconds</span>
              </div>
              <input 
                type="range" 
                min="2" 
                max="30" 
                value={wsFrequency} 
                onChange={(e) => setWsFrequency(parseInt(e.target.value))} 
                className="w-full accent-cyan-400" 
              />
              <span className="text-[10px] text-slate-500 block">Controls the interval between live data refreshes through the WebSocket feed.</span>
            </div>

            {/* Cache settings toggle */}
            <div className="flex justify-between items-center pt-2">
              <div>
                <span className="text-slate-300 block mb-0.5">Enable yFinance Caching</span>
                <span className="text-[10px] text-slate-500 font-medium">Caches yahoo prices for 60 seconds to avoid rate limits.</span>
              </div>
              <button 
                onClick={() => setEnableCache(!enableCache)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${enableCache ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enableCache ? 'translate-x-5' : 'translate-x-0'}`}></span>
              </button>
            </div>

          </div>
        </div>

        {/* Database configurations */}
        <div className="glass-panel p-6 space-y-6">
          <h3 className="text-md font-bold flex items-center gap-2 text-purple-400">
            <Database className="w-5 h-5" />
            Database Connection Hooks
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Database Engine:</span>
                <span className="font-bold text-slate-200">SQLite v3.x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Local Path:</span>
                <span className="font-mono text-cyan-400 font-semibold">predictions.db</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Upgrade Vector:</span>
                <span className="font-bold text-purple-400">PostgreSQL (Compatible Schema)</span>
              </div>
            </div>

            <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl flex items-start gap-3">
              <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                The database tables represent a modern standard schema. When migrating to PostgreSQL for enterprise production usage, simply adjust the `DATABASE_URL` environment parameter inside the `.env` configuration file.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* About Section & Quicklinks */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-md font-bold flex items-center gap-2 text-slate-200">
          <Cpu className="w-5 h-5 text-slate-400" />
          Neural Engine Documentation Quicklinks
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-900/20 hover:bg-slate-900/50 border border-slate-800 hover:border-slate-700/50 rounded-2xl flex items-center justify-between group transition-all cursor-pointer">
            <div className="space-y-1">
              <span className="text-slate-200 block">FastAPI OpenAPI Swagger Documentation</span>
              <span className="text-[10px] text-slate-500 font-medium font-mono">http://localhost:8000/docs</span>
            </div>
            <Link2 className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </a>
          <div className="p-4 bg-slate-900/20 border border-slate-800 rounded-2xl flex items-center justify-between group">
            <div className="space-y-1">
              <span className="text-slate-200 block">NVIDIA Stock Predicting Core (.pkl)</span>
              <span className="text-[10px] text-slate-500 font-medium">Integrated using Scikit-Learn tree ensemble.</span>
            </div>
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
