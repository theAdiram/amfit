import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, User, Dumbbell, Ruler, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import PageContainer from '@/components/layout/PageContainer';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, setHasCompletedOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    // Personal info
    name: '',
    age: '',
    height: '',
    weight: '',
    gender: 'male',
    
    // Fitness goals
    fitnessLevel: 'beginner',
    goals: [] as string[],
    targetAreas: [] as string[],
    
    // Availability
    workoutDuration: 30,
    workoutFrequency: 3,
    preferredTime: 'morning',
    
    // Limitations
    limitations: [] as string[],
    preferences: [] as string[],
    notes: ''
  });
  
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field as keyof typeof prev] as string[], value]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
      }));
    }
  };
  
  const goToNextStep = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      await handleSubmit();
    }
  };
  
  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleSubmit = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to save your fitness profile."
      });
      navigate('/auth');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('fitness_profiles' as any)
        .insert({
          user_id: user.id,
          age: parseInt(formData.age) || null,
          height: parseInt(formData.height) || null,
          weight: parseInt(formData.weight) || null,
          gender: formData.gender,
          fitness_level: formData.fitnessLevel,
          goals: formData.goals,
          target_areas: formData.targetAreas,
          limitations: formData.limitations,
          workout_duration: formData.workoutDuration,
          workout_frequency: formData.workoutFrequency,
          preferred_time: formData.preferredTime
        });
      
      if (error) throw error;
      
      setHasCompletedOnboarding(true);
      
      toast({
        title: "Profile created!",
        description: "Your fitness profile has been saved. Let's start working out!"
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Error saving fitness profile:', error);
      toast({
        variant: "destructive",
        title: "Error saving profile",
        description: error.message || "There was an error saving your fitness profile."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return <PersonalInfoStep formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <FitnessGoalsStep formData={formData} updateFormData={updateFormData} handleCheckboxChange={handleCheckboxChange} />;
      case 3:
        return <AvailabilityStep formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <LimitationsStep formData={formData} updateFormData={updateFormData} handleCheckboxChange={handleCheckboxChange} />;
      default:
        return <PersonalInfoStep formData={formData} updateFormData={updateFormData} />;
    }
  };
  
  return (
    <PageContainer className="max-w-2xl mx-auto">
      <div className="flex flex-col gap-6">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold">Create Your Profile</h1>
          <p className="text-muted-foreground">Step {step} of {totalSteps}</p>
        </div>
        
        <div className="w-full bg-secondary h-2 rounded-full mb-6">
          <div 
            className="bg-gradient-to-r from-neon-pink to-neon-cyan h-full rounded-full transition-all duration-500"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
        
        <Card className="p-6 bg-card border-border">
          {renderStep()}
          
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <Button variant="outline" onClick={goToPreviousStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            ) : (
              <div></div>
            )}
            
            <Button onClick={goToNextStep} disabled={isSubmitting}>
              {step === totalSteps ? (isSubmitting ? 'Saving...' : 'Complete') : 'Continue'} 
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

interface StepProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  handleCheckboxChange?: (field: string, value: string, checked: boolean) => void;
}

const PersonalInfoStep = ({ formData, updateFormData }: StepProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <User className="text-neon-pink h-6 w-6" />
        <h2 className="text-xl font-bold">Personal Information</h2>
      </div>
      
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            placeholder="Enter your name" 
            value={formData.name}
            onChange={(e) => updateFormData('name', e.target.value)}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="age">Age</Label>
          <Input 
            id="age" 
            type="number" 
            placeholder="Enter your age" 
            value={formData.age}
            onChange={(e) => updateFormData('age', e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input 
              id="height" 
              type="number" 
              placeholder="Height in cm" 
              value={formData.height}
              onChange={(e) => updateFormData('height', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input 
              id="weight" 
              type="number" 
              placeholder="Weight in kg" 
              value={formData.weight}
              onChange={(e) => updateFormData('weight', e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label>Gender</Label>
          <RadioGroup 
            value={formData.gender} 
            onValueChange={(value) => updateFormData('gender', value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">Female</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">Other</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};

const FitnessGoalsStep = ({ formData, updateFormData, handleCheckboxChange }: StepProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Dumbbell className="text-neon-cyan h-6 w-6" />
        <h2 className="text-xl font-bold">Fitness Goals</h2>
      </div>
      
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Current Fitness Level</Label>
          <RadioGroup 
            value={formData.fitnessLevel}
            onValueChange={(value) => updateFormData('fitnessLevel', value)}
          >
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="beginner" id="beginner" />
              <Label htmlFor="beginner">Beginner</Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="intermediate" id="intermediate" />
              <Label htmlFor="intermediate">Intermediate</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="advanced" id="advanced" />
              <Label htmlFor="advanced">Advanced</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="grid gap-2">
          <Label>Primary Goals (Select up to 3)</Label>
          <div className="space-y-2">
            {['Weight loss', 'Muscle gain', 'Improved endurance', 'Increased flexibility', 'Better posture', 'Stress reduction'].map((goal) => (
              <div key={goal} className="flex items-center space-x-2">
                <Checkbox 
                  id={goal.toLowerCase().replace(' ', '-')} 
                  checked={formData.goals.includes(goal)}
                  onCheckedChange={(checked) => handleCheckboxChange && handleCheckboxChange('goals', goal, checked === true)}
                />
                <Label htmlFor={goal.toLowerCase().replace(' ', '-')}>{goal}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label>Target Areas</Label>
          <div className="space-y-2">
            {['Full body', 'Upper body', 'Lower body', 'Core', 'Back', 'Arms'].map((area) => (
              <div key={area} className="flex items-center space-x-2">
                <Checkbox 
                  id={area.toLowerCase().replace(' ', '-')} 
                  checked={formData.targetAreas.includes(area)}
                  onCheckedChange={(checked) => handleCheckboxChange && handleCheckboxChange('targetAreas', area, checked === true)}
                />
                <Label htmlFor={area.toLowerCase().replace(' ', '-')}>{area}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AvailabilityStep = ({ formData, updateFormData }: StepProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="text-neon-green h-6 w-6" />
        <h2 className="text-xl font-bold">Time Availability</h2>
      </div>
      
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Preferred Workout Duration (minutes)</Label>
          <div className="pt-6 pb-2">
            <Slider 
              value={[formData.workoutDuration]} 
              min={10}
              max={60} 
              step={5} 
              onValueChange={(value) => updateFormData('workoutDuration', value[0])}
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>10 min</span>
            <span>{formData.workoutDuration} min</span>
            <span>60 min</span>
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label>Weekly Frequency (days per week)</Label>
          <div className="pt-6 pb-2">
            <Slider 
              value={[formData.workoutFrequency]} 
              min={1}
              max={7} 
              step={1} 
              onValueChange={(value) => updateFormData('workoutFrequency', value[0])}
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>1 day</span>
            <span>{formData.workoutFrequency} days</span>
            <span>7 days</span>
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label>Preferred Time of Day</Label>
          <RadioGroup 
            value={formData.preferredTime}
            onValueChange={(value) => updateFormData('preferredTime', value)}
          >
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="morning" id="morning" />
              <Label htmlFor="morning">Morning (6am - 9am)</Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="midday" id="midday" />
              <Label htmlFor="midday">Midday (10am - 2pm)</Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="afternoon" id="afternoon" />
              <Label htmlFor="afternoon">Afternoon (3pm - 5pm)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="evening" id="evening" />
              <Label htmlFor="evening">Evening (6pm - 10pm)</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};

const LimitationsStep = ({ formData, updateFormData, handleCheckboxChange }: StepProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <AlertCircle className="text-neon-yellow h-6 w-6" />
        <h2 className="text-xl font-bold">Limitations & Preferences</h2>
      </div>
      
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Do you have any physical limitations?</Label>
          <div className="space-y-2">
            {['No limitations', 'Joint issues', 'Back problems', 'Limited mobility', 'Recent injury', 'Other'].map((limitation) => (
              <div key={limitation} className="flex items-center space-x-2">
                <Checkbox 
                  id={limitation.toLowerCase().replace(' ', '-')} 
                  checked={formData.limitations.includes(limitation)}
                  onCheckedChange={(checked) => handleCheckboxChange && handleCheckboxChange('limitations', limitation, checked === true)}
                />
                <Label htmlFor={limitation.toLowerCase().replace(' ', '-')}>{limitation}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label>Exercise Preferences</Label>
          <div className="space-y-2">
            {['High intensity', 'Low impact', 'Strength focused', 'Cardio focused', 'Flexibility', 'Balance'].map((preference) => (
              <div key={preference} className="flex items-center space-x-2">
                <Checkbox 
                  id={preference.toLowerCase().replace(' ', '-')} 
                  checked={formData.preferences.includes(preference)}
                  onCheckedChange={(checked) => handleCheckboxChange && handleCheckboxChange('preferences', preference, checked === true)}
                />
                <Label htmlFor={preference.toLowerCase().replace(' ', '-')}>{preference}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea 
            id="notes" 
            placeholder="Any other information you'd like us to know..."
            value={formData.notes}
            onChange={(e) => updateFormData('notes', e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
