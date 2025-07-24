import React from 'react';

interface QuickLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const QuickLoader: React.FC<QuickLoaderProps> = ({ 
  message = 'Cargando...', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <div 
          className={`${sizeClasses[size]} border-2 border-neon-mint border-t-transparent rounded-full animate-spin mx-auto mb-2`}
        />
        <p className="text-gray-light font-space text-xs">{message}</p>
      </div>
    </div>
  );
};

export default QuickLoader; 