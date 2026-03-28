import { type SiteScore } from '@/engine/scoringEngine';
import { motion, AnimatePresence } from 'framer-motion';
import ScoreGauge from './ScoreGauge';
import { X, MapPin } from 'lucide-react';

interface ComparedSite {
  lat: number;
  lng: number;
  score: SiteScore;
}

interface ComparisonPanelProps {
  sites: ComparedSite[];
  onRemove: (index: number) => void;
  onClose: () => void;
}

const layerLabels: Record<string, string> = {
  demographics: 'Demographics',
  transportation: 'Transport',
  poi: 'POI',
  landuse: 'Land Use',
  environmental: 'Environment',
};

const ComparisonPanel = ({ sites, onRemove, onClose }: ComparisonPanelProps) => {
  if (sites.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 200, opacity: 0 }}
        className="absolute bottom-0 left-0 right-0 glass-panel border-t border-border/50 z-[999] max-h-[40vh] overflow-y-auto"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Site Comparison ({sites.length})</h3>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary text-muted-foreground">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sites.map((site, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-3 relative"
              >
                <button
                  onClick={() => onRemove(i)}
                  className="absolute top-1 right-1 p-0.5 rounded hover:bg-secondary text-muted-foreground"
                >
                  <X size={12} />
                </button>

                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin size={10} className="text-primary" />
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Site {i + 1}
                  </span>
                </div>

                <div className="flex justify-center mb-2">
                  <div className="scale-75 origin-center">
                    <ScoreGauge score={site.score} />
                  </div>
                </div>

                <div className="space-y-1">
                  {Object.entries(site.score.breakdown).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-[10px] text-muted-foreground">{layerLabels[key]}</span>
                      <span className="text-[10px] font-mono text-foreground">{val}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ComparisonPanel;
