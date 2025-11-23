import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'neon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Badge Component - Estilo moderno refero.design
 */
export default function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className 
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-800/50 text-gray-300 border-gray-700',
    success: 'bg-techno-neon-green/20 text-techno-neon-green border-techno-neon-green/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    info: 'bg-techno-azure/20 text-techno-azure border-techno-azure/30',
    neon: 'bg-techno-neon-green text-black border-techno-neon-green shadow-lg shadow-techno-neon-green/50',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

