import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Moon, 
  TrendingUp, 
  Clock, 
  Gauge,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowLeft,
  ArrowRight,
  Edit,
  User
} from "lucide-react";

export type HealthMetrics = {
  heartRate: {
    current: number;
    resting: number;
    max: number;
    status: "normal" | "elevated" | "high" | "low";
    lastReading: Date;
  };
  bloodPressure: {
    systolic: number;
    diastolic: number;
    status: "normal" | "elevated" | "high" | "low";
    lastReading: Date;
  };
  oxygenSaturation: {
    percentage: number;
    status: "normal" | "low" | "critical";
    lastReading: Date;
  };
  bodyTemperature: {
    celsius: number;
    fahrenheit: number;
    status: "normal" | "fever" | "low";
    lastReading: Date;
  };
  sleepData: {
    hoursLastNight: number;
    quality: "poor" | "fair" | "good" | "excellent";
    deepSleepMinutes: number;
    remSleepMinutes: number;
    lastUpdated: Date;
  };
  activityLevel: {
    steps: number;
    activeMinutes: number;
    caloriesBurned: number;
    lastSync: Date;
  };
  respiratoryRate: {
    breathsPerMinute: number;
    status: "normal" | "elevated" | "low";
    lastReading: Date;
  };
  stressLevel: {
    score: number; // 0-100
    status: "low" | "moderate" | "high" | "very_high";
    lastUpdated: Date;
  };
};

interface HealthDataCollectionProps {
  onDataCollected: (healthData: HealthMetrics) => void;
  onBack: () => void;
  onContinue: () => void;
  user: {
    provider: "google" | "email";
    name: string;
  } | null;
}

export function HealthDataCollection({ 
  onDataCollected, 
  onBack, 
  onContinue,
  user
}: HealthDataCollectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [healthData, setHealthData] = useState<HealthMetrics | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [inputMethod, setInputMethod] = useState<"google" | "manual" | "skip">("google");
  const [manualData, setManualData] = useState({
    heartRate: "",
    systolic: "",
    diastolic: "",
    oxygenSaturation: "",
    temperature: "",
    sleepHours: "",
    sleepQuality: "",
    steps: "",
    stressLevel: ""
  });

  // Simulate Google Health API data collection
  const collectHealthData = async () => {
    setIsLoading(true);
    setSyncProgress(0);
    
    const steps = [
      "Connecting to Google Health...",
      "Fetching heart rate data...",
      "Retrieving blood pressure readings...",
      "Getting oxygen saturation levels...",
      "Collecting sleep data...",
      "Gathering activity metrics...",
      "Processing vital signs...",
      "Finalizing health profile..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i]);
      setSyncProgress((i + 1) * 12.5);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Generate realistic dummy data
    const mockHealthData: HealthMetrics = {
      heartRate: {
        current: 72 + Math.floor(Math.random() * 20),
        resting: 65 + Math.floor(Math.random() * 10),
        max: 180 + Math.floor(Math.random() * 20),
        status: Math.random() > 0.8 ? "elevated" : "normal",
        lastReading: new Date(Date.now() - Math.random() * 3600000) // Within last hour
      },
      bloodPressure: {
        systolic: 115 + Math.floor(Math.random() * 25),
        diastolic: 75 + Math.floor(Math.random() * 15),
        status: Math.random() > 0.85 ? "elevated" : "normal",
        lastReading: new Date(Date.now() - Math.random() * 7200000) // Within 2 hours
      },
      oxygenSaturation: {
        percentage: 96 + Math.floor(Math.random() * 4),
        status: Math.random() > 0.95 ? "low" : "normal",
        lastReading: new Date(Date.now() - Math.random() * 1800000) // Within 30 mins
      },
      bodyTemperature: {
        celsius: 36.1 + Math.random() * 2,
        fahrenheit: 97 + Math.random() * 3.6,
        status: Math.random() > 0.9 ? "fever" : "normal",
        lastReading: new Date(Date.now() - Math.random() * 3600000)
      },
      sleepData: {
        hoursLastNight: 6 + Math.random() * 3,
        quality: ["poor", "fair", "good", "excellent"][Math.floor(Math.random() * 4)] as any,
        deepSleepMinutes: 60 + Math.floor(Math.random() * 120),
        remSleepMinutes: 80 + Math.floor(Math.random() * 100),
        lastUpdated: new Date(Date.now() - 8 * 3600000) // 8 hours ago (morning)
      },
      activityLevel: {
        steps: 3000 + Math.floor(Math.random() * 8000),
        activeMinutes: 30 + Math.floor(Math.random() * 60),
        caloriesBurned: 1800 + Math.floor(Math.random() * 800),
        lastSync: new Date(Date.now() - Math.random() * 1800000)
      },
      respiratoryRate: {
        breathsPerMinute: 12 + Math.floor(Math.random() * 8),
        status: Math.random() > 0.85 ? "elevated" : "normal",
        lastReading: new Date(Date.now() - Math.random() * 3600000)
      },
      stressLevel: {
        score: Math.floor(Math.random() * 100),
        status: Math.random() > 0.7 ? (Math.random() > 0.5 ? "moderate" : "high") : "low",
        lastUpdated: new Date(Date.now() - Math.random() * 3600000)
      }
    };

    setHealthData(mockHealthData);
    onDataCollected(mockHealthData);
    setIsLoading(false);
  };

  // Handle manual data input
  const handleManualSubmit = () => {
    const currentTime = new Date();
    
    const manualHealthData: HealthMetrics = {
      heartRate: {
        current: parseInt(manualData.heartRate) || 72,
        resting: Math.max(parseInt(manualData.heartRate) - 10, 60),
        max: parseInt(manualData.heartRate) + 50 || 150,
        status: parseInt(manualData.heartRate) > 100 ? "elevated" : parseInt(manualData.heartRate) < 60 ? "low" : "normal",
        lastReading: currentTime
      },
      bloodPressure: {
        systolic: parseInt(manualData.systolic) || 120,
        diastolic: parseInt(manualData.diastolic) || 80,
        status: parseInt(manualData.systolic) > 140 || parseInt(manualData.diastolic) > 90 ? "high" : 
                parseInt(manualData.systolic) > 130 || parseInt(manualData.diastolic) > 85 ? "elevated" : "normal",
        lastReading: currentTime
      },
      oxygenSaturation: {
        percentage: parseInt(manualData.oxygenSaturation) || 98,
        status: parseInt(manualData.oxygenSaturation) < 95 ? "low" : parseInt(manualData.oxygenSaturation) < 90 ? "critical" : "normal",
        lastReading: currentTime
      },
      bodyTemperature: {
        celsius: parseFloat(manualData.temperature) || 36.5,
        fahrenheit: (parseFloat(manualData.temperature) || 36.5) * 9/5 + 32,
        status: parseFloat(manualData.temperature) > 37.5 ? "fever" : parseFloat(manualData.temperature) < 35 ? "low" : "normal",
        lastReading: currentTime
      },
      sleepData: {
        hoursLastNight: parseFloat(manualData.sleepHours) || 7.5,
        quality: (manualData.sleepQuality as any) || "good",
        deepSleepMinutes: Math.floor((parseFloat(manualData.sleepHours) || 7.5) * 60 * 0.2),
        remSleepMinutes: Math.floor((parseFloat(manualData.sleepHours) || 7.5) * 60 * 0.25),
        lastUpdated: new Date(currentTime.getTime() - 8 * 3600000) // 8 hours ago
      },
      activityLevel: {
        steps: parseInt(manualData.steps) || 8000,
        activeMinutes: Math.floor((parseInt(manualData.steps) || 8000) / 150),
        caloriesBurned: 1800 + Math.floor((parseInt(manualData.steps) || 8000) / 25),
        lastSync: currentTime
      },
      respiratoryRate: {
        breathsPerMinute: 16 + Math.floor(Math.random() * 4),
        status: "normal",
        lastReading: currentTime
      },
      stressLevel: {
        score: parseInt(manualData.stressLevel) || 30,
        status: parseInt(manualData.stressLevel) > 70 ? "high" : parseInt(manualData.stressLevel) > 50 ? "moderate" : "low",
        lastUpdated: currentTime
      }
    };

    setHealthData(manualHealthData);
    onDataCollected(manualHealthData);
  };

  // Skip health data collection
  const handleSkip = () => {
    onContinue();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": case "good": case "excellent": case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "elevated": case "moderate": case "fair":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high": case "fever": case "very_high": case "poor":
        return "bg-red-100 text-red-800 border-red-200";
      case "critical":
        return "bg-red-200 text-red-900 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-medium">Health Data Collection</h1>
          <p className="text-muted-foreground">
            {user?.provider === "google" 
              ? "Sync your vital signs and health metrics for more accurate assessment"
              : "Add your health metrics manually or skip to continue with symptom assessment"
            }
          </p>
        </div>
      </div>

      {/* Show different options based on login method */}
      {!healthData && !isLoading && inputMethod === "google" && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle>
              {user?.provider === "google" ? "Connect Google Health" : "Health Data Collection"}
            </CardTitle>
            <CardDescription className="max-w-md mx-auto">
              {user?.provider === "google" 
                ? "We'll securely collect your latest health metrics including heart rate, blood pressure, sleep data, and activity levels to provide more personalized health insights."
                : "Add your health metrics manually to get more personalized health insights, or skip this step to continue."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your health data is encrypted and only used for this assessment. 
                We don't store personal health information permanently.
              </AlertDescription>
            </Alert>

            {user?.provider !== "google" && (
              <Alert className="mb-6 bg-amber-50 border-amber-200">
                <User className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  You're not logged in with Google. You can manually enter your health data below or skip this step entirely.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Heart, label: "Heart Rate", desc: "Current & resting HR" },
                  { icon: Gauge, label: "Blood Pressure", desc: "Latest readings" },
                  { icon: Activity, label: "SpO2", desc: "Oxygen saturation" },
                  { icon: Thermometer, label: "Temperature", desc: "Body temperature" },
                  { icon: Moon, label: "Sleep Data", desc: "Quality & duration" },
                  { icon: TrendingUp, label: "Activity", desc: "Steps & calories" },
                  { icon: Clock, label: "Respiratory", desc: "Breathing rate" },
                  { icon: AlertTriangle, label: "Stress Level", desc: "Current stress" }
                ].map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg text-center">
                    <item.icon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3">
                {user?.provider === "google" && (
                  <Button 
                    onClick={collectHealthData}
                    className="flex-1"
                    size="lg"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync from Google Health
                  </Button>
                )}
                
                <Button 
                  onClick={() => setInputMethod("manual")}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Enter Manually
                </Button>
                
                <Button 
                  onClick={handleSkip}
                  variant="ghost"
                  size="lg"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Skip
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual input form */}
      {!healthData && !isLoading && inputMethod === "manual" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Manual Health Data Entry
            </CardTitle>
            <CardDescription>
              Enter your current health metrics. Leave fields empty to use default values.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Vital Signs */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  Vital Signs
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                    <Input
                      id="heartRate"
                      type="number"
                      placeholder="72"
                      min="40"
                      max="200"
                      value={manualData.heartRate}
                      onChange={(e) => setManualData({...manualData, heartRate: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="systolic">Systolic BP</Label>
                      <Input
                        id="systolic"
                        type="number"
                        placeholder="120"
                        min="80"
                        max="200"
                        value={manualData.systolic}
                        onChange={(e) => setManualData({...manualData, systolic: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="diastolic">Diastolic BP</Label>
                      <Input
                        id="diastolic"
                        type="number"
                        placeholder="80"
                        min="40"
                        max="120"
                        value={manualData.diastolic}
                        onChange={(e) => setManualData({...manualData, diastolic: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
                    <Input
                      id="oxygenSaturation"
                      type="number"
                      placeholder="98"
                      min="70"
                      max="100"
                      value={manualData.oxygenSaturation}
                      onChange={(e) => setManualData({...manualData, oxygenSaturation: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="temperature">Body Temperature (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      placeholder="36.5"
                      min="35"
                      max="42"
                      value={manualData.temperature}
                      onChange={(e) => setManualData({...manualData, temperature: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Activity & Wellness */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Activity & Wellness
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="sleepHours">Sleep Last Night (hours)</Label>
                    <Input
                      id="sleepHours"
                      type="number"
                      step="0.5"
                      placeholder="7.5"
                      min="0"
                      max="24"
                      value={manualData.sleepHours}
                      onChange={(e) => setManualData({...manualData, sleepHours: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="sleepQuality">Sleep Quality</Label>
                    <Select value={manualData.sleepQuality} onValueChange={(value) => setManualData({...manualData, sleepQuality: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="poor">Poor</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="excellent">Excellent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="steps">Steps Today</Label>
                    <Input
                      id="steps"
                      type="number"
                      placeholder="8000"
                      min="0"
                      max="50000"
                      value={manualData.steps}
                      onChange={(e) => setManualData({...manualData, steps: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="stressLevel">Stress Level (0-100)</Label>
                    <Input
                      id="stressLevel"
                      type="number"
                      placeholder="30"
                      min="0"
                      max="100"
                      value={manualData.stressLevel}
                      onChange={(e) => setManualData({...manualData, stressLevel: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={() => setInputMethod("google")} variant="outline">
                Back to Options
              </Button>
              <Button onClick={handleManualSubmit} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Health Data
              </Button>
              <Button onClick={handleSkip} variant="ghost">
                Skip Instead
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <div>
                <p className="font-medium">{currentStep}</p>
                <p className="text-sm text-muted-foreground">Please wait while we collect your health data</p>
              </div>
              <div className="max-w-xs mx-auto">
                <Progress value={syncProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">{Math.round(syncProgress)}% complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {healthData && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">Health data successfully collected</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Vital Signs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Vital Signs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Heart Rate</p>
                    <p className="text-sm text-muted-foreground">Current: {healthData.heartRate.current} bpm</p>
                    <p className="text-sm text-muted-foreground">Resting: {healthData.heartRate.resting} bpm</p>
                  </div>
                  <Badge className={getStatusColor(healthData.heartRate.status)}>
                    {healthData.heartRate.status}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Blood Pressure</p>
                    <p className="text-sm text-muted-foreground">
                      {healthData.bloodPressure.systolic}/{healthData.bloodPressure.diastolic} mmHg
                    </p>
                  </div>
                  <Badge className={getStatusColor(healthData.bloodPressure.status)}>
                    {healthData.bloodPressure.status}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Oxygen Saturation</p>
                    <p className="text-sm text-muted-foreground">{healthData.oxygenSaturation.percentage}%</p>
                  </div>
                  <Badge className={getStatusColor(healthData.oxygenSaturation.status)}>
                    {healthData.oxygenSaturation.status}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Body Temperature</p>
                    <p className="text-sm text-muted-foreground">
                      {healthData.bodyTemperature.celsius.toFixed(1)}°C ({healthData.bodyTemperature.fahrenheit.toFixed(1)}°F)
                    </p>
                  </div>
                  <Badge className={getStatusColor(healthData.bodyTemperature.status)}>
                    {healthData.bodyTemperature.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Activity & Sleep */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Activity & Sleep
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Sleep Quality</p>
                    <p className="text-sm text-muted-foreground">
                      {healthData.sleepData.hoursLastNight.toFixed(1)} hours last night
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Deep: {healthData.sleepData.deepSleepMinutes}m, REM: {healthData.sleepData.remSleepMinutes}m
                    </p>
                  </div>
                  <Badge className={getStatusColor(healthData.sleepData.quality)}>
                    {healthData.sleepData.quality}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Daily Activity</p>
                    <p className="text-sm text-muted-foreground">{healthData.activityLevel.steps.toLocaleString()} steps</p>
                    <p className="text-sm text-muted-foreground">
                      {healthData.activityLevel.activeMinutes} active minutes
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {healthData.activityLevel.caloriesBurned} cal
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Respiratory Rate</p>
                    <p className="text-sm text-muted-foreground">{healthData.respiratoryRate.breathsPerMinute} breaths/min</p>
                  </div>
                  <Badge className={getStatusColor(healthData.respiratoryRate.status)}>
                    {healthData.respiratoryRate.status}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Stress Level</p>
                    <p className="text-sm text-muted-foreground">Score: {healthData.stressLevel.score}/100</p>
                  </div>
                  <Badge className={getStatusColor(healthData.stressLevel.status)}>
                    {healthData.stressLevel.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This health data will be used to provide more accurate health assessments and recommendations. 
              Last updated: {formatTime(new Date())}
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button variant="outline" onClick={collectHealthData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
            <Button onClick={onContinue} className="flex-1">
              Continue to Assessment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}