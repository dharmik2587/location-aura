import { type SiteScore } from '@/engine/scoringEngine';
import { motion, AnimatePresence } from 'framer-motion';
import ScoreGauge from './ScoreGauge';
import ScoreRadar from './ScoreRadar';
import ScoreDetails from './ScoreDetails';
import { X, Download, MapPin } from 'lucide-react';

interface ScorePanelProps {
  score: SiteScore | null;
  lat: number;
  lng: number;
  onClose: () => void;
  onExport: () => void;
  onCompare: () => void;
}

const ScorePanel = ({ score, lat, lng, onClose, onExport, onCompare }: ScorePanelProps) => {
  if (!score) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute top-0 right-0 w-80 h-full glass-panel border-l border-border/50 overflow-y-auto z-[1000]"
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Site Analysis</h3>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary text-muted-foreground">
              <X size={16} />
            </button>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 mb-4 px-2 py-1.5 rounded-md bg-secondary/50">
            <MapPin size={12} className="text-primary" />
            <span className="text-xs font-mono text-muted-foreground">
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </span>
          </div>

          {/* Score Gauge */}
          <div className="flex justify-center mb-4">
            <ScoreGauge score={score} />
          </div>

          {/* Radar Chart */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Layer Breakdown</h4>
            <div className="glass-panel p-2">
              <ScoreRadar score={score} />
            </div>
          </div>

          {/* Score Bars */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Scores by Layer</h4>
            <div className="space-y-2">
              {Object.entries(score.breakdown).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-xs text-muted-foreground capitalize">{key}</span>
                    <span className="text-xs font-mono font-medium text-foreground">{value}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-secondary">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: value >= 70 ? 'hsl(var(--score-excellent))' : value >= 50 ? 'hsl(var(--score-good))' : value >= 30 ? 'hsl(var(--score-moderate))' : 'hsl(var(--score-poor))',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Key Metrics</h4>
            <ScoreDetails score={score} />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onExport}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <Download size={12} />
              Export Report
            </button>
            <button
              onClick={onCompare}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors border border-border/50"
            >
              Compare
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScorePanel;
