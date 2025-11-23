import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardAnimatedProps {
  children: ReactNode;
  variant?: 'glow' | 'tilt' | 'float' | 'border';
  className?: string;
  onClick?: () => void;
}

export default function CardAnimated({ 
  children, 
  variant = 'glow',
  className,
  onClick 
}: CardAnimatedProps) {
  const baseClasses = 'relative bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 transition-all duration-300';
  
  const variantClasses = {
    glow: 'hover:shadow-lg hover:shadow-techno-neon-green/20 hover:border-techno-neon-green/50 border border-gray-700 hover:border-techno-neon-green',
    tilt: 'hover:rotate-1 hover:scale-105 border border-gray-700 hover:border-techno-azure',
    float: 'hover:-translate-y-2 hover:shadow-xl hover:shadow-techno-purple/20 border border-gray-700',
    border: 'border-2 border-transparent hover:border-techno-azure bg-gradient-to-br from-gray-800 to-gray-900',
  };

  return (
    <div
      onClick={onClick}
      className={cn(baseClasses, variantClasses[variant], className, onClick && 'cursor-pointer')}
    >
      {children}
    </div>
  );
}

