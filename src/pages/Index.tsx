
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Dumbbell, TrendingUp, Flame, Clock, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PageContainer from '@/components/layout/PageContainer';
import StatCard from '@/components/ui-custom/StatCard';
import ProgressCircle from '@/components/ui-custom/ProgressCircle';
import WorkoutCard from '@/components/ui-custom/WorkoutCard';
import GenerateWorkoutButton from '@/components/ui-custom/GenerateWorkoutButton';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { fetchUserWorkouts, type FitnessProfile, type Workout } from '@/services/workoutService';

const Index = () => {
  const { user } = useAuth();
  const [fitnessProfile, setFitnessProfile] = useState<FitnessProfile | null>(null);
  const [userWorkouts, setUserWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch fitness profile
      const { data, error } = await supabase
        .from('fitness_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        // Type assertion to ensure type compatibility
        setFitnessProfile(data as unknown as FitnessProfile);
      }

      // Fetch user workouts
      const workouts = await fetchUserWorkouts(user.id);
      setUserWorkouts(workouts);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user data."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center h-[50vh]">
          <p>Loading dashboard data...</p>
        </div>
      </PageContainer>
    );
  }

  // Use real workouts from the user if available, or show a message to generate one
  const recommendedWorkouts = userWorkouts.slice(0, 2);

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        {/* Header with greeting */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Hello, {user?.email?.split('@')[0] || 'User'}</h1>
            <p className="text-muted-foreground">{currentDate}</p>
          </div>
          <ProgressCircle 
            value={0} 
            max={7} 
            size="sm" 
            label="Week" 
            color="cyan" 
          />
        </div>

        {/* Daily goal section */}
        <Card className="bg-card border-border p-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-lg font-bold mb-1">Today's Target</h2>
              <p className="text-muted-foreground text-sm">
                {fitnessProfile?.workout_duration 
                  ? `${fitnessProfile.workout_duration} minute workout` 
                  : '30 minute workout'}
              </p>
            </div>
            <div className="flex gap-4 flex-wrap justify-center">
              <Button className="bg-neon-pink hover:bg-neon-pink/80 text-white">
                Start Workout
              </Button>
              <Button variant="outline" className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10">
                See Plan
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            title="Streak" 
            value="0" 
            icon={<Trophy className="w-4 h-4" />}
            color="pink" 
            trend="neutral" 
            trendValue="Start your streak" 
          />
          <StatCard 
            title="Workouts" 
            value="0" 
            icon={<Dumbbell className="w-4 h-4" />}
            color="cyan" 
            trend="neutral" 
            trendValue="No workouts yet" 
          />
          <StatCard 
            title="Calories" 
            value="0" 
            icon={<Flame className="w-4 h-4" />}
            color="green" 
            trend="neutral" 
            trendValue="No calories burned yet" 
          />
          <StatCard 
            title="Total Time" 
            value="0 min" 
            icon={<Clock className="w-4 h-4" />}
            color="yellow" 
            trend="neutral" 
            trendValue="No workout time yet" 
          />
        </div>

        {/* Recommended workouts or generate button */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Workout Plan</h2>
            <Link to="/workouts" className="text-sm text-neon-cyan hover:text-neon-cyan/80">
              View All
            </Link>
          </div>
          
          {recommendedWorkouts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedWorkouts.map((workout, index) => (
                <WorkoutCard
                  key={workout.id}
                  id={workout.id}
                  title={workout.title}
                  description={workout.description}
                  duration={workout.duration}
                  exerciseCount={workout.exerciseCount}
                  caloriesBurn={workout.caloriesBurn}
                  level={workout.level}
                  color={index % 2 === 0 ? 'pink' : 'cyan'}
                />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <h3 className="text-lg font-medium mb-2">No Workout Plan Yet</h3>
              <p className="text-muted-foreground mb-4">
                Generate a personalized workout plan based on your fitness profile.
              </p>
              <div className="flex justify-center">
                <GenerateWorkoutButton 
                  fitnessProfile={fitnessProfile} 
                  onSuccess={loadUserData}
                />
              </div>
            </Card>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/workouts" className="data-card flex flex-col items-center border-neon-pink/20 bg-gradient-to-br from-neon-pink/10 to-transparent">
            <Dumbbell className="w-8 h-8 mb-2 text-neon-pink" />
            <span className="text-sm font-medium">Browse Workouts</span>
          </Link>
          <Link to="/progress" className="data-card flex flex-col items-center border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/10 to-transparent">
            <TrendingUp className="w-8 h-8 mb-2 text-neon-cyan" />
            <span className="text-sm font-medium">View Progress</span>
          </Link>
          <Link to="/profile" className="data-card flex flex-col items-center border-neon-green/20 bg-gradient-to-br from-neon-green/10 to-transparent">
            <Calendar className="w-8 h-8 mb-2 text-neon-green" />
            <span className="text-sm font-medium">Schedule</span>
          </Link>
          <Link to="/profile" className="data-card flex flex-col items-center border-neon-yellow/20 bg-gradient-to-br from-neon-yellow/10 to-transparent">
            <Trophy className="w-8 h-8 mb-2 text-neon-yellow" />
            <span className="text-sm font-medium">Achievements</span>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};

export default Index;
