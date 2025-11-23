import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

/**
 * Glass Card - Efecto glassmorphism moderno inspirado en refero.design
 */
export default function GlassCard({ children, className, hover = true, glow = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10',
        'p-6 transition-all duration-300',
        hover && 'hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-techno-neon-green/10',
        glow && 'hover:shadow-[0_0_30px_rgba(57,255,20,0.3)]',
        className
      )}
    >
      {glow && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-techno-neon-green/0 via-techno-neon-green/10 to-techno-neon-green/0 opacity-0 hover:opacity-100 transition-opacity duration-500 blur-xl" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

