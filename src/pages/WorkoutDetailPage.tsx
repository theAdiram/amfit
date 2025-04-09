import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Dumbbell, Flame, ChevronLeft, Play, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import PageContainer from '@/components/layout/PageContainer';
import WorkoutExecution from '@/components/workout/WorkoutExecution';
import { fetchWorkoutWithExercises, type Workout } from '@/services/workoutService';
import { toast } from '@/hooks/use-toast';

const WorkoutDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  
  useEffect(() => {
    const loadWorkout = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const workoutData = await fetchWorkoutWithExercises(id);
        setWorkout(workoutData);
      } catch (error) {
        console.error('Error loading workout:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load workout details."
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadWorkout();
  }, [id]);

  const handleStartWorkout = () => {
    setIsWorkoutStarted(true);
  };

  const handleWorkoutComplete = () => {
    setIsWorkoutStarted(false);
    // Here you can add logic to save workout progress
    toast({
      title: "Workout Completed",
      description: "Great job! Your progress has been saved.",
      variant: "default",
    });
  };
  
  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
        </div>
      </PageContainer>
    );
  }
  
  if (!workout) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Workout Not Found</h1>
          <Button variant="outline" onClick={() => navigate('/workouts')}>
            Back to Workouts
          </Button>
        </div>
      </PageContainer>
    );
  }
  
  const levelColorClasses = {
    beginner: 'text-neon-green',
    intermediate: 'text-neon-yellow',
    advanced: 'text-neon-pink',
  };
  
  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        <div className="flex items-center mb-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/workouts')} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{workout.title}</h1>
        </div>
        
        <div className="data-card border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/10 to-transparent">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-muted-foreground mb-4">{workout.description}</p>
              <div className="flex flex-wrap gap-4 justify-between">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-neon-cyan" />
                  <span>{workout.duration} min</span>
                </div>
                <div className="flex items-center">
                  <Dumbbell className="w-4 h-4 mr-2 text-neon-green" />
                  <span>{workout.exerciseCount} exercises</span>
                </div>
                <div className="flex items-center">
                  <Flame className="w-4 h-4 mr-2 text-neon-pink" />
                  <span>{workout.caloriesBurn} calories</span>
                </div>
                <div className="flex items-center">
                  <Info className="w-4 h-4 mr-2 text-neon-yellow" />
                  <span className={levelColorClasses[workout.level]}>
                    {workout.level.charAt(0).toUpperCase() + workout.level.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-2">
              <Button 
                className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-medium w-full sm:w-auto"
                onClick={handleStartWorkout}
              >
                <Play className="w-4 h-4 mr-2" /> Start Workout
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">Exercises</h2>
          <div className="flex flex-col gap-4">
            {workout.exercises.map((exercise, index) => (
              <div key={exercise.id} className="data-card">
                <div className="flex justify-between">
                  <h3 className="font-medium">{index + 1}. {exercise.name}</h3>
                  <span className="text-sm text-muted-foreground">
                    {exercise.sets} sets × {exercise.reps} {exercise.duration > 0 ? 'sec' : 'reps'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 mb-3">{exercise.description}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="data-card flex flex-col items-center">
                    <span className="text-muted-foreground mb-1">Sets</span>
                    <span className="text-neon-pink font-bold">{exercise.sets}</span>
                  </div>
                  <div className="data-card flex flex-col items-center">
                    <span className="text-muted-foreground mb-1">Reps/Time</span>
                    <span className="text-neon-cyan font-bold">
                      {exercise.reps} {exercise.duration > 0 ? 'sec' : ''}
                    </span>
                  </div>
                  <div className="data-card flex flex-col items-center">
                    <span className="text-muted-foreground mb-1">Rest</span>
                    <span className="text-neon-green font-bold">{exercise.restTime}s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {workout && (
        <WorkoutExecution
          exercises={workout.exercises}
          isOpen={isWorkoutStarted}
          onClose={() => setIsWorkoutStarted(false)}
          onComplete={handleWorkoutComplete}
        />
      )}
    </PageContainer>
  );
};

export default WorkoutDetailPage;
