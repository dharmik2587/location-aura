// Synthetic geospatial data for Ahmedabad metro area
// Center: 23.0225, 72.5714

export interface GeoPoint {
  lat: number;
  lng: number;
  properties: Record<string, number | string>;
}

export interface GeoLayer {
  id: string;
  name: string;
  icon: string;
  color: string;
  points: GeoPoint[];
  type: 'point' | 'heatmap' | 'polygon';
}

// Seeded random for reproducibility
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = seededRandom(42);

function randomInRange(min: number, max: number): number {
  return min + rng() * (max - min);
}

// Ahmedabad key areas with realistic density patterns
const ahmedabadZones = [
  { name: 'SG Highway', lat: 23.03, lng: 72.53, density: 0.9, income: 0.85, commercial: 0.9 },
  { name: 'Ashram Road', lat: 23.03, lng: 72.58, density: 0.85, income: 0.7, commercial: 0.8 },
  { name: 'CG Road', lat: 23.03, lng: 72.56, density: 0.8, income: 0.8, commercial: 0.85 },
  { name: 'Navrangpura', lat: 23.04, lng: 72.56, density: 0.75, income: 0.75, commercial: 0.7 },
  { name: 'Satellite', lat: 23.01, lng: 72.53, density: 0.85, income: 0.9, commercial: 0.75 },
  { name: 'Maninagar', lat: 22.99, lng: 72.60, density: 0.8, income: 0.5, commercial: 0.6 },
  { name: 'Bopal', lat: 23.03, lng: 72.47, density: 0.5, income: 0.8, commercial: 0.4 },
  { name: 'Chandkheda', lat: 23.11, lng: 72.59, density: 0.6, income: 0.5, commercial: 0.45 },
  { name: 'Vastrapur', lat: 23.04, lng: 72.53, density: 0.7, income: 0.85, commercial: 0.65 },
  { name: 'Paldi', lat: 23.01, lng: 72.57, density: 0.75, income: 0.6, commercial: 0.65 },
  { name: 'Gandhinagar', lat: 23.22, lng: 72.65, density: 0.4, income: 0.7, commercial: 0.5 },
  { name: 'Naroda', lat: 23.07, lng: 72.65, density: 0.65, income: 0.4, commercial: 0.5 },
  { name: 'Thaltej', lat: 23.05, lng: 72.50, density: 0.55, income: 0.85, commercial: 0.6 },
  { name: 'Gota', lat: 23.10, lng: 72.54, density: 0.5, income: 0.7, commercial: 0.35 },
  { name: 'Bapunagar', lat: 23.04, lng: 72.63, density: 0.7, income: 0.35, commercial: 0.4 },
];

function generateDemographics(): GeoPoint[] {
  const points: GeoPoint[] = [];
  for (const zone of ahmedabadZones) {
    const count = Math.floor(3 + rng() * 5);
    for (let i = 0; i < count; i++) {
      points.push({
        lat: zone.lat + randomInRange(-0.02, 0.02),
        lng: zone.lng + randomInRange(-0.02, 0.02),
        properties: {
          population_density: Math.round(zone.density * randomInRange(5000, 25000)),
          median_income: Math.round(zone.income * randomInRange(300000, 1200000)),
          avg_age: Math.round(randomInRange(24, 42)),
          households: Math.round(zone.density * randomInRange(500, 5000)),
          zone: zone.name,
        },
      });
    }
  }
  return points;
}

function generateTransportation(): GeoPoint[] {
  const points: GeoPoint[] = [];
  // Major roads / highway access points
  const highways = [
    { lat: 23.05, lng: 72.53, name: 'SG Highway Junction' },
    { lat: 23.02, lng: 72.58, name: 'Ashram Road NH-48' },
    { lat: 23.00, lng: 72.55, name: 'Ring Road South' },
    { lat: 23.08, lng: 72.58, name: 'SP Ring Road North' },
    { lat: 23.03, lng: 72.49, name: 'Sarkhej-Gandhinagar Highway' },
    { lat: 23.12, lng: 72.63, name: 'Ahmedabad-Mehsana Highway' },
    { lat: 23.06, lng: 72.68, name: 'Ahmedabad-Vadodara Expressway' },
    { lat: 22.97, lng: 72.60, name: 'NH-47 South Entry' },
  ];
  // Metro stations
  const metroStations = [
    { lat: 23.01, lng: 72.55, name: 'Apparel Park Metro' },
    { lat: 23.03, lng: 72.57, name: 'Paldi Metro' },
    { lat: 23.04, lng: 72.57, name: 'Shahpur Metro' },
    { lat: 23.06, lng: 72.58, name: 'Kalupur Metro' },
    { lat: 23.07, lng: 72.59, name: 'Vastral Metro' },
    { lat: 23.02, lng: 72.53, name: 'Doordarshan Metro' },
    { lat: 23.00, lng: 72.52, name: 'GNLU Metro' },
  ];

  for (const h of highways) {
    points.push({
      lat: h.lat + randomInRange(-0.003, 0.003),
      lng: h.lng + randomInRange(-0.003, 0.003),
      properties: {
        type: 'highway',
        name: h.name,
        traffic_index: Math.round(randomInRange(40, 95)),
        lanes: Math.round(randomInRange(4, 8)),
        daily_vehicles: Math.round(randomInRange(20000, 120000)),
      },
    });
  }
  for (const m of metroStations) {
    points.push({
      lat: m.lat,
      lng: m.lng,
      properties: {
        type: 'metro',
        name: m.name,
        daily_ridership: Math.round(randomInRange(5000, 40000)),
        connectivity_score: Math.round(randomInRange(50, 95)),
      },
    });
  }
  return points;
}

function generatePOI(): GeoPoint[] {
  const points: GeoPoint[] = [];
  const poiTypes = ['retail_store', 'restaurant', 'gas_station', 'ev_charger', 'mall', 'hospital', 'school', 'bank'];
  for (const zone of ahmedabadZones) {
    const count = Math.floor(zone.commercial * 8 + 2);
    for (let i = 0; i < count; i++) {
      points.push({
        lat: zone.lat + randomInRange(-0.015, 0.015),
        lng: zone.lng + randomInRange(-0.015, 0.015),
        properties: {
          type: poiTypes[Math.floor(rng() * poiTypes.length)],
          zone: zone.name,
          foot_traffic: Math.round(zone.commercial * randomInRange(100, 2000)),
          rating: Math.round(randomInRange(25, 50)) / 10,
        },
      });
    }
  }
  return points;
}

function generateLandUse(): GeoPoint[] {
  const points: GeoPoint[] = [];
  const landTypes = ['commercial', 'residential', 'industrial', 'mixed_use', 'institutional', 'open_space'];
  for (const zone of ahmedabadZones) {
    const count = Math.floor(2 + rng() * 4);
    for (let i = 0; i < count; i++) {
      const typeIdx = zone.commercial > 0.7 ? 0 : zone.commercial > 0.5 ? 3 : 1;
      points.push({
        lat: zone.lat + randomInRange(-0.018, 0.018),
        lng: zone.lng + randomInRange(-0.018, 0.018),
        properties: {
          zoning: landTypes[rng() > 0.6 ? typeIdx : Math.floor(rng() * landTypes.length)],
          land_value_sqm: Math.round(zone.income * randomInRange(15000, 80000)),
          buildable_area: Math.round(randomInRange(60, 95)),
          zone: zone.name,
        },
      });
    }
  }
  return points;
}

function generateEnvironmental(): GeoPoint[] {
  const points: GeoPoint[] = [];
  for (const zone of ahmedabadZones) {
    const count = Math.floor(2 + rng() * 3);
    for (let i = 0; i < count; i++) {
      const isNearRiver = zone.lng > 72.56 && zone.lng < 72.62;
      points.push({
        lat: zone.lat + randomInRange(-0.02, 0.02),
        lng: zone.lng + randomInRange(-0.02, 0.02),
        properties: {
          flood_risk: isNearRiver ? randomInRange(0.3, 0.8) : randomInRange(0, 0.2),
          earthquake_zone: randomInRange(0.1, 0.4),
          air_quality_index: Math.round(randomInRange(50, 200)),
          noise_level_db: Math.round(randomInRange(40, 80)),
          green_cover_pct: Math.round(randomInRange(5, 35)),
          zone: zone.name,
        },
      });
    }
  }
  return points;
}

export const geoLayers: GeoLayer[] = [
  {
    id: 'demographics',
    name: 'Demographics',
    icon: '👥',
    color: '#22d3ee',
    points: generateDemographics(),
    type: 'heatmap',
  },
  {
    id: 'transportation',
    name: 'Transportation',
    icon: '🚗',
    color: '#a78bfa',
    points: generateTransportation(),
    type: 'point',
  },
  {
    id: 'poi',
    name: 'Points of Interest',
    icon: '📍',
    color: '#fb923c',
    points: generatePOI(),
    type: 'point',
  },
  {
    id: 'landuse',
    name: 'Land Use & Zoning',
    icon: '🏗️',
    color: '#4ade80',
    points: generateLandUse(),
    type: 'polygon',
  },
  {
    id: 'environmental',
    name: 'Environmental Risk',
    icon: '🌿',
    color: '#f472b6',
    points: generateEnvironmental(),
    type: 'heatmap',
  },
];

export const AHMEDABAD_CENTER: [number, number] = [23.0225, 72.5714];

export type UseCase = 'retail' | 'warehouse' | 'ev_station' | 'telecom' | 'solar';

export interface UseCaseConfig {
  id: UseCase;
  name: string;
  icon: string;
  description: string;
  weights: {
    demographics: number;
    transportation: number;
    poi: number;
    landuse: number;
    environmental: number;
  };
  thresholds: {
    minPopDensity: number;
    maxFloodRisk: number;
    preferredZoning: string[];
    optimalCompetitors: number;
  };
}

export const useCaseConfigs: Record<UseCase, UseCaseConfig> = {
  retail: {
    id: 'retail',
    name: 'Retail Store',
    icon: '🏪',
    description: 'High foot traffic, affluent demographics, visible location',
    weights: { demographics: 0.30, transportation: 0.20, poi: 0.25, landuse: 0.15, environmental: 0.10 },
    thresholds: { minPopDensity: 5000, maxFloodRisk: 0.3, preferredZoning: ['commercial', 'mixed_use'], optimalCompetitors: 4 },
  },
  warehouse: {
    id: 'warehouse',
    name: 'Warehouse',
    icon: '🏭',
    description: 'Highway access, large parcels, industrial zoning',
    weights: { demographics: 0.10, transportation: 0.35, poi: 0.10, landuse: 0.30, environmental: 0.15 },
    thresholds: { minPopDensity: 1000, maxFloodRisk: 0.2, preferredZoning: ['industrial', 'open_space'], optimalCompetitors: 2 },
  },
  ev_station: {
    id: 'ev_station',
    name: 'EV Charging',
    icon: '⚡',
    description: 'High traffic corridors, underserved areas, good grid access',
    weights: { demographics: 0.20, transportation: 0.30, poi: 0.25, landuse: 0.10, environmental: 0.15 },
    thresholds: { minPopDensity: 3000, maxFloodRisk: 0.25, preferredZoning: ['commercial', 'mixed_use'], optimalCompetitors: 2 },
  },
  telecom: {
    id: 'telecom',
    name: 'Telecom Tower',
    icon: '📡',
    description: 'Coverage gaps, elevation, minimal obstructions',
    weights: { demographics: 0.25, transportation: 0.15, poi: 0.15, landuse: 0.20, environmental: 0.25 },
    thresholds: { minPopDensity: 2000, maxFloodRisk: 0.15, preferredZoning: ['industrial', 'open_space', 'institutional'], optimalCompetitors: 1 },
  },
  solar: {
    id: 'solar',
    name: 'Solar Farm',
    icon: '☀️',
    description: 'Open land, low shade, grid connectivity, minimal environmental risk',
    weights: { demographics: 0.05, transportation: 0.15, poi: 0.05, landuse: 0.35, environmental: 0.40 },
    thresholds: { minPopDensity: 500, maxFloodRisk: 0.1, preferredZoning: ['open_space', 'industrial'], optimalCompetitors: 0 },
  },
};
