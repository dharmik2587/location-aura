import { type SiteScore } from '@/engine/scoringEngine';
import { motion } from 'framer-motion';

interface ScoreDetailsProps {
  score: SiteScore;
}

const ScoreDetails = ({ score }: ScoreDetailsProps) => {
  const { details } = score;

  const items = [
    { label: 'Population Density', value: details.nearestPopDensity.toLocaleString(), unit: '/km²' },
    { label: 'Median Income', value: `₹${(details.nearestIncome / 100000).toFixed(1)}L`, unit: '' },
    { label: 'Catchment Pop.', value: details.catchmentPopulation.toLocaleString(), unit: '' },
    { label: 'Competitors Nearby', value: details.competitorCount.toString(), unit: '' },
    { label: 'Flood Risk', value: `${(details.floodRisk * 100).toFixed(0)}%`, unit: '', warn: details.floodRisk > 0.3 },
    { label: 'Air Quality (AQI)', value: details.airQuality.toString(), unit: '', warn: details.airQuality > 150 },
    { label: 'Zoning Match', value: details.zoningMatch ? '✓ Yes' : '✗ No', unit: '', good: details.zoningMatch },
  ];

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          className="flex items-center justify-between py-1.5 px-2 rounded-md bg-secondary/30"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <span className="text-xs text-muted-foreground">{item.label}</span>
          <span className={`text-xs font-mono font-medium ${
            item.warn ? 'text-glow-warning' : item.good ? 'text-glow-success' : 'text-foreground'
          }`}>
            {item.value}{item.unit}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export default ScoreDetails;
