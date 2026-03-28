import { geoLayers } from '@/data/syntheticData';

interface LayerToggleProps {
  activeLayers: string[];
  onToggle: (layerId: string) => void;
}

const LayerToggle = ({ activeLayers, onToggle }: LayerToggleProps) => {
  return (
    <div className="space-y-1">
      {geoLayers.map((layer) => {
        const active = activeLayers.includes(layer.id);
        return (
          <button
            key={layer.id}
            onClick={() => onToggle(layer.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all ${
              active
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
            }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all ${active ? 'scale-100' : 'scale-75 opacity-40'}`}
              style={{ backgroundColor: layer.color }}
            />
            <span className="text-xs">{layer.icon}</span>
            <span className="flex-1 text-left text-xs font-medium">{layer.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono">{layer.points.length}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LayerToggle;
