import type {
  RegionConfig,
  NodeData,
  HourlyTimelineStep,
  PolicyAdvisory,
  RegionId,
  RegionalFireSpot,
  HourlyPoint
} from '../types/atmosense';

export const REGIONS: RegionConfig[] = [
  {
    id: 'delhi-ncr',
    name: 'Delhi-NCR',
    subTitle: 'National Capital Region & Suburban Virtual Grids',
    center: [28.6300, 77.2300],
    zoom: 11
  },
  {
    id: 'mumbai',
    name: 'Mumbai Metropolitan',
    subTitle: 'Coastal Boundary Layer & Port Urban Grid',
    center: [19.0760, 72.8777],
    zoom: 11
  },
  {
    id: 'kolkata',
    name: 'Kolkata Mega Grid',
    subTitle: 'Gangetic Basin Thermal Inversion Zone',
    center: [22.5726, 88.3639],
    zoom: 11
  },
  {
    id: 'lucknow',
    name: 'Lucknow Urban Core',
    subTitle: 'Central UP Agricultural & Suburban Belt',
    center: [26.8467, 80.9462],
    zoom: 12
  }
];

export function calculateAqiFromPm25(pm25: number): number {
  if (pm25 <= 30) return Math.round((pm25 / 30) * 50);
  if (pm25 <= 60) return Math.round(50 + ((pm25 - 30) / 30) * 50);
  if (pm25 <= 90) return Math.round(100 + ((pm25 - 60) / 30) * 100);
  if (pm25 <= 120) return Math.round(200 + ((pm25 - 90) / 30) * 100);
  if (pm25 <= 250) return Math.round(300 + ((pm25 - 120) / 130) * 100);
  return Math.min(500, Math.round(400 + ((pm25 - 250) / 150) * 100));
}

// ----------------------------------------------------------------------
// Episode Curve Generators across 73 Hourly Steps (T+0 to T+72h)
// ----------------------------------------------------------------------

function getRegionalBasePm25(h: number): number {
  let episodeBase: number;
  if (h <= 24) {
    // Episode Build-up & Peak: 118 -> 236
    const t = h / 24;
    episodeBase = 118 + (236 - 118) * Math.sin((t * Math.PI) / 2);
  } else if (h <= 48) {
    // Dispersion / Clearing Phase: 236 -> 170
    const t = (h - 24) / 24;
    episodeBase = 236 - (236 - 170) * Math.sin((t * Math.PI) / 2);
  } else {
    // Recovery Phase: 170 -> 115
    const t = (h - 48) / 24;
    episodeBase = 170 - (170 - 115) * Math.sin((t * Math.PI) / 2);
  }

  // Superimpose diurnal heating variation
  const dayHour = h % 24;
  let diurnalDelta = 0;
  if (dayHour >= 2 && dayHour <= 8) {
    diurnalDelta = Math.sin(((dayHour - 2) / 6) * Math.PI) * 18;
  } else if (dayHour >= 12 && dayHour <= 17) {
    diurnalDelta = -Math.sin(((dayHour - 12) / 5) * Math.PI) * 14;
  }

  return Math.round(episodeBase + diurnalDelta);
}

function getPblh(h: number): number {
  let basePblh: number;
  if (h <= 24) {
    const t = h / 24;
    basePblh = 420 - (420 - 180) * Math.sin((t * Math.PI) / 2);
  } else if (h <= 48) {
    const t = (h - 24) / 24;
    basePblh = 180 + (310 - 180) * Math.sin((t * Math.PI) / 2);
  } else {
    const t = (h - 48) / 24;
    basePblh = 310 + (520 - 310) * Math.sin((t * Math.PI) / 2);
  }

  const dayHour = h % 24;
  let diurnalPblhDelta = 0;
  if (dayHour >= 11 && dayHour <= 17) {
    diurnalPblhDelta = Math.sin(((dayHour - 11) / 6) * Math.PI) * 220;
  } else if (dayHour >= 2 && dayHour <= 8) {
    diurnalPblhDelta = -Math.sin(((dayHour - 2) / 6) * Math.PI) * 35;
  }

  return Math.max(160, Math.round(basePblh + diurnalPblhDelta));
}

function getWindData(h: number): { speed: number; deg: number; cardinal: string } {
  let speed: number;
  let deg: number;
  let cardinal: string;

  if (h <= 12) {
    speed = Number((2.8 - (h / 12) * 1.3).toFixed(1));
    deg = 315;
    cardinal = 'NW';
  } else if (h <= 32) {
    speed = Number((1.2 + Math.sin(h * 0.8) * 0.15).toFixed(1));
    deg = 305;
    cardinal = 'WNW';
  } else if (h <= 54) {
    const t = (h - 32) / 22;
    speed = Number((1.3 + t * 2.1).toFixed(1));
    deg = Math.round(305 - t * 35);
    cardinal = 'W';
  } else {
    const t = (h - 54) / 18;
    speed = Number((3.4 + t * 0.9).toFixed(1));
    deg = Math.round(270 - t * 25);
    cardinal = 'WSW';
  }

  return { speed, deg, cardinal };
}

// ----------------------------------------------------------------------
// Node Definitions for Delhi-NCR (10 Physical CAAQMS + 6 Model Grid Points)
// ----------------------------------------------------------------------

interface NodeDef {
  id: string;
  name: string;
  type: 'physical' | 'model_estimated';
  lat: number;
  lng: number;
  data_provenance: 'CAAQMS Ground Observation' | 'Model-Estimated Spatial Grid';
  multiplier: number;
  peakHourOffset: number;
  estimation_method?: string;
  nearest_physical_station?: string;
  distance_km?: number;
}

const DELHI_NODE_DEFS: NodeDef[] = [
  // Physical CAAQMS Ground Stations
  { id: 'node-01', name: 'Anand Vihar CAAQMS', type: 'physical', lat: 28.6469, lng: 77.3160, data_provenance: 'CAAQMS Ground Observation', multiplier: 1.48, peakHourOffset: 0 },
  { id: 'node-02', name: 'Punjabi Bagh CAAQMS', type: 'physical', lat: 28.6683, lng: 77.1167, data_provenance: 'CAAQMS Ground Observation', multiplier: 1.28, peakHourOffset: -4 },
  { id: 'node-03', name: 'Mandir Marg CAAQMS', type: 'physical', lat: 28.6258, lng: 77.1972, data_provenance: 'CAAQMS Ground Observation', multiplier: 1.12, peakHourOffset: 0 },
  { id: 'node-04', name: 'RK Puram CAAQMS', type: 'physical', lat: 28.5644, lng: 77.1744, data_provenance: 'CAAQMS Ground Observation', multiplier: 1.05, peakHourOffset: 2 },
  { id: 'node-05', name: 'Rohini Sec 16 CAAQMS', type: 'physical', lat: 28.7325, lng: 77.1199, data_provenance: 'CAAQMS Ground Observation', multiplier: 1.36, peakHourOffset: -6 },
  { id: 'node-06', name: 'Dwarka Sec 8 CAAQMS', type: 'physical', lat: 28.5708, lng: 77.0715, data_provenance: 'CAAQMS Ground Observation', multiplier: 1.04, peakHourOffset: 2 },
  { id: 'node-07', name: 'Noida Sector 62 CAAQMS', type: 'physical', lat: 28.6245, lng: 77.3649, data_provenance: 'CAAQMS Ground Observation', multiplier: 1.20, peakHourOffset: 4 },
  { id: 'node-08', name: 'Vasundhara Ghaziabad CAAQMS', type: 'physical', lat: 28.6603, lng: 77.3572, data_provenance: 'CAAQMS Ground Observation', multiplier: 1.40, peakHourOffset: 2 },
  { id: 'node-09', name: 'Vikas Sadan Gurugram CAAQMS', type: 'physical', lat: 28.4501, lng: 77.0263, data_provenance: 'CAAQMS Ground Observation', multiplier: 0.96, peakHourOffset: 4 },
  { id: 'node-10', name: 'Sector 16A Faridabad CAAQMS', type: 'physical', lat: 28.4089, lng: 77.3178, data_provenance: 'CAAQMS Ground Observation', multiplier: 1.10, peakHourOffset: 6 },

  // Model-Estimated Spatial Grid Points
  { id: 'node-v01', name: 'Alipur Model Grid', type: 'model_estimated', lat: 28.8150, lng: 77.1400, data_provenance: 'Model-Estimated Spatial Grid', multiplier: 1.38, peakHourOffset: -8, estimation_method: 'NW Entry Spatial Model Interpolation', nearest_physical_station: 'Rohini Sec 16 CAAQMS', distance_km: 10.5 },
  { id: 'node-v02', name: 'Bawana Industrial Model Grid', type: 'model_estimated', lat: 28.7900, lng: 77.0400, data_provenance: 'Model-Estimated Spatial Grid', multiplier: 1.46, peakHourOffset: -6, estimation_method: 'North Industrial Boundary Coupling', nearest_physical_station: 'Rohini Sec 16 CAAQMS', distance_km: 9.2 },
  { id: 'node-v03', name: 'Sonipat Border Model Grid', type: 'model_estimated', lat: 28.9800, lng: 77.0200, data_provenance: 'Model-Estimated Spatial Grid', multiplier: 1.42, peakHourOffset: -10, estimation_method: 'Trans-Boundary Entry Grid Advection', nearest_physical_station: 'Alipur Model Grid', distance_km: 18.4 },
  { id: 'node-v04', name: 'Najafgarh Suburban Model Grid', type: 'model_estimated', lat: 28.6100, lng: 76.9800, data_provenance: 'Model-Estimated Spatial Grid', multiplier: 1.08, peakHourOffset: -2, estimation_method: 'Western Agricultural Fringe Model', nearest_physical_station: 'Dwarka Sec 8 CAAQMS', distance_km: 11.2 },
  { id: 'node-v05', name: 'Greater Noida Model Grid', type: 'model_estimated', lat: 28.4700, lng: 77.5000, data_provenance: 'Model-Estimated Spatial Grid', multiplier: 1.06, peakHourOffset: 8, estimation_method: 'Eastern Exit Corridor Spatial Model', nearest_physical_station: 'Noida Sector 62 CAAQMS', distance_km: 18.6 },
  { id: 'node-v06', name: 'Manesar Industrial Model Grid', type: 'model_estimated', lat: 28.3500, lng: 76.9400, data_provenance: 'Model-Estimated Spatial Grid', multiplier: 0.94, peakHourOffset: 6, estimation_method: 'SW Industrial Corridor Model', nearest_physical_station: 'Vikas Sadan Gurugram', distance_km: 14.5 }
];

// Helper to compute node PM2.5 at hour h
function calculateNodePm25(def: NodeDef, h: number): number {
  // Effective hour shifted by peakHourOffset
  const effectiveH = Math.max(0, Math.min(72, h - def.peakHourOffset));
  const basePm25 = getRegionalBasePm25(effectiveH);
  return Math.round(basePm25 * def.multiplier);
}

// ----------------------------------------------------------------------
// Regional Fire Activity Spots (NW Delhi NCR Entry Corridor)
// ----------------------------------------------------------------------

export const REGIONAL_FIRE_SPOTS: RegionalFireSpot[] = [
  {
    id: 'fire-01',
    name: 'Sangrur-Patiala Fire Activity Cluster',
    lat: 29.80,
    lng: 75.80,
    intensity: 'Severe',
    activeFiresCount: 142,
    description: 'Regional thermal anomaly activity observation in agricultural entry corridor.'
  },
  {
    id: 'fire-02',
    name: 'Kaithal-Karnal Border Fire Spot',
    lat: 29.60,
    lng: 76.25,
    intensity: 'High',
    activeFiresCount: 88,
    description: 'Regional fire activity detected along prevailing northwest wind trajectory.'
  },
  {
    id: 'fire-03',
    name: 'Panipat Suburban Fire Cluster',
    lat: 29.35,
    lng: 76.60,
    intensity: 'Moderate',
    activeFiresCount: 45,
    description: 'Biomass/agricultural fire spot in upper Haryana corridor.'
  },
  {
    id: 'fire-04',
    name: 'Rohtak Suburban Agricultural Spot',
    lat: 28.90,
    lng: 76.58,
    intensity: 'Moderate',
    activeFiresCount: 32,
    description: 'Suburban agricultural thermal anomaly west of Delhi NCR entry.'
  }
];

// ----------------------------------------------------------------------
// Generate 73 Hourly Timeline Steps (T+0 to T+72h)
// ----------------------------------------------------------------------

export const TIMELINE_STEPS: HourlyTimelineStep[] = Array.from({ length: 73 }).map((_, index) => {
  const hour = index; // 0 to 72
  const dayOffset = Math.floor(hour / 24);
  const dayHour = hour % 24;
  const dayNum = 16 + dayOffset;
  const hourStr = dayHour.toString().padStart(2, '0');
  const displayHour = dayHour % 12 === 0 ? 12 : dayHour % 12;
  const ampm = dayHour < 12 ? 'AM' : 'PM';
  const formattedTime = `Nov ${dayNum}, ${displayHour.toString().padStart(2, '0')}:00 ${ampm} (T+${hour}h)`;
  const isForecast = hour >= 4;

  const pblh = getPblh(hour);
  const wind = getWindData(hour);
  const inversePblh = Number((1 / pblh).toFixed(5));

  let stagnationIndex: 'Low' | 'Moderate' | 'High' | 'Critical Stagnation';
  if (pblh < 200 && wind.speed <= 1.4) {
    stagnationIndex = 'Critical Stagnation';
  } else if (pblh < 280 || wind.speed <= 2.0) {
    stagnationIndex = 'High';
  } else if (pblh < 420) {
    stagnationIndex = 'Moderate';
  } else {
    stagnationIndex = 'Low';
  }

  // Node values for all 16 stations at this step
  const nodeValues: Record<string, { pm25: number; aqi: number }> = {};
  DELHI_NODE_DEFS.forEach((def) => {
    const pm25 = calculateNodePm25(def, hour);
    const aqi = calculateAqiFromPm25(pm25);
    nodeValues[def.id] = { pm25, aqi };
  });

  const isPeak = pblh < 220;

  // Spatial wind vectors aligned with wind.deg & wind.speed
  const rad = (wind.deg * Math.PI) / 180;
  const uComp = Number((-Math.sin(rad) * wind.speed).toFixed(1));
  const vComp = Number((-Math.cos(rad) * wind.speed).toFixed(1));

  const windVectors = [
    { lat: 28.82, lng: 77.10, u: uComp, v: vComp, speed: wind.speed, deg: wind.deg },
    { lat: 28.80, lng: 77.30, u: uComp, v: vComp, speed: wind.speed, deg: wind.deg },
    { lat: 28.65, lng: 77.12, u: uComp, v: vComp, speed: wind.speed, deg: wind.deg },
    { lat: 28.64, lng: 77.35, u: uComp, v: vComp, speed: wind.speed, deg: wind.deg },
    { lat: 28.48, lng: 77.15, u: uComp, v: vComp, speed: wind.speed, deg: wind.deg },
    { lat: 28.42, lng: 77.40, u: uComp, v: vComp, speed: wind.speed, deg: wind.deg }
  ];

  const contours = [
    { lat: 28.6469, lng: 77.3160, inversePblh, radiusMeters: 4500, intensity: isPeak ? 0.92 : 0.45 },
    { lat: 28.7500, lng: 77.2800, inversePblh: inversePblh * 1.1, radiusMeters: 5500, intensity: isPeak ? 0.95 : 0.45 },
    { lat: 28.8000, lng: 77.1300, inversePblh: inversePblh * 1.05, radiusMeters: 6000, intensity: isPeak ? 0.88 : 0.4 },
    { lat: 28.5800, lng: 77.4400, inversePblh: inversePblh * 0.95, radiusMeters: 4800, intensity: isPeak ? 0.82 : 0.35 }
  ];

  // Dynamic pollution plume transport progression
  const horizonLabel = `T+${hour}h`;
  let affectedRegion: string;
  let plumeCenter: [number, number];
  let plumeRadiusMeters: number;
  let plumeIntensity: number;
  let transportDirection = 'NW → SE';

  if (hour < 6) {
    const t = hour / 6;
    affectedRegion = 'Upper Punjab/Haryana Regional Source Area';
    plumeCenter = [
      Number((29.60 - t * 0.45).toFixed(4)),
      Number((76.00 + t * 0.45).toFixed(4))
    ];
    plumeRadiusMeters = Math.round(9000 + t * 4000);
    plumeIntensity = Number((0.35 + t * 0.20).toFixed(2));
  } else if (hour < 12) {
    const t = (hour - 6) / 6;
    affectedRegion = 'Upper Haryana & Sonipat Entry Corridor';
    plumeCenter = [
      Number((29.15 - t * 0.30).toFixed(4)),
      Number((76.45 + t * 0.45).toFixed(4))
    ];
    plumeRadiusMeters = Math.round(13000 + t * 6000);
    plumeIntensity = Number((0.55 + t * 0.23).toFixed(2));
  } else if (hour < 32) {
    const t = (hour - 12) / 20;
    affectedRegion = 'Delhi-NCR Urban Core & Central Basin';
    plumeCenter = [
      Number((28.85 - t * 0.35).toFixed(4)),
      Number((76.90 + t * 0.50).toFixed(4))
    ];
    plumeRadiusMeters = Math.round(19000 + t * 8000);
    plumeIntensity = Number((0.78 + Math.sin(t * Math.PI) * 0.14).toFixed(2));
  } else if (hour < 54) {
    const t = (hour - 32) / 22;
    affectedRegion = 'Noida, Greater Noida & Southern NCR Belt';
    plumeCenter = [
      Number((28.50 - t * 0.35).toFixed(4)),
      Number((77.40 + t * 0.30).toFixed(4))
    ];
    plumeRadiusMeters = Math.round(27000 + t * 6000);
    plumeIntensity = Number((0.75 - t * 0.35).toFixed(2));
    transportDirection = 'W → E / SE';
  } else {
    const t = (hour - 54) / 18;
    affectedRegion = 'Peripheral Eastern Corridor (Dissipating)';
    plumeCenter = [
      Number((28.15 - t * 0.20).toFixed(4)),
      Number((77.70 + t * 0.25).toFixed(4))
    ];
    plumeRadiusMeters = Math.round(33000 + t * 5000);
    plumeIntensity = Number((0.40 - t * 0.22).toFixed(2));
    transportDirection = 'WSW → ENE';
  }

  return {
    timestamp: `2026-11-${dayNum}T${hourStr}:00:00Z`,
    formattedTime,
    isForecast,
    telemetry: {
      pblh_meters: pblh,
      inverse_pblh: inversePblh,
      wind_speed_ms: wind.speed,
      wind_direction_deg: wind.deg,
      wind_direction_cardinal: wind.cardinal,
      stagnation_index: stagnationIndex,
      peak_spike_window: {
        isPeak,
        startLabel: '02:00 AM',
        endLabel: '08:00 AM',
        description: isPeak
          ? 'Nocturnal Inversion Trap: Boundary Layer height drops below 200m with weak dispersion.'
          : 'Standard Convective Boundary Layer Window.'
      }
    },
    nodeValues,
    windVectors,
    contours,
    plumeState: {
      horizonLabel,
      sourceName: 'North-Western Regional Fire Activity',
      transportDirection,
      windSpeedMs: wind.speed,
      affectedRegion,
      transportStatus: 'Simulated Plume Transport Progression',
      plumeCenter,
      plumeRadiusMeters,
      plumeIntensity,
      plumePath: [
        [29.80, 75.80],
        [29.60, 76.00],
        [29.10, 76.60],
        [28.75, 77.10],
        [28.50, 77.35],
        [28.20, 77.65]
      ]
    }
  };
});

// ----------------------------------------------------------------------
// Populate INITIAL_NODES for Delhi-NCR with 73-hour complete hourlyHistory
// ----------------------------------------------------------------------

const delhiNodes: NodeData[] = DELHI_NODE_DEFS.map((def) => {
  const hourlyHistory: HourlyPoint[] = TIMELINE_STEPS.map((step, idx) => {
    const pm25 = step.nodeValues[def.id]?.pm25 || calculateNodePm25(def, idx);
    const aqi = calculateAqiFromPm25(pm25);
    return {
      timestamp: step.formattedTime.replace(/Nov \d+, /, ''),
      timeLabel: step.formattedTime,
      pm25,
      aqi,
      pblh: step.telemetry.pblh_meters,
      windSpeed: step.telemetry.wind_speed_ms
    };
  });

  const step4Val = TIMELINE_STEPS[4].nodeValues[def.id]?.pm25 || calculateNodePm25(def, 4);
  const step4Aqi = calculateAqiFromPm25(step4Val);

  const maxPm25 = Math.max(...hourlyHistory.map((h) => h.pm25));
  const maxAqi = Math.max(...hourlyHistory.map((h) => h.aqi));

  let inversionRisk: 'Low' | 'Moderate' | 'High' | 'Severe Lid Collapse' = 'High';
  if (maxPm25 > 350) inversionRisk = 'Severe Lid Collapse';
  else if (maxPm25 > 220) inversionRisk = 'High';
  else if (maxPm25 > 140) inversionRisk = 'Moderate';
  else inversionRisk = 'Low';

  return {
    id: def.id,
    name: def.name,
    type: def.type,
    lat: def.lat,
    lng: def.lng,
    data_provenance: def.data_provenance,
    current_pm25: step4Val,
    current_aqi: step4Aqi,
    forecast_pm25_peak: maxPm25,
    forecast_aqi_peak: maxAqi,
    estimation_method: def.estimation_method,
    nearest_physical_station: def.nearest_physical_station,
    distance_km: def.distance_km,
    pblh_meters: 215,
    inversion_risk: inversionRisk,
    hourlyHistory
  };
});

export const INITIAL_NODES: Record<RegionId, NodeData[]> = {
  'delhi-ncr': delhiNodes,
  'mumbai': [
    {
      id: 'node-m01',
      name: 'Bandra CAAQMS Station',
      type: 'physical',
      data_provenance: 'CAAQMS Ground Observation',
      lat: 19.0596,
      lng: 72.8295,
      current_pm25: 140,
      current_aqi: 190,
      forecast_pm25_peak: 180,
      forecast_aqi_peak: 240,
      pblh_meters: 450,
      inversion_risk: 'Moderate',
      hourlyHistory: []
    }
  ],
  'kolkata': [
    {
      id: 'node-k01',
      name: 'Victoria Memorial CAAQMS',
      type: 'physical',
      data_provenance: 'CAAQMS Ground Observation',
      lat: 22.5448,
      lng: 88.3426,
      current_pm25: 240,
      current_aqi: 290,
      forecast_pm25_peak: 310,
      forecast_aqi_peak: 360,
      pblh_meters: 320,
      inversion_risk: 'High',
      hourlyHistory: []
    }
  ],
  'lucknow': [
    {
      id: 'node-l01',
      name: 'Lalbagh CAAQMS Station',
      type: 'physical',
      data_provenance: 'CAAQMS Ground Observation',
      lat: 26.8500,
      lng: 80.9400,
      current_pm25: 310,
      current_aqi: 360,
      forecast_pm25_peak: 390,
      forecast_aqi_peak: 430,
      pblh_meters: 260,
      inversion_risk: 'High',
      hourlyHistory: []
    }
  ],
  'custom': []
};

// ----------------------------------------------------------------------
// Dynamic Policy Advisory Generator per Timeline Step
// ----------------------------------------------------------------------

export function getPolicyAdvisoryForStep(step: HourlyTimelineStep): PolicyAdvisory {
  const pm25Values = Object.values(step.nodeValues).map((v) => v.pm25);
  const avgPm25 = Math.round(pm25Values.reduce((a, b) => a + b, 0) / (pm25Values.length || 1));
  const pblh = step.telemetry.pblh_meters;
  const windSpeed = step.telemetry.wind_speed_ms;
  const cardinal = step.telemetry.wind_direction_cardinal;
  const horizon = step.plumeState.horizonLabel;

  if (avgPm25 >= 200 || pblh < 210) {
    return {
      title: 'AI Environmental Decision Support & Diagnostic Briefing',
      recommended_stage: 'GRAP STAGE IV',
      advisory_text: `Coupled diagnostic models indicate a severe pollution accumulation event. Boundary-layer depth has collapsed to ${pblh}m, severely restricting vertical dispersion. Calm ${cardinal} winds (${windSpeed} m/s) prevent horizontal ventilation, trapping incoming regional biomass smoke into the urban core.`,
      forecastRisk: {
        title: 'CRITICAL INVERSION & PEAK EPISODE SPIKE',
        risk_level: 'Severe',
        window: `Severe Inversion & Plume Trap Window (${horizon})`,
        primary_drivers: [
          `Severe Boundary Layer Collapse (PBLH ${pblh}m < 200m)`,
          `Stagnant ${cardinal} winds (${windSpeed} m/s ventilation lock)`,
          'Nocturnal ground temperature inversion lid',
          'Heavy trans-boundary regional smoke transport'
        ]
      },
      expectedImpact: {
        pm25_trend: `Severe Peak (~${Math.round(avgPm25 * 1.5)} µg/m³ Anand Vihar / ~${avgPm25} µg/m³ Regional Mean)`,
        dispersion: 'Severely Restricted / Stagnant Mixing',
        inversion: 'Critical Nocturnal Thermal Lid Trap',
        regional_transport: 'Northwest → Delhi-NCR Central Basin'
      },
      aiExplanation: `Coupled diagnostic models indicate a severe pollution accumulation event. Boundary-layer depth has collapsed to ${pblh}m, severely restricting vertical dispersion. Calm ${cardinal} winds (${windSpeed} m/s) prevent horizontal ventilation, trapping incoming regional biomass smoke into the urban core.`,
      recommendedConsiderations: {
        authorities: [
          'Enforce GRAP Stage IV emergency traffic entry restrictions for heavy commercial vehicles.',
          'Mandate temporary halt on non-essential construction and demolition activities.',
          'Deploy high-capacity anti-smog water misters along high-density transit corridors.',
          'Increase Metro & public transit frequency to minimize private vehicle emissions.'
        ],
        public: [
          'Avoid all strenuous outdoor physical exertion during nocturnal and early morning hours.',
          'Keep windows & doors sealed during stagnant inversion lid windows (02:00 AM – 08:00 AM).',
          'Use N95 respirators for mandatory outdoor travel.'
        ]
      },
      directives: [
        {
          id: 'dir-01',
          category: 'transportation',
          categoryTitle: 'Vehicle & Transport Restrictions',
          title: 'Emergency Commercial Freight Entry Prohibition',
          description: 'Halt entry of non-essential BS-III petrol and BS-IV diesel heavy commercial vehicles at all regional entry toll gates.',
          targetedZones: ['Alipur Entry Toll', 'Sonipat Highway', 'Noida Entry Corridor']
        },
        {
          id: 'dir-02',
          category: 'industrial',
          categoryTitle: 'Industrial & Infrastructure Halt',
          title: 'Construction & Dust-Generating Activity Shutdown',
          description: 'Mandate immediate total shutdown of public works, highway construction, and industrial fuel burning in unapproved sectors.',
          targetedZones: ['Bawana Industrial Area', 'Anand Vihar Hub', 'Greater Noida Zone']
        },
        {
          id: 'dir-03',
          category: 'civic',
          categoryTitle: 'Civic & Emergency Health Interventions',
          title: 'Anti-Smog Deployment & School Safety Directives',
          description: 'Deploy 50+ mobile anti-smog mist cannons across dense urban hotspots and transition primary schools to virtual mode.',
          targetedZones: ['Anand Vihar', 'Punjabi Bagh', 'Rohini Sector 16']
        }
      ],
      basisOfAssessment: [
        'Coupled Weather–Chemistry Numerical Model Output',
        'CAAQMS Ground Station Real-Time Observations',
        'Atmospheric Diagnostics (1/PBLH Inversion & Vector Fields)',
        'Regional Satellite Thermal Anomaly / Fire Observations',
        'Short-Term Pollution Trend Forecast Engine'
      ],
      atmospheric_trigger: `Sub-200m PBLH Collapse (${pblh}m) with Stagnant ${cardinal} Winds (${windSpeed} m/s)`,
      affected_population_est: '24.8 Million Citizens in Delhi-NCR'
    };
  } else if (avgPm25 >= 140) {
    return {
      title: 'AI Environmental Decision Support & Diagnostic Briefing',
      recommended_stage: 'GRAP STAGE III',
      advisory_text: `Northwesterly advection fields are actively carrying regional biomass smoke into the Delhi-NCR border grid. Boundary layer height is declining (${pblh}m), reducing mixing capacity and leading to gradual PM2.5 accumulation.`,
      forecastRisk: {
        title: 'HIGH POLLUTION TRANSPORT & STAGNATION RISK',
        risk_level: 'High',
        window: `Advancing Smoke & Accumulation Window (${horizon})`,
        primary_drivers: [
          `Declining Boundary Layer Depth (PBLH ${pblh}m)`,
          `Northwesterly transport winds (${windSpeed} m/s)`,
          'Moderate atmospheric inversion layer',
          'Incoming regional biomass plume'
        ]
      },
      expectedImpact: {
        pm25_trend: `Increasing (Regional Mean ~${avgPm25} µg/m³)`,
        dispersion: 'Poor / Moderately Restricted',
        inversion: 'Moderate Nocturnal Thermal Trapping',
        regional_transport: 'Upper Haryana → Sonipat / NW Delhi Entry Corridor'
      },
      aiExplanation: `Northwesterly advection fields are actively carrying regional biomass smoke into the Delhi-NCR border grid. Boundary layer height is declining (${pblh}m), reducing mixing capacity and leading to gradual PM2.5 accumulation.`,
      recommendedConsiderations: {
        authorities: [
          'Initiate targeted dust-suppression watering in NW entry corridors (Alipur, Sonipat, Rohini).',
          'Enhance monitoring along major freight traffic entry points.',
          'Issue early public health warnings for vulnerable groups.',
          'Enforce strict dust control on active infrastructure sites.'
        ],
        public: [
          'Limit prolonged outdoor exertion during evening and early morning hours.',
          'Sensitive groups (elderly, children, asthmatics) should wear protective masks.'
        ]
      },
      directives: [
        {
          id: 'dir-01',
          category: 'transportation',
          categoryTitle: 'Transportation & Traffic Management',
          title: 'Enhanced Freight Inspection & Mechanized Sweeping',
          description: 'Increase mechanical street sweeping frequency and step up tailpipe emission checks for interstate commercial transit.',
          targetedZones: ['Sonipat Entry Corridor', 'Alipur Grid', 'Outer Ring Road']
        },
        {
          id: 'dir-02',
          category: 'industrial',
          categoryTitle: 'Industrial Dust Suppression',
          title: 'Dust Suppressant Water Sprinkling Protocol',
          description: 'Deploy heavy water sprinklers with dust-suppressants along open earth & unpaved road segments.',
          targetedZones: ['Alipur Grid', 'Rohini Sec 16', 'Najafgarh Suburban']
        },
        {
          id: 'dir-03',
          category: 'civic',
          categoryTitle: 'Public Health Advisory',
          title: 'Vulnerable Population Exposure Warning',
          description: 'Issue public health advisories targeting outdoor workers, children, and elderly citizens regarding morning exercise.',
          targetedZones: ['Central Delhi Basin', 'Dwarka Sec 8', 'Noida Sec 62']
        }
      ],
      basisOfAssessment: [
        'Coupled Weather–Chemistry Numerical Model Output',
        'CAAQMS Ground Station Real-Time Observations',
        'Atmospheric Diagnostics (1/PBLH Inversion & Vector Fields)',
        'Regional Satellite Thermal Anomaly / Fire Observations'
      ],
      atmospheric_trigger: `Declining PBLH (${pblh}m) with Moderate NW Transport (${windSpeed} m/s)`,
      affected_population_est: '24.8 Million Citizens in Delhi-NCR'
    };
  } else {
    return {
      title: 'AI Environmental Decision Support & Diagnostic Briefing',
      recommended_stage: 'GRAP STAGE II',
      advisory_text: `Strengthening westerly ventilation winds (${windSpeed} m/s) and expanding boundary-layer height (${pblh}m) have significantly improved regional atmospheric dispersion.`,
      forecastRisk: {
        title: 'MODERATE POLLUTION / DISPERSION RECOVERY',
        risk_level: 'Moderate',
        window: `Atmospheric Ventilation & Dispersion Horizon (${horizon})`,
        primary_drivers: [
          `Elevated Mixing Layer Depth (PBLH ${pblh}m)`,
          `Strong ventilation winds (${cardinal} @ ${windSpeed} m/s)`,
          'Dissipating regional plume influence',
          'Improved atmospheric mixing'
        ]
      },
      expectedImpact: {
        pm25_trend: `Decreasing (Regional Mean ~${avgPm25} µg/m³)`,
        dispersion: 'Good / Well-Ventilated',
        inversion: 'Weak / Dispersed Layer',
        regional_transport: 'Plume Dissipating Eastward'
      },
      aiExplanation: `Strengthening westerly ventilation winds (${windSpeed} m/s) and expanding boundary-layer height (${pblh}m) have significantly improved regional atmospheric dispersion. Particulate concentrations are diluting rapidly across the Delhi-NCR basin.`,
      recommendedConsiderations: {
        authorities: [
          'Maintain routine mechanical street sweeping and water sprinkling.',
          'Gradually de-escalate emergency GRAP restrictions as air quality stabilizes.',
          'Resume standard industrial emissions compliance auditing.'
        ],
        public: [
          'Air quality conditions are improving; outdoor activities can safely resume with standard precautions.'
        ]
      },
      directives: [
        {
          id: 'dir-01',
          category: 'transportation',
          categoryTitle: 'Routine Traffic Controls',
          title: 'Standard Traffic Flow & Transit Frequency',
          description: 'Maintain synchronized traffic light signals to reduce idling emissions at major urban intersections.',
          targetedZones: ['Connaught Place', 'ITO Junction', 'Vikas Marg']
        },
        {
          id: 'dir-02',
          category: 'industrial',
          categoryTitle: 'Compliance Auditing',
          title: 'Continuous Emissions Monitoring Audits',
          description: 'Verify CEMS telemetry output for operational industrial boilers in designated industrial clusters.',
          targetedZones: ['Mayapuri Industrial Area', 'Okhla Phase III', 'Sahibabad']
        },
        {
          id: 'dir-03',
          category: 'civic',
          categoryTitle: 'Civic Sweeping & Maintenance',
          title: 'Routine Road & Park Maintenance',
          description: 'Continue daily mechanized road sweeping and municipal waste burning prevention patrols.',
          targetedZones: ['All Delhi-NCR Municipal Zones']
        }
      ],
      basisOfAssessment: [
        'Coupled Weather–Chemistry Numerical Model Output',
        'CAAQMS Ground Station Real-Time Observations',
        'Atmospheric Diagnostics (1/PBLH Inversion & Vector Fields)'
      ],
      atmospheric_trigger: `Well-Ventilated PBLH (${pblh}m) with Active ${cardinal} Winds (${windSpeed} m/s)`,
      affected_population_est: '24.8 Million Citizens in Delhi-NCR'
    };
  }
}

export const MOCK_POLICY_ADVISORY: PolicyAdvisory = getPolicyAdvisoryForStep(TIMELINE_STEPS[4]);
