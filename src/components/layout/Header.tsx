import React from 'react';
import {
  Wind,
  Layers,
  FileText,
  AlertTriangle,
  ChevronDown,
  Activity,
  Map,
  Zap,
  Radio,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import type { RegionConfig, HorizonMode, RegionId, TabId } from '../../types/atmosense';

interface HeaderProps {
  regions: RegionConfig[];
  selectedRegion: RegionId;
  onSelectRegion: (id: RegionId) => void;
  horizonMode: HorizonMode;
  onSelectHorizon: (mode: HorizonMode) => void;
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  onOpenPolicyReport: () => void;
  nodeCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
  horizonMode,
  onSelectHorizon,
  activeTab,
  onSelectTab,
  onOpenPolicyReport,
  nodeCount
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs z-30 select-none">
      {/* Top Bar: Brand, Region, Horizon & Export */}
      <div className="px-4 lg:px-6 py-3 flex items-center justify-between border-b border-slate-100">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Wind className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900 font-sans">
                ATMOSENSE
              </h1>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                Coupled Weather–Chemistry System
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Air Pollution–Weather Coupled Forecasting System (Delhi NCR Focus)
            </p>
          </div>
        </div>

        {/* Global Controls: Region & Forecast Horizon */}
        <div className="flex items-center space-x-3">
          {/* Target Region Dropdown */}
          <div className="relative">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block -mb-0.5 px-1">
              Target Region
            </label>
            <div className="flex items-center space-x-1.5 bg-slate-100/90 hover:bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer transition-colors">
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              <select
                value={selectedRegion}
                onChange={(e) => onSelectRegion(e.target.value as RegionId)}
                className="bg-transparent border-none text-xs font-bold text-slate-900 focus:ring-0 cursor-pointer pr-4 appearance-none outline-none"
              >
                {regions.map((reg) => (
                  <option key={reg.id} value={reg.id}>
                    {reg.name}
                  </option>
                ))}
                <option value="custom">Custom Bounds</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none -ml-3" />
            </div>
          </div>

          {/* Horizon Picker */}
          <div className="relative hidden md:block">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block -mb-0.5 px-1">
              Forecast Horizon
            </label>
            <div className="flex items-center space-x-1.5 bg-slate-100/90 hover:bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer transition-colors">
              <select
                value={horizonMode}
                onChange={(e) => onSelectHorizon(e.target.value as HorizonMode)}
                className="bg-transparent border-none text-xs font-bold text-slate-900 focus:ring-0 cursor-pointer pr-4 appearance-none outline-none"
              >
                <option value="72h_short_term">Short-Term (24h - 72h)</option>
                <option value="7d_extended">7-Day Extended Outlook</option>
                <option value="custom">Custom Calendar Horizon</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none -ml-3" />
            </div>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2 lg:space-x-3">
          {/* Active Alert Badge */}
          <div className="hidden lg:flex items-center space-x-2 bg-rose-50 border border-rose-200/90 px-3 py-1.5 rounded-xl">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1 text-rose-950 font-extrabold text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Accumulation Risk High</span>
              </div>
              <span className="text-[9px] text-rose-700 font-medium">Sub-200m PBLH Lid Collapse</span>
            </div>
          </div>

          {/* Export Advisory Brief Button */}
          <button
            onClick={onOpenPolicyReport}
            className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm shadow-sky-600/30 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Advisory Brief</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Bottom Bar: Pill-Style Multi-Tab Navigation Bar */}
      <div className="px-4 lg:px-6 py-2 bg-slate-50/80 flex items-center justify-between">
        <nav className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Tab 1: Spatial Map */}
          <button
            onClick={() => onSelectTab('map')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'map'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Map className={`w-4 h-4 ${activeTab === 'map' ? 'text-sky-400' : 'text-slate-500'}`} />
            <span>Spatial Map Canvas</span>
          </button>

          {/* Tab 2: Physics & Telemetry */}
          <button
            onClick={() => onSelectTab('physics')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'physics'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Zap className={`w-4 h-4 ${activeTab === 'physics' ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>Physics Diagnostics & Telemetry</span>
          </button>

          {/* Tab 3: Grid Nodes */}
          <button
            onClick={() => onSelectTab('nodes')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'nodes'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Radio className={`w-4 h-4 ${activeTab === 'nodes' ? 'text-teal-400' : 'text-slate-500'}`} />
            <span>Sensing Nodes & Analytics</span>
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
              activeTab === 'nodes' ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {nodeCount}
            </span>
          </button>

          {/* Tab 4: AI Decision Support */}
          <button
            onClick={() => onSelectTab('policy')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'policy'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <FileSpreadsheet className={`w-4 h-4 ${activeTab === 'policy' ? 'text-rose-400' : 'text-slate-500'}`} />
            <span>AI Environmental Decision Support</span>
          </button>
        </nav>

        <div className="hidden lg:flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Coupled Forecast System</span>
        </div>
      </div>
    </header>
  );
};
