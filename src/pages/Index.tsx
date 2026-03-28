import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GeoMap from '@/components/GeoMap';
import ScorePanel from '@/components/ScorePanel';
import LayerToggle from '@/components/LayerToggle';
import UseCaseSelector from '@/components/UseCaseSelector';
import ComparisonPanel from '@/components/ComparisonPanel';
import { type UseCase, geoLayers } from '@/data/syntheticData';
import { type SiteScore } from '@/engine/scoringEngine';
import { exportPDF, exportCSV } from '@/utils/exportReport';
import { Layers, Eye, EyeOff, ChevronLeft, ChevronRight, Upload, Zap, BarChart3, Globe } from 'lucide-react';

interface SelectedSite {
  lat: number;
  lng: number;
  score: SiteScore;
}

const Index = () => {
  const [useCase, setUseCase] = useState<UseCase>('retail');
  const [activeLayers, setActiveLayers] = useState<string[]>(['demographics', 'transportation', 'poi']);
  const [selectedSite, setSelectedSite] = useState<SelectedSite | null>(null);
  const [comparedSites, setComparedSites] = useState<SelectedSite[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showHotspots, setShowHotspots] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLayerToggle = useCallback((layerId: string) => {
    setActiveLayers((prev) =>
      prev.includes(layerId) ? prev.filter((id) => id !== layerId) : [...prev, layerId]
    );
  }, []);

  const handleSiteClick = useCallback((lat: number, lng: number, score: SiteScore) => {
    setSelectedSite({ lat, lng, score });
  }, []);

  const handleExport = useCallback(() => {
    if (!selectedSite) return;
    exportPDF(selectedSite.lat, selectedSite.lng, selectedSite.score, useCase);
  }, [selectedSite, useCase]);

  const handleCompare = useCallback(() => {
    if (!selectedSite) return;
    setComparedSites((prev) => [...prev, selectedSite]);
    setShowComparison(true);
  }, [selectedSite]);

  

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full border-r border-border/50 bg-card/90 backdrop-blur-xl flex flex-col overflow-hidden z-10"
          >
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Globe size={14} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-foreground tracking-tight">GeoSpatial Analyzer</h1>
                  <p className="text-[10px] text-muted-foreground">Prama Innovations</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Use Case */}
              <div>
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Use Case</h3>
                <UseCaseSelector selected={useCase} onChange={setUseCase} />
              </div>

              {/* Data Layers */}
              <div>
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Layers size={10} />
                  Data Layers
                </h3>
                <LayerToggle activeLayers={activeLayers} onToggle={handleLayerToggle} />
              </div>

              {/* Hotspot Toggle */}
              <div>
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Zap size={10} />
                  Analysis
                </h3>
                <button
                  onClick={() => setShowHotspots(!showHotspots)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all ${
                    showHotspots
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary border border-transparent'
                  }`}
                >
                  {showHotspots ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span className="text-xs font-medium">Hot-Spot Detection</span>
                </button>
              </div>

              {/* Upload */}
              <div>
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Upload size={10} />
                  Load Data
                </h3>
                <div className="border-2 border-dashed border-border/50 rounded-lg p-4 text-center">
                  <Upload size={16} className="mx-auto text-muted-foreground mb-1.5" />
                  <p className="text-[10px] text-muted-foreground">Drop GeoJSON, Shapefile, or GeoTIFF</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">Using synthetic Ahmedabad data</p>
                </div>
              </div>
            </div>

            {/* Stats footer */}
            <div className="p-3 border-t border-border/50 bg-secondary/20">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Active points</span>
                <span className="text-[10px] font-mono text-primary">{activeLayers.reduce((sum, id) => {
                  const found = geoLayers.find((l) => l.id === id);
                  return sum + (found?.points.length || 0);
                }, 0)}</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-4 left-2 z-20 p-1.5 rounded-md glass-panel hover:bg-secondary text-muted-foreground"
        style={{ left: sidebarOpen ? 268 : 8 }}
      >
        {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Map area */}
      <div className="flex-1 relative">
        {/* Top bar */}
        <div className="absolute top-3 left-12 z-[500] glass-panel px-3 py-1.5 flex items-center gap-3">
          <BarChart3 size={12} className="text-primary" />
          <span className="text-[11px] text-muted-foreground">
            Click anywhere on the map to analyze site readiness
          </span>
          {selectedSite && (
            <span className="text-[11px] font-mono text-primary">
              Score: {selectedSite.score.total}
            </span>
          )}
        </div>

        <GeoMap
          activeLayers={activeLayers}
          useCase={useCase}
          onSiteClick={handleSiteClick}
          showHotspots={showHotspots}
        />

        {/* Score Panel */}
        <ScorePanel
          score={selectedSite?.score || null}
          lat={selectedSite?.lat || 0}
          lng={selectedSite?.lng || 0}
          onClose={() => setSelectedSite(null)}
          onExport={handleExport}
          onCompare={handleCompare}
        />

        {/* Comparison Panel */}
        {showComparison && (
          <ComparisonPanel
            sites={comparedSites}
            onRemove={(i) => setComparedSites((prev) => prev.filter((_, idx) => idx !== i))}
            onClose={() => {
              setShowComparison(false);
              setComparedSites([]);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
