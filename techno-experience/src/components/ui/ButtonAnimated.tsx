import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ButtonAnimatedProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'asChild'> {
  variant?: 'neon' | 'glow' | 'slide' | 'ripple' | 'gradient';
  children: ReactNode;
  className?: string;
  to?: string;
}

export default function ButtonAnimated({ 
  variant = 'neon', 
  children, 
  className,
  to,
  ...props 
}: ButtonAnimatedProps) {
  const baseClasses = 'relative px-6 py-3 font-semibold rounded-lg transition-all duration-300 overflow-hidden min-h-[44px] flex items-center justify-center';
  
  const variantClasses = {
    neon: 'bg-techno-neon-green text-black hover:bg-techno-neon-green/90 hover:shadow-lg hover:shadow-techno-neon-green/50 active:scale-95',
    glow: 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 hover:shadow-xl hover:shadow-techno-purple/50 active:scale-95',
    slide: 'bg-gradient-to-r from-techno-purple to-techno-azure text-white hover:from-techno-azure hover:to-techno-purple active:scale-95',
    ripple: 'bg-techno-azure text-white hover:bg-techno-azure/90 active:scale-95',
    gradient: 'bg-gradient-to-r from-techno-neon-green via-techno-azure to-techno-purple text-white hover:shadow-lg hover:shadow-techno-purple/50 active:scale-95',
  };

  const buttonContent = variant === 'ripple' ? (
    <>
      <span className="relative z-10">{children}</span>
      <span 
        className="absolute inset-0 bg-white/20 rounded-full scale-0 animate-ripple"
        style={{
          animation: 'ripple 0.6s ease-out',
        }}
      />
    </>
  ) : children;

  const buttonClasses = cn(baseClasses, variantClasses[variant], className);

  if (to) {
    return (
      <Link to={to} className={buttonClasses}>
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      {...props}
      className={buttonClasses}
    >
      {buttonContent}
    </button>
  );
}
