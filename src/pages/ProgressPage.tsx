
import React, { useEffect, useState } from 'react';
import { Calendar, Activity, Dumbbell, Flame, ArrowUp, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageContainer from '@/components/layout/PageContainer';
import StatCard from '@/components/ui-custom/StatCard';
import ProgressCircle from '@/components/ui-custom/ProgressCircle';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface FitnessProfile {
  age: number | null;
  height: number | null;
  weight: number | null;
  fitness_level: string | null;
  goals: string[] | null;
  workout_duration: number | null;
  workout_frequency: number | null;
}

// In a real app, there would be proper workout logs with dates and metrics
// For now, we'll use placeholder data when no real data is available
const emptyChartData = Array(7).fill(0).map((_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - index));
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    calories: 0,
    time: 0,
    workouts: 0
  };
});

const ProgressPage = () => {
  const { user } = useAuth();
  const [fitnessProfile, setFitnessProfile] = useState<FitnessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(emptyChartData);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('fitness_profiles' as any)
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          // Type assertion to ensure type compatibility
          setFitnessProfile(data as unknown as FitnessProfile);
        }
      } catch (error: any) {
        console.error('Error fetching fitness profile:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center h-[50vh]">
          <p>Loading progress data...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Your Progress</h1>
          <p className="text-muted-foreground">Track your fitness journey</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            title="This Week" 
            value="0/7" 
            icon={<Calendar className="w-4 h-4" />}
            color="pink" 
            trend="neutral" 
            trendValue="No workouts yet" 
          />
          <StatCard 
            title="Avg. Active Time" 
            value="0 min" 
            icon={<Clock className="w-4 h-4" />}
            color="cyan" 
            trend="neutral" 
            trendValue="No workouts yet" 
          />
          <StatCard 
            title="Total Calories" 
            value="0" 
            icon={<Flame className="w-4 h-4" />}
            color="green" 
            trend="neutral" 
            trendValue="No workouts yet" 
          />
          <StatCard 
            title="Workouts" 
            value="0" 
            icon={<Dumbbell className="w-4 h-4" />}
            color="yellow" 
            trend="neutral" 
            trendValue="No workouts yet" 
          />
        </div>

        {/* Weekly overview */}
        <Card className="p-4 bg-card border-border">
          <h2 className="text-lg font-bold mb-4">Weekly Overview</h2>
          {chartData.length === 0 ? (
            <div className="flex justify-center items-center h-64 text-muted-foreground">
              No workout data available yet
            </div>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3C" />
                  <XAxis dataKey="date" stroke="#8884d8" />
                  <YAxis stroke="#8884d8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1A1A2E', 
                      borderColor: '#2A2A3C',
                      color: '#fff'
                    }} 
                  />
                  <Line type="monotone" dataKey="calories" stroke="#FF3CA4" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="time" stroke="#00E9FF" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Detailed metrics */}
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-card border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Workout Frequency</h3>
                <div className="w-full h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3C" />
                      <XAxis dataKey="date" stroke="#8884d8" />
                      <YAxis stroke="#8884d8" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1A1A2E', 
                          borderColor: '#2A2A3C',
                          color: '#fff'
                        }} 
                      />
                      <Bar dataKey="workouts" fill="#34FFB6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              
              <Card className="p-4 bg-card border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Calories Burned</h3>
                <div className="w-full h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3C" />
                      <XAxis dataKey="date" stroke="#8884d8" />
                      <YAxis stroke="#8884d8" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1A1A2E', 
                          borderColor: '#2A2A3C',
                          color: '#fff'
                        }} 
                      />
                      <Bar dataKey="calories" fill="#FF3CA4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
            
            <Card className="p-4 bg-card border-border">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-bold mb-2">Current Goal Progress</h3>
                  <p className="text-muted-foreground">
                    {fitnessProfile?.goals && fitnessProfile.goals.length > 0 
                      ? `Working towards: ${fitnessProfile.goals[0]}`
                      : 'No goals set yet'}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <div className="text-muted-foreground text-sm">
                      Start your first workout to track progress
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <ProgressCircle 
                    value={0} 
                    max={100} 
                    size="lg" 
                    label="Goal Completion" 
                    color="pink" 
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="monthly">
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No monthly data available yet</p>
            </Card>
          </TabsContent>
          
          <TabsContent value="yearly">
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No yearly data available yet</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default ProgressPage;
