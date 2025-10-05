import React from 'react';
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
  Users
} from 'lucide-react';
import type { AnalysisResult, Symptom, OutbreakData, LocationData } from '../App';

interface AnalysisResultsProps {
  result: AnalysisResult;
  symptoms: Symptom[];
  onStartOver: () => void;
  outbreakData: {
    global: OutbreakData[];
    local: OutbreakData[];
  };
  location: LocationData | null;
  onFindDoctors: () => void;
}

export function AnalysisResults({ 
  result, 
  symptoms, 
  onStartOver, 
  outbreakData, 
  location, 
  onFindDoctors 
}: AnalysisResultsProps) {
  const getUrgencyConfig = (level: string) => {
    switch (level) {
      case 'emergency':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <Phone className="h-4 w-4" />,
          title: 'Emergency',
          description: 'Seek immediate medical attention'
        };
      case 'high':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: <AlertTriangle className="h-4 w-4" />,
          title: 'High Priority',
          description: 'Contact your healthcare provider soon'
        };
      case 'medium':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock className="h-4 w-4" />,
          title: 'Medium Priority',
          description: 'Monitor symptoms and consider medical consultation'
        };
      case 'low':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="h-4 w-4" />,
          title: 'Low Priority',
          description: 'Self-care measures may be sufficient'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Clock className="h-4 w-4" />,
          title: 'Unknown',
          description: 'Consult with healthcare provider'
        };
    }
  };

  const urgencyConfig = getUrgencyConfig(result.urgencyLevel);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl text-primary mb-2">Analysis Results</h1>
        <p className="text-muted-foreground">
          Based on your symptoms, here's what our AI assessment suggests
        </p>
      </div>

      <Alert className="mb-8 border-destructive/50 bg-destructive/5">
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-destructive">
          <strong>Medical Disclaimer:</strong> {result.disclaimer}
        </AlertDescription>
      </Alert>

      {/* Outbreak Context */}
      {result.outbreakContext && result.outbreakContext.length > 0 && (
        <Alert className="mb-8 border-orange-500/50 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="text-orange-800">
                <strong>Health Alert:</strong> Your symptoms may be related to current disease outbreaks:
              </p>
              {result.outbreakContext.map((context, index) => (
                <div key={index} className="text-sm text-orange-700">
                  • <strong>{context.outbreak.title}</strong> - {context.reason}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Possible Conditions</CardTitle>
            <CardDescription>
              Conditions that may match your symptoms, ordered by likelihood
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.possibleConditions.map((condition, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg">{condition.name}</h3>
                  <Badge variant="outline">{condition.probability}% match</Badge>
                </div>
                <Progress value={condition.probability} className="mb-3" />
                <p className="text-sm text-muted-foreground">{condition.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {urgencyConfig.icon}
              <span className="ml-2">Urgency Level</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`${urgencyConfig.color} mb-3`}>
              {urgencyConfig.title}
            </Badge>
            <p className="text-sm mb-4">{urgencyConfig.description}</p>
            
            {result.urgencyLevel === 'emergency' && (
              <Alert className="border-red-200 bg-red-50">
                <Phone className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  Call emergency services immediately or go to the nearest emergency room.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Suggested next steps based on your symptoms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Symptom Summary</CardTitle>
            <CardDescription>
              Overview of the symptoms you reported
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {symptoms.map((symptom, index) => (
                <div key={symptom.id}>
                  <div className="flex items-center justify-between">
                    <span className="capitalize text-sm">{symptom.description}</span>
                    <Badge variant="outline" className={
                      symptom.severity === 'mild' ? 'border-green-200 text-green-800' :
                      symptom.severity === 'moderate' ? 'border-yellow-200 text-yellow-800' :
                      'border-red-200 text-red-800'
                    }>
                      {symptom.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Duration: {symptom.duration}</p>
                  {index < symptoms.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Find Doctors Section */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <Stethoscope className="h-6 w-6 mr-2" />
            Book an Appointment
          </CardTitle>
          <CardDescription className="text-blue-700">
            Find and book appointments with qualified healthcare providers in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-blue-800">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>
                    {location ? 
                      `${location.city || location.country} area` : 
                      'Your local area'
                    }
                  </span>
                </div>
                <div className="flex items-center text-sm text-blue-800">
                  <Users className="h-4 w-4 mr-2" />
                  <span>5+ qualified doctors available</span>
                </div>
                <div className="flex items-center text-sm text-blue-800">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Same-day appointments available</span>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-blue-700">
                <li>• View doctor profiles and ratings</li>
                <li>• Check real-time availability</li>
                <li>• Book appointments instantly</li>
                <li>• Get directions to clinics</li>
              </ul>
            </div>
            <div className="text-center">
              <Button 
                onClick={onFindDoctors}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              >
                <MapPin className="h-5 w-5 mr-2" />
                Find Doctors Near Me
              </Button>
              <p className="text-xs text-blue-600 mt-2">
                Your symptoms and analysis will be shared with your chosen doctor
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <Phone className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="mb-2">Contact Healthcare Provider</h3>
              <p className="text-sm text-muted-foreground">
                Schedule an appointment with your doctor or healthcare provider for professional evaluation
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="mb-2">Monitor Symptoms</h3>
              <p className="text-sm text-muted-foreground">
                Keep track of any changes in your symptoms and note any new developments
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="mb-2">Follow Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                Follow the care recommendations provided and seek help if symptoms worsen
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button onClick={onStartOver} variant="outline" size="lg" className="px-8">
          <RotateCcw className="h-4 w-4 mr-2" />
          Start New Assessment
        </Button>
        <p className="text-sm text-muted-foreground mt-4">
          You can start a new symptom assessment at any time
        </p>
      </div>
    </div>
  );
}