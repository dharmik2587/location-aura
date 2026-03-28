import { type SiteScore } from '@/engine/scoringEngine';
import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: SiteScore;
}

const ScoreGauge = ({ score }: ScoreGaugeProps) => {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score.total / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
          <motion.circle
            cx="50" cy="50" r="45" fill="none"
            stroke={score.color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 8px ${score.color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold font-mono"
            style={{ color: score.color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {score.total}
          </motion.span>
          <span className="text-xs text-muted-foreground mt-0.5">/ 100</span>
        </div>
      </div>
      <motion.div
        className="mt-2 px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: `${score.color}20`, color: score.color }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {score.label}
      </motion.div>
    </div>
  );
};

export default ScoreGauge;
