import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ChevronUp,
  ChevronDown,
  Building2,
  Truck,
  Factory,
  FileDown,
  AlertOctagon,
  MapPin
} from 'lucide-react';
import type { PolicyAdvisory, PolicyDirective } from '../../types/atmosense';

interface PolicyAdvisoryDrawerProps {
  advisory: PolicyAdvisory;
  isOpen: boolean;
  onToggle: () => void;
  onOpenReportModal: () => void;
}

export const PolicyAdvisoryDrawer: React.FC<PolicyAdvisoryDrawerProps> = ({
  advisory,
  isOpen,
  onToggle,
  onOpenReportModal
}) => {
  const recommendedStage =
    advisory.recommended_stage ||
    (advisory.forecastRisk?.risk_level === 'Severe'
      ? 'GRAP STAGE IV'
      : advisory.forecastRisk?.risk_level === 'High'
      ? 'GRAP STAGE III'
      : 'GRAP STAGE II');

  const advisoryText =
    advisory.advisory_text ||
    advisory.aiExplanation ||
    'Diagnostic atmospheric models indicate heightened pollution accumulation risk. Boundary-layer depth collapse restricts vertical dispersion.';

  const defaultDirectives: PolicyDirective[] = [
    {
      id: 'dir-transport',
      category: 'transportation',
      categoryTitle: 'Traffic & Transportation Directives',
      title: 'Heavy Commercial Entry & Traffic Directives',
      description:
        advisory.recommendedConsiderations?.authorities?.[0] ||
        'Enforce GRAP Stage IV emergency traffic entry restrictions for heavy commercial vehicles across major toll points.',
      targetedZones: ['Alipur Grid', 'Sonipat Entry Corridor', 'GT Road Border']
    },
    {
      id: 'dir-industrial',
      category: 'industrial',
      categoryTitle: 'Industrial & Construction Controls',
      title: 'Construction & Demolition Halt',
      description:
        advisory.recommendedConsiderations?.authorities?.[1] ||
        'Mandate temporary halt on non-essential construction and demolition activities in high-density corridors.',
      targetedZones: ['Bawana Industrial', 'Noida Sector 62', 'Anand Vihar']
    },
    {
      id: 'dir-civic',
      category: 'civic',
      categoryTitle: 'Civic Protection & Public Health',
      title: 'High-Capacity Misters & Health Protection',
      description:
        advisory.recommendedConsiderations?.authorities?.[2] ||
        advisory.recommendedConsiderations?.public?.[0] ||
        'Deploy high-capacity anti-smog water misters along high-density transit corridors and issue public protection guidance.',
      targetedZones: ['Anand Vihar CAAQMS', 'Punjabi Bagh', 'RK Puram']
    }
  ];

  const directives: PolicyDirective[] =
    advisory.directives && advisory.directives.length > 0
      ? advisory.directives
      : defaultDirectives;

  return (
    <div className="relative w-full z-30 select-none shadow-2xl">
      {/* Drawer Toggle Header Strip */}
      <div
        onClick={onToggle}
        className="bg-slate-900 text-white px-6 py-2.5 shadow-2xl flex items-center justify-between cursor-pointer border-t border-slate-700 hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/40 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              AI Policy Advisory Engine (LangChain RAG)
            </span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-500 text-white">
              {recommendedStage}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-semibold text-slate-300">
          <span className="hidden md:inline">
            Click to {isOpen ? 'Collapse Advisory Drawer' : 'Expand Categorized Directives'}
          </span>
          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expandable Framer Motion Body Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl overflow-hidden max-h-[70vh] overflow-y-auto"
          >
            <div className="p-6 max-w-7xl mx-auto space-y-6">
              {/* Header Banner & Download Button */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-slate-50 border border-rose-200/80">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <AlertOctagon className="w-5 h-5 text-rose-600" />
                    <h2 className="text-base font-extrabold text-slate-900">
                      Recommended Action: {recommendedStage} Protocol Trigger
                    </h2>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed max-w-4xl font-sans">
                    {advisoryText}
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={onOpenReportModal}
                    className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <FileDown className="w-4 h-4 text-sky-400" />
                    <span>Download Official Policy PDF</span>
                  </button>
                </div>
              </div>

              {/* Categorized Directives Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {directives.map((dir: PolicyDirective) => {
                  let icon = <Building2 className="w-5 h-5 text-sky-600" />;
                  let bgHeader = 'bg-sky-50 border-sky-200/80 text-sky-950';

                  if (dir.category === 'transportation') {
                    icon = <Truck className="w-5 h-5 text-amber-600" />;
                    bgHeader = 'bg-amber-50 border-amber-200/80 text-amber-950';
                  } else if (dir.category === 'industrial') {
                    icon = <Factory className="w-5 h-5 text-rose-600" />;
                    bgHeader = 'bg-rose-50 border-rose-200/80 text-rose-950';
                  }

                  return (
                    <div
                      key={dir.id}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                    >
                      <div className="p-4 space-y-3">
                        {/* Category Label */}
                        <div className={`flex items-center space-x-2 p-2 rounded-xl border ${bgHeader}`}>
                          {icon}
                          <span className="text-xs font-extrabold">{dir.categoryTitle}</span>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {dir.title}
                        </h4>

                        {/* Description */}
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">
                          {dir.description}
                        </p>
                      </div>

                      {/* Targeted Zones Footer */}
                      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>Target Hotspots:</span>
                        </span>
                        {dir.targetedZones.map((zone: string, zIdx: number) => (
                          <span
                            key={zIdx}
                            className="text-[10px] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700"
                          >
                            {zone}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
