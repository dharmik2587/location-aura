import { type SiteScore } from '@/engine/scoringEngine';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface ScoreRadarProps {
  score: SiteScore;
}

const layerLabels: Record<string, string> = {
  demographics: 'Demographics',
  transportation: 'Transport',
  poi: 'POI / Competition',
  landuse: 'Land Use',
  environmental: 'Environment',
};

const ScoreRadar = ({ score }: ScoreRadarProps) => {
  const data = Object.entries(score.breakdown).map(([key, value]) => ({
    layer: layerLabels[key] || key,
    score: value,
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="hsl(222, 30%, 18%)" />
        <PolarAngleAxis
          dataKey="layer"
          tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: 'hsl(215, 20%, 45%)', fontSize: 9 }}
          axisLine={false}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke={score.color}
          fill={score.color}
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default ScoreRadar;
