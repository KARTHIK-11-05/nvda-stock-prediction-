import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Sliders, History, BarChart3, Settings as SettingsIcon, Cpu, AlertCircle } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import LivePrediction from './pages/LivePrediction';
import HistoricalAnalysis from './pages/HistoricalAnalysis';
import ModelAccuracy from './pages/ModelAccuracy';
import Settings from './pages/Settings';
import { apiService } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [wsData, setWsData] = useState(null);
  const [serverOnline, setServerOnline] = useState(false);
  const [reconnectTrigger, setReconnectTrigger] = useState(0);

  // Initialize live WebSocket stream
  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;

    const connect = () => {
      ws = apiService.connectWebSocket(
        (data) => {
          setWsData(data);
          setServerOnline(true);
        },
        (err) => {
          console.warn("WebSocket error:", err);
          setServerOnline(false);
        },
        () => {
          setServerOnline(false);
          // Try to reconnect in 5 seconds
          reconnectTimeout = setTimeout(() => {
            setReconnectTrigger(prev => prev + 1);
          }, 5000);
        }
      );
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [reconnectTrigger]);

  // Fast check of server health status via REST
  useEffect(() => {
    const checkRestStatus = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/model/status");
        if (res.ok) setServerOnline(true);
      } catch (err) {
        setServerOnline(false);
      }
    };
    checkRestStatus();
    // Poll REST every 10 seconds just in case WS is silent
    const interval = setInterval(checkRestStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard liveUpdate={wsData} />;
      case 'predict':
        return <LivePrediction />;
      case 'history':
        return <HistoricalAnalysis />;
      case 'accuracy':
        return <ModelAccuracy />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard liveUpdate={wsData} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'AI Dashboard', icon: LayoutDashboard },
    { id: 'predict', label: 'What-If Simulation', icon: Sliders },
    { id: 'history', label: 'Prediction Logs', icon: History },
    { id: 'accuracy', label: 'Performance Cockpit', icon: BarChart3 },
    { id: 'settings', label: 'System Settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen bg-darkBg text-slate-100 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-950/80 border-r border-slate-900 flex flex-col justify-between p-6">
        <div className="space-y-8">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/25">
              <Cpu className="w-6 h-6 text-slate-950 font-extrabold" />
            </div>
            <div>
              <h1 className="text-md font-black tracking-wider uppercase text-slate-200">NVDA Predictive</h1>
              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest font-mono">Neural Engine</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/5 text-cyan-400 border border-cyan-500/20 shadow-md shadow-cyan-500/5' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Connectivity Indicators */}
        <div className="space-y-4 pt-4 border-t border-slate-900/80">
          <div className="flex items-center justify-between text-xs font-semibold px-2">
            <span className="text-slate-400">Model Engine:</span>
            <span className="text-slate-200 font-bold font-mono">Active</span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold px-2">
            <span className="text-slate-400">Server State:</span>
            {serverOnline ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                ONLINE
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                OFFLINE
              </span>
            )}
          </div>
        </div>

      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-900 flex items-center justify-between px-8 bg-slate-950/20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/10">
              NASDAQ: NVDA
            </span>
          </div>
          <div className="text-slate-400 text-xs font-medium">
            System Clock: <span className="font-mono text-slate-300 font-bold">2026-05-22</span>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>

    </div>
  );
}
