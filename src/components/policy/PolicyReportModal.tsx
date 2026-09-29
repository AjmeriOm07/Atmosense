import React from 'react';
import {
  X,
  Printer,
  Download,
  FileCheck,
  CheckCircle,
  AlertTriangle,
  Layers,
  Sparkles
} from 'lucide-react';
import type { PolicyAdvisory, RegionConfig, NodeData } from '../../types/atmosense';

interface PolicyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  advisory: PolicyAdvisory;
  region: RegionConfig;
  nodes?: NodeData[];
}

export const PolicyReportModal: React.FC<PolicyReportModalProps> = ({
  isOpen,
  onClose,
  advisory,
  region
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const risk = advisory.forecastRisk || {
    title: 'HIGH POLLUTION ACCUMULATION RISK',
    risk_level: 'High',
    window: '02:00 AM – 08:00 AM',
    primary_drivers: [
      'Low Planetary Boundary Layer Height (PBLH < 200m)',
      'Weak northwesterly winds (< 1.8 m/s)',
      'Strong atmospheric inversion layer',
      'Regional trans-boundary pollution transport'
    ]
  };

  const considerations = advisory.recommendedConsiderations || {
    authorities: [
      'Consider enhanced spatial monitoring in affected eastern & border zones.',
      'Review applicable traffic entry & dust-suppression control measures.',
      'Monitor regional fire activity and incoming trans-boundary air masses.'
    ],
    public: [
      'Avoid prolonged outdoor strenuous physical exposure during early morning peak hours (02:00 AM – 08:00 AM).',
      'Follow official public health guidelines and environmental advisories.'
    ]
  };

  const basisList = advisory.basisOfAssessment || [
    'Coupled Weather–Chemistry Numerical Model Output',
    'CAAQMS Ground Station Real-Time Observations',
    'Atmospheric Diagnostics (1/PBLH Inversion & Vector Fields)',
    'Regional Satellite Thermal Anomaly / Fire Observations'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm font-extrabold text-slate-900 font-sans">
              Environmental Decision Support Briefing Preview
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Brief Document Body */}
        <div className="p-8 space-y-6 overflow-y-auto bg-white font-sans text-slate-900 printable-area">
          {/* Official Letterhead Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg tracking-widest shadow-md">
                ATM
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 font-sans">
                  ATMOSENSE ENVIRONMENTAL INTELLIGENCE
                </h1>
                <p className="text-xs font-semibold text-slate-600">
                  Air Pollution–Weather Coupled Forecasting & Environmental Decision Support
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-500 font-mono">
              <div>Ref: ATM-ADVISORY-2026/089</div>
              <div>Issued: Nov 16, 2026 - 04:00 AM</div>
              <div className="font-bold text-sky-700">DECISION SUPPORT BRIEFING</div>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">Target Region</span>
              <span className="text-xs font-bold text-slate-900">{region.name} ({region.subTitle})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">Assessment Status</span>
              <span className="text-sm font-black text-rose-600 uppercase">
                {risk.title} ({risk.window})
              </span>
            </div>
          </div>

          {/* Forecast Risk & Primary Drivers Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-1">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>1. Forecast Risk & Primary Atmospheric Drivers</span>
            </h4>
            <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 text-xs text-slate-800 space-y-2">
              <p>
                <strong>Boundary Layer Dynamics:</strong> Planetary Boundary Layer Height (PBLH) is forecast to collapse to <strong>180m</strong> between {risk.window}.
              </p>
              <p>
                <strong>Primary Drivers:</strong> {risk.primary_drivers.join(' • ')}
              </p>
            </div>
          </div>

          {/* AI Explanation & Expected Impact Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-1">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>2. Diagnostic Narrative & Expected Impact</span>
            </h4>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans">
              <p className="italic">
                “{advisory.aiExplanation}”
              </p>
            </div>
          </div>

          {/* Recommended Considerations */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>3. Recommended Response Considerations</span>
            </h4>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-sky-50/50 border border-sky-200 space-y-1">
                <span className="font-extrabold text-sky-950 block">For Authorities</span>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {considerations.authorities.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-1">
                <span className="font-extrabold text-emerald-950 block">For Public</span>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {considerations.public.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Basis of Assessment Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-1">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>4. Basis of Assessment & Evidence Checklist</span>
            </h4>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              {basisList.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-slate-800 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signature Block */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-800">Generated by Atmosense Decision Support Platform</p>
              <p>Coupled Weather–Chemistry Model Architecture</p>
            </div>
            <div className="text-right">
              <div className="w-32 h-8 border-b border-slate-400 font-serif italic text-slate-700 flex items-end justify-center">
                Atmosense Forecast Engine
              </div>
              <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Environmental Intelligence Brief</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Ready for Executive & Stakeholder Review
          </span>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Brief PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
