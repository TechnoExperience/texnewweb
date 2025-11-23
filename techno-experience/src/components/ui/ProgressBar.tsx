import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'default' | 'gradient' | 'glow';
  className?: string;
  showLabel?: boolean;
}

export default function ProgressBar({ 
  value, 
  max = 100, 
  variant = 'default',
  className,
  showLabel = false 
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const variantClasses = {
    default: 'bg-techno-neon-green',
    gradient: 'bg-gradient-to-r from-techno-neon-green via-techno-azure to-techno-purple',
    glow: 'bg-techno-neon-green shadow-lg shadow-techno-neon-green/50',
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-gray-400 text-right">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

