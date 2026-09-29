import React from 'react';
import {
  ShieldAlert,
  FileDown,
  Mail,
  CheckCircle2,
  Layers,
  Info,
  AlertTriangle,
  Building2,
  Users,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import type { PolicyAdvisory, RegionConfig, NodeData } from '../../types/atmosense';

interface PolicyTabProps {
  advisory: PolicyAdvisory;
  region: RegionConfig;
  nodes?: NodeData[];
  onOpenReportModal: () => void;
}

export const PolicyTab: React.FC<PolicyTabProps> = ({
  advisory,
  region,
  onOpenReportModal
}) => {
  const handleEmailShare = () => {
    alert(`Environmental Decision Support Briefing for ${region.name} dispatched to authority contacts.`);
  };

  const risk = advisory.forecastRisk || {
    title: 'HIGH POLLUTION ACCUMULATION RISK',
    risk_level: 'High',
    window: '02:00 AM – 08:00 AM',
    primary_drivers: [
      'Low Planetary Boundary Layer Height (PBLH < 200m)',
      'Weak northwesterly winds (< 1.8 m/s)',
      'Strong nocturnal atmospheric inversion layer',
      'Regional trans-boundary pollution transport'
    ]
  };

  const impact = advisory.expectedImpact || {
    pm25_trend: 'Increasing (Peak forecast ~465 µg/m³)',
    dispersion: 'Poor / Severely Restricted',
    inversion: 'Strong Nocturnal Lid Collapse',
    regional_transport: 'Northwest → Delhi-NCR Corridor'
  };

  const considerations = advisory.recommendedConsiderations || {
    authorities: [
      'Consider enhanced spatial monitoring in affected eastern & border zones.',
      'Review applicable traffic entry & dust-suppression control measures.',
      'Monitor regional fire activity and incoming trans-boundary air masses.',
      'Deploy localized anti-smog water misters along high-density transit corridors.'
    ],
    public: [
      'Avoid prolonged outdoor strenuous physical exposure during early morning peak hours (02:00 AM – 08:00 AM).',
      'Follow official public health guidelines and environmental advisories.',
      'Use N95 masks or indoor air filtration where feasible during stagnant inversion periods.'
    ]
  };

  const basisList = advisory.basisOfAssessment || [
    'Coupled Weather–Chemistry Numerical Model Output',
    'CAAQMS Ground Station Real-Time Observations',
    'Atmospheric Diagnostics (1/PBLH Inversion & Vector Fields)',
    'Regional Satellite Thermal Anomaly / Fire Observations',
    'Short-Term Pollution Trend Forecast Engine'
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300 font-sans">
      {/* Top Banner: AI Environmental Decision Support Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-6 shadow-md border border-slate-700 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  AI Environmental Decision Support
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Ref: ATM-ADVISORY-2026/089
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight mt-1">
                {risk.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onOpenReportModal}
              className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl shadow-sm transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Export Decision Brief</span>
            </button>

            <button
              onClick={handleEmailShare}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-2xl border border-slate-700 transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Share Briefing</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-700/60 pt-3">
          This decision-support module provides diagnostic forecasts and non-coercive response considerations to assist environmental authorities and the public. Official policy activations remain under sole governing authority.
        </p>
      </div>

      {/* Grid Row 1: FORECAST RISK & EXPECTED IMPACT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* FORECAST RISK (7 cols) */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                1. Forecast Risk Window
              </h3>
            </div>
            <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
              Window: {risk.window}
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Drivers</span>
            <div className="grid grid-cols-1 gap-2">
              {risk.primary_drivers.map((driver, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>{driver}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* EXPECTED IMPACT (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              2. Expected Impact
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 font-mono">
              <span className="text-[10px] font-bold text-rose-700 uppercase block font-sans">PM₂.₅ Trend</span>
              <span className="text-xs font-black text-rose-950 mt-1 block">{impact.pm25_trend}</span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 font-mono">
              <span className="text-[10px] font-bold text-amber-700 uppercase block font-sans">Dispersion</span>
              <span className="text-xs font-black text-amber-950 mt-1 block">{impact.dispersion}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 font-mono">
              <span className="text-[10px] font-bold text-slate-500 uppercase block font-sans">Inversion Severity</span>
              <span className="text-xs font-black text-slate-900 mt-1 block">{impact.inversion}</span>
            </div>

            <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 font-mono">
              <span className="text-[10px] font-bold text-sky-700 uppercase block font-sans">Regional Transport</span>
              <span className="text-xs font-black text-sky-950 mt-1 block">{impact.regional_transport}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: AI-GENERATED DIAGNOSTIC EXPLANATION */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-sky-600" />
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            3. AI Diagnostic Explanation & Scientific Interpretation
          </h3>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <p className="text-xs text-slate-700 leading-relaxed font-sans italic">
            “{advisory.aiExplanation || 'The predicted pollution increase is associated with reduced boundary-layer height and weak northwesterly winds, which limit pollutant dispersion. Regional transport may further contribute to pollutant accumulation.'}”
          </p>
          <div className="text-[10px] text-slate-400 flex items-center space-x-1 pt-1 border-t border-slate-200">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Note: Scientific interpretation generated by atmospheric model diagnostics. Numerical predictions carry intrinsic meteorological uncertainty.</span>
          </div>
        </div>
      </div>

      {/* Section 4: RECOMMENDED CONSIDERATIONS (For Authorities vs For Public) */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-extrabold text-slate-900">
            4. Recommended Considerations & Response Options
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* For Authorities */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950">
              <Building2 className="w-5 h-5 text-sky-600 shrink-0" />
              <span className="text-xs font-black uppercase tracking-wider">Recommended Considerations for Authorities</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-700">
              {considerations.authorities.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className="text-sky-600 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* For Public */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
              <Users className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-xs font-black uppercase tracking-wider">Recommended Considerations for Public</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-700">
              {considerations.public.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Section 5: BASIS OF ASSESSMENT / EVIDENCE SECTION */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            5. Basis of Assessment & Evidence Provenance
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-semibold">
          {basisList.map((item, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
