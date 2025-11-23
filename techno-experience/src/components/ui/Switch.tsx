import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Switch Component - Toggle moderno estilo refero.design
 */
export default function Switch({ 
  checked: controlledChecked, 
  onChange,
  label,
  disabled = false,
  size = 'md'
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = useState(false);
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;

  const handleToggle = () => {
    if (disabled) return;
    const newValue = !checked;
    if (!isControlled) {
      setInternalChecked(newValue);
    }
    onChange?.(newValue);
  };

  const sizes = {
    sm: 'w-8 h-4',
    md: 'w-11 h-6',
    lg: 'w-14 h-7',
  };

  const thumbSizes = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <label className="inline-flex items-center gap-3 cursor-pointer">
      {label && (
        <span className="text-sm text-gray-300">{label}</span>
      )}
      <div
        className={cn(
          'relative rounded-full transition-all duration-300',
          checked ? 'bg-techno-neon-green' : 'bg-gray-700',
          disabled && 'opacity-50 cursor-not-allowed',
          sizes[size]
        )}
        onClick={handleToggle}
      >
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 rounded-full bg-white transition-all duration-300 shadow-lg',
            checked ? 'translate-x-full' : 'translate-x-0.5',
            thumbSizes[size]
          )}
          style={{
            left: checked ? undefined : '2px',
            right: checked ? '2px' : undefined,
          }}
        />
      </div>
    </label>
  );
}

