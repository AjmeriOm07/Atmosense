import React, { useState } from 'react';
import {
  MapPin,
  Cpu,
  Search,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
  Thermometer,
  Navigation,
  CheckCircle2,
  ChevronRight,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import type { NodeData, HourlyTimelineStep, RegionConfig, ViewMode } from '../../types/atmosense';

interface GridNodesTabProps {
  region: RegionConfig;
  nodes: NodeData[];
  currentStep: HourlyTimelineStep;
  viewMode: ViewMode;
  selectedNode: NodeData | null;
  onSelectNode: (node: NodeData) => void;
}

export const GridNodesTab: React.FC<GridNodesTabProps> = ({
  region,
  nodes,
  currentStep,
  viewMode,
  selectedNode,
  onSelectNode
}) => {
  const [filterType, setFilterType] = useState<'all' | 'physical' | 'virtual'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Default active node if none selected
  const activeNode = selectedNode || nodes[0];
  const isVirtual = activeNode.type === 'model_estimated' || (activeNode.type as string) === 'virtual';

  const activeStepVal = currentStep.nodeValues[activeNode.id];
  const activeVal = activeStepVal
    ? viewMode === 'pm25'
      ? activeStepVal.pm25
      : activeStepVal.aqi
    : viewMode === 'pm25'
    ? activeNode.current_pm25
    : activeNode.current_aqi;

  const peakVal = viewMode === 'pm25' ? activeNode.forecast_pm25_peak : activeNode.forecast_aqi_peak;

  // Filter nodes for sidebar
  const filteredNodes = nodes.filter((node) => {
    const isNodeVirtual = node.type === 'model_estimated' || (node.type as string) === 'virtual';
    if (filterType === 'physical' && node.type !== 'physical') return false;
    if (filterType === 'virtual' && !isNodeVirtual) return false;
    if (searchQuery.trim() !== '') {
      return node.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col space-y-4 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 font-sans tracking-tight">
              Sensing Nodes & Spatial Analytics ({region.name})
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Official Ground CAAQMS Stations & Model-Estimated Spatial Grids
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-sky-600" />
            <span>Coupled Weather–Chemistry Grid</span>
          </span>
        </div>
      </div>

      {/* Split View Container (30% Sidebar Directory / 70% Rich Detailed Analytics) */}
      <div className="flex-1 min-h-[560px] grid grid-cols-1 lg:grid-cols-12 gap-6 items-start overflow-hidden">
        {/* Sidebar Station List (4 cols ~ 30%) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full max-h-[620px]">
          {/* Search & Tabs */}
          <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search station or grid point..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/70 rounded-xl text-xs font-bold text-center">
              <button
                onClick={() => setFilterType('all')}
                className={`py-1.5 rounded-lg transition-all ${
                  filterType === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({nodes.length})
              </button>
              <button
                onClick={() => setFilterType('physical')}
                className={`py-1.5 rounded-lg transition-all ${
                  filterType === 'physical'
                    ? 'bg-white text-blue-700 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                CAAQMS ({nodes.filter((n) => n.type === 'physical').length})
              </button>
              <button
                onClick={() => setFilterType('virtual')}
                className={`py-1.5 rounded-lg transition-all ${
                  filterType === 'virtual'
                    ? 'bg-white text-teal-700 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Model Grid ({nodes.filter((n) => n.type === 'model_estimated' || (n.type as string) === 'virtual').length})
              </button>
            </div>
          </div>

          {/* Node List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-3 space-y-1.5">
            {filteredNodes.map((node) => {
              const nodeIsVirtual = node.type === 'model_estimated' || (node.type as string) === 'virtual';
              const isSelected = activeNode.id === node.id;
              const stepVal = currentStep.nodeValues[node.id];
              const val = stepVal
                ? viewMode === 'pm25'
                  ? stepVal.pm25
                  : stepVal.aqi
                : viewMode === 'pm25'
                ? node.current_pm25
                : node.current_aqi;

              let badgeColor = 'bg-emerald-100 text-emerald-800';
              if (val > 250) badgeColor = 'bg-rose-100 text-rose-800';
              else if (val > 120) badgeColor = 'bg-amber-100 text-amber-800';

              return (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-sky-50 border-sky-400 shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        nodeIsVirtual ? 'bg-teal-500 text-white' : 'bg-blue-600 text-white'
                      }`}
                    >
                      {nodeIsVirtual ? <Cpu className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-extrabold text-slate-900">{node.name}</span>
                        {nodeIsVirtual && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">
                            MODEL
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {nodeIsVirtual ? 'Model Spatial Estimate' : 'CAAQMS Ground Station'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-sm font-black text-slate-900">{val}</div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${badgeColor}`}>
                      Peak {node.forecast_pm25_peak}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Detailed Inspection View (8 cols ~ 70%) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 flex flex-col justify-between h-full min-h-[620px]">
          {/* Header Card Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
                  isVirtual ? 'bg-teal-500' : 'bg-blue-600'
                }`}
              >
                {isVirtual ? <Cpu className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-black text-slate-900">{activeNode.name}</h3>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      isVirtual
                        ? 'bg-teal-50 text-teal-700 border-teal-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {isVirtual ? 'Model-Estimated Spatial Grid' : 'CAAQMS Ground Station'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Lat: {activeNode.lat.toFixed(4)}° N, Lng: {activeNode.lng.toFixed(4)}° E
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                {activeNode.data_provenance || (isVirtual ? 'Model-Estimated Spatial Grid' : 'CAAQMS Ground Observation')}
              </span>
            </div>
          </div>

          {/* Metrics Trio Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Current {viewMode === 'pm25' ? 'PM₂.₅' : 'AQI'}
              </span>
              <div className="flex items-baseline space-x-1 mt-1 font-mono">
                <span className="text-3xl font-black text-slate-900">{activeVal}</span>
                <span className="text-xs font-bold text-slate-500">{viewMode === 'pm25' ? 'µg/m³' : ''}</span>
              </div>
              <span className="mt-2 text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md self-start">
                {isVirtual ? 'Model Output Estimate' : 'Ground Sensor Reading'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-col">
              <span className="text-[10px] font-bold uppercase text-rose-800 flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                <span>Forecast 24h Peak</span>
              </span>
              <div className="flex items-baseline space-x-1 mt-1 font-mono">
                <span className="text-3xl font-black text-rose-950">{peakVal}</span>
                <span className="text-xs font-bold text-rose-600">{viewMode === 'pm25' ? 'µg/m³' : ''}</span>
              </div>
              <span className="mt-2 text-[10px] font-semibold text-rose-800">
                Peak Window: 02:00 AM - 08:00 AM
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col">
              <span className="text-[10px] font-bold uppercase text-amber-900 flex items-center space-x-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                <span>Boundary Layer</span>
              </span>
              <div className="flex items-baseline space-x-1 mt-1 font-mono">
                <span className="text-3xl font-black text-slate-900">{activeNode.pblh_meters || 215}m</span>
              </div>
              <span className="mt-2 text-[10px] font-extrabold text-amber-900">
                {activeNode.inversion_risk || 'Severe Lid Collapse'}
              </span>
            </div>
          </div>

          {/* Model Grid Origin & Nearest Station Details */}
          {isVirtual && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-xs font-extrabold text-teal-950">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Data Provenance: Model-Estimated Spatial Grid</span>
                </div>
                <p className="text-xs text-teal-800">
                  {activeNode.estimation_method || 'Interpolated using spatial model estimation & atmospheric boundary layer physics.'}
                </p>
              </div>

              {activeNode.nearest_physical_station && (
                <div className="bg-white border border-teal-200 px-3.5 py-1.5 rounded-xl text-right text-xs shrink-0">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Nearest Physical Station</span>
                  <span className="font-extrabold text-slate-800">
                    {activeNode.nearest_physical_station} ({activeNode.distance_km || 11.8} km)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 72-Hour Forecast Trendline Preview (Recharts) */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <BarChart2 className="w-4 h-4 text-sky-600" />
                <span>Observed & Model-Predicted Trendline</span>
              </span>
              <div className="flex items-center space-x-2 text-[11px] font-bold">
                <span className="w-3 h-3 rounded-xs bg-sky-500 inline-block" />
                <span className="text-sky-900 font-extrabold">
                  Blue Area: {viewMode === 'pm25' ? 'PM₂.₅ Concentration (Unit: µg/m³)' : 'AQI Index (Unit: AQI)'}
                </span>
              </div>
            </div>

            <div className="h-52 w-full bg-slate-50/80 rounded-2xl border border-slate-200 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeNode.hourlyHistory}>
                  <defs>
                    <linearGradient id="gridTrendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={['auto', 'auto']} unit={viewMode === 'pm25' ? ' µg/m³' : ''} />
                  <Tooltip
                    formatter={(value: any) => [
                      `${value} ${viewMode === 'pm25' ? 'µg/m³' : 'AQI'}`,
                      viewMode === 'pm25' ? 'PM₂.₅ Concentration' : 'AQI Index Value'
                    ]}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={viewMode === 'pm25' ? 'pm25' : 'aqi'}
                    stroke="#0284C7"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#gridTrendGrad)"
                    name={viewMode === 'pm25' ? 'PM₂.₅ Concentration (µg/m³)' : 'AQI Index Value'}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
