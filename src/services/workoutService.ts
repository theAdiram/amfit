
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Exercise {
  id: string;
  name: string;
  description: string;
  sets: number;
  reps: number;
  duration: number;
  restTime: number;
}

export interface Workout {
  id: string;
  title: string;
  description: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  exerciseCount: number;
  caloriesBurn: number;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  workouts: Workout[];
}

export interface FitnessProfile {
  age: number | null;
  height: number | null;
  weight: number | null;
  fitness_level: string | null;
  goals: string[] | null;
  workout_duration: number | null;
  workout_frequency: number | null;
  limitations?: string[] | null;
  target_areas?: string[] | null;
}

export async function generateWorkoutPlan(fitnessProfile: FitnessProfile): Promise<WorkoutPlan | null> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-workout-plan', {
      body: { fitnessProfile },
    });

    if (error) {
      console.error('Error generating workout plan:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate workout plan. Please try again."
      });
      return null;
    }

    return data.workoutPlan;
  } catch (error) {
    console.error('Exception generating workout plan:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "An unexpected error occurred while generating your workout plan."
    });
    return null;
  }
}

export async function saveWorkoutPlan(workoutPlan: WorkoutPlan, userId: string): Promise<boolean> {
  try {
    // First, save the workout plan
    const { data: planData, error: planError } = await supabase
      .from('workout_plans')
      .insert({
        id: workoutPlan.id,
        user_id: userId,
        title: workoutPlan.title,
        description: workoutPlan.description,
      })
      .select();

    if (planError) {
      console.error('Error saving workout plan:', planError);
      throw planError;
    }

    // Then save each workout
    for (const workout of workoutPlan.workouts) {
      const { error: workoutError } = await supabase
        .from('workouts')
        .insert({
          id: workout.id,
          plan_id: workoutPlan.id,
          title: workout.title,
          description: workout.description,
          duration: workout.duration,
          level: workout.level,
          exercise_count: workout.exerciseCount,
          calories_burn: workout.caloriesBurn,
        });

      if (workoutError) {
        console.error('Error saving workout:', workoutError);
        throw workoutError;
      }

      // Finally save each exercise
      for (const exercise of workout.exercises) {
        const { error: exerciseError } = await supabase
          .from('exercises')
          .insert({
            id: exercise.id,
            workout_id: workout.id,
            name: exercise.name,
            description: exercise.description,
            sets: exercise.sets,
            reps: exercise.reps,
            duration: exercise.duration,
            rest_time: exercise.restTime,
          });

        if (exerciseError) {
          console.error('Error saving exercise:', exerciseError);
          throw exerciseError;
        }
      }
    }

    toast({
      title: "Success",
      description: "Your workout plan has been saved."
    });
    return true;
  } catch (error) {
    console.error('Error saving workout plan:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to save workout plan. Please try again."
    });
    return false;
  }
}

export async function fetchUserWorkouts(userId: string): Promise<Workout[]> {
  try {
    // Get the user's workout plans
    const { data: planData, error: planError } = await supabase
      .from('workout_plans')
      .select('id')
      .eq('user_id', userId);

    if (planError) {
      throw planError;
    }

    if (!planData || planData.length === 0) {
      return [];
    }

    const planIds = planData.map(plan => plan.id);
    
    // Get all workouts for the user's plans
    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select(`
        id, 
        title, 
        description, 
        duration, 
        level, 
        exercise_count, 
        calories_burn
      `)
      .in('plan_id', planIds);

    if (workoutsError) {
      throw workoutsError;
    }

    if (!workouts) {
      return [];
    }

    return workouts.map(w => ({
      id: w.id,
      title: w.title,
      description: w.description,
      duration: w.duration,
      level: w.level,
      exerciseCount: w.exercise_count,
      caloriesBurn: w.calories_burn,
      exercises: [] // We'll load exercises only when needed for the workout detail view
    }));
  } catch (error) {
    console.error('Error fetching user workouts:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load your workouts."
    });
    return [];
  }
}

export async function fetchWorkoutWithExercises(workoutId: string): Promise<Workout | null> {
  try {
    // Get the workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .select(`
        id, 
        title, 
        description, 
        duration, 
        level, 
        exercise_count, 
        calories_burn
      `)
      .eq('id', workoutId)
      .single();

    if (workoutError) {
      throw workoutError;
    }

    // Get the exercises for this workout
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select(`
        id,
        name,
        description,
        sets,
        reps,
        duration,
        rest_time
      `)
      .eq('workout_id', workoutId);

    if (exercisesError) {
      throw exercisesError;
    }

    if (!exercises) {
      return {
        id: workout.id,
        title: workout.title,
        description: workout.description,
        duration: workout.duration,
        level: workout.level,
        exerciseCount: workout.exercise_count,
        caloriesBurn: workout.calories_burn,
        exercises: []
      };
    }

    return {
      id: workout.id,
      title: workout.title,
      description: workout.description,
      duration: workout.duration,
      level: workout.level,
      exerciseCount: workout.exercise_count,
      caloriesBurn: workout.calories_burn,
      exercises: exercises.map(e => ({
        id: e.id,
        name: e.name,
        description: e.description,
        sets: e.sets,
        reps: e.reps,
        duration: e.duration,
        restTime: e.rest_time
      }))
    };
  } catch (error) {
    console.error('Error fetching workout details:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load workout details."
    });
    return null;
  }
}
