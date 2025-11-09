import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Trash2, Plus, ArrowLeft, ArrowRight, AlertTriangle, Info, Activity, Heart, Thermometer } from 'lucide-react';
import { Symptom } from '../types/doctor';
import { OutbreakData, LocationData } from '../types/outbreaks';

interface SymptomInputProps {
  symptoms: Symptom[];
  onAddSymptom: (symptom: Omit<Symptom, 'id' | 'timestamp'> | Array<Omit<Symptom, 'id' | 'timestamp'>>) => void;
  onRemoveSymptom: (id: string) => void;
  onContinue: () => void;
  onBack: () => void;
  onSubmit: (symptoms: Symptom[]) => Promise<void>;
  isLoading: boolean;
  isSubmitting: boolean;
  outbreakData: {
    global: OutbreakData[];
    local: OutbreakData[];
  };
  location: LocationData | null;
  isGoogleHealthSynced?: boolean;
  onAnalysisComplete?: (result: ApiResponse) => void;
}

interface PredictionRequest {
  age: number;
  weight: number;
  glucoseLevel: number;
  insulinLevel: number;
  smokingHabit: string;
  symptoms: string[];
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  spO2: number;
  temperature: number;
  sleepQuality: string;
  sleepDuration: number;
  activitySteps: number;
  activityCalories: number;
  respiratoryRate: number;
  stressLevel: string;
}

// Add the AnalyzeRequest interface alongside PredictionRequest
interface AnalyzeRequest {
  age: number;
  gender: string;
  symptoms: {
    name: string;
    severity: string;
    duration: number;
  }[];
  additionalInfo?: string;
}

// Add interface for the API response
interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    primaryDiagnosis: string;
    confidence: number;
    confidenceLevel: string;
    possibleConditions: Array<{
      disease: string;
      confidence: number;
    }>;
    recommendedActions: string[];
    urgency: 'routine' | 'urgent' | 'emergency';
    summary: string;
    timestamp: string;
    requiresImmediateAttention: boolean;
  };
  errors: string[];
}

