import { useState } from 'react';
import { Header } from './components/layout/Header';
import { MapTab } from './components/tabs/MapTab';
import { PhysicsTab } from './components/tabs/PhysicsTab';
import { GridNodesTab } from './components/tabs/GridNodesTab';
import { PolicyTab } from './components/tabs/PolicyTab';

import { NodeInspectorModal } from './components/map/NodeInspectorModal';
import { PolicyReportModal } from './components/policy/PolicyReportModal';
import { AtmosphericPhysicsModal } from './components/analytics/AtmosphericPhysicsModal';
import { RagChatbotWidget } from './components/chatbot/RagChatbotWidget';

import {
  REGIONS,
  INITIAL_NODES,
  TIMELINE_STEPS,
  getPolicyAdvisoryForStep
} from './data/mockAtmosenseState';
import type {
  RegionId,
  HorizonMode,
  NodeData,
  MapLayerConfig,
  TabId
} from './types/atmosense';

export function App() {
  // Global App State
  const [activeTab, setActiveTab] = useState<TabId>('map');
  const [selectedRegionId, setSelectedRegionId] = useState<RegionId>('delhi-ncr');
  const [horizonMode, setHorizonMode] = useState<HorizonMode>('72h_short_term');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0); // Default at T+0 (NOW)

  // Selected Node for Modal Inspection
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  // Modal Visibility States
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isPhysicsModalOpen, setIsPhysicsModalOpen] = useState<boolean>(false);

  // Map Layer Visibility Config
  const [layerConfig, setLayerConfig] = useState<MapLayerConfig>({
    showPhysical: true,
    showVirtual: true,
    showPblhContours: true,
    showWindVectors: true,
    showRegionalFires: true,
    showPollutionPlume: true,
    viewMode: 'pm25'
  });

  // Current Region Details & Nodes
  const currentRegion = REGIONS.find((r) => r.id === selectedRegionId) || REGIONS[0];
  const currentNodes = INITIAL_NODES[selectedRegionId] || INITIAL_NODES['delhi-ncr'];
  const currentStep = TIMELINE_STEPS[currentStepIndex] || TIMELINE_STEPS[0];
  const currentAdvisory = getPolicyAdvisoryForStep(currentStep);

  const handleUpdateLayerConfig = (updated: Partial<MapLayerConfig>) => {
    setLayerConfig((prev) => ({ ...prev, ...updated }));
  };

  // Selected node current PM2.5 / AQI from step data
  const selectedNodePm25 = selectedNode
    ? currentStep.nodeValues[selectedNode.id]?.pm25 ?? selectedNode.current_pm25
    : 0;
  const selectedNodeAqi = selectedNode
    ? currentStep.nodeValues[selectedNode.id]?.aqi ?? selectedNode.current_aqi
    : 0;

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col font-sans select-none overflow-y-auto pb-16">
      {/* 1. Global Header Navigation Bar with Pill-Style Multi-Tab Bar */}
      <Header
        regions={REGIONS}
        selectedRegion={selectedRegionId}
        onSelectRegion={setSelectedRegionId}
        horizonMode={horizonMode}
        onSelectHorizon={setHorizonMode}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenPolicyReport={() => setIsReportModalOpen(true)}
        nodeCount={currentNodes.length}
      />

      {/* 2. Dynamic View Content Area per Active Tab */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex-1 flex flex-col">
        {activeTab === 'map' && (
          <MapTab
            region={currentRegion}
            nodes={currentNodes}
            currentStep={currentStep}
            timelineSteps={TIMELINE_STEPS}
            currentStepIndex={currentStepIndex}
            onSelectStepIndex={setCurrentStepIndex}
            layerConfig={layerConfig}
            onUpdateLayerConfig={handleUpdateLayerConfig}
            onSelectNode={(node) => setSelectedNode(node)}
          />
        )}

        {activeTab === 'physics' && (
          <PhysicsTab
            region={currentRegion}
            currentStep={currentStep}
            timelineSteps={TIMELINE_STEPS}
            nodes={currentNodes}
          />
        )}

        {activeTab === 'nodes' && (
          <GridNodesTab
            region={currentRegion}
            nodes={currentNodes}
            currentStep={currentStep}
            viewMode={layerConfig.viewMode}
            selectedNode={selectedNode}
            onSelectNode={(node) => setSelectedNode(node)}
          />
        )}

        {activeTab === 'policy' && (
          <PolicyTab
            advisory={currentAdvisory}
            region={currentRegion}
            nodes={currentNodes}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}
      </main>

      {/* 3. Global Floating AI RAG Environmental Assistant Chatbot Widget */}
      <RagChatbotWidget
        region={currentRegion}
        nodes={currentNodes}
        advisory={currentAdvisory}
        currentStep={currentStep}
        selectedNode={selectedNode}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* 4. Global Node Inspection Modal */}
      <NodeInspectorModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        viewMode={layerConfig.viewMode}
        currentPm25={selectedNodePm25}
        currentAqi={selectedNodeAqi}
      />

      {/* 5. Official CPCB Policy Brief Printable Modal */}
      <PolicyReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        advisory={currentAdvisory}
        region={currentRegion}
        nodes={currentNodes}
      />

      {/* 6. Atmospheric Physics Dynamics Inspector Modal */}
      <AtmosphericPhysicsModal
        isOpen={isPhysicsModalOpen}
        onClose={() => setIsPhysicsModalOpen(false)}
        steps={TIMELINE_STEPS}
      />
    </div>
  );
}

export default App;
