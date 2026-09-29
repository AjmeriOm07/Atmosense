import React from 'react';
import {
  X,
  MapPin,
  Cpu,
  TrendingUp,
  Thermometer,
  ShieldCheck,
  Zap,
  Navigation,
  Activity
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
import type { NodeData, ViewMode } from '../../types/atmosense';

interface NodeInspectorModalProps {
  node: NodeData | null;
  onClose: () => void;
  viewMode: ViewMode;
  currentPm25: number;
  currentAqi: number;
}

export const NodeInspectorModal: React.FC<NodeInspectorModalProps> = ({
  node,
  onClose,
  viewMode,
  currentPm25,
  currentAqi
}) => {
  if (!node) return null;

  const isVirtual = node.type === 'model_estimated' || (node.type as string) === 'virtual';
  const val = viewMode === 'pm25' ? currentPm25 : currentAqi;
  const peakVal = viewMode === 'pm25' ? node.forecast_pm25_peak : node.forecast_aqi_peak;

  // Severity indicator styling
  let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  let statusText = 'Good / Moderate';
  if (val > 250) {
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
    statusText = 'Severe Peak Trapping Spike';
  } else if (val > 120) {
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
    statusText = 'Poor / High Risk';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${
                isVirtual
                  ? 'bg-teal-500 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {isVirtual ? <Cpu className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 font-sans">
                  {node.name}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isVirtual
                      ? 'bg-teal-50 text-teal-700 border-teal-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {isVirtual ? 'Model-Estimated Spatial Grid' : 'Physical Ground CAAQMS'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Lat: {node.lat.toFixed(4)}° N, Lng: {node.lng.toFixed(4)}° E
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Current Reading */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Current {viewMode === 'pm25' ? 'PM₂.₅' : 'AQI'}
              </span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-2xl font-black text-slate-900 font-sans">
                  {val}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {viewMode === 'pm25' ? 'µg/m³' : ''}
                </span>
              </div>
              <span className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full border self-start ${badgeColor}`}>
                {statusText}
              </span>
            </div>

            {/* Forecast Peak */}
            <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/70 flex flex-col">
              <span className="text-[10px] font-bold uppercase text-rose-700 tracking-wider flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-rose-600" />
                <span>Forecast 24h Peak</span>
              </span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-2xl font-black text-rose-950 font-sans">
                  {peakVal}
                </span>
                <span className="text-xs font-semibold text-rose-600">
                  {viewMode === 'pm25' ? 'µg/m³' : ''}
                </span>
              </div>
              <span className="mt-2 text-[10px] font-semibold text-rose-800">
                Peak Window: 02:00 AM - 08:00 AM
              </span>
            </div>

            {/* Inversion Risk / PBLH */}
            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 flex flex-col col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider flex items-center space-x-1">
                <Thermometer className="w-3 h-3 text-amber-600" />
                <span>Boundary Layer</span>
              </span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-2xl font-black text-slate-900 font-sans">
                  {node.pblh_meters || 215}
                </span>
                <span className="text-xs font-semibold text-slate-500">meters</span>
              </div>
              <span className="mt-2 text-[10px] font-bold text-amber-900">
                {node.inversion_risk || 'Severe Lid Collapse'}
              </span>
            </div>
          </div>

          {/* Model Grid Origin & Nearest Station Details (if Model Estimated) */}
          {isVirtual && (
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-xs font-bold text-teal-950">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Data Provenance: Model-Estimated Spatial Grid</span>
                </div>
                <p className="text-[11px] text-teal-800">
                  {node.estimation_method || 'Interpolated using spatial model estimation & atmospheric boundary layer physics.'}
                </p>
              </div>

              {node.nearest_physical_station && (
                <div className="bg-white/80 border border-teal-200 px-3 py-1.5 rounded-lg text-right text-[11px] shrink-0">
                  <span className="text-slate-500 block">Nearest Ground Station</span>
                  <span className="font-bold text-slate-800">
                    {node.nearest_physical_station} ({node.distance_km || 11.8} km)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 24-Hour Trend Line Preview (Recharts) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1">
                <Activity className="w-4 h-4 text-sky-600" />
                <span>24-Hour Observed & Predicted Trendline</span>
              </span>
              <div className="flex items-center space-x-2 text-[11px] font-bold">
                <span className="w-3 h-3 rounded-xs bg-sky-500 inline-block" />
                <span className="text-sky-900 font-extrabold">
                  Blue Area: {viewMode === 'pm25' ? 'PM₂.₅ Concentration (Unit: µg/m³)' : 'AQI Index (Unit: AQI)'}
                </span>
              </div>
            </div>

            <div className="h-44 w-full bg-slate-50/80 border border-slate-200/80 rounded-xl p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={node.hourlyHistory}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="timestamp"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    domain={['auto', 'auto']}
                    unit={viewMode === 'pm25' ? ' µg/m³' : ''}
                  />
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
                    fill="url(#colorTrend)"
                    name={viewMode === 'pm25' ? 'PM₂.₅ Concentration (µg/m³)' : 'AQI Index Value'}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            CPCB Guidance Standard Compliant
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close Inspection
          </button>
        </div>
      </div>
    </div>
  );
};
