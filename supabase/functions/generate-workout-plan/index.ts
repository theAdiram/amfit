
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0'
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0'

// Define CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Types matching our database schema
interface FitnessProfile {
  age: number | null
  height: number | null
  weight: number | null
  fitness_level: string | null
  goals: string[] | null
  workout_duration: number | null
  workout_frequency: number | null
  limitations?: string[] | null
  target_areas?: string[] | null
}

interface Exercise {
  id: string
  name: string
  description: string
  sets: number
  reps: number
  duration: number
  restTime: number
}

interface Workout {
  id: string
  title: string
  description: string
  duration: number
  level: 'beginner' | 'intermediate' | 'advanced'
  exerciseCount: number
  caloriesBurn: number
  exercises: Exercise[]
}

interface WorkoutPlan {
  id: string
  title: string
  description: string
  workouts: Workout[]
}

// This is needed for preflight requests
Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  // Get the authorization header
  const authorization = req.headers.get('Authorization')
  if (!authorization) {
    return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // Parse request body
    const { fitnessProfile } = await req.json()
    
    if (!fitnessProfile) {
      return new Response(JSON.stringify({ error: 'Missing fitness profile data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get workout plan from Gemini
    const workoutPlan = await generateWorkoutWithGemini(fitnessProfile)
    
    return new Response(JSON.stringify({ workoutPlan }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function generateWorkoutWithGemini(fitnessProfile: FitnessProfile): Promise<WorkoutPlan> {
  try {
    // Get Gemini API key from environment
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      throw new Error('Gemini API key not configured')
    }

    // Format fitness profile data for the prompt
    const age = fitnessProfile.age || 'unknown'
    const height = fitnessProfile.height || 'unknown'
    const weight = fitnessProfile.weight || 'unknown'
    const fitnessLevel = fitnessProfile.fitness_level || 'beginner'
    const goals = fitnessProfile.goals?.join(', ') || 'general fitness'
    const workoutDuration = fitnessProfile.workout_duration || 30
    const workoutFrequency = fitnessProfile.workout_frequency || 3
    const limitations = fitnessProfile.limitations?.join(', ') || 'none'
    const targetAreas = fitnessProfile.target_areas?.join(', ') || 'full body'

    // Create prompt for Gemini
    const prompt = `
    Generate a detailed, personalized workout plan for a person with the following characteristics:
    - Age: ${age}
    - Height: ${height} cm
    - Weight: ${weight} kg
    - Fitness Level: ${fitnessLevel}
    - Goals: ${goals}
    - Preferred Workout Duration: ${workoutDuration} minutes per session
    - Workout Frequency: ${workoutFrequency} times per week
    - Physical Limitations: ${limitations}
    - Target Areas: ${targetAreas}

    The workout plan should include:
    1. A title for the overall workout plan
    2. A brief description of the plan (1-2 sentences)
    3. ${workoutFrequency} different workouts, each with:
       - A unique title
       - A short description
       - Appropriate difficulty level (beginner, intermediate, or advanced)
       - Duration in minutes (around ${workoutDuration} minutes)
       - Estimated calories burned
       - 4-8 exercises per workout with:
         - Exercise name
         - Brief description of how to perform it
         - Number of sets
         - Number of reps or duration in seconds
         - Rest time between sets in seconds

    Format your response as a JSON object following this structure:
    {
      "title": "Plan title",
      "description": "Plan description",
      "workouts": [
        {
          "title": "Workout title",
          "description": "Workout description",
          "level": "beginner/intermediate/advanced",
          "duration": 30,
          "caloriesBurn": 300,
          "exercises": [
            {
              "name": "Exercise name",
              "description": "Exercise description",
              "sets": 3,
              "reps": 10,
              "duration": 0,
              "restTime": 30
            }
          ]
        }
      ]
    }

    Important:
    - For strength exercises, use reps (e.g., 10 reps) and set duration to 0
    - For timed exercises, use duration in seconds (e.g., 30 seconds) and set reps to 1
    - Make sure the exercises are appropriate for the person's fitness level and limitations
    - Include proper warm-up and cool-down exercises
    - Vary the exercises to target different muscle groups based on the goals
    - Only include the JSON in your response, nothing else
    `

    console.log("Sending request to Gemini API...")
    
    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        }),
      }
    )

    const data = await response.json()
    console.log("Received response from Gemini API")

    if (!response.ok) {
      console.error("Gemini API error:", data)
      throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`)
    }

    // Extract the content from Gemini's response
    const textContent = data.candidates[0]?.content?.parts[0]?.text
    if (!textContent) {
      throw new Error('No content in Gemini response')
    }

    // Extract JSON from the response (Gemini sometimes includes markdown code blocks)
    let jsonText = textContent
    if (textContent.includes('```json')) {
      jsonText = textContent.split('```json')[1].split('```')[0]
    } else if (textContent.includes('```')) {
      jsonText = textContent.split('```')[1].split('```')[0]
    }

    // Parse the JSON response
    const planData = JSON.parse(jsonText.trim())
    
    // Generate UUIDs for all entities
    const planId = uuidv4()
    
    // Map the response to our WorkoutPlan structure
    const workoutPlan: WorkoutPlan = {
      id: planId,
      title: planData.title,
      description: planData.description,
      workouts: planData.workouts.map((workout: any) => {
        const workoutId = uuidv4()
        return {
          id: workoutId,
          title: workout.title,
          description: workout.description,
          duration: workout.duration,
          level: workout.level,
          exerciseCount: workout.exercises.length,
          caloriesBurn: workout.caloriesBurn,
          exercises: workout.exercises.map((exercise: any) => ({
            id: uuidv4(),
            name: exercise.name,
            description: exercise.description,
            sets: exercise.sets,
            reps: exercise.reps,
            duration: exercise.duration,
            restTime: exercise.restTime
          }))
        }
      })
    }

    console.log(`Generated workout plan: ${workoutPlan.title} with ${workoutPlan.workouts.length} workouts`)
    return workoutPlan
  } catch (error) {
    console.error('Error generating workout plan with Gemini:', error)
    throw new Error(`Failed to generate workout plan: ${error.message}`)
  }
}
