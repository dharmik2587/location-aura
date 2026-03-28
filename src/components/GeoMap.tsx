import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMapEvents, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { geoLayers, AHMEDABAD_CENTER, type UseCase } from '@/data/syntheticData';
import { calculateSiteScore, type SiteScore } from '@/engine/scoringEngine';

interface GeoMapProps {
  activeLayers: string[];
  useCase: UseCase;
  onSiteClick: (lat: number, lng: number, score: SiteScore) => void;
  showHotspots: boolean;
}

function ClickHandler({ useCase, onSiteClick }: { useCase: UseCase; onSiteClick: GeoMapProps['onSiteClick'] }) {
  useMapEvents({
    click(e) {
      const score = calculateSiteScore(e.latlng.lat, e.latlng.lng, useCase);
      onSiteClick(e.latlng.lat, e.latlng.lng, score);
    },
  });
  return null;
}

function HotspotLayer({ useCase }: { useCase: UseCase }) {
  const map = useMap();
  const [hexagons, setHexagons] = useState<{ lat: number; lng: number; score: number }[]>([]);

  useEffect(() => {
    // Generate hotspot grid (reduced for performance)
    const spots: { lat: number; lng: number; score: number }[] = [];
    for (let lat = 22.96; lat <= 23.12; lat += 0.012) {
      for (let lng = 72.47; lng <= 72.68; lng += 0.012) {
        const score = calculateSiteScore(lat, lng, useCase);
        spots.push({ lat, lng, score: score.total });
      }
    }
    setHexagons(spots);
  }, [useCase]);

  return (
    <>
      {hexagons.map((h, i) => {
        const opacity = Math.max(0.05, (h.score / 100) * 0.5);
        const color = h.score >= 70 ? '#34d399' : h.score >= 50 ? '#22d3ee' : h.score >= 30 ? '#fbbf24' : '#f87171';
        return (
          <CircleMarker
            key={`hotspot-${i}`}
            center={[h.lat, h.lng]}
            radius={8}
            pathOptions={{
              fillColor: color,
              fillOpacity: opacity,
              stroke: false,
            }}
          />
        );
      })}
    </>
  );
}

const layerColors: Record<string, string> = {
  demographics: '#22d3ee',
  transportation: '#a78bfa',
  poi: '#fb923c',
  landuse: '#4ade80',
  environmental: '#f472b6',
};

const GeoMap = ({ activeLayers, useCase, onSiteClick, showHotspots }: GeoMapProps) => {
  return (
    <MapContainer
      center={AHMEDABAD_CENTER}
      zoom={12}
      className="w-full h-full"
      zoomControl={true}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        maxZoom={19}
      />

      <ClickHandler useCase={useCase} onSiteClick={onSiteClick} />

      {showHotspots && <HotspotLayer useCase={useCase} />}

      {activeLayers.map((layerId) => {
        const layer = geoLayers.find((l) => l.id === layerId);
        if (!layer) return null;
        const color = layerColors[layerId] || '#ffffff';

        return layer.points.map((point, i) => (
          <CircleMarker
            key={`${layerId}-${i}`}
            center={[point.lat, point.lng]}
            radius={layerId === 'demographics' ? 6 : 4}
            pathOptions={{
              fillColor: color,
              fillOpacity: 0.7,
              color: color,
              weight: 1,
              opacity: 0.4,
            }}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <div className="font-semibold text-foreground">{layer.name}</div>
                {Object.entries(point.properties).slice(0, 4).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <span className="text-muted-foreground">{k.replace(/_/g, ' ')}</span>
                    <span className="font-mono">{typeof v === 'number' ? v.toLocaleString() : v}</span>
                  </div>
                ))}
              </div>
            </Popup>
          </CircleMarker>
        ));
      })}
    </MapContainer>
  );
};

export default GeoMap;
