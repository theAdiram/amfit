
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dumbbell, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { generateWorkoutPlan, saveWorkoutPlan, type FitnessProfile } from '@/services/workoutService';
import { toast } from '@/hooks/use-toast';

interface GenerateWorkoutButtonProps {
  fitnessProfile: FitnessProfile | null;
  onSuccess?: () => void;
}

const GenerateWorkoutButton = ({ fitnessProfile, onSuccess }: GenerateWorkoutButtonProps) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateWorkout = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to generate a workout plan."
      });
      return;
    }

    if (!fitnessProfile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Your fitness profile is incomplete. Please update your profile first."
      });
      return;
    }

    setIsGenerating(true);
    try {
      const workoutPlan = await generateWorkoutPlan(fitnessProfile);
      
      if (!workoutPlan) {
        throw new Error('Failed to generate workout plan');
      }
      
      const success = await saveWorkoutPlan(workoutPlan, user.id);
      
      if (success) {
        toast({
          title: "Success!",
          description: `Your personalized workout plan "${workoutPlan.title}" has been created.`
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error in handleGenerateWorkout:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create your workout plan. Please try again."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={handleGenerateWorkout} 
      disabled={isGenerating || !fitnessProfile}
      className="bg-neon-pink hover:bg-neon-pink/80 text-white"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating Plan
        </>
      ) : (
        <>
          <Dumbbell className="mr-2 h-4 w-4" />
          Generate Workout Plan
        </>
      )}
    </Button>
  );
};

export default GenerateWorkoutButton;
