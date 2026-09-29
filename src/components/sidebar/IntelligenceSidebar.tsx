import React, { useState } from 'react';
import {
  MapPin,
  Cpu,
  Thermometer,
  ChevronRight,
  Layers,
  Search,
  AlertTriangle,
  FileText
} from 'lucide-react';
import type {
  NodeData,
  HourlyTimelineStep,
  PolicyAdvisory,
  RegionConfig,
  ViewMode
} from '../../types/atmosense';

interface IntelligenceSidebarProps {
  region: RegionConfig;
  nodes: NodeData[];
  currentStep: HourlyTimelineStep;
  advisory: PolicyAdvisory;
  viewMode: ViewMode;
  selectedNode: NodeData | null;
  onSelectNode: (node: NodeData) => void;
  onOpenPolicyReport: () => void;
  onOpenPhysicsModal: () => void;
}

export const IntelligenceSidebar: React.FC<IntelligenceSidebarProps> = ({
  region,
  nodes,
  currentStep,
  advisory,
  viewMode,
  selectedNode,
  onSelectNode,
  onOpenPolicyReport,
  onOpenPhysicsModal
}) => {
  const [filterType, setFilterType] = useState<'all' | 'physical' | 'virtual'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate average regional PM2.5 / AQI from current step
  const allPm25 = nodes.map(n => currentStep.nodeValues[n.id]?.pm25 ?? n.current_pm25);
  const avgPm25 = Math.round(allPm25.reduce((a, b) => a + b, 0) / (allPm25.length || 1));
  
  const allAqi = nodes.map(n => currentStep.nodeValues[n.id]?.aqi ?? n.current_aqi);
  const avgAqi = Math.round(allAqi.reduce((a, b) => a + b, 0) / (allAqi.length || 1));

  const displayVal = viewMode === 'pm25' ? avgPm25 : avgAqi;

  // Severity color calculation
  let riskBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  let riskLabel = 'Good / Moderate';
  if (displayVal > 250) {
    riskBadgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
    riskLabel = 'Severe Inversion Trapping';
  } else if (displayVal > 120) {
    riskBadgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
    riskLabel = 'Poor / High Risk';
  }

  // Filter nodes
  const filteredNodes = nodes.filter(node => {
    const isNodeVirtual = node.type === 'model_estimated' || (node.type as string) === 'virtual';
    if (filterType === 'physical' && node.type !== 'physical') return false;
    if (filterType === 'virtual' && !isNodeVirtual) return false;
    if (searchQuery.trim() !== '') {
      return node.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <aside className="w-full lg:w-[380px] xl:w-[420px] bg-slate-50 border-l border-slate-200 flex flex-col h-full overflow-hidden select-none shrink-0 font-sans">
      {/* 1. Regional Overview Header Card */}
      <div className="p-4 border-b border-slate-200 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Regional Environmental Intelligence
            </span>
            <h2 className="text-base font-extrabold text-slate-900 font-sans">
              {region.name} Overview
            </h2>
          </div>
          <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${riskBadgeColor}`}>
            {riskLabel}
          </span>
        </div>

        {/* Primary Metric Large Gauge */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">
              Regional Mean {viewMode === 'pm25' ? 'PM₂.₅' : 'AQI'}
            </span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-2xl font-black text-slate-900 font-sans">
                {displayVal}
              </span>
              <span className="text-xs font-bold text-slate-500">
                {viewMode === 'pm25' ? 'µg/m³' : ''}
              </span>
            </div>
          </div>

          <div className="border-l border-slate-200 pl-3">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              Boundary Height
            </span>
            <div className="flex items-baseline space-x-1 mt-0.5 font-mono">
              <span className="text-2xl font-black text-rose-600">
                {currentStep.telemetry.pblh_meters}m
              </span>
            </div>
            <span className="text-[9px] text-rose-700 font-bold block">
              {currentStep.telemetry.stagnation_index}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Physics Diagnostics Trigger Card */}
      <div className="p-3 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-sky-950 font-semibold">
          <Thermometer className="w-4 h-4 text-sky-600 shrink-0" />
          <span>Inverse 1/PBLH Thermal Inversion Diagnostics</span>
        </div>
        <button
          onClick={onOpenPhysicsModal}
          className="text-xs font-bold text-sky-600 hover:text-sky-800 underline flex items-center space-x-0.5 cursor-pointer"
        >
          <span>Inspect</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Node Directory Panel (Physical & Model-Estimated Spatial Grids) */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Panel Controls: Search & Tabs */}
        <div className="p-3 border-b border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Sensing Grids ({filteredNodes.length})</span>
            </span>
            <span className="text-[10px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Coupled Weather–Chemistry Grid
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search station or grid point..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-100 rounded-lg text-[11px] font-semibold text-center">
            <button
              onClick={() => setFilterType('all')}
              className={`py-1 rounded-md transition-all ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({nodes.length})
            </button>
            <button
              onClick={() => setFilterType('physical')}
              className={`py-1 rounded-md transition-all ${
                filterType === 'physical'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              CAAQMS ({nodes.filter(n => n.type === 'physical').length})
            </button>
            <button
              onClick={() => setFilterType('virtual')}
              className={`py-1 rounded-md transition-all ${
                filterType === 'virtual'
                  ? 'bg-white text-teal-700 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Model Grid ({nodes.filter(n => n.type === 'model_estimated' || (n.type as string) === 'virtual').length})
            </button>
          </div>
        </div>

        {/* Scrollable Node List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
          {filteredNodes.map((node) => {
            const isVirtual = node.type === 'model_estimated' || (node.type as string) === 'virtual';
            const stepVal = currentStep.nodeValues[node.id];
            const nodeVal = stepVal
              ? viewMode === 'pm25'
                ? stepVal.pm25
                : stepVal.aqi
              : viewMode === 'pm25'
              ? node.current_pm25
              : node.current_aqi;

            const isSelected = selectedNode?.id === node.id;

            let pillColor = 'bg-emerald-100 text-emerald-800';
            if (nodeVal > 250) pillColor = 'bg-rose-100 text-rose-800';
            else if (nodeVal > 120) pillColor = 'bg-amber-100 text-amber-800';

            return (
              <div
                key={node.id}
                onClick={() => onSelectNode(node)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-sky-50/80 border-sky-300 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200/70'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isVirtual ? 'bg-teal-500 text-white' : 'bg-blue-600 text-white'
                    }`}
                  >
                    {isVirtual ? <Cpu className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-slate-900">{node.name}</span>
                      {isVirtual && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">
                          MODEL
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {isVirtual
                        ? 'Model Spatial Estimate'
                        : 'Official Ground Station'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-slate-900 font-mono">
                    {nodeVal} <span className="text-[10px] text-slate-500">{viewMode === 'pm25' ? 'µg' : ''}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${pillColor}`}>
                    Peak: {viewMode === 'pm25' ? node.forecast_pm25_peak : node.forecast_aqi_peak}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Advisory Decision Support Quick Banner */}
      <div className="p-3.5 bg-slate-900 text-white border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <div className="text-[10px] font-bold text-slate-300 uppercase">
              Active Risk Advisory
            </div>
            <div className="text-xs font-extrabold text-amber-400">
              {advisory.forecastRisk?.title || 'HIGH ACCUMULATION RISK'}
            </div>
          </div>
        </div>

        <button
          onClick={onOpenPolicyReport}
          className="flex items-center space-x-1 bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Decision Brief</span>
        </button>
      </div>
    </aside>
  );
};
