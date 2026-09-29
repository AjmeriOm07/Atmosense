import React from 'react';
import { MapWorkspace } from '../map/MapWorkspace';
import { TimeScrubberBar } from '../telemetry/TimeScrubberBar';
import { MapPin } from 'lucide-react';
import type {
  RegionConfig,
  NodeData,
  HourlyTimelineStep,
  MapLayerConfig
} from '../../types/atmosense';

interface MapTabProps {
  region: RegionConfig;
  nodes: NodeData[];
  currentStep: HourlyTimelineStep;
  timelineSteps: HourlyTimelineStep[];
  currentStepIndex: number;
  onSelectStepIndex: (idx: number) => void;
  layerConfig: MapLayerConfig;
  onUpdateLayerConfig: (updated: Partial<MapLayerConfig>) => void;
  onSelectNode: (node: NodeData) => void;
}

export const MapTab: React.FC<MapTabProps> = ({
  region,
  nodes,
  currentStep,
  timelineSteps,
  currentStepIndex,
  onSelectStepIndex,
  layerConfig,
  onUpdateLayerConfig,
  onSelectNode
}) => {
  return (
    <div className="w-full h-full flex flex-col space-y-4 animate-in fade-in duration-300">
      {/* Top Map Context Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-extrabold text-slate-900 font-sans">
                {region.name} Spatial Observation & Forecast Grid
              </h2>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                Coupled Weather–Chemistry Forecast
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              {region.subTitle} • CAAQMS Stations & Model-Estimated Grids
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              <span>CAAQMS Ground Station</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" />
              <span>Model-Estimated Grid</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Map Box Widget (Occupies 85% of Viewport Height) */}
      <div className="flex-1 min-h-[540px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
        {/* Map Workspace */}
        <div className="flex-1 relative overflow-hidden">
          <MapWorkspace
            region={region}
            nodes={nodes}
            currentStep={currentStep}
            layerConfig={layerConfig}
            onUpdateLayerConfig={onUpdateLayerConfig}
            onSelectNode={onSelectNode}
          />
        </div>

        {/* Executive Time Controller Strip */}
        <div className="shrink-0 bg-slate-900 border-t border-slate-800">
          <TimeScrubberBar
            steps={timelineSteps}
            currentIndex={currentStepIndex}
            onSelectIndex={onSelectStepIndex}
          />
        </div>
      </div>
    </div>
  );
};
