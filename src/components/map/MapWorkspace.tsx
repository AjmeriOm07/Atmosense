import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { NodeData, MapLayerConfig, HourlyTimelineStep, RegionConfig } from '../../types/atmosense';
import { REGIONAL_FIRE_SPOTS } from '../../data/mockAtmosenseState';
import { LayerControls } from './LayerControls';
import { Flame, X, Navigation } from 'lucide-react';

// Custom Leaflet Icons for Physical CAAQMS & Model-Estimated Grid Nodes
const createPhysicalIcon = (val: number, isPm25: boolean) => {
  const badgeColor = val > 250 ? '#EF4444' : val > 120 ? '#F59E0B' : '#10B981';
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
        <div style="background-color: #2563EB; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;">
          G
        </div>
        <div style="background-color: ${badgeColor}; color: white; padding: 2px 6px; border-radius: 9999px; font-weight: 800; font-size: 10px; border: 1.5px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2); white-space: nowrap; margin-top: -6px; margin-left: -8px;">
          ${val} ${isPm25 ? 'µg' : ''}
        </div>
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 24]
  });
};

const createModelGridIcon = (val: number, isPm25: boolean) => {
  const badgeColor = val > 250 ? '#EF4444' : val > 120 ? '#F59E0B' : '#10B981';
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: rgba(20, 184, 166, 0.3);"></div>
          <div style="background: linear-gradient(135deg, #14B8A6, #0D9488); width: 26px; height: 26px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 8px;">
            GRID
          </div>
        </div>
        <div style="background-color: ${badgeColor}; color: white; padding: 2px 6px; border-radius: 9999px; font-weight: 800; font-size: 10px; border: 1.5px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2); white-space: nowrap; margin-top: -4px;">
          ${val} ${isPm25 ? 'µg' : ''}
        </div>
      </div>
    `,
    iconSize: [36, 46],
    iconAnchor: [18, 26]
  });
};

const createFireIcon = (name: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: rgba(239, 68, 68, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="background: linear-gradient(135deg, #EF4444, #DC2626); width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.5); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 11px;">
            🔥
          </div>
        </div>
        <div style="background-color: #991B1B; color: white; padding: 2px 6px; border-radius: 9999px; font-weight: 800; font-size: 9px; border: 1px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); white-space: nowrap; margin-top: -4px;">
          Fire Spot
        </div>
      </div>
    `,
    iconSize: [36, 46],
    iconAnchor: [18, 26]
  });
};

// Component to dynamically re-center Leaflet map when user switches region & fix blank map tiles on mount
const MapRecenter: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom, { animate: true });
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [center, zoom, map]);
  return null;
};

interface MapWorkspaceProps {
  region: RegionConfig;
  nodes: NodeData[];
  currentStep: HourlyTimelineStep;
  layerConfig: MapLayerConfig;
  onUpdateLayerConfig: (updated: Partial<MapLayerConfig>) => void;
  onSelectNode: (node: NodeData) => void;
}

export const MapWorkspace: React.FC<MapWorkspaceProps> = ({
  region,
  nodes,
  currentStep,
  layerConfig,
  onUpdateLayerConfig,
  onSelectNode
}) => {
  const [activePlumeModal, setActivePlumeModal] = useState<boolean>(false);
  const physicalNodes = nodes.filter((n) => n.type === 'physical');
  const virtualNodes = nodes.filter((n) => n.type === 'model_estimated' || (n.type as string) === 'virtual');

  // Heatmap plume color based on pollution severity
  const getPlumeColor = (val: number) => {
    if (val > 350) return '#DC2626'; // Red severe
    if (val > 250) return '#EA580C'; // Orange poor
    if (val > 120) return '#F59E0B'; // Amber moderate
    return '#10B981'; // Green good
  };

  const plumeState = currentStep.plumeState || {
    horizonLabel: 'T+4h',
    sourceName: 'North-Western Regional Fire Activity',
    transportDirection: 'NW → SE',
    windSpeedMs: 3.8,
    affectedRegion: 'North-West Delhi NCR',
    transportStatus: 'Prototype Transport Visualization',
    plumeCenter: [29.10, 76.70] as [number, number],
    plumeRadiusMeters: 14000,
    plumeIntensity: 0.6,
    plumePath: [
      [29.80, 75.80],
      [29.60, 76.25],
      [29.10, 76.70],
      [28.75, 77.10],
      [28.50, 77.35]
    ] as [number, number][]
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-100 overflow-hidden select-none font-sans">
      {/* Floating Layer Controls */}
      <LayerControls
        layerConfig={layerConfig}
        onUpdateConfig={onUpdateLayerConfig}
        physicalCount={physicalNodes.length}
        virtualCount={virtualNodes.length}
      />

      {/* Regional Transport Event Info Panel Overlay Modal (when clicked) */}
      {activePlumeModal && (
        <div className="absolute top-4 right-4 z-[1000] bg-slate-900/95 text-white p-4 rounded-2xl border border-slate-700 shadow-2xl max-w-xs w-full space-y-3 font-sans animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-1.5 text-rose-400 font-black text-xs uppercase tracking-wider">
              <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>REGIONAL TRANSPORT EVENT</span>
            </div>
            <button
              onClick={() => setActivePlumeModal(false)}
              className="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 text-xs font-sans">
            <div className="flex justify-between">
              <span className="text-slate-400">Source:</span>
              <span className="font-bold text-slate-100 text-right">{plumeState.sourceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Transport Direction:</span>
              <span className="font-mono font-bold text-sky-400">{plumeState.transportDirection}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Wind Speed:</span>
              <span className="font-mono font-bold text-slate-100">{plumeState.windSpeedMs} m/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Forecast Horizon:</span>
              <span className="font-mono font-bold text-amber-300">{plumeState.horizonLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Affected Region:</span>
              <span className="font-bold text-slate-100 text-right">{plumeState.affectedRegion}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Status:</span>
              <span className="font-semibold text-emerald-400">{plumeState.transportStatus}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Spatial Map Workspace */}
      <MapContainer
        center={region.center}
        zoom={region.zoom}
        style={{ width: '100%', height: '100%', minHeight: '500px' }}
        zoomControl={false}
      >
        <MapRecenter center={region.center} zoom={region.zoom} />

        {/* Clean OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Dynamic Regional Heatmap Plumes */}
        {nodes.map((node) => {
          const stepVal = currentStep.nodeValues[node.id];
          const val = stepVal
            ? layerConfig.viewMode === 'pm25'
              ? stepVal.pm25
              : stepVal.aqi
            : layerConfig.viewMode === 'pm25'
            ? node.current_pm25
            : node.current_aqi;

          const color = getPlumeColor(val);
          const opacity = Math.min(0.45, 0.15 + (val / 500) * 0.3);

          return (
            <Circle
              key={`plume-${node.id}`}
              center={[node.lat, node.lng]}
              radius={node.type === 'model_estimated' || (node.type as string) === 'virtual' ? 4500 : 3500}
              pathOptions={{
                fillColor: color,
                fillOpacity: opacity,
                color: color,
                weight: 1,
                opacity: opacity * 0.8
              }}
            />
          );
        })}

        {/* Pollution Transport / Plume Layer (when toggled ON) */}
        {layerConfig.showPollutionPlume && (
          <React.Fragment>
            {/* Plume Envelope Circle */}
            <Circle
              center={plumeState.plumeCenter}
              radius={plumeState.plumeRadiusMeters}
              pathOptions={{
                color: '#EA580C',
                weight: 2,
                dashArray: '8, 8',
                fillColor: '#F97316',
                fillOpacity: plumeState.plumeIntensity * 0.35
              }}
              eventHandlers={{
                click: () => setActivePlumeModal(true)
              }}
            />
            {/* Plume Core Circle */}
            <Circle
              center={plumeState.plumeCenter}
              radius={plumeState.plumeRadiusMeters * 0.5}
              pathOptions={{
                color: '#DC2626',
                weight: 2.5,
                fillColor: '#EF4444',
                fillOpacity: plumeState.plumeIntensity * 0.5
              }}
              eventHandlers={{
                click: () => setActivePlumeModal(true)
              }}
            />
            {/* Transport Pathway Corridor Polyline */}
            <Polyline
              positions={plumeState.plumePath}
              pathOptions={{
                color: '#EF4444',
                weight: 3.5,
                dashArray: '6, 6',
                opacity: 0.85
              }}
              eventHandlers={{
                click: () => setActivePlumeModal(true)
              }}
            />
          </React.Fragment>
        )}

        {/* Regional Fire / Stubble Activity Markers (when toggled ON) */}
        {layerConfig.showRegionalFires &&
          REGIONAL_FIRE_SPOTS.map((spot) => {
            const fireIcon = createFireIcon(spot.name);
            return (
              <Marker
                key={spot.id}
                position={[spot.lat, spot.lng]}
                icon={fireIcon}
                eventHandlers={{
                  click: () => setActivePlumeModal(true)
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-2 font-sans space-y-1">
                    <div className="text-xs font-bold text-slate-900">{spot.name}</div>
                    <div className="text-[10px] text-rose-700 font-bold flex items-center space-x-1">
                      <Flame className="w-3 h-3 text-rose-600" />
                      <span>Regional Fire Activity ({spot.activeFiresCount} Active Spots)</span>
                    </div>
                    <p className="text-[10px] text-slate-600 font-sans">{spot.description}</p>
                    <button
                      onClick={() => setActivePlumeModal(true)}
                      className="mt-1 text-[10px] font-bold text-rose-600 underline block cursor-pointer"
                    >
                      View Transport Event &rarr;
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 1/PBLH Thermal Inversion Contours */}
        {layerConfig.showPblhContours &&
          currentStep.contours.map((contour, i) => (
            <React.Fragment key={`contour-${i}`}>
              <Circle
                center={[contour.lat, contour.lng]}
                radius={contour.radiusMeters}
                pathOptions={{
                  color: '#F59E0B',
                  weight: 2,
                  dashArray: '6, 6',
                  fillColor: '#FEF3C7',
                  fillOpacity: contour.intensity * 0.25
                }}
              />
              <Circle
                center={[contour.lat, contour.lng]}
                radius={contour.radiusMeters * 0.6}
                pathOptions={{
                  color: '#EF4444',
                  weight: 2.5,
                  dashArray: '4, 4',
                  fillColor: '#FEE2E2',
                  fillOpacity: contour.intensity * 0.35
                }}
              />
            </React.Fragment>
          ))}

        {/* Animated Wind Dynamics Vector Field Overlays */}
        {layerConfig.showWindVectors &&
          currentStep.windVectors.map((wv, idx) => {
            const endLat = wv.lat + wv.v * 0.03;
            const endLng = wv.lng + wv.u * 0.03;
            return (
              <Polyline
                key={`wind-vec-${idx}`}
                positions={[
                  [wv.lat, wv.lng],
                  [endLat, endLng]
                ]}
                pathOptions={{
                  color: '#0284C7',
                  weight: 3,
                  opacity: 0.8,
                  dashArray: '8, 8'
                }}
              />
            );
          })}

        {/* Physical Ground Station Pin Markers */}
        {layerConfig.showPhysical &&
          physicalNodes.map((node) => {
            const stepVal = currentStep.nodeValues[node.id];
            const val = stepVal
              ? layerConfig.viewMode === 'pm25'
                ? stepVal.pm25
                : stepVal.aqi
              : layerConfig.viewMode === 'pm25'
              ? node.current_pm25
              : node.current_aqi;

            const icon = createPhysicalIcon(val, layerConfig.viewMode === 'pm25');

            return (
              <Marker
                key={node.id}
                position={[node.lat, node.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => onSelectNode(node)
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 font-sans">
                    <div className="text-xs font-bold text-slate-900">{node.name}</div>
                    <div className="text-[10px] text-blue-700 font-bold">
                      ● CAAQMS Station — Ground observation
                    </div>
                    <div className="mt-1 text-sm font-black text-slate-800">
                      {val} {layerConfig.viewMode === 'pm25' ? 'µg/m³' : 'AQI'}
                    </div>
                    <button
                      onClick={() => onSelectNode(node)}
                      className="mt-2 text-[10px] font-bold text-sky-600 underline block cursor-pointer"
                    >
                      Inspect Station Details &rarr;
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Model-Estimated Spatial Grid Node Markers */}
        {layerConfig.showVirtual &&
          virtualNodes.map((node) => {
            const stepVal = currentStep.nodeValues[node.id];
            const val = stepVal
              ? layerConfig.viewMode === 'pm25'
                ? stepVal.pm25
                : stepVal.aqi
              : layerConfig.viewMode === 'pm25'
              ? node.current_pm25
              : node.current_aqi;

            const icon = createModelGridIcon(val, layerConfig.viewMode === 'pm25');

            return (
              <Marker
                key={node.id}
                position={[node.lat, node.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => onSelectNode(node)
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 font-sans">
                    <div className="text-xs font-bold text-slate-900">{node.name}</div>
                    <div className="text-[10px] text-teal-700 font-bold">
                      ● Model-Estimated Grid — Spatial model estimate
                    </div>
                    <div className="mt-1 text-sm font-black text-slate-800">
                      {val} {layerConfig.viewMode === 'pm25' ? 'µg/m³' : 'AQI'}
                    </div>
                    <button
                      onClick={() => onSelectNode(node)}
                      className="mt-2 text-[10px] font-bold text-teal-600 underline block cursor-pointer"
                    >
                      Inspect Model Grid Point &rarr;
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};
