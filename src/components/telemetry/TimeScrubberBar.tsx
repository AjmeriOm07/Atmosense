import React from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  Calendar,
  SlidersHorizontal
} from 'lucide-react';
import type { HourlyTimelineStep } from '../../types/atmosense';
import { TelemetryChips } from './TelemetryChips';

interface TimeScrubberBarProps {
  steps: HourlyTimelineStep[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
}

export const TimeScrubberBar: React.FC<TimeScrubberBarProps> = ({
  steps,
  currentIndex,
  onSelectIndex
}) => {
  const currentStep = steps[currentIndex] || steps[0];

  const handlePrevHour = () => {
    onSelectIndex(Math.max(0, currentIndex - 1));
  };

  const handleNextHour = () => {
    onSelectIndex(Math.min(steps.length - 1, currentIndex + 1));
  };

  return (
    <div className="w-full bg-slate-900 text-white px-4 py-3.5 z-30 shadow-xl flex flex-col gap-3 select-none">
      {/* Top Row: Hour Stepper, Number Input, Timestamp Dropdown & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Timestamp Readout & Dropdown Picker */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-400 flex items-center justify-center font-bold shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Selected Atmospheric Time
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-black text-white font-mono">
                {currentStep.formattedTime}
              </span>
              <select
                value={currentIndex}
                onChange={(e) => onSelectIndex(Number(e.target.value))}
                className="bg-slate-800 text-sky-300 font-mono text-xs font-bold px-2.5 py-1 rounded-xl border border-slate-700 cursor-pointer outline-none hover:bg-slate-750 transition-colors"
              >
                {steps.map((step, idx) => (
                  <option key={idx} value={idx}>
                    {step.formattedTime} {step.isForecast ? '(Forecast)' : '(Observed)'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Center: Hour Number Input & Stepper Buttons (-1h / +1h) */}
        <div className="flex items-center space-x-2 bg-slate-800 p-1.5 rounded-2xl border border-slate-700 shadow-inner">
          <button
            onClick={handlePrevHour}
            disabled={currentIndex === 0}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 disabled:opacity-30 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer"
            title="Step Back 1 Hour"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>- 1 Hour</span>
          </button>

          {/* Direct Hour Number Input */}
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-950 rounded-xl text-xs font-mono text-white font-black border border-slate-800">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Hour</span>
            <input
              type="number"
              min={0}
              max={steps.length - 1}
              value={currentIndex}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 0 && val < steps.length) {
                  onSelectIndex(val);
                }
              }}
              className="w-10 bg-slate-900 border border-slate-700 rounded text-sky-400 text-center font-bold text-xs outline-none focus:ring-1 focus:ring-sky-500"
            />
            <span className="text-slate-500">/ {steps.length - 1}</span>
          </div>

          <button
            onClick={handleNextHour}
            disabled={currentIndex === steps.length - 1}
            className="flex items-center space-x-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-400 disabled:opacity-30 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-xs"
            title="Step Forward 1 Hour"
          >
            <span>+ 1 Hour</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Quick 72-Hour Horizon Presets */}
        <div className="flex items-center space-x-1.5 text-xs overflow-x-auto py-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Quick Horizon:
          </span>
          <button
            onClick={() => onSelectIndex(0)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentIndex === 0
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            NOW (T+0)
          </button>
          <button
            onClick={() => onSelectIndex(6)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentIndex === 6
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            +6h
          </button>
          <button
            onClick={() => onSelectIndex(12)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentIndex === 12
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            +12h
          </button>
          <button
            onClick={() => onSelectIndex(24)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentIndex === 24
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            +24h
          </button>
          <button
            onClick={() => onSelectIndex(48)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentIndex === 48
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            +48h
          </button>
          <button
            onClick={() => onSelectIndex(72)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentIndex === 72
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            +72h
          </button>
        </div>
      </div>

      {/* Bottom Row: Live Telemetry Chips */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-2.5">
        <TelemetryChips
          telemetry={currentStep.telemetry}
          formattedTime={currentStep.formattedTime}
        />

        <div className="text-[11px] text-slate-400 hidden xl:block font-mono">
          Coupled Weather–Chemistry 72h Prototype Forecast
        </div>
      </div>
    </div>
  );
};
