
import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressCircleProps {
  value: number;
  max: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  color?: 'pink' | 'cyan' | 'green' | 'yellow' | 'purple';
  className?: string;
}

const ProgressCircle = ({
  value,
  max,
  size = 'md',
  label,
  color = 'pink',
  className,
}: ProgressCircleProps) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };
  
  const colorClasses = {
    pink: 'text-neon-pink',
    cyan: 'text-neon-cyan',
    green: 'text-neon-green',
    yellow: 'text-neon-yellow',
    purple: 'text-neon-purple',
  };
  
  const radius = size === 'sm' ? 28 : size === 'md' ? 44 : 60;
  const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 6 : 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className={cn('relative flex items-center justify-center', sizeClasses[size], className)}>
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={0}
          className="text-muted"
        />
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn('transition-all duration-500 ease-out', colorClasses[color])}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={cn('font-bold', {
          'text-xl': size === 'lg',
          'text-lg': size === 'md',
          'text-sm': size === 'sm',
        })}>
          {Math.round(percentage)}%
        </span>
        {label && (
          <span className="text-xs text-muted-foreground mt-1">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressCircle;
