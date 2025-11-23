import { InputHTMLAttributes, useState } from 'react';
import { cn } from '@/lib/utils';

interface InputAnimatedProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function InputAnimated({ 
  label, 
  error,
  className,
  ...props 
}: InputAnimatedProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = props.value && String(props.value).length > 0;

  return (
    <div className="relative w-full">
      {label && (
        <label
          className={cn(
            'absolute left-3 transition-all duration-300 pointer-events-none',
            focused || hasValue
              ? 'top-2 text-xs text-techno-neon-green'
              : 'top-1/2 -translate-y-1/2 text-sm text-gray-400'
          )}
        >
          {label}
        </label>
      )}
      <input
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        className={cn(
          'w-full px-3 pt-6 pb-2 bg-gray-800/50 border-2 rounded-lg text-white transition-all duration-300 outline-none min-h-[44px]',
          error
            ? 'border-red-500 focus:border-red-400'
            : focused
            ? 'border-techno-neon-green focus:border-techno-neon-green focus:shadow-lg focus:shadow-techno-neon-green/20'
            : 'border-gray-600 hover:border-gray-500',
          className
        )}
      />
      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
      {focused && !error && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-techno-neon-green to-techno-azure animate-slide-in" />
      )}
    </div>
  );
}

