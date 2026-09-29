import React from 'react';
import {
  X,
  BarChart2,
  Thermometer,
  Zap,
  TrendingUp,
  Info,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import type { HourlyTimelineStep } from '../../types/atmosense';

interface AtmosphericPhysicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: HourlyTimelineStep[];
}

export const AtmosphericPhysicsModal: React.FC<AtmosphericPhysicsModalProps> = ({
  isOpen,
  onClose,
  steps
}) => {
  if (!isOpen) return null;

  // Format data for dual axis chart
  const chartData = steps.map((step) => {
    // Average PM2.5 across all nodes for this hour
    const vals = Object.values(step.nodeValues).map((v) => v.pm25);
    const avgPm25 = Math.round(vals.reduce((a, b) => a + b, 0) / (vals.length || 1));

    return {
      time: step.formattedTime.replace('Nov 16, ', ''),
      pm25: avgPm25,
      pblh: step.telemetry.pblh_meters,
      inversePblh: Number((step.telemetry.inverse_pblh * 10000).toFixed(2)) // Scaled for visibility
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-sans">
                Atmospheric Physics Dynamics (1/PBLH & Advection)
              </h3>
              <p className="text-xs text-slate-500">
                Inverse Planetary Boundary Layer Height Mechanics vs. Pollution Trapping
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Explanation Banner */}
          <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl flex items-start space-x-3 text-xs text-sky-950">
            <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-extrabold text-sm">
                Solving the "Valley/Peak-Smoothing Problem"
              </div>
              <p className="leading-relaxed font-sans">
                Standard statistical ML models smooth out extreme winter pollution spikes because ground stations are sparse.
                Atmosense embeds atmospheric boundary layer physics: as nocturnal temperature inversion collapses the boundary lid (PBLH ↓), concentration scales inversely (1/PBLH ↑), preserving peak spikes without hardware expansion.
              </p>
            </div>
          </div>

          {/* Dual Axis Recharts Graph */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1">
                <Activity className="w-4 h-4 text-sky-600" />
                <span>Atmospheric Inverse Correlation Curve</span>
              </span>
              <div className="p-2 bg-slate-100 rounded-xl border border-slate-200 flex items-center space-x-4 text-[11px] font-bold">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-xs bg-rose-200 border border-rose-500 inline-block" />
                  <span className="text-rose-900 font-extrabold">Red Area (Left Axis): PM₂.₅ (µg/m³)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-1 rounded-full bg-sky-600 inline-block" />
                  <span className="text-sky-900 font-extrabold">Blue Line (Right Axis): PBLH Depth (m)</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                  <YAxis
                    yAxisId="left"
                    stroke="#EF4444"
                    fontSize={11}
                    label={{ value: 'PM₂.₅ Concentration (µg/m³)', angle: -90, position: 'insideLeft', fill: '#EF4444' }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#0284C7"
                    fontSize={11}
                    label={{ value: 'PBLH Depth (Meters - m)', angle: 90, position: 'insideRight', fill: '#0284C7' }}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => {
                      if (name.includes('PM₂.₅') || name.includes('Concentration')) {
                        return [`${value} µg/m³`, 'Red Area: Regional PM₂.₅ Concentration'];
                      }
                      return [`${value} meters (m)`, 'Blue Line: Planetary Boundary Layer Height'];
                    }}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="pm25"
                    name="Regional PM₂.₅ Concentration (µg/m³)"
                    fill="#FEE2E2"
                    stroke="#EF4444"
                    strokeWidth={2.5}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="pblh"
                    name="Boundary Layer Height (PBLH meters - m)"
                    stroke="#0284C7"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Core Equation Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="font-bold text-slate-900">1/PBLH Scaling Factor</div>
              <div className="text-slate-600 mt-1">Direct inverse scaling preserves nocturnal ground pollution trapping.</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="font-bold text-slate-900">Advection Field ($U, V$)</div>
              <div className="text-slate-600 mt-1">Wind vector components dictate regional transport and accumulation.</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="font-bold text-slate-900 font-sans">Model Spatial Grid Coverage</div>
              <div className="text-slate-600 mt-1 font-sans">Coupled weather–chemistry numerical estimates across unmonitored suburban sub-grids.</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close Physics Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
