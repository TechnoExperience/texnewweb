import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pulse' | 'spinner' | 'dots';
  className?: string;
}

export default function Loader({ size = 'md', variant = 'default', className }: LoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        <div className={cn('rounded-full bg-techno-neon-green animate-pulse', sizeClasses[size])} style={{ animationDelay: '0ms' }} />
        <div className={cn('rounded-full bg-techno-azure animate-pulse', sizeClasses[size])} style={{ animationDelay: '150ms' }} />
        <div className={cn('rounded-full bg-techno-purple animate-pulse', sizeClasses[size])} style={{ animationDelay: '300ms' }} />
      </div>
    );
  }

  if (variant === 'spinner') {
    return (
      <div className={cn('relative', className)}>
        <div className={cn('border-4 border-gray-700 border-t-techno-neon-green rounded-full animate-spin', sizeClasses[size])} />
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center gap-1.5', className)}>
        <div className={cn('rounded-full bg-techno-neon-green animate-bounce', size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3')} style={{ animationDelay: '0ms' }} />
        <div className={cn('rounded-full bg-techno-neon-green animate-bounce', size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3')} style={{ animationDelay: '150ms' }} />
        <div className={cn('rounded-full bg-techno-neon-green animate-bounce', size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3')} style={{ animationDelay: '300ms' }} />
      </div>
    );
  }

  // Default: Neon glow spinner
  return (
    <div className={cn('relative', className)}>
      <div className={cn('border-4 border-gray-800 border-t-techno-neon-green rounded-full animate-spin shadow-lg shadow-techno-neon-green/50', sizeClasses[size])} />
    </div>
  );
}

