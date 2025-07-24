
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  className, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      {/* Track Container */}
      <div className={cn('relative', sizeClasses[size])}>
        {/* Main Track Circle */}
        <div className="absolute inset-0 rounded-full bg-pacers-blue border-4 border-pacers-blue">
          {/* Lane Markings */}
          <div className="absolute inset-2 rounded-full border-2 border-white border-dashed opacity-60"></div>
          <div className="absolute inset-4 rounded-full border-2 border-white border-dashed opacity-40"></div>
          <div className="absolute inset-6 rounded-full border-2 border-white border-dashed opacity-30"></div>
          <div className="absolute inset-8 rounded-full border-2 border-white border-dashed opacity-20"></div>
        </div>
        
        {/* Animated Runner Dot */}
        <div className="absolute inset-0 animate-spin">
          <div className="relative w-full h-full">
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-pacers-accent rounded-full shadow-lg animate-pulse"></div>
          </div>
        </div>
      </div>
      
      {/* Loading Text */}
      <p className="mt-4 text-sm text-muted-foreground font-medium">
        Warming up the track…
      </p>
    </div>
  );
};

export default LoadingSpinner;
