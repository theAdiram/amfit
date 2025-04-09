
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Dumbbell, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutCardProps {
  id: string;
  title: string;
  description: string;
  duration: number;
  exerciseCount: number;
  caloriesBurn: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  color?: 'pink' | 'cyan' | 'green' | 'yellow' | 'purple';
  className?: string;
}

const WorkoutCard = ({
  id,
  title,
  description,
  duration,
  exerciseCount,
  caloriesBurn,
  level,
  color = 'pink',
  className,
}: WorkoutCardProps) => {
  const colorClasses = {
    pink: 'border-neon-pink/20 bg-gradient-to-br from-neon-pink/10 to-transparent',
    cyan: 'border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/10 to-transparent',
    green: 'border-neon-green/20 bg-gradient-to-br from-neon-green/10 to-transparent',
    yellow: 'border-neon-yellow/20 bg-gradient-to-br from-neon-yellow/10 to-transparent',
    purple: 'border-neon-purple/20 bg-gradient-to-br from-neon-purple/10 to-transparent',
  };

  const levelBadgeColors = {
    beginner: 'bg-neon-green/20 text-neon-green',
    intermediate: 'bg-neon-yellow/20 text-neon-yellow',
    advanced: 'bg-neon-pink/20 text-neon-pink',
  };

  const textColorClasses = {
    pink: 'text-neon-pink',
    cyan: 'text-neon-cyan',
    green: 'text-neon-green',
    yellow: 'text-neon-yellow',
    purple: 'text-neon-purple',
  };

  return (
    <Link 
      to={`/workouts/${id}`}
      className={cn(
        'data-card flex flex-col transition-all duration-300 hover:scale-[1.02]',
        colorClasses[color],
        className
      )}
    >
      <div className="flex justify-between items-start">
        <h3 className={cn('text-lg font-bold mb-1', textColorClasses[color])}>{title}</h3>
        <span className={cn('text-xs px-2 py-0.5 rounded-full', levelBadgeColors[level])}>
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </span>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
      
      <div className="mt-auto flex justify-between text-xs text-muted-foreground">
        <div className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          <span>{duration} min</span>
        </div>
        <div className="flex items-center">
          <Dumbbell className="w-3 h-3 mr-1" />
          <span>{exerciseCount} exercises</span>
        </div>
        <div className="flex items-center">
          <Flame className="w-3 h-3 mr-1" />
          <span>{caloriesBurn} cal</span>
        </div>
      </div>
    </Link>
  );
};

export default WorkoutCard;