export function SymptomInput({ 
  symptoms, 
  onAddSymptom, 
  onRemoveSymptom, 
  onContinue, 
  onBack,
  isSubmitting,
  outbreakData,
  location,
  onAnalysisComplete // Destructure the callback prop
}: SymptomInputProps) {
  // Existing symptom state
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [duration, setDuration] = useState('');
  
  // Health data state
  const [age, setAge] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [glucoseLevel, setGlucoseLevel] = useState<number>(95);
  const [insulinLevel, setInsulinLevel] = useState<number>(10);
  const [smokingHabit, setSmokingHabit] = useState<string>('non-smoker');
  const [systolicBP, setSystolicBP] = useState<number>(120);
  const [diastolicBP, setDiastolicBP] = useState<number>(80);
  const [heartRate, setHeartRate] = useState<number>(72);
  const [spO2, setSpO2] = useState<number>(98);
  const [temperature, setTemperature] = useState<number>(36.5);
  const [sleepQuality, setSleepQuality] = useState<string>('good');
  const [sleepDuration, setSleepDuration] = useState<number>(7);
  const [activitySteps, setActivitySteps] = useState<number>(8000);
  const [activityCalories, setActivityCalories] = useState<number>(250);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(16);
  const [stressLevel, setStressLevel] = useState<string>('mild');
  
  const [currentStep, setCurrentStep] = useState<'symptoms' | 'health-data'>('symptoms');
  const [isSubmittingPrediction, setIsSubmittingPrediction] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [relevantOutbreaks, setRelevantOutbreaks] = useState<OutbreakData[]>([]);

  // Add gender and additionalInfo state
  const [gender, setGender] = useState<string>('');
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  const [isGoogleHealthSynced, setIsGoogleHealthSynced] = useState(false); // Track sync status
  const [hasCollectedHealthData, setHasCollectedHealthData] = useState(false); // Track if health data was collected

  // Check if health data was already collected in the previous step
  useEffect(() => {
    const storedHealthData = localStorage.getItem('healthData');
    if (storedHealthData) {
      try {
        const healthData = JSON.parse(storedHealthData);
        setHasCollectedHealthData(true);
        setIsGoogleHealthSynced(true); // Consider it synced if health data exists
      } catch (error) {
        console.error('Error parsing stored health data:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Check for outbreaks that match current symptoms
    try {
      const allOutbreaks = [...(outbreakData?.global || []), ...(outbreakData?.local || [])];
      const symptomsText = symptoms.map(s => s.description?.toLowerCase() || '').join(' ');
      
      if (!symptomsText.trim()) {
        setRelevantOutbreaks([]);
        return;
      }
      
      const matches = allOutbreaks.filter(outbreak => {
        if (!outbreak || !outbreak.symptoms || !Array.isArray(outbreak.symptoms)) {
          return false;
        }
        
        return outbreak.symptoms.some((outbreakSymptom: string) => {
          // Add null/undefined checks and ensure it's a string
          if (!outbreakSymptom || typeof outbreakSymptom !== 'string') {
            return false;
          }
          
          const symptomLower = outbreakSymptom.toLowerCase();
          const foundWord = symptomsText.split(' ').find(word => word && word.length > 3);
          
          return symptomsText.includes(symptomLower) ||
                 (foundWord && symptomLower.includes(foundWord));
        });
      });
      
      setRelevantOutbreaks(matches);
    } catch (error) {
      console.error('Error processing outbreak data:', error);
      setRelevantOutbreaks([]);
    }
  }, [symptoms, outbreakData]);

  // Update the handleAddSymptom function with debugging
  const handleAddSymptom = () => {
    console.log('handleAddSymptom called');
    console.log('Description:', description);
    console.log('Duration:', duration);
    
    if (description.trim() && duration.trim()) {
      // Check if description contains commas (multiple symptoms)
      const symptomDescriptions = description.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      console.log('Symptom descriptions:', symptomDescriptions);
      
      if (symptomDescriptions.length > 1) {
        // Multiple symptoms - create array and pass all at once
        const multipleSymptoms = symptomDescriptions.map(symptomDesc => ({
          description: symptomDesc,
          severity,
          duration: duration.trim(),
        }));
        
        console.log('Adding multiple symptoms:', multipleSymptoms);
        onAddSymptom(multipleSymptoms);
      } else {
        // Single symptom - add as before
        console.log('Adding single symptom:', description.trim());
        onAddSymptom({
          description: description.trim(),
          severity,
          duration: duration.trim(),
        });
      }
      
      // Clear the form
      setDescription('');
      setDuration('');
      setSeverity('mild');
      
      console.log('Form cleared');
    } else {
      console.log('Validation failed - missing description or duration');
    }
  };

  // Add helper function to parse duration
  const parseDuration = (durationStr: string): number => {
    const str = durationStr.toLowerCase();
    if (str.includes('day')) {
      const match = str.match(/(\d+)\s*day/);
      return match ? parseInt(match[1]) : 1;
    } else if (str.includes('week')) {
      const match = str.match(/(\d+)\s*week/);
      return match ? parseInt(match[1]) * 7 : 7;
    } else if (str.includes('hour')) {
      return 1; // Less than a day
    } else if (str.includes('month')) {
      const match = str.match(/(\d+)\s*month/);
      return match ? parseInt(match[1]) * 30 : 30;
    }
    return 1; // Default to 1 day
  };

  // Update the handleSubmitPrediction function
  const handleSubmitPrediction = async () => {
    // Add validation before API call
    if (symptoms.length < 3) {
      alert('Please add at least 3 symptoms for accurate analysis.');
      return;
    }

    setIsSubmittingPrediction(true);
    
    try {
      let response;
      
      if (isGoogleHealthSynced) {
        // Use the /predict API when Google Health is synced
        const requestData: PredictionRequest = {
          age,
          weight,
          glucoseLevel,
          insulinLevel,
          smokingHabit,
          symptoms: symptoms.map(s => s.description),
          systolicBP,
          diastolicBP,
          heartRate,
          spO2,
          temperature,
          sleepQuality,
          sleepDuration,
          activitySteps,
          activityCalories,
          respiratoryRate,
          stressLevel
        };

        response = await fetch('http://localhost:5051/api/Diagnosis/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });
      } else {
        // Use the /analyze API when Google Health is not synced
        const requestData: AnalyzeRequest = {
          age,
          gender,
          symptoms: symptoms.map(s => ({
            name: s.description,
            severity: s.severity,
            duration: parseDuration(s.duration)
          })),
          additionalInfo: additionalInfo || `Patient reports ${symptoms.length} symptoms. Location: ${location?.city || 'Unknown'}.`
        };

        console.log('Sending analyze request:', requestData); // Debug log

        response = await fetch('http://localhost:5051/api/v2/Symptoms/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API call failed: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const result: any = await response.json();
      console.log('API Success Response:', result); // Debug log
      
      // Check if the API returned success
      if (!result.success) {
        const errorMessage = result.errors?.length > 0 
          ? result.errors.join(', ') 
          : result.message || 'Analysis failed';
        console.error('API returned failure:', errorMessage);
        throw new Error(errorMessage);
      }

      // Transform the response based on API type
      let transformedResult: ApiResponse;
      
      if (isGoogleHealthSynced && result.data.predictedDisease) {
        // Handle /predict API response format
        const determinedUrgency = determineUrgencyFromSymptoms(symptoms);
        const isEmergency = determinedUrgency === 'emergency';
        const isUrgent = determinedUrgency === 'urgent';

        // Set appropriate recommended actions based on urgency
        let recommendedActions: string[];
        if (isEmergency) {
          recommendedActions = [
            'Seek immediate medical attention',
            'Go to the nearest emergency room',
            'Call emergency services if condition is life-threatening',
            'Do not delay medical care'
          ];
        } else if (isUrgent) {
          recommendedActions = [
            'Consult a healthcare provider within 24-48 hours',
            'Monitor symptoms closely',
            'Seek immediate care if symptoms worsen',
            'Keep a record of symptom changes'
          ];
        } else {
          recommendedActions = result.data.confidence > 0.7 ? 
            ['Consult with a healthcare provider for confirmation', 'Monitor symptoms closely'] :
            ['Seek medical evaluation for proper diagnosis', 'Keep track of symptom changes'];
        }

        transformedResult = {
          success: true,
          message: result.message,
          data: {
            primaryDiagnosis: result.data.predictedDisease,
            confidence: result.data.confidence,
            confidenceLevel: result.data.confidence > 0.8 ? 'High' : 
                           result.data.confidence > 0.6 ? 'Medium' : 
                           result.data.confidence > 0.4 ? 'Low' : 'Very Low',
            possibleConditions: result.data.alternativesDiagnoses?.map((alt: any) => ({
              disease: alt.disease,
              confidence: alt.confidence
            })) || [],
            recommendedActions,
            urgency: determinedUrgency,
            summary: `AI prediction analysis completed with ${(result.data.confidence * 100).toFixed(1)}% confidence.`,
            timestamp: result.data.predictionDateTime,
            requiresImmediateAttention: isEmergency
          },
          errors: result.errors || []
        };
      } else {
        // Handle /analyze API response format (already in correct format)
        transformedResult = result as ApiResponse;
      }

      // Store the result and navigate to analysis page
      if (transformedResult.success && transformedResult.data) {
        setPredictionResult(transformedResult);
        
        // Call the callback to show the result modal
        if (onAnalysisComplete) {
          onAnalysisComplete(transformedResult);
        } else {
          onContinue(); // Fallback to direct navigation
        }
      }

      // Optionally, you can also store in localStorage for persistence
      localStorage.setItem('analysisResult', JSON.stringify({
        result: transformedResult.data,
        symptoms,
        timestamp: transformedResult.data.timestamp,
        apiUsed: isGoogleHealthSynced ? 'predict' : 'analyze'
      }));

    } catch (error) {
      console.error('Full API error details:', error);
      
      // Show user-friendly error message
      let errorMessage = 'An unexpected error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // More specific error message based on error type
      if (errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the analysis server. Please check your internet connection and try again.';
      } else if (errorMessage.includes('500')) {
        errorMessage = 'Server error occurred. Please try again in a moment.';
      } else if (errorMessage.includes('404')) {
        errorMessage = 'Analysis service not found. Please contact support.';
      }
        
      alert(`Analysis Error:\n${errorMessage}\n\nPlease try again or contact support if the problem persists.`);
    } finally {
      setIsSubmittingPrediction(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOutbreakSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  // Determine urgency based on symptom severity
  const determineUrgencyFromSymptoms = (symptoms: Symptom[]): 'routine' | 'urgent' | 'emergency' => {
    if (!symptoms || symptoms.length === 0) return 'routine';

    // Define emergency symptoms that require immediate attention
    const emergencyKeywords = [
      'chest pain', 'difficulty breathing', 'severe abdominal pain', 'unconscious',
      'seizure', 'severe bleeding', 'stroke symptoms', 'heart attack', 'severe allergic reaction',
      'severe headache', 'high fever', 'severe burns', 'broken bone', 'severe injury',
      'shortness of breath', 'trouble breathing', 'choking', 'severe vomiting'
    ];

    // Define urgent symptoms that need prompt attention
    const urgentKeywords = [
      'persistent fever', 'severe pain', 'blood in urine', 'blood in stool',
      'severe nausea', 'dehydration', 'persistent vomiting', 'severe diarrhea',
      'moderate bleeding', 'severe cough', 'persistent headache', 'dizziness',
      'fainting', 'confusion', 'severe fatigue'
    ];

    let severeCount = 0;
    let moderateCount = 0;
    let hasEmergencySymptom = false;
    let hasUrgentSymptom = false;

    symptoms.forEach(symptom => {
      const description = symptom.description.toLowerCase();
      
      // Check for emergency keywords
      if (emergencyKeywords.some(keyword => description.includes(keyword))) {
        hasEmergencySymptom = true;
      }
      
      // Check for urgent keywords
      if (urgentKeywords.some(keyword => description.includes(keyword))) {
        hasUrgentSymptom = true;
      }

      // Count severity levels
      if (symptom.severity === 'severe') {
        severeCount++;
      } else if (symptom.severity === 'moderate') {
        moderateCount++;
      }
    });

    // Emergency conditions
    if (hasEmergencySymptom || severeCount >= 3) {
      return 'emergency';
    }

    // Urgent conditions
    if (hasUrgentSymptom || severeCount >= 2 || (severeCount >= 1 && moderateCount >= 2)) {
      return 'urgent';
    }

    // Check for moderate symptoms with concerning patterns
    if (moderateCount >= 3 || severeCount >= 1) {
      return 'urgent';
    }

    // Default to routine
    return 'routine';
  };

  // Add helper function to get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return 'border-red-500 bg-red-50 text-red-800';
      case 'urgent':
        return 'border-orange-500 bg-orange-50 text-orange-800';
      case 'routine':
        return 'border-green-500 bg-green-50 text-green-800';
      default:
        return 'border-gray-500 bg-gray-50 text-gray-800';
    }
  };

  if (currentStep === 'health-data') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setCurrentStep('symptoms')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Symptoms
          </Button>
          <h1 className="text-3xl text-primary mb-2">Health Data Collection</h1>
          <p className="text-muted-foreground">
            Please provide your health information for accurate analysis
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age || ''}
                    onChange={(e) => setAge(Number(e.target.value))}
                    placeholder="25"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={gender} onValueChange={setGender} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Google Health Sync Toggle - Only show if no health data was collected */}
              {!hasCollectedHealthData && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="googleHealthSync" className="text-sm font-medium">
                      Sync Google Health Data
                    </Label>
                    <Button
                      type="button"
                      variant={isGoogleHealthSynced ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsGoogleHealthSynced(!isGoogleHealthSynced)}
                    >
                      {isGoogleHealthSynced ? "Synced" : "Sync Now"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isGoogleHealthSynced 
                      ? "Enhanced analysis using your Google Health data including vitals, activity, and health metrics."
                      : "Basic analysis using symptoms and demographic information only. Sync Google Health for more accurate predictions."
                    }
                  </p>
                </div>
              )}

              {/* Health Data Already Collected Message */}
              {hasCollectedHealthData && (
                <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-green-600" />
                    <Label className="text-sm font-medium text-green-800">
                      Health Data Connected
                    </Label>
                  </div>
                  <p className="text-xs text-green-700">
                    Your health metrics have been collected and will be used for enhanced analysis including vitals, activity, and health data.
                  </p>
                </div>
              )}

              {/* Show weight field - required if no health data was collected and Google Health not synced */}
              <div>
                <Label htmlFor="weight">Weight (kg) {!hasCollectedHealthData && !isGoogleHealthSynced && '*'}</Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight || ''}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  placeholder="70"
                  required={!hasCollectedHealthData && !isGoogleHealthSynced}
                />
              </div>

              {/* Show smoking habit for both scenarios */}
              <div>
                <Label htmlFor="smoking">Smoking Habit</Label>
                <Select value={smokingHabit} onValueChange={setSmokingHabit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non-smoker">Non-smoker</SelectItem>
                    <SelectItem value="former smoker">Former smoker</SelectItem>
                    <SelectItem value="current smoker">Current smoker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {isGoogleHealthSynced && (
            <>
              {/* Show all the existing vital signs, sleep & activity, and additional health data cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Vital Signs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="systolic">Systolic BP</Label>
                      <Input
                        id="systolic"
                        type="number"
                        value={systolicBP}
                        onChange={(e) => setSystolicBP(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="diastolic">Diastolic BP</Label>
                      <Input
                        id="diastolic"
                        type="number"
                        value={diastolicBP}
                        onChange={(e) => setDiastolicBP(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                      <Input
                        id="heartRate"
                        type="number"
                        value={heartRate}
                        onChange={(e) => setHeartRate(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="temperature">Temperature (°C)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="spO2">SpO2 (%)</Label>
                      <Input
                        id="spO2"
                        type="number"
                        value={spO2}
                        onChange={(e) => setSpO2(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="respiratoryRate">Respiratory Rate</Label>
                      <Input
                        id="respiratoryRate"
                        type="number"
                        value={respiratoryRate}
                        onChange={(e) => setRespiratoryRate(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sleep & Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sleepQuality">Sleep Quality</Label>
                    <Select value={sleepQuality} onValueChange={setSleepQuality}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sleepDuration">Sleep Duration (hours)</Label>
                    <Input
                      id="sleepDuration"
                      type="number"
                      value={sleepDuration}
                      onChange={(e) => setSleepDuration(Number(e.target.value))}
                    />
                  </div>
                  {/* <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="steps">Daily Steps</Label>
                      <Input
                        id="steps"
                        type="number"
                        value={activitySteps}
                        onChange={(e) => setActivitySteps(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="calories">Calories Burned</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={activityCalories}
                        onChange={(e) => setActivityCalories(Number(e.target.value))}
                      />
                    </div>
                  </div> */}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Health Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="glucose">Glucose Level</Label>
                      <Input
                        id="glucose"
                        type="number"
                        value={glucoseLevel}
                        onChange={(e) => setGlucoseLevel(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="insulin">Insulin Level</Label>
                      <Input
                        id="insulin"
                        type="number"
                        value={insulinLevel}
                        onChange={(e) => setInsulinLevel(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="stress">Stress Level</Label>
                    <Select value={stressLevel} onValueChange={setStressLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Any additional details about your symptoms or medical history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="additionalInfo">Additional Notes (Optional)</Label>
                <textarea
                  id="additionalInfo"
                  className="w-full min-h-[80px] px-3 py-2 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Any additional information about your symptoms, recent travel, exposure to illness, or other relevant details..."
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button 
            onClick={handleSubmitPrediction} 
            size="lg" 
            className="px-8"
            disabled={
              isSubmittingPrediction || 
              !age || 
              !gender || 
              symptoms.length < 3 || // Require at least 3 symptoms
              (!isGoogleHealthSynced && !weight)
            }
          >
            {isSubmittingPrediction 
              ? (isGoogleHealthSynced ? 'Getting AI Prediction...' : 'Analyzing Symptoms...') 
              : (isGoogleHealthSynced ? 'Get AI Prediction' : 'Analyze Symptoms')
            }
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Add a success preview card (optional - shows briefly before navigation) */}
        {predictionResult && (
          <Card className="mt-6 border-green-500 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Analysis Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Primary Diagnosis:</strong> {predictionResult.data.primaryDiagnosis}</p>
                <p><strong>Confidence:</strong> {predictionResult.data.confidenceLevel}</p>
                <div className={`inline-block px-2 py-1 rounded text-xs ${getUrgencyColor(predictionResult.data.urgency)}`}>
                  {predictionResult.data.urgency.toUpperCase()}
                  {predictionResult.data.requiresImmediateAttention && ' - IMMEDIATE ATTENTION REQUIRED'}
                </div>
                <p className="text-muted-foreground mt-2">Redirecting to detailed results...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl text-primary mb-2">Describe Your Symptoms</h1>
        <p className="text-muted-foreground">
          Please provide details about the symptoms you're experiencing
        </p>
      </div>

      {/* Outbreak alerts for relevant symptoms */}
      {relevantOutbreaks.length > 0 && (
        <Alert className="mb-6 border-orange-500/50 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="text-orange-800">
                <strong>Health Alert:</strong> Your symptoms may be related to current disease outbreaks:
              </p>
              <div className="space-y-1">
                {relevantOutbreaks.slice(0, 2).map(outbreak => (
                  <div key={outbreak.id} className="text-sm text-orange-700">
                    • <strong>{outbreak.title}</strong> in {outbreak.location}
                    {outbreak.symptoms && (
                      <span className="ml-2 text-orange-600">
                        (Symptoms: {outbreak.symptoms.slice(0, 3).join(', ')})
                      </span>
                    )}
                  </div>
                ))}
                {relevantOutbreaks.length > 2 && (
                  <p className="text-sm text-orange-600">
                    +{relevantOutbreaks.length - 2} more outbreak(s) with similar symptoms
                  </p>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Symptom</CardTitle>
                <CardDescription>
                  Describe your symptom as clearly as possible
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="description">Symptom Description</Label>
                  <Input
                    id="description"
                    placeholder="e.g., headache, fever, cough OR Breast lump, changes in breast size or shape, nipple changes, breast pain"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    💡 Tip: You can enter multiple symptoms separated by commas. Each will use the same severity and duration.
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <Select value={severity} onValueChange={(value: 'mild' | 'moderate' | 'severe') => setSeverity(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild - Barely noticeable</SelectItem>
                      <SelectItem value="moderate">Moderate - Noticeable but manageable</SelectItem>
                      <SelectItem value="severe">Severe - Significantly affecting daily activities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 2 days, 1 week, since this morning..."
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>

                {/* Add this preview section right after the duration input and before the Add Symptom button */}
                {description.includes(',') && description.trim() && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Info className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-800">Multiple symptoms detected</span>
                    </div>
                    <div className="text-xs text-blue-700">
                      <p className="mb-2">The following {description.split(',').map(s => s.trim()).filter(s => s.length > 0).length} symptoms will be added:</p>
                      <div className="space-y-1">
                        {description.split(',').map(s => s.trim()).filter(s => s.length > 0).map((symptom, index) => (
                          <div key={index} className="flex items-center justify-between bg-white rounded px-2 py-1">
                            <span className="capitalize">{symptom}</span>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs capitalize">
                                {severity}
                              </Badge>
                              <span className="text-muted-foreground text-xs">{duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Update the Add Symptom button to show count */}
                <Button 
                  onClick={handleAddSymptom} // Make sure this is handleAddSymptom, not handleAdd
                  disabled={!description.trim() || !duration.trim()}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {description.includes(',') && description.trim() 
                    ? `Add ${description.split(',').map(s => s.trim()).filter(s => s.length > 0).length} Symptoms`
                    : 'Add Symptom'
                  }
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Symptoms ({symptoms.length})</CardTitle>
                <CardDescription>
                  Review and manage the symptoms you've added
                </CardDescription>
              </CardHeader>
              <CardContent>
                {symptoms.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No symptoms added yet.</p>
                    <p className="text-sm">Add your first symptom to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {symptoms.map((symptom) => (
                      <div key={symptom.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="capitalize">{symptom.description}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveSymptom(symptom.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge className={getSeverityColor(symptom.severity)}>
                            {symptom.severity}
                          </Badge>
                          <span className="text-muted-foreground">for {symptom.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Outbreak context sidebar */}
        <div className="space-y-6">
          {location && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Local Health Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Your Location:</p>
                    <p>{location.city ? `${location.city}, ` : ''}{location.state ? `${location.state}, ` : ''}{location.country}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Local Alerts:</p>
                    <Badge variant="outline">
                      {outbreakData.local.length} active
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Global Alerts:</p>
                    <Badge variant="outline">
                      {outbreakData.global.length} monitoring
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {outbreakData.local.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Local Outbreaks</CardTitle>
                <CardDescription className="text-xs">
                  Current health alerts in your area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {outbreakData.local.slice(0, 3).map(outbreak => (
                    <div key={outbreak.id} className={`border rounded-lg p-3 ${getOutbreakSeverityColor(outbreak.severity)}`}>
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-xs line-clamp-2">{outbreak.title}</h4>
                        <Badge variant="outline" className="text-xs capitalize">
                          {outbreak.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {outbreak.description}
                      </p>
                      {outbreak.symptoms && outbreak.symptoms.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Watch for:</p>
                          <div className="flex flex-wrap gap-1">
                            {outbreak.symptoms.slice(0, 3).map((symptom: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs capitalize">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {outbreakData.local.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{outbreakData.local.length - 3} more local alerts
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Info className="h-4 w-4 mr-1" />
                Helpful Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>• Be as specific as possible with symptoms</li>
                <li>• Include when symptoms started</li>
                <li>• Note any triggers or patterns</li>
                <li>• Consider recent travel or exposure</li>
                <li>• Rate severity honestly</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {symptoms.length > 0 && (
        <div className="mt-8 text-center">
          <Button onClick={() => setCurrentStep('health-data')} size="lg" className="px-8">
            Continue to Health Data
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}