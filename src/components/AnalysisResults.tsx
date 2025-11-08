import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Phone,
  FileText,
  Shield,
  MapPin,
  Calendar,
  Stethoscope,
  Users,
  Info,
  Activity
} from 'lucide-react';
import { Symptom } from '../types/doctor';
import { AnalysisResult, OutbreakData, LocationData } from '../types/outbreaks';
import { useLocation } from 'react-router-dom';


interface AnalysisResultsProps {
  result?: AnalysisResult;
  symptoms: Symptom[];
  onStartOver: () => void;
  outbreakData: {
    global: OutbreakData[];
    local: OutbreakData[];
  };
  location: LocationData | null;
  onFindDoctors: () => void;
}


// models/SymptomAnalysis.ts
export interface PossibleCondition {
  description: string;
  probability: number;
  name: string;
}

export interface AnalysisData {
  primaryDiagnosis: string;
  confidence: number;
  confidenceLevel: string;
  possibleConditions: PossibleCondition[];
  recommendations: string[];
  urgency: string;
  summary: string;
  timestamp: string;
  requiresImmediateAttention: boolean;
}

export interface SymptomAnalysisResponse {
  success: boolean;
  message: string;
  data: AnalysisData;
  errors: string[];
}


export function AnalysisResults({ 
  result, 
  symptoms, 
  onStartOver, 
  outbreakData, 
  location, 
  onFindDoctors 
}: AnalysisResultsProps) {
  const routeLocation = useLocation();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  useEffect(() => {
    // Get analysis data from route state or localStorage
    const stateData = routeLocation.state?.result;
    const storedData = localStorage.getItem('analysisResult');
    console.log('Route Location State:', stateData );
    console.log('Stored Data:', storedData );
    if (stateData) {
      setAnalysisData(stateData);
    } else if (storedData) {
      const parsed = JSON.parse(storedData);
      setAnalysisData(parsed.result);
    }
  }, [routeLocation]);

  const getUrgencyConfig = (level: string) => {
    switch (level) {
      case 'emergency':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: '🚨',
          message: 'Seek immediate medical attention'
        };
      case 'urgent':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: '⚠️',
          message: 'Consult a healthcare provider soon'
        };
      case 'routine':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '✅',
          message: 'Self-care measures may be sufficient'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: 'ℹ️',
          message: 'Monitor symptoms'
        };
    }
  };

  const urgencyConfig = getUrgencyConfig(analysisData?.urgency || 'routine');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl text-primary mb-2">Analysis Results</h1>
        <p className="text-muted-foreground">
          Based on your symptoms, here's what our AI assessment suggests
        </p>
      </div>

      {/* Medical Disclaimer */}
      <Alert className="mb-8 border-destructive/50 bg-destructive/5">
        <Shield className="h-4 w-4 text-destructive" />
        <AlertDescription>
          <strong>Important Medical Disclaimer:</strong> This tool provides general information only and is not a substitute for professional medical advice. Always consult a qualified healthcare provider for diagnosis and treatment decisions. In case of emergency, call your local emergency services immediately.
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Primary Diagnosis Card */}
          {analysisData?.primaryDiagnosis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Primary Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-2">
                      {analysisData.primaryDiagnosis}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        <strong>Confidence:</strong> {analysisData.confidenceLevel} 
                        ({(analysisData.confidence * 100).toFixed(1)}%)
                      </span>
                      <span>
                        <strong>Analysis Time:</strong> {new Date(analysisData.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  {analysisData.summary && (
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm">{analysisData.summary}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Possible Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Possible Conditions</CardTitle>
              <CardDescription>
                Conditions that may match your symptoms, ordered by likelihood
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisData?.possibleConditions && analysisData.possibleConditions.length > 0 ? (
                <div className="space-y-4">
                  {analysisData.possibleConditions
                    .filter((condition: any) => !condition.name.toLowerCase().includes('note'))
                    .map((condition: any, index: number) => {
                      const percentage = (condition.probability * 100).toFixed(1);
                      return (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-sm">{condition.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {percentage}%
                            </Badge>
                          </div>
                          <Progress 
                            value={condition.probability * 100} 
                            className="h-2" 
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Likelihood</span>
                            <span>{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  {/* Show message if all conditions were filtered out */}
                  {analysisData.possibleConditions.filter((condition: any) => !condition.name.toLowerCase().includes('note')).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No specific conditions identified.</p>
                      <p className="text-sm">Consider providing more detailed symptoms.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No specific conditions identified.</p>
                  <p className="text-sm">Consider providing more detailed symptoms.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>
                Suggested next steps based on your symptoms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisData?.recommendations && analysisData.recommendations.length > 0 ? (
                <div className="space-y-4">
                  {analysisData.recommendations.map((action: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        
                        <p className="text-sm text-blue-800 font-medium">{action}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Summary footer */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Recommendations:</span>
                      <Badge variant="secondary">{analysisData.recommendations.length}</Badge>
                    </div>
                    <Progress 
                      value={100} 
                      className="h-1 mt-2" 
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Stethoscope className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No specific recommendations available.</p>
                  <p className="text-sm">Consider consulting a healthcare professional.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Urgency Level */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Urgency Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${urgencyConfig.color}`}>
                  <span className="mr-2">{urgencyConfig.icon}</span>
                  {analysisData?.urgency ? (
                    <span className="capitalize">{analysisData.urgency} Priority</span>
                  ) : (
                    <span>Low Priority</span>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {urgencyConfig.message}
                </p>

                {analysisData?.requiresImmediateAttention && (
                  <Alert className="border-red-500 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Immediate attention required.</strong> Please seek medical care promptly.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Symptom Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Symptom Summary</CardTitle>
              <CardDescription>
                Overview of the symptoms you reported
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Summary from API */}
                {analysisData?.summary && (
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm text-blue-800">{analysisData.summary}</p>
                  </div>
                )}
                
                {/* Symptom count and details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Symptoms Reported:</span>
                    <Badge variant="outline">{symptoms.length}</Badge>
                  </div>
                  
                  {symptoms.length > 0 && (
                    <>
                      <Progress value={(symptoms.length / 10) * 100} className="h-2" />
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {symptoms.map((symptom, index) => (
                          <div key={index} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                            <span className="capitalize font-medium">{symptom.description}</span>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={symptom.severity === 'severe' ? 'destructive' : 
                                        symptom.severity === 'moderate' ? 'default' : 'secondary'} 
                                className="text-xs capitalize"
                              >
                                {symptom.severity}
                              </Badge>
                              <span className="text-muted-foreground">{symptom.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {/* Analysis timestamp */}
                  {analysisData?.timestamp && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Analyzed: {new Date(analysisData.timestamp).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={onFindDoctors} className="w-full">
              <MapPin className="h-4 w-4 mr-2" />
              Find Doctors Nearby
            </Button>
            
            <Button variant="outline" onClick={onStartOver} className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Start New Assessment
            </Button>
          </div>

          {/* Confidence Notice */}
          {analysisData?.confidence && analysisData.confidence < 0.5 && (
            <Alert className="border-orange-500 bg-orange-50">
              <Info className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Low Confidence Assessment</strong>
                <br />
                Consider providing more detailed symptoms or consulting a healthcare professional for a more accurate diagnosis.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}