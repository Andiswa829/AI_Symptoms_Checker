import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Stethoscope, Shield, Clock, Users, Globe, MapPin, AlertTriangle, Calendar, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LocationData, User } from '../types/outbreaks';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  outbreakCount?: number;
  location?: LocationData | null;
  user?: User | null;
  onViewOutbreaks: () => void;
  onBookAppointment: () => void;
}

export function WelcomeScreen({ onGetStarted, outbreakCount = 0, location, user, onViewOutbreaks, onBookAppointment }: WelcomeScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Stethoscope className="h-12 w-12 text-primary mr-3" />
          <h1 className="text-4xl text-primary">AI Symptoms Checker</h1>
        </div>
        
        {user && (
          <div className="mb-4">
            <p className="text-xl text-muted-foreground">
              Welcome back {(user.name ? user.name.split(' ')[0] : 'User')}!
            </p>
            <p className="text-sm text-muted-foreground">
              Last login: {user.lastLogin.toLocaleDateString()}
            </p>
          </div>
        )}
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get insights about your symptoms with our AI-powered health assessment tool
        </p>
        
        {location && (
          <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>
              {location.city ? `${location.city}, ` : ''}
              {location.state ? `${location.state}, ` : ''}
              {location.country}
            </span>
          </div>
        )}
      </div>

     

      {/* Enhanced Outbreak Dashboard */}
      {outbreakCount > 0 && (
        <div className="mb-8 space-y-4">
          <Alert className="border-orange-500/50 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-orange-800">Active Health Alerts:</strong>
                  <span className="text-orange-700 ml-2">
                    {outbreakCount} disease outbreak{outbreakCount > 1 ? 's' : ''} being monitored
                    {location && ` in ${location.country} and globally`}
                  </span>
                </div>
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                  <Globe className="h-3 w-3 mr-1" />
                  {outbreakCount} Alert{outbreakCount > 1 ? 's' : ''}
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-red-50 border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-800">Critical Outbreaks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                  <span className="text-2xl text-red-700">2</span>
                </div>
                <p className="text-xs text-red-600 mt-1">Immediate attention required</p>
              </CardContent>
            </Card>
            
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-yellow-800">Local Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <MapPin className="h-6 w-6 text-yellow-600 mr-2" />
                  <span className="text-2xl text-yellow-700">3</span>
                </div>
                <p className="text-xs text-yellow-600 mt-1">In your area</p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-800">Global Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Globe className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-2xl text-blue-700">{outbreakCount}</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">Worldwide surveillance</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Quick & Easy
            </CardTitle>
            <CardDescription>
              Get personalized insights in just a few minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Describe your symptoms step by step</li>
              <li>• Answer follow-up questions</li>
              <li>• Receive AI-powered analysis</li>
              <li>• Get actionable recommendations</li>
              <li>• Access real-time outbreak information</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Smart & Aware
            </CardTitle>
            <CardDescription>
              Context-aware analysis with outbreak monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Location-based health alerts</li>
              <li>• Real-time outbreak notifications</li>
              <li>• Symptom correlation with current outbreaks</li>
              <li>• Integration with health authorities</li>
              <li>• Privacy-first approach</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3">
                1
              </div>
              <h3 className="mb-2">Describe Symptoms</h3>
              <p className="text-sm text-muted-foreground">
                Tell us about your symptoms, their severity, and duration
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3">
                2
              </div>
              <h3 className="mb-2">Answer Questions</h3>
              <p className="text-sm text-muted-foreground">
                Our AI will ask follow-up questions to better understand your condition
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3">
                3
              </div>
              <h3 className="mb-2">Get Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Receive possible conditions with outbreak context and recommendations
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3">
                4
              </div>
              <h3 className="mb-2">Stay Informed</h3>
              <p className="text-sm text-muted-foreground">
                Monitor relevant health alerts and outbreak updates in your area
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="mb-8 border-destructive/50 bg-destructive/5">
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-destructive">
          <strong>Important Medical Disclaimer:</strong> This tool is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. In case of emergency, call your local emergency number immediately.
        </AlertDescription>
      </Alert>

      {/* Quick Actions */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-center">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button 
              onClick={() => {
                window.location.href = '/disclaimer';  // Changed from '/assessment' to '/disclaimer'
              }} 
              size="lg" 
              className="h-16 flex-col space-y-1"
            >
              <Stethoscope className="h-6 w-6" />
              <span>Start Assessment</span>
            </Button>
            
            <Button 
              onClick={() => navigate('/outbreaks')}
              variant="outline" 
              size="lg" 
              className="h-16 flex-col space-y-1"
            >
              <Globe className="h-6 w-6" />
              <span>View Outbreaks</span>
            </Button>
            
            <Button 
              onClick={() => navigate('/doctors')}
              variant="outline" 
              size="lg" 
              className="h-16 flex-col space-y-1"
            >
              <Calendar className="h-6 w-6" />
              <span>Book Appointment</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          By continuing, you acknowledge that you have read and understand our medical disclaimer
        </p>
      </div>
    </div>
  );
}