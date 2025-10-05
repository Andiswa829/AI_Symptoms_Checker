import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Trash2, Plus, ArrowLeft, ArrowRight, AlertTriangle, Info } from 'lucide-react';
import type { Symptom, OutbreakData, LocationData } from '../App';

interface SymptomInputProps {
  symptoms: Symptom[];
  onAddSymptom: (symptom: Omit<Symptom, 'id' | 'timestamp'>) => void;
  onRemoveSymptom: (id: string) => void;
  onContinue: () => void;
  onBack: () => void;
  outbreakData: {
    global: OutbreakData[];
    local: OutbreakData[];
  };
  location: LocationData | null;
}

export function SymptomInput({ 
  symptoms, 
  onAddSymptom, 
  onRemoveSymptom, 
  onContinue, 
  onBack,
  outbreakData,
  location
}: SymptomInputProps) {
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [duration, setDuration] = useState('');
  const [relevantOutbreaks, setRelevantOutbreaks] = useState<OutbreakData[]>([]);

  useEffect(() => {
    // Check for outbreaks that match current symptoms
    const allOutbreaks = [...outbreakData.global, ...outbreakData.local];
    const symptomsText = symptoms.map(s => s.description.toLowerCase()).join(' ');
    
    const matches = allOutbreaks.filter(outbreak => {
      return outbreak.symptoms?.some(outbreakSymptom => 
        symptomsText.includes(outbreakSymptom.toLowerCase()) ||
        outbreakSymptom.toLowerCase().includes(symptomsText.split(' ').find(word => word.length > 3) || '')
      );
    });
    
    setRelevantOutbreaks(matches);
  }, [symptoms, outbreakData]);

  const handleAddSymptom = () => {
    if (description.trim() && duration.trim()) {
      onAddSymptom({
        description: description.trim(),
        severity,
        duration: duration.trim(),
      });
      setDescription('');
      setDuration('');
      setSeverity('mild');
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
                    placeholder="e.g., headache, fever, cough, sore throat..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
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
                
                <Button 
                  onClick={handleAddSymptom} 
                  disabled={!description.trim() || !duration.trim()}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Symptom
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
                            {outbreak.symptoms.slice(0, 3).map((symptom, index) => (
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
          <Button onClick={onContinue} size="lg" className="px-8">
            Continue to Assessment
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Your symptoms will be analyzed in context of current health alerts
          </p>
        </div>
      )}
    </div>
  );
}