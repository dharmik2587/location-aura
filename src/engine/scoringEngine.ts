import { geoLayers, type UseCase, useCaseConfigs, type GeoPoint } from '@/data/syntheticData';

export interface ScoreBreakdown {
  demographics: number;
  transportation: number;
  poi: number;
  landuse: number;
  environmental: number;
}

export interface SiteScore {
  total: number;
  breakdown: ScoreBreakdown;
  details: {
    nearestPopDensity: number;
    nearestIncome: number;
    transportScore: number;
    competitorCount: number;
    zoningMatch: boolean;
    floodRisk: number;
    airQuality: number;
    catchmentPopulation: number;
  };
  label: string;
  color: string;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distanceDecay(distance: number, maxDist: number): number {
  if (distance >= maxDist) return 0;
  return Math.max(0, 1 - (distance / maxDist) ** 1.5);
}

function getNearbyPoints(lat: number, lng: number, layerId: string, maxDist: number): { point: GeoPoint; dist: number }[] {
  const layer = geoLayers.find(l => l.id === layerId);
  if (!layer) return [];
  return layer.points
    .map(p => ({ point: p, dist: haversineDistance(lat, lng, p.lat, p.lng) }))
    .filter(p => p.dist <= maxDist)
    .sort((a, b) => a.dist - b.dist);
}

function scoreDemographics(lat: number, lng: number, config: typeof useCaseConfigs.retail): number {
  const nearby = getNearbyPoints(lat, lng, 'demographics', 5);
  if (nearby.length === 0) return 20;

  let score = 0;
  let totalWeight = 0;

  for (const { point, dist } of nearby) {
    const w = distanceDecay(dist, 5);
    const popDensity = point.properties.population_density as number;
    const income = point.properties.median_income as number;

    const popScore = Math.min(100, (popDensity / config.thresholds.minPopDensity) * 50);
    const incomeScore = Math.min(100, (income / 600000) * 60);

    score += (popScore * 0.6 + incomeScore * 0.4) * w;
    totalWeight += w;
  }

  return totalWeight > 0 ? Math.min(100, score / totalWeight) : 20;
}

function scoreTransportation(lat: number, lng: number): number {
  const nearby = getNearbyPoints(lat, lng, 'transportation', 8);
  if (nearby.length === 0) return 15;

  const highways = nearby.filter(n => n.point.properties.type === 'highway');
  const metro = nearby.filter(n => n.point.properties.type === 'metro');

  let score = 0;
  if (highways.length > 0) {
    const closest = highways[0];
    score += distanceDecay(closest.dist, 5) * 55;
  }
  if (metro.length > 0) {
    const closest = metro[0];
    score += distanceDecay(closest.dist, 3) * 45;
  }

  return Math.min(100, score + nearby.length * 3);
}

function scorePOI(lat: number, lng: number, config: typeof useCaseConfigs.retail): number {
  const nearby = getNearbyPoints(lat, lng, 'poi', 3);
  const competitorCount = nearby.length;
  const optimal = config.thresholds.optimalCompetitors;

  // Bell curve around optimal
  const diff = Math.abs(competitorCount - optimal);
  const competitorScore = Math.max(0, 100 - diff * 15);

  // Foot traffic bonus
  const avgTraffic = nearby.reduce((sum, n) => sum + (n.point.properties.foot_traffic as number), 0) / Math.max(1, nearby.length);
  const trafficScore = Math.min(100, (avgTraffic / 1000) * 50);

  return competitorScore * 0.6 + trafficScore * 0.4;
}

function scoreLandUse(lat: number, lng: number, config: typeof useCaseConfigs.retail): number {
  const nearby = getNearbyPoints(lat, lng, 'landuse', 3);
  if (nearby.length === 0) return 30;

  const closest = nearby[0];
  const zoning = closest.point.properties.zoning as string;
  const zoningMatch = config.thresholds.preferredZoning.includes(zoning);
  const buildable = closest.point.properties.buildable_area as number;
  const landValue = closest.point.properties.land_value_sqm as number;

  let score = zoningMatch ? 60 : 20;
  score += (buildable / 100) * 20;
  score += Math.max(0, 20 - (landValue / 80000) * 20);

  return Math.min(100, score);
}

function scoreEnvironmental(lat: number, lng: number, config: typeof useCaseConfigs.retail): number {
  const nearby = getNearbyPoints(lat, lng, 'environmental', 4);
  if (nearby.length === 0) return 60;

  const closest = nearby[0];
  const flood = closest.point.properties.flood_risk as number;
  const aqi = closest.point.properties.air_quality_index as number;
  const noise = closest.point.properties.noise_level_db as number;

  // Hard threshold: flood risk too high = penalty
  if (flood > config.thresholds.maxFloodRisk) return Math.max(5, 30 - flood * 40);

  let score = 100;
  score -= flood * 60;
  score -= Math.max(0, (aqi - 100) / 2);
  score -= Math.max(0, (noise - 60) / 2);

  return Math.max(0, Math.min(100, score));
}

export function calculateSiteScore(lat: number, lng: number, useCase: UseCase): SiteScore {
  const config = useCaseConfigs[useCase];
  const { weights } = config;

  const breakdown: ScoreBreakdown = {
    demographics: Math.round(scoreDemographics(lat, lng, config)),
    transportation: Math.round(scoreTransportation(lat, lng)),
    poi: Math.round(scorePOI(lat, lng, config)),
    landuse: Math.round(scoreLandUse(lat, lng, config)),
    environmental: Math.round(scoreEnvironmental(lat, lng, config)),
  };

  const total = Math.round(
    breakdown.demographics * weights.demographics +
    breakdown.transportation * weights.transportation +
    breakdown.poi * weights.poi +
    breakdown.landuse * weights.landuse +
    breakdown.environmental * weights.environmental
  );

  // Gather details
  const demoNearby = getNearbyPoints(lat, lng, 'demographics', 5);
  const envNearby = getNearbyPoints(lat, lng, 'environmental', 4);
  const poiNearby = getNearbyPoints(lat, lng, 'poi', 3);

  const nearestPopDensity = demoNearby[0]?.point.properties.population_density as number || 0;
  const nearestIncome = demoNearby[0]?.point.properties.median_income as number || 0;
  const floodRisk = envNearby[0]?.point.properties.flood_risk as number || 0;
  const airQuality = envNearby[0]?.point.properties.air_quality_index as number || 100;
  const catchmentPopulation = demoNearby.reduce((sum, n) => sum + (n.point.properties.households as number || 0) * 3.2, 0);

  let label: string;
  let color: string;
  if (total >= 75) { label = 'Excellent'; color = 'hsl(152, 72%, 48%)'; }
  else if (total >= 55) { label = 'Good'; color = 'hsl(167, 72%, 48%)'; }
  else if (total >= 35) { label = 'Moderate'; color = 'hsl(38, 92%, 55%)'; }
  else { label = 'Poor'; color = 'hsl(0, 72%, 55%)'; }

  return {
    total,
    breakdown,
    details: {
      nearestPopDensity: Math.round(nearestPopDensity),
      nearestIncome: Math.round(nearestIncome),
      transportScore: breakdown.transportation,
      competitorCount: poiNearby.length,
      zoningMatch: breakdown.landuse > 50,
      floodRisk: Math.round(floodRisk * 100) / 100,
      airQuality: Math.round(airQuality),
      catchmentPopulation: Math.round(catchmentPopulation),
    },
    label,
    color,
  };
}

// Generate hexagonal hotspot data
export function generateHotspots(useCase: UseCase): { lat: number; lng: number; score: number }[] {
  const hotspots: { lat: number; lng: number; score: number }[] = [];
  // Sample grid across Ahmedabad
  for (let lat = 22.95; lat <= 23.15; lat += 0.008) {
    for (let lng = 72.45; lng <= 72.70; lng += 0.008) {
      const score = calculateSiteScore(lat, lng, useCase);
      hotspots.push({ lat, lng, score: score.total });
    }
  }
  return hotspots;
}
