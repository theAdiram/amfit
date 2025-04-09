
export interface Workout {
  id: string;
  title: string;
  description: string;
  duration: number;
  exerciseCount: number;
  caloriesBurn: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: number;
  sets: number;
  reps: number;
  restTime: number;
  imageUrl?: string;
}

export interface UserProfile {
  name: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  preferredWorkoutDuration: number; // in minutes
  workoutsCompleted: number;
  streakDays: number;
  totalWorkoutTime: number; // in minutes
}

export interface ProgressData {
  dates: string[];
  workouts: number[];
  caloriesBurned: number[];
  workoutTime: number[];
}

export const mockWorkouts: Workout[] = [
  {
    id: "w1",
    title: "Full Body Blast",
    description: "A comprehensive full-body workout targeting major muscle groups for balanced strength development.",
    duration: 30,
    exerciseCount: 8,
    caloriesBurn: 250,
    level: "beginner",
    exercises: [
      {
        id: "e1",
        name: "Push-ups",
        description: "Standard push-ups targeting chest, shoulders, and triceps.",
        duration: 60,
        sets: 3,
        reps: 10,
        restTime: 30
      },
      {
        id: "e2",
        name: "Bodyweight Squats",
        description: "Classic squats to strengthen quads, hamstrings, and glutes.",
        duration: 60,
        sets: 3,
        reps: 15,
        restTime: 30
      },
      {
        id: "e3",
        name: "Mountain Climbers",
        description: "Dynamic exercise engaging core and building cardiovascular endurance.",
        duration: 45,
        sets: 3,
        reps: 20,
        restTime: 30
      }
    ]
  },
  {
    id: "w2",
    title: "HIIT Cardio Burn",
    description: "High-intensity interval training to maximize calorie burn in minimal time.",
    duration: 25,
    exerciseCount: 6,
    caloriesBurn: 300,
    level: "intermediate",
    exercises: [
      {
        id: "e4",
        name: "Jumping Jacks",
        description: "Full-body exercise to elevate heart rate and warm up muscles.",
        duration: 30,
        sets: 4,
        reps: 30,
        restTime: 15
      },
      {
        id: "e5",
        name: "Burpees",
        description: "Compound exercise combining squat, plank, push-up, and jump.",
        duration: 30,
        sets: 4,
        reps: 12,
        restTime: 15
      },
      {
        id: "e6",
        name: "High Knees",
        description: "Running in place with knees raised to chest height.",
        duration: 30,
        sets: 4,
        reps: 40,
        restTime: 15
      }
    ]
  },
  {
    id: "w3",
    title: "Core Crusher",
    description: "Targeted core workout to strengthen abdominals and improve stability.",
    duration: 20,
    exerciseCount: 5,
    caloriesBurn: 180,
    level: "beginner",
    exercises: [
      {
        id: "e7",
        name: "Planks",
        description: "Isometric core exercise strengthening abdominals and back.",
        duration: 45,
        sets: 3,
        reps: 1,
        restTime: 30
      },
      {
        id: "e8",
        name: "Crunches",
        description: "Classic abdominal exercise targeting upper abs.",
        duration: 60,
        sets: 3,
        reps: 20,
        restTime: 30
      },
      {
        id: "e9",
        name: "Russian Twists",
        description: "Seated rotation exercise for obliques and core.",
        duration: 45,
        sets: 3,
        reps: 16,
        restTime: 30
      }
    ]
  },
  {
    id: "w4",
    title: "Power Legs",
    description: "Lower body-focused workout to build strength and power in legs.",
    duration: 35,
    exerciseCount: 7,
    caloriesBurn: 270,
    level: "advanced",
    exercises: [
      {
        id: "e10",
        name: "Jump Squats",
        description: "Explosive plyometric variation of squats.",
        duration: 45,
        sets: 4,
        reps: 15,
        restTime: 45
      },
      {
        id: "e11",
        name: "Lunges",
        description: "Single-leg exercise targeting quads, hamstrings, and glutes.",
        duration: 60,
        sets: 3,
        reps: 12,
        restTime: 30
      },
      {
        id: "e12",
        name: "Calf Raises",
        description: "Isolation exercise for calf muscles.",
        duration: 45,
        sets: 3,
        reps: 20,
        restTime: 30
      }
    ]
  }
];

export const mockUserProfile: UserProfile = {
  name: "Alex Johnson",
  age: 28,
  height: 175,
  weight: 70,
  fitnessLevel: "intermediate",
  goals: ["Weight loss", "Muscle tone", "Improved endurance"],
  preferredWorkoutDuration: 30,
  workoutsCompleted: 24,
  streakDays: 5,
  totalWorkoutTime: 720
};

export const mockProgressData: ProgressData = {
  dates: [
    "2023-04-01", "2023-04-02", "2023-04-03", "2023-04-04", 
    "2023-04-05", "2023-04-06", "2023-04-07"
  ],
  workouts: [1, 1, 0, 1, 1, 0, 1],
  caloriesBurned: [250, 300, 0, 270, 180, 0, 250],
  workoutTime: [30, 25, 0, 35, 20, 0, 30]
};
