export type TabId = 'map' | 'physics' | 'nodes' | 'policy';

export type RegionId = 'delhi-ncr' | 'mumbai' | 'kolkata' | 'lucknow' | 'custom';

export type HorizonMode = '72h_short_term' | '7d_extended' | 'custom';

export type ViewMode = 'pm25' | 'aqi';

export type NodeType = 'physical' | 'model_estimated';

export interface HourlyPoint {
  timestamp: string;
  timeLabel: string;
  pm25: number;
  aqi: number;
  pblh: number;
  windSpeed: number;
}

export interface NodeData {
  id: string;
  name: string;
  type: NodeType;
  lat: number;
  lng: number;
  current_pm25: number;
  current_aqi: number;
  forecast_pm25_peak: number;
  forecast_aqi_peak: number;
  data_provenance: 'CAAQMS Ground Observation' | 'Model-Estimated Spatial Grid';
  estimation_method?: string; // e.g. "Spatial Model Interpolation"
  nearest_physical_station?: string;
  distance_km?: number;
  pblh_meters?: number;
  inversion_risk?: 'Low' | 'Moderate' | 'High' | 'Severe Lid Collapse';
  hourlyHistory: HourlyPoint[];
}

export interface WindVector {
  lat: number;
  lng: number;
  u: number;
  v: number;
  speed: number;
  deg: number;
}

export interface InversionContour {
  lat: number;
  lng: number;
  inversePblh: number; // 1 / PBLH value multiplier
  radiusMeters: number;
  intensity: number; // 0 to 1
}

export interface TelemetryData {
  pblh_meters: number;
  inverse_pblh: number;
  wind_speed_ms: number;
  wind_direction_deg: number;
  wind_direction_cardinal: string;
  stagnation_index: 'Low' | 'Moderate' | 'High' | 'Critical Stagnation';
  peak_spike_window: {
    isPeak: boolean;
    startLabel: string;
    endLabel: string;
    description: string;
  };
}

export interface ForecastRisk {
  title: string;
  risk_level: 'High' | 'Severe' | 'Moderate';
  window: string;
  primary_drivers: string[];
}

export interface ExpectedImpact {
  pm25_trend: string;
  dispersion: string;
  inversion: string;
  regional_transport: string;
}

export interface RecommendedConsiderations {
  authorities: string[];
  public: string[];
}

export interface PolicyDirective {
  id: string;
  category: 'transportation' | 'industrial' | 'civic';
  categoryTitle: string;
  title: string;
  description: string;
  targetedZones: string[];
}

export interface PolicyAdvisory {
  title: string;
  forecastRisk: ForecastRisk;
  expectedImpact: ExpectedImpact;
  aiExplanation: string;
  recommendedConsiderations: RecommendedConsiderations;
  basisOfAssessment: string[];
  atmospheric_trigger: string;
  affected_population_est: string;
  recommended_stage?: string;
  advisory_text?: string;
  directives?: PolicyDirective[];
}

export interface RegionalFireSpot {
  id: string;
  name: string; // e.g. "NW Regional Fire / Stubble Activity Zone"
  lat: number;
  lng: number;
  intensity: 'Moderate' | 'High' | 'Severe';
  activeFiresCount: number;
  description: string;
}

export interface PollutionPlumeState {
  horizonLabel: string; // e.g. "T+0", "T+6h", "T+12h", "T+24h", "T+48h", "T+72h"
  sourceName: string; // e.g. "North-Western Regional Fire Activity"
  transportDirection: string; // e.g. "NW → SE"
  windSpeedMs: number;
  affectedRegion: string;
  transportStatus: string;
  plumeCenter: [number, number];
  plumeRadiusMeters: number;
  plumeIntensity: number; // 0 to 1
  plumePath: [number, number][];
}

export interface HourlyTimelineStep {
  timestamp: string;
  formattedTime: string;
  isForecast: boolean;
  telemetry: TelemetryData;
  nodeValues: Record<string, { pm25: number; aqi: number }>;
  windVectors: WindVector[];
  contours: InversionContour[];
  plumeState: PollutionPlumeState;
}

export interface MapLayerConfig {
  showPhysical: boolean;
  showVirtual: boolean;
  showPblhContours: boolean;
  showWindVectors: boolean;
  showRegionalFires: boolean;
  showPollutionPlume: boolean;
  viewMode: ViewMode;
}

export interface RegionConfig {
  id: RegionId;
  name: string;
  subTitle: string;
  center: [number, number];
  zoom: number;
}


