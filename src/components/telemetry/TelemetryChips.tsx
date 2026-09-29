import React from 'react';
import {
  Thermometer,
  Wind,
  AlertOctagon,
  Flame,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import type { TelemetryData } from '../../types/atmosense';

interface TelemetryChipsProps {
  telemetry: TelemetryData;
  formattedTime: string;
}

export const TelemetryChips: React.FC<TelemetryChipsProps> = ({
  telemetry,
  formattedTime
}) => {
  const isSeverePblh = telemetry.pblh_meters < 220;
  const isStagnantWind = telemetry.wind_speed_ms < 2.0;

  return (
    <div className="flex flex-wrap items-center gap-2 lg:gap-3 select-none">
      {/* 1. PBLH Gauge & Lid Collapse Alert */}
      <div
        className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
          isSeverePblh
            ? 'bg-rose-50 border-rose-200/90 text-rose-900 shadow-xs'
            : 'bg-slate-100/90 border-slate-200 text-slate-800'
        }`}
      >
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            isSeverePblh ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-700'
          }`}
        >
          <Thermometer className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center space-x-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              PBLH Lid Height
            </span>
            {isSeverePblh && (
              <span className="text-[9px] font-black uppercase text-rose-600 bg-rose-100 px-1 rounded">
                Collapse Alert
              </span>
            )}
          </div>
          <div className="flex items-baseline space-x-1 font-mono">
            <span className="text-sm font-black text-slate-900">
              {telemetry.pblh_meters}m
            </span>
            <span className="text-[10px] font-semibold text-slate-500">
              (1/PBLH: {telemetry.inverse_pblh})
            </span>
          </div>
        </div>
      </div>

      {/* 2. Wind Dynamics Vector Chip */}
      <div
        className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
          isStagnantWind
            ? 'bg-amber-50 border-amber-200/90 text-amber-900 shadow-xs'
            : 'bg-slate-100/90 border-slate-200 text-slate-800'
        }`}
      >
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            isStagnantWind ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
          }`}
        >
          <Wind
            className="w-4 h-4 transition-transform duration-500"
            style={{ transform: `rotate(${telemetry.wind_direction_deg}deg)` }}
          />
        </div>
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            Wind Dynamics ($U, V$)
          </div>
          <div className="flex items-center space-x-1.5 font-mono">
            <span className="text-sm font-black text-slate-900">
              {telemetry.wind_direction_cardinal} @ {telemetry.wind_speed_ms} m/s
            </span>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                isStagnantWind
                  ? 'bg-amber-200 text-amber-900'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {telemetry.stagnation_index}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Peak Spike Indicator Flag */}
      {telemetry.peak_spike_window.isPeak ? (
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-rose-600 text-white rounded-xl shadow-sm animate-pulse text-xs font-bold">
          <Flame className="w-4 h-4 text-amber-300" />
          <div>
            <div className="text-[10px] font-semibold text-rose-100 uppercase tracking-wider">
              Extreme Spike Window Triggered
            </div>
            <div className="text-[11px] font-mono">
              Peak: {telemetry.peak_spike_window.startLabel} - {telemetry.peak_spike_window.endLabel}
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold">
          <ShieldAlert className="w-4 h-4 text-emerald-600" />
          <span>Normal Dispersion Horizon ({formattedTime})</span>
        </div>
      )}
    </div>
  );
};
