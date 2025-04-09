
import React, { useEffect, useState } from 'react';
import { User, Settings, Calendar, Bell, BarChart2, Award, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PageContainer from '@/components/layout/PageContainer';
import ProgressCircle from '@/components/ui-custom/ProgressCircle';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserFitnessProfile {
  age: number | null;
  height: number | null;
  weight: number | null;
  fitness_level: string | null;
  goals: string[] | null;
  workout_duration: number | null;
  workout_frequency: number | null;
  workouts_completed?: number;
  streak_days?: number;
  total_workout_time?: number;
}

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const [fitnessProfile, setFitnessProfile] = useState<UserFitnessProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
        
        // If we have user data, set it with default stats for workout metrics
        // In a real app, these would come from a workout_logs table
        if (data) {
          // Create a new object instead of using spread to avoid type issues
          const profileWithStats: UserFitnessProfile = {
            ...(data as unknown as UserFitnessProfile),
            workouts_completed: 0,
            streak_days: 0,
            total_workout_time: 0
          };
          setFitnessProfile(profileWithStats);
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

  const handleSignOut = async () => {
    await signOut();
  };

  const menuItems = [
    { icon: <User className="w-5 h-5" />, label: 'Personal Information', href: '#' },
    { icon: <BarChart2 className="w-5 h-5" />, label: 'Fitness Goals', href: '#' },
    { icon: <Award className="w-5 h-5" />, label: 'Achievements', href: '#' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Workout Schedule', href: '#' },
    { icon: <Bell className="w-5 h-5" />, label: 'Notifications', href: '#' },
    { icon: <Settings className="w-5 h-5" />, label: 'App Settings', href: '#' },
  ];

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center h-[50vh]">
          <p>Loading profile data...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* Profile header */}
        <Card className="p-6 bg-card border-border">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-neon-cyan/30">
              <AvatarImage src="https://github.com/shadcn.png" alt={user?.email || 'User'} />
              <AvatarFallback className="text-2xl">{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold">{user?.email || 'User'}</h2>
              <p className="text-muted-foreground mb-4">
                {fitnessProfile?.fitness_level ? fitnessProfile.fitness_level.charAt(0).toUpperCase() + fitnessProfile.fitness_level.slice(1) : 'Beginner'} • 
                {fitnessProfile?.age ? `${fitnessProfile.age} years` : 'N/A'} • 
                {fitnessProfile?.height ? `${fitnessProfile.height} cm` : 'N/A'} • 
                {fitnessProfile?.weight ? `${fitnessProfile.weight} kg` : 'N/A'}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {fitnessProfile?.goals?.map((goal, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neon-pink/20 text-neon-pink"
                  >
                    {goal}
                  </span>
                )) || (
                  <span className="text-muted-foreground">No goals set</span>
                )}
              </div>
            </div>
            
            <div className="ml-auto hidden md:block">
              <Button variant="outline" className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10">
                Edit Profile
              </Button>
            </div>
          </div>
          
          <div className="mt-6 md:hidden">
            <Button variant="outline" className="w-full border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10">
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Stats overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 flex flex-col items-center justify-center bg-gradient-to-br from-neon-pink/10 to-transparent border-neon-pink/20">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Workouts</h3>
            <p className="text-3xl font-bold text-neon-pink">{fitnessProfile?.workouts_completed || 0}</p>
            <span className="text-xs text-muted-foreground">completed</span>
          </Card>
          
          <Card className="p-4 flex flex-col items-center justify-center bg-gradient-to-br from-neon-cyan/10 to-transparent border-neon-cyan/20">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Streak</h3>
            <p className="text-3xl font-bold text-neon-cyan">{fitnessProfile?.streak_days || 0}</p>
            <span className="text-xs text-muted-foreground">days</span>
          </Card>
          
          <Card className="p-4 flex flex-col items-center justify-center bg-gradient-to-br from-neon-green/10 to-transparent border-neon-green/20">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Duration</h3>
            <p className="text-3xl font-bold text-neon-green">{fitnessProfile?.total_workout_time || 0}</p>
            <span className="text-xs text-muted-foreground">minutes</span>
          </Card>
          
          <Card className="p-4 flex flex-col items-center justify-center bg-gradient-to-br from-neon-yellow/10 to-transparent border-neon-yellow/20">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Goal Progress</h3>
            <ProgressCircle value={0} max={100} size="sm" color="yellow" />
          </Card>
        </div>

        {/* Menu options */}
        <Card className="p-4 bg-card border-border">
          <div className="flex flex-col divide-y divide-border">
            {menuItems.map((item, index) => (
              <a 
                key={index}
                href={item.href}
                className="flex items-center py-3 px-2 hover:bg-secondary rounded-md transition-colors"
              >
                <span className="mr-3 text-muted-foreground">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
            
            <div className="pt-3">
              <Button 
                variant="destructive" 
                className="w-full flex items-center justify-center gap-2 mt-2"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default ProfilePage;
