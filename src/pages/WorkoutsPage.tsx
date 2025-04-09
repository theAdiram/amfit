
import React, { useState, useEffect } from 'react';
import { Search, Filter, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/PageContainer';
import WorkoutCard from '@/components/ui-custom/WorkoutCard';
import GenerateWorkoutButton from '@/components/ui-custom/GenerateWorkoutButton';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { fetchUserWorkouts, type FitnessProfile, type Workout } from '@/services/workoutService';

const WorkoutsPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [userWorkouts, setUserWorkouts] = useState<Workout[]>([]);
  const [fitnessProfile, setFitnessProfile] = useState<FitnessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch the user's fitness profile
        const { data, error } = await supabase
          .from('fitness_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          setFitnessProfile(data as unknown as FitnessProfile);
        }

        // Fetch user workouts
        const workouts = await fetchUserWorkouts(user.id);
        setUserWorkouts(workouts);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load workouts."
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const filteredWorkouts = userWorkouts.filter(workout => 
    workout.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    workout.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const colorOptions = ['pink', 'cyan', 'green', 'yellow', 'purple'] as const;

  const handleRefresh = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const workouts = await fetchUserWorkouts(user.id);
      setUserWorkouts(workouts);
    } catch (error) {
      console.error('Error refreshing workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Workout Library</h1>
          <p className="text-muted-foreground">Find the perfect workout for your fitness goals</p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search workouts..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Loading workouts...</p>
          </div>
        ) : (
          <>
            {userWorkouts.length === 0 ? (
              <Card className="p-6 text-center">
                <h3 className="text-lg font-medium mb-2">No Workout Plans Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate a personalized workout plan based on your fitness profile.
                </p>
                <div className="flex justify-center">
                  <GenerateWorkoutButton 
                    fitnessProfile={fitnessProfile}
                    onSuccess={handleRefresh}
                  />
                </div>
              </Card>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Your Workouts</h2>
                  <GenerateWorkoutButton 
                    fitnessProfile={fitnessProfile}
                    onSuccess={handleRefresh}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredWorkouts.length > 0 ? (
                    filteredWorkouts.map((workout, index) => (
                      <WorkoutCard
                        key={workout.id}
                        id={workout.id}
                        title={workout.title}
                        description={workout.description}
                        duration={workout.duration}
                        exerciseCount={workout.exerciseCount}
                        caloriesBurn={workout.caloriesBurn}
                        level={workout.level}
                        color={colorOptions[index % colorOptions.length]}
                      />
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center">
                      <p className="text-muted-foreground">No workouts found matching your search.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
};

export default WorkoutsPage;
