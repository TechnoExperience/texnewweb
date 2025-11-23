import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  text?: ReactNode;
  className?: string;
}

/**
 * Divider Component - Separador moderno
 */
export default function Divider({ 
  orientation = 'horizontal', 
  text,
  className 
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn('w-px h-full bg-gray-700', className)}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  if (text) {
    return (
      <div className={cn('flex items-center gap-4 my-6', className)}>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-gray-700" />
        <span className="text-sm text-gray-400">{text}</span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-700 to-gray-700" />
      </div>
    );
  }

  return (
    <div
      className={cn('h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent', className)}
      role="separator"
      aria-orientation="horizontal"
    />
  );
}

