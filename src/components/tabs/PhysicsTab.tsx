import React from 'react';
import {
  Thermometer,
  Wind,
  Flame,
  Activity,
  AlertOctagon,
  ArrowUpRight,
  TrendingUp,
  BarChart2,
  Compass,
  ShieldAlert,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import type { HourlyTimelineStep, RegionConfig, NodeData } from '../../types/atmosense';
import { InfoTooltip } from '../common/InfoTooltip';

interface PhysicsTabProps {
  region: RegionConfig;
  currentStep: HourlyTimelineStep;
  timelineSteps: HourlyTimelineStep[];
  nodes: NodeData[];
}

export const PhysicsTab: React.FC<PhysicsTabProps> = ({
  region,
  currentStep,
  timelineSteps,
  nodes
}) => {
  // Average PM2.5 calculation across all region nodes
  const allPm25 = nodes.map((n) => currentStep.nodeValues[nodeId(n)]?.pm25 ?? n.current_pm25);
  function nodeId(n: NodeData) { return n.id; }
  const avgPm25 = Math.round(allPm25.reduce((a, b) => a + b, 0) / (allPm25.length || 1));

  // Hourly timeline dataset for Recharts
  const physicsChartData = timelineSteps.map((step) => {
    const stepVals = Object.values(step.nodeValues).map((v) => v.pm25);
    const stepAvg = Math.round(stepVals.reduce((a, b) => a + b, 0) / (stepVals.length || 1));

    return {
      time: step.formattedTime.replace('Nov 16, ', ''),
      pm25: stepAvg,
      pblh: step.telemetry.pblh_meters,
      inversePblh: Number((step.telemetry.inverse_pblh * 100000).toFixed(1))
    };
  });

  const isSeverePblh = currentStep.telemetry.pblh_meters < 220;
  const isStagnantWind = currentStep.telemetry.wind_speed_ms < 2.0;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
            <h2 className="text-xl font-black text-slate-900 font-sans tracking-tight">
              Atmospheric Physics & Diagnostic Telemetry ({region.name})
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
            <span>Atmospheric Diagnostics: Inverse Boundary Layer Height (1/PBLH) & Wind Vectors (U, V)</span>
            <InfoTooltip termKey="inverse_pblh" />
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-sky-50 border border-sky-200 px-4 py-2 rounded-2xl text-right">
            <span className="text-[10px] font-bold text-sky-700 uppercase block">Selected Timestamp</span>
            <span className="text-sm font-black text-slate-900 font-mono">{currentStep.formattedTime}</span>
          </div>
        </div>
      </div>

      {/* Existing Atmospheric Diagnostic Causal Chain Flow Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-5 border border-slate-700 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-sky-400 flex items-center space-x-1.5">
            <Activity className="w-4 h-4 text-sky-400" />
            <span>Atmospheric Diagnostic Interpretation Sequence (One-Way Physical Drivers)</span>
          </span>
          <span className="text-[10px] text-slate-400 italic">
            * Diagnostic relationship model (Not direct physical observation)
          </span>
        </div>

        {/* Diagnostic Causal Chain Flow */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-xs font-bold">
          <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10 flex flex-col items-center justify-center">
            <span className="text-[10px] text-rose-300 font-mono uppercase">Step 1</span>
            <span className="text-white mt-0.5 flex items-center">
              LOW PBLH <InfoTooltip termKey="pblh" />
            </span>
            <span className="text-[9px] text-slate-400 mt-0.5 font-normal">&lt; 200m Lid Height</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10 flex flex-col items-center justify-center">
            <span className="text-[10px] text-amber-300 font-mono uppercase">Step 2</span>
            <span className="text-white mt-0.5 flex items-center">
              WEAK WINDS <InfoTooltip termKey="wind_vectors" />
            </span>
            <span className="text-[9px] text-slate-400 mt-0.5 font-normal">&lt; 1.8 m/s Calms</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10 flex flex-col items-center justify-center">
            <span className="text-[10px] text-amber-300 font-mono uppercase">Step 3</span>
            <span className="text-white mt-0.5 flex items-center">
              INVERSION <InfoTooltip termKey="inversion" />
            </span>
            <span className="text-[9px] text-slate-400 mt-0.5 font-normal">Thermal Trapping</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10 flex flex-col items-center justify-center">
            <span className="text-[10px] text-sky-300 font-mono uppercase">Step 4</span>
            <span className="text-white mt-0.5 flex items-center">
              POOR DISPERSION <InfoTooltip termKey="dispersion" />
            </span>
            <span className="text-[9px] text-slate-400 mt-0.5 font-normal">Restricted Mixing</span>
          </div>

          <div className="col-span-2 md:col-span-1 p-2.5 rounded-2xl bg-rose-600/90 text-white border border-rose-400 flex flex-col items-center justify-center shadow-md">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-100">Outcome Risk</span>
            <span className="text-sm font-black mt-0.5 flex items-center">
              PM₂.₅ SPIKE RISK <InfoTooltip termKey="pm25" />
            </span>
          </div>
        </div>
      </div>

      {/* ENHANCEMENT 2: Explicit Weather ↔ Chemistry Feedback Visualization Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Weather ↔ Chemistry Two-Way Feedback Coupling Architecture
                </h3>
                <InfoTooltip termKey="two_way_feedback" />
              </div>
              <p className="text-xs text-slate-500">
                Closed-loop interaction model: Weather drives pollutant dispersion, while accumulated aerosol feedback alters local weather profiles.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 shrink-0 self-start sm:self-auto">
            Planned WRF-Chem Integration Architecture
          </span>
        </div>

        {/* 5-Stage Closed Feedback Cycle Visual */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
          {/* Stage 1: Meteorology */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 relative group hover:border-sky-400 border border-transparent transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-sky-400 uppercase">Stage 1</span>
              <Thermometer className="w-4 h-4 text-sky-400" />
            </div>
            <div className="font-extrabold text-sm flex items-center">
              <span>METEOROLOGY</span>
            </div>
            <div className="text-[11px] text-slate-300 space-y-0.5 font-mono">
              <p className="flex items-center">Temperature <InfoTooltip termKey="inversion" /></p>
              <p className="flex items-center">Wind (U, V) <InfoTooltip termKey="wind_vectors" /></p>
              <p className="flex items-center">PBLH <InfoTooltip termKey="pblh" /></p>
              <p className="flex items-center">Inversion <InfoTooltip termKey="inversion" /></p>
            </div>
          </div>

          {/* Stage 2: Pollutant Dispersion */}
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 space-y-2 hover:border-sky-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-sky-700 uppercase">Stage 2</span>
              <Wind className="w-4 h-4 text-sky-600" />
            </div>
            <div className="font-extrabold text-sm flex items-center">
              <span>DISPERSION</span>
              <InfoTooltip termKey="dispersion" />
            </div>
            <p className="text-[11px] text-sky-800 leading-tight">
              Atmospheric mixing depth & regional wind vectors govern physical pollutant transport capacity.
            </p>
          </div>

          {/* Stage 3: Pollutants */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2 hover:border-amber-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-amber-700 uppercase">Stage 3</span>
              <Flame className="w-4 h-4 text-amber-600" />
            </div>
            <div className="font-extrabold text-sm flex items-center">
              <span>POLLUTANTS</span>
            </div>
            <div className="text-[11px] text-amber-900 font-mono space-y-0.5">
              <p className="flex items-center">PM₂.₅ <InfoTooltip termKey="pm25" /></p>
              <p className="flex items-center">PM₁₀ <InfoTooltip termKey="pm10" /></p>
              <p className="flex items-center">O₃ <InfoTooltip termKey="o3" /></p>
              <p className="flex items-center">NOₓ <InfoTooltip termKey="nox" /></p>
            </div>
          </div>

          {/* Stage 4: Atmospheric / Aerosol Effects */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2 hover:border-rose-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-rose-700 uppercase">Stage 4</span>
              <Activity className="w-4 h-4 text-rose-600" />
            </div>
            <div className="font-extrabold text-sm flex items-center">
              <span>AEROSOL EFFECTS</span>
              <InfoTooltip termKey="aerosol_effects" />
            </div>
            <p className="text-[11px] text-rose-900 leading-tight">
              Dense aerosols scatter & absorb incoming solar radiation (Solar Dimming & Radiative Forcing).
            </p>
          </div>

          {/* Stage 5: Local Weather Response -> Feedback Loop */}
          <div className="p-4 rounded-2xl bg-purple-900 text-white space-y-2 relative border border-purple-700 hover:border-purple-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-purple-300 uppercase">Stage 5</span>
              <span className="text-purple-300 font-black text-sm">↺ Feedback</span>
            </div>
            <div className="font-extrabold text-sm">
              <span>WEATHER RESPONSE</span>
            </div>
            <p className="text-[11px] text-purple-200 leading-tight">
              Surface cooling dampens convection, suppressing PBLH recovery & stabilizing inversion lid.
            </p>
            <div className="pt-1 flex items-center justify-end text-[10px] text-purple-300 font-mono font-bold">
              <span>↺ Loop to Stage 1</span>
            </div>
          </div>
        </div>

        {/* Scientific Disclaimer Note */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              <strong>Scientific Note:</strong> This visualization illustrates the 2-way weather-chemistry feedback architecture specified in the SIH problem statement. Prototype state — full online WRF-Chem dynamic coupling is planned for future backend deployment.
            </span>
          </div>
        </div>
      </div>

      {/* 2x2 Grid of Physics Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: Planetary Boundary Layer Height (PBLH) Collapse Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Planetary Boundary Layer Height (PBLH)
                  </h3>
                  <InfoTooltip termKey="pblh" />
                </div>
                <span className="text-[11px] text-slate-500">
                  Thermal Boundary Layer Depth
                </span>
              </div>
            </div>

            <span
              className={`text-xs font-black px-3 py-1 rounded-full border ${
                isSeverePblh
                  ? 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse'
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}
            >
              {isSeverePblh ? 'Severe Inversion Lid' : 'Moderate Inversion'}
            </span>
          </div>

          {/* Current PBLH Display */}
          <div className="flex items-baseline space-x-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-mono">
            <span className="text-3xl font-black text-slate-900">
              {currentStep.telemetry.pblh_meters} m
            </span>
            <span className="text-xs font-semibold text-slate-500 flex items-center">
              <span>(Scaled 1/PBLH: {currentStep.telemetry.inverse_pblh} m⁻¹)</span>
              <InfoTooltip termKey="inverse_pblh" />
            </span>
          </div>

          {/* PBLH Trend Chart Header Legend */}
          <div className="flex items-center justify-between text-[11px] font-bold">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-xs bg-red-500 inline-block" />
              <span className="text-slate-700">PBLH Depth (Unit: Meters / m)</span>
            </div>
            <span className="text-slate-400 font-mono text-[10px]">Lower = Worse Dispersion</span>
          </div>

          {/* PBLH Trend Chart */}
          <div className="h-44 w-full bg-slate-50/60 rounded-2xl p-2 border border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={physicsChartData}>
                <defs>
                  <linearGradient id="pblhGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={['auto', 'auto']} unit="m" />
                <Tooltip
                  formatter={(value: any) => [`${value} meters (m)`, 'Boundary Layer Height (PBLH)']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pblh"
                  stroke="#DC2626"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#pblhGrad)"
                  name="PBLH Depth (m)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CARD 2: Wind Vectors & Dynamics Directional Compass */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Wind Vectors & Advection Fields (U, V)
                  </h3>
                  <InfoTooltip termKey="wind_vectors" />
                </div>
                <span className="text-[11px] text-slate-500">
                  Directional Vector Compass & Stagnation Index
                </span>
              </div>
            </div>

            <span
              className={`text-xs font-black px-3 py-1 rounded-full border ${
                isStagnantWind
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              {currentStep.telemetry.stagnation_index}
            </span>
          </div>

          {/* Compass Graphic & Metrics */}
          <div className="flex items-center space-x-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="relative w-20 h-20 bg-white rounded-full border-2 border-slate-200 flex items-center justify-center shadow-xs shrink-0">
              <span className="absolute top-1 text-[9px] font-bold text-slate-400">N</span>
              <span className="absolute bottom-1 text-[9px] font-bold text-slate-400">S</span>
              <span className="absolute left-1 text-[9px] font-bold text-slate-400">W</span>
              <span className="absolute right-1 text-[9px] font-bold text-slate-400">E</span>
              <Compass
                className="w-10 h-10 text-cyan-600 transition-transform duration-500"
                style={{ transform: `rotate(${currentStep.telemetry.wind_direction_deg}deg)` }}
              />
            </div>

            <div className="space-y-1 font-mono">
              <div className="text-2xl font-black text-slate-900">
                {currentStep.telemetry.wind_direction_cardinal} @ {currentStep.telemetry.wind_speed_ms} m/s
              </div>
              <div className="text-xs text-slate-500 font-sans flex items-center space-x-1">
                <span>Vector Angle: {currentStep.telemetry.wind_direction_deg}° NW Advection</span>
                <InfoTooltip termKey="advection" />
              </div>
              <p className="text-[11px] text-slate-600 font-sans pt-1">
                {isStagnantWind
                  ? 'Calm winds restricting lateral dispersion across rural border entries.'
                  : 'Moderate dispersion ventilation.'}
              </p>
            </div>
          </div>

          {/* Wind dynamics bullet summary */}
          <div className="p-3 rounded-2xl bg-cyan-50/60 border border-cyan-200/80 text-xs text-cyan-950 flex items-center space-x-2">
            <Info className="w-4 h-4 text-cyan-600 shrink-0" />
            <span className="flex items-center space-x-1">
              <span>Advection fields (U, V) transport regional emissions across spatial grid boundaries (Unit: m/s).</span>
              <InfoTooltip termKey="advection" />
            </span>
          </div>
        </div>

        {/* CARD 3: Peak Pollution Spike Predictor */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Pollution Accumulation Window
                  </h3>
                  <InfoTooltip termKey="inversion" />
                </div>
                <span className="text-[11px] text-slate-500">
                  Nocturnal Boundary Layer Trapping Horizon
                </span>
              </div>
            </div>

            <span className="text-xs font-black px-3 py-1 rounded-full bg-rose-600 text-white shadow-xs">
              02:00 AM - 08:00 AM Window
            </span>
          </div>

          {/* Peak Spike Window Description */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
            <div className="text-xs font-black text-rose-950 uppercase flex items-center space-x-1">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <span>Reduced Dispersion Diagnostic</span>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed font-sans">
              Planetary boundary-layer height reduced to <strong>180m</strong> with stagnant winds (&lt; 1.8 m/s) restricts atmospheric dispersion, elevating near-surface accumulation risk.
            </p>
          </div>

          {/* 1/PBLH Correlation Curve Legend Key */}
          <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-[11px] font-bold gap-2">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-400 border border-amber-500 inline-block" />
              <span className="text-amber-900 font-extrabold">Yellow Area: Regional PM₂.₅ (µg/m³)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-1 rounded-full bg-rose-600 inline-block" />
              <span className="text-rose-800 font-extrabold">Red Line: Scaled 1/PBLH Ratio (×10⁵ m⁻¹)</span>
            </div>
          </div>

          {/* 1/PBLH Correlation Curve */}
          <div className="h-44 w-full bg-slate-50/60 rounded-2xl p-2 border border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={physicsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={['auto', 'auto']} />
                <Tooltip
                  formatter={(value: any, name: any) => {
                    if (name.includes('PM₂.₅') || name.includes('Spike')) {
                      return [`${value} µg/m³`, 'Yellow Area: PM₂.₅ Concentration'];
                    }
                    return [`${value} ×10⁻⁵ m⁻¹`, 'Red Line: Scaled Inversion Ratio (1/PBLH)'];
                  }}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pm25"
                  fill="#FEF3C7"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  name="Yellow Area: Regional PM₂.₅ Spike (µg/m³)"
                />
                <Line
                  type="monotone"
                  dataKey="inversePblh"
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  dot={false}
                  name="Red Line: Scaled 1/PBLH Ratio (×10⁵ m⁻¹)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CARD 4: Regional Summary Gauge */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
                <Activity className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <div className="flex items-center">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Regional Environmental Diagnostic Mean
                  </h3>
                  <InfoTooltip termKey="pm25" />
                </div>
                <span className="text-[11px] text-slate-500">
                  Integrated Spatial Grid Summary
                </span>
              </div>
            </div>

            <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-900 text-white">
              {nodes.length} Spatial Points
            </span>
          </div>

          {/* Big Numeric Gauge Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-500 to-red-700 text-white space-y-2 shadow-md">
            <span className="text-xs font-extrabold text-rose-100 uppercase tracking-wider block">
              Regional Mean PM₂.₅ Concentration
            </span>
            <div className="flex items-baseline space-x-2 font-mono">
              <span className="text-4xl font-black">{avgPm25}</span>
              <span className="text-sm font-bold text-rose-200">µg/m³</span>
            </div>
            <span className="inline-block text-xs font-extrabold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-xs">
              Reduced Dispersion Window Active
            </span>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">CAAQMS Ground Stations</span>
              <span className="text-base font-extrabold text-slate-900">
                {nodes.filter((n) => n.type === 'physical').length} Stations
              </span>
            </div>
            <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100">
              <div className="flex items-center">
                <span className="text-[10px] font-bold text-teal-700 uppercase block">Model-Estimated Grids</span>
                <InfoTooltip termKey="model_grid" />
              </div>
              <span className="text-base font-extrabold text-teal-950">
                {nodes.filter((n) => n.type === 'model_estimated' || (n.type as string) === 'virtual').length} Grid Points
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
