
import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'pink' | 'cyan' | 'green' | 'yellow' | 'purple';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

const StatCard = ({
  title,
  value,
  icon,
  color = 'pink',
  trend,
  trendValue,
  className,
}: StatCardProps) => {
  const colorClasses = {
    pink: 'border-neon-pink/20 bg-gradient-to-br from-neon-pink/10 to-transparent',
    cyan: 'border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/10 to-transparent',
    green: 'border-neon-green/20 bg-gradient-to-br from-neon-green/10 to-transparent',
    yellow: 'border-neon-yellow/20 bg-gradient-to-br from-neon-yellow/10 to-transparent',
    purple: 'border-neon-purple/20 bg-gradient-to-br from-neon-purple/10 to-transparent',
  };

  const textColorClasses = {
    pink: 'text-neon-pink',
    cyan: 'text-neon-cyan',
    green: 'text-neon-green',
    yellow: 'text-neon-yellow',
    purple: 'text-neon-purple',
  };

  const trendClasses = {
    up: 'text-neon-green',
    down: 'text-neon-pink',
    neutral: 'text-gray-400',
  };

  return (
    <div className={cn(
      'data-card flex flex-col',
      colorClasses[color],
      className
    )}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && <div className={textColorClasses[color]}>{icon}</div>}
      </div>
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className={cn('text-2xl font-bold', textColorClasses[color])}>{value}</span>
          {trend && trendValue && (
            <span className={cn('text-xs font-medium', trendClasses[trend])}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
