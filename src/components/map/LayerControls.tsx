import React from 'react';
import {
  Layers,
  MapPin,
  Cpu,
  Thermometer,
  Wind,
  Eye,
  Sliders,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { MapLayerConfig, ViewMode } from '../../types/atmosense';

interface LayerControlsProps {
  layerConfig: MapLayerConfig;
  onUpdateConfig: (updated: Partial<MapLayerConfig>) => void;
  physicalCount: number;
  virtualCount: number;
}

export const LayerControls: React.FC<LayerControlsProps> = ({
  layerConfig,
  onUpdateConfig,
  physicalCount,
  virtualCount
}) => {
  // Uncollapsed by default to overlay the left portion of the map
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="absolute top-3 left-3 z-[1000] select-none transition-all duration-300 max-h-[calc(100%-24px)] flex flex-col">
      {collapsed ? (
        /* Sleek Left Tab Trigger Button when collapsed */
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center space-x-2 bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 text-xs font-bold px-3 py-2 rounded-xl shadow-md border border-slate-200 transition-all hover:scale-105 cursor-pointer"
        >
          <Layers className="w-4 h-4 text-sky-600" />
          <span>Spatial Layer Controls</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      ) : (
        /* Full Left Portion Overlay Panel */
        <div className="w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden flex flex-col max-h-full border-l-4 border-l-sky-600 animate-in fade-in duration-200">
          {/* Header Bar */}
          <div
            className="px-3.5 py-2.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between cursor-pointer shrink-0"
            onClick={() => setCollapsed(true)}
          >
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
              <Layers className="w-4 h-4 text-sky-600" />
              <span className="uppercase tracking-wider">Spatial Layer Controls</span>
            </div>
            <button
              className="w-6 h-6 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              title="Collapse Panel to Left Tab"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-3.5 space-y-3.5 overflow-y-auto flex-1">
            {/* View Mode Radio */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Display Metric Mode
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/90 rounded-xl">
                <button
                  type="button"
                  onClick={() => onUpdateConfig({ viewMode: 'pm25' })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1 ${
                    layerConfig.viewMode === 'pm25'
                      ? 'bg-white text-sky-700 shadow-xs font-bold border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>PM₂.₅ (µg/m³)</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateConfig({ viewMode: 'aqi' })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1 ${
                    layerConfig.viewMode === 'aqi'
                      ? 'bg-white text-sky-700 shadow-xs font-bold border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Overall AQI</span>
                </button>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Node Overlays */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Node Overlays
              </label>

              {/* Physical Stations */}
              <label className="flex items-center justify-between cursor-pointer group p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                  <div className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow-xs" />
                  <span className="group-hover:text-slate-900">CAAQMS Stations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                    {physicalCount}
                  </span>
                  <input
                    type="checkbox"
                    checked={layerConfig.showPhysical}
                    onChange={(e) => onUpdateConfig({ showPhysical: e.target.checked })}
                    className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                  />
                </div>
              </label>

              {/* Model-Estimated Grid Points */}
              <label className="flex items-center justify-between cursor-pointer group p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                  <div className="relative w-3 h-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500 border border-white"></span>
                  </div>
                  <span className="group-hover:text-slate-900">Model-Estimated Grid</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                    {virtualCount} Estimated
                  </span>
                  <input
                    type="checkbox"
                    checked={layerConfig.showVirtual}
                    onChange={(e) => onUpdateConfig({ showVirtual: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                  />
                </div>
              </label>
            </div>

            <hr className="border-slate-100" />

            {/* Atmospheric Physics Layers */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Atmospheric Physics Layers
              </label>

              {/* 1/PBLH Thermal Inversion Contours */}
              <label className="flex items-center justify-between cursor-pointer group p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                  <Thermometer className="w-4 h-4 text-amber-500" />
                  <span className="group-hover:text-slate-900">1/PBLH Thermal Inversion</span>
                </div>
                <input
                  type="checkbox"
                  checked={layerConfig.showPblhContours}
                  onChange={(e) => onUpdateConfig({ showPblhContours: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                />
              </label>

              {/* Wind Flow Vectors */}
              <label className="flex items-center justify-between cursor-pointer group p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                  <Wind className="w-4 h-4 text-cyan-600" />
                  <span className="group-hover:text-slate-900">Wind Dynamics Vector Overlay</span>
                </div>
                <input
                  type="checkbox"
                  checked={layerConfig.showWindVectors}
                  onChange={(e) => onUpdateConfig({ showWindVectors: e.target.checked })}
                  className="w-4 h-4 text-cyan-600 rounded border-slate-300 focus:ring-cyan-500 cursor-pointer"
                />
              </label>

              {/* Regional Fire / Stubble Activity */}
              <label className="flex items-center justify-between cursor-pointer group p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                  <div className="w-3 h-3 rounded-full bg-rose-600 animate-pulse border border-white" />
                  <span className="group-hover:text-slate-900">Regional Fire / Stubble Activity</span>
                </div>
                <input
                  type="checkbox"
                  checked={layerConfig.showRegionalFires}
                  onChange={(e) => onUpdateConfig({ showRegionalFires: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                />
              </label>

              {/* Pollution Transport / Plume Layer */}
              <label className="flex items-center justify-between cursor-pointer group p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                  <div className="w-3 h-3 rounded-full bg-amber-500 border border-white" />
                  <span className="group-hover:text-slate-900">Pollution Transport / Plume</span>
                </div>
                <input
                  type="checkbox"
                  checked={layerConfig.showPollutionPlume}
                  onChange={(e) => onUpdateConfig({ showPollutionPlume: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                />
              </label>
            </div>

            <hr className="border-slate-100" />

            {/* Spatial Legend Strip */}
            <div className="pt-1 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Spatial Data Legend
              </label>
              <div className="space-y-1 text-[11px] font-semibold text-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                  <span>CAAQMS Station — Ground observation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
                  <span>Model-Estimated Grid — Spatial model estimate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
                  <span>Regional Fire / Stubble Spot</span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-900 leading-tight">
                ℹ️ <strong>Note:</strong> Satellite fire observations may include agricultural and non-agricultural sources.
              </div>

              <div className="pt-1">
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex justify-between">
                  <span>Risk Intensity Scale</span>
                  <span>PM₂.₅ µg/m³</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-600 shadow-inner" />
                <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-semibold">
                  <span className="text-emerald-700">0-60 Good</span>
                  <span className="text-amber-700">60-250 Moderate</span>
                  <span className="text-rose-700">250+ Severe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
