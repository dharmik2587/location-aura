import { motion } from 'framer-motion';
import { type UseCase, useCaseConfigs } from '@/data/syntheticData';

interface UseCaseSelectorProps {
  selected: UseCase;
  onChange: (useCase: UseCase) => void;
}

const UseCaseSelector = ({ selected, onChange }: UseCaseSelectorProps) => {
  const cases = Object.values(useCaseConfigs);

  return (
    <div className="flex flex-wrap gap-2">
      {cases.map((uc) => (
        <button
          key={uc.id}
          onClick={() => onChange(uc.id)}
          className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
            selected === uc.id
              ? 'bg-primary/15 border-primary/50 text-primary'
              : 'bg-secondary/50 border-border/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          {selected === uc.id && (
            <motion.div
              layoutId="usecase-indicator"
              className="absolute inset-0 rounded-lg border border-primary/30 glow-border"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            <span>{uc.icon}</span>
            <span>{uc.name}</span>
          </span>
        </button>
      ))}
    </div>
  );
};

export default UseCaseSelector;
