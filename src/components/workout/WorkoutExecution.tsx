import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Clock, ChevronRight, CheckCircle2, XCircle, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Exercise {
  id: string;
  name: string;
  description: string;
  sets: number;
  reps: number;
  duration: number;
  restTime: number;
}

interface WorkoutExecutionProps {
  exercises: Exercise[];
  onComplete: () => void;
  onClose: () => void;
  isOpen: boolean;
}

const WorkoutExecution: React.FC<WorkoutExecutionProps> = ({
  exercises,
  onComplete,
  onClose,
  isOpen,
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const [exerciseTimerActive, setExerciseTimerActive] = useState(false);

  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;
  const progress = ((currentExerciseIndex * 100) / totalExercises) + 
                  ((currentSet - 1) * (100 / totalExercises) / currentExercise?.sets);

  // Rest Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            setIsResting(false);
            toast({
              title: "Rest Complete",
              description: "Get ready for the next set!",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timer]);

  // Exercise Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (exerciseTimerActive && exerciseTimer > 0) {
      interval = setInterval(() => {
        setExerciseTimer((prev) => {
          if (prev <= 1) {
            setExerciseTimerActive(false);
            handleSetComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [exerciseTimerActive, exerciseTimer]);

  const startRest = () => {
    setTimer(currentExercise.restTime);
    setIsResting(true);
    setTimerActive(true);
    toast({
      title: "Rest Time",
      description: `Take a ${currentExercise.restTime} second break`,
    });
  };

  const startExercise = () => {
    if (currentExercise.duration > 0) {
      setExerciseTimer(currentExercise.duration);
      setExerciseTimerActive(true);
    }
  };

  const handleSetComplete = () => {
    setExerciseTimerActive(false);
    
    if (currentSet < currentExercise.sets) {
      setCurrentSet(currentSet + 1);
      startRest();
    } else {
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSet(1);
        toast({
          title: "Exercise Complete",
          description: "Great job! Moving to the next exercise.",
        });
      } else {
        onComplete();
        toast({
          title: "Workout Complete!",
          description: "Congratulations on completing your workout!",
        });
      }
    }
  };

  const skipRest = () => {
    setTimer(0);
    setTimerActive(false);
    setIsResting(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentExercise) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Exercise {currentExerciseIndex + 1} of {totalExercises}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <Progress value={progress} className="w-full" />
          
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{currentExercise.name}</h2>
            <p className="text-muted-foreground mb-4">{currentExercise.description}</p>
            
            <div className="flex justify-center gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-cyan">
                  {currentSet}/{currentExercise.sets}
                </div>
                <div className="text-sm text-muted-foreground">Sets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-pink">
                  {currentExercise.duration > 0 ? formatTime(exerciseTimer || currentExercise.duration) : currentExercise.reps}
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentExercise.duration > 0 ? 'Seconds' : 'Reps'}
                </div>
              </div>
              {isResting && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-neon-green">
                    {formatTime(timer)}
                  </div>
                  <div className="text-sm text-muted-foreground">Rest</div>
                </div>
              )}
            </div>

            {isResting ? (
              <div className="flex flex-col gap-2">
                <Button
                  className="w-full"
                  variant="outline"
                  disabled
                >
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Resting... {formatTime(timer)}
                </Button>
                <Button
                  className="w-full"
                  variant="ghost"
                  onClick={skipRest}
                >
                  Skip Rest
                </Button>
              </div>
            ) : currentExercise.duration > 0 ? (
              exerciseTimerActive ? (
                <Button
                  className="w-full"
                  variant="outline"
                  disabled
                >
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  {formatTime(exerciseTimer)} remaining...
                </Button>
              ) : (
                <Button
                  className="w-full bg-neon-cyan hover:bg-neon-cyan/80 text-black font-medium"
                  onClick={startExercise}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Timer
                </Button>
              )
            ) : (
              <Button
                className="w-full bg-neon-cyan hover:bg-neon-cyan/80 text-black font-medium"
                onClick={handleSetComplete}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete Set
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutExecution; 