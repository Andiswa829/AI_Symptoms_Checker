import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  Globe, 
  MapPin, 
  AlertTriangle, 
  Users,
  Activity,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  Clock,
  Minus,
  TrendingDown
} from 'lucide-react';
import type { OutbreakData, LocationData } from '../types/outbreaks';
import { Progress } from './ui/progress';

interface OutbreakDashboardProps {
  globalOutbreaks: OutbreakData[];
  localOutbreaks: OutbreakData[];
  location: LocationData | null;
  onBack: () => void;
  lastUpdated: Date | null;
}

export function OutbreakDashboard({ 
  globalOutbreaks, 
  localOutbreaks, 
  location, 
  onBack, 
  lastUpdated 
}: OutbreakDashboardProps) {
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null);
  const [showEmbedded, setShowEmbedded] = useState(false);

  // NICD Dashboard configurations
  const nicdDashboards = {
    clinical: [
      {
        id: 'tb-dashboard',
        name: "End TB Campaign Dashboard",
        url: "https://www.nicd.ac.za/tb-naat-dashboard/",
        embedUrl: "https://www.nicd.ac.za/tb-naat-dashboard/",
        description: "Tuberculosis surveillance and NAAT testing data",
        severity: "high",
        category: "Respiratory Disease",
        icon: <Activity className="h-5 w-5" />,
        symptoms: ["Persistent cough", "Chest pain", "Weight loss", "Night sweats", "Fatigue", "Fever"],
        embeddable: true
      },
      {
        id: 'cholera-dashboard',
        name: "Cholera Dashboard", 
        url: "https://www.nicd.ac.za/cholera-dashboard/",
        embedUrl: "https://www.nicd.ac.za/cholera-dashboard/",
        description: "Cholera outbreak monitoring and case tracking",
        severity: "critical",
        category: "Infectious Disease",
        icon: <AlertTriangle className="h-5 w-5" />,
        symptoms: ["Severe diarrhea", "Vomiting", "Dehydration", "Muscle cramps", "Low blood pressure"],
        embeddable: true
      },
      {
        id: 'measles-dashboard',
        name: "Measles/Rubella Dashboard",
        url: "https://www.nicd.ac.za/measles-rubella-dashboard/",
        embedUrl: "https://www.nicd.ac.za/measles-rubella-dashboard/",
        description: "Measles and rubella surveillance data",
        severity: "medium",
        category: "Vaccine-Preventable",
        icon: <Users className="h-5 w-5" />,
        symptoms: ["High fever", "Cough", "Runny nose", "Red eyes", "Skin rash", "White spots in mouth"],
        embeddable: true
      },
      {
        id: 'mpox-dashboard',
        name: "Mpox Dashboard",
        url: "https://www.nicd.ac.za/mpox-dashboard/",
        embedUrl: "https://www.nicd.ac.za/mpox-dashboard/",
        description: "Mpox (monkeypox) case monitoring",
        severity: "high", 
        category: "Infectious Disease",
        icon: <AlertTriangle className="h-5 w-5" />,
        symptoms: ["Skin rash", "Fever", "Headache", "Muscle aches", "Back pain", "Swollen lymph nodes"],
        embeddable: true
      },
      {
        id: 'rabies-dashboard',
        name: "Rabies Dashboard",
        url: "https://www.nicd.ac.za/rabies-dashboard/",
        embedUrl: "https://www.nicd.ac.za/rabies-dashboard/",
        description: "Rabies surveillance and prevention tracking",
        severity: "medium",
        category: "Zoonotic Disease",
        icon: <Activity className="h-5 w-5" />,
        symptoms: ["Fever", "Headache", "Nausea", "Vomiting", "Agitation", "Confusion", "Hydrophobia"],
        embeddable: true
      },
      {
        id: 'amr-dashboard',
        name: "Antimicrobial Resistance Dashboard",
        url: "https://www.nicd.ac.za/anti-microbial-resistance-surveillance-dashboard/",
        embedUrl: "https://www.nicd.ac.za/anti-microbial-resistance-surveillance-dashboard/",
        description: "AMR surveillance and resistance patterns",
        severity: "high",
        category: "Drug Resistance",
        icon: <TrendingUp className="h-5 w-5" />,
        symptoms: ["Persistent infection", "Treatment failure", "Prolonged illness", "Recurring symptoms"],
        embeddable: true
      }
    ],
    environmental: [
      {
        id: 'covid-wastewater',
        name: "SARS-CoV-2 Wastewater Surveillance",
        url: "https://www.nicd.ac.za/sars-cov-2-wastewater-surveillance/",
        embedUrl: "https://www.nicd.ac.za/sars-cov-2-wastewater-surveillance/",
        description: "COVID-19 environmental surveillance",
        icon: <Globe className="h-5 w-5 text-blue-600" />,
        symptoms: ["Fever", "Cough", "Shortness of breath", "Loss of taste/smell", "Fatigue", "Body aches"],
        embeddable: true
      },
      {
        id: 'mpox-wastewater',
        name: "Mpox Wastewater Surveillance",
        url: "https://www.nicd.ac.za/mpox-wastewater-surveillance-dashboard/",
        embedUrl: "https://www.nicd.ac.za/mpox-wastewater-surveillance-dashboard/",
        description: "Mpox environmental detection",
        icon: <Globe className="h-5 w-5 text-orange-600" />,
        symptoms: ["Skin lesions", "Fever", "Headache", "Muscle aches", "Swollen lymph nodes"],
        embeddable: true
      },
      {
        id: 'measles-wastewater',
        name: "Measles Wastewater Surveillance", 
        url: "https://www.nicd.ac.za/measles-wastewater-surveillance-dashboard/",
        embedUrl: "https://www.nicd.ac.za/measles-wastewater-surveillance-dashboard/",
        description: "Measles environmental surveillance",
        icon: <Globe className="h-5 w-5 text-green-600" />,
        symptoms: ["High fever", "Cough", "Runny nose", "Red watery eyes", "Skin rash"],
        embeddable: true
      }
    ]
  };

  const handleViewDashboard = (dashboardId: string, embedded: boolean = true) => {
    setSelectedDashboard(dashboardId);
    setShowEmbedded(embedded);
  };

  const handleCloseDashboard = () => {
    setSelectedDashboard(null);
    setShowEmbedded(false);
  };

  const getCurrentDashboard = () => {
    if (selectedDashboard === 'nicd-main') {
      return {
        id: 'nicd-main',
        name: 'NICD Official Website',
        description: 'National Institute for Communicable Diseases - Full Website Access',
        url: 'https://www.nicd.ac.za/',
        embedUrl: 'https://www.nicd.ac.za/'
      };
    }
    
    const allDashboards = [...nicdDashboards.clinical, ...nicdDashboards.environmental];
    return allDashboards.find(d => d.id === selectedDashboard);
  };

  const allOutbreaks = [...globalOutbreaks, ...localOutbreaks];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-primary mb-2">NICD Health Surveillance</h1>
            <p className="text-muted-foreground">
              Official health monitoring dashboards from the National Institute for Communicable Diseases
              {location && (
                <span className="block mt-1">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  South Africa - {location.city ? `${location.city}, ` : ''}{location.country}
                </span>
              )}
            </p>
          </div>
          <div className="text-right">
            {lastUpdated && (
              <div className="flex items-center text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 mr-1" />
                <span>Updated {lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
            <Button 
              className="mt-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => window.open('https://www.nicd.ac.za/dashboards/', '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit NICD
            </Button>
          </div>
        </div>
      </div>

      {/* NICD Content */}
      <div className="space-y-6">
        {/* NICD Dashboards Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              NICD Health Surveillance Dashboards
            </CardTitle>
            <CardDescription>
              Official health surveillance dashboards from the National Institute for Communicable Diseases (NICD) of South Africa.
              Click on any dashboard to open it in a new tab for real-time data.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Quick Access to Most Important Dashboards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-red-600" />
              Priority Health Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Button 
                className="h-20 bg-red-600 hover:bg-red-700 text-white flex flex-col items-center justify-center space-y-2"
                onClick={() => handleViewDashboard('cholera-dashboard')}
              >
                <AlertTriangle className="h-6 w-6" />
                <span className="font-medium">Cholera Dashboard</span>
                <span className="text-xs opacity-90">View Embedded</span>
              </Button>
              <Button 
                className="h-20 bg-orange-600 hover:bg-orange-700 text-white flex flex-col items-center justify-center space-y-2"
                onClick={() => handleViewDashboard('tb-dashboard')}
              >
                <Activity className="h-6 w-6" />
                <span className="font-medium">TB Campaign Dashboard</span>
                <span className="text-xs opacity-90">View Embedded</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Dashboards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Clinical Disease Dashboards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nicdDashboards.clinical.map((dashboard) => (
                <Card key={dashboard.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {dashboard.icon}
                          <h4 className="font-semibold text-sm leading-tight">{dashboard.name}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">{dashboard.description}</p>
                        <Badge 
                          variant={dashboard.severity === 'critical' ? 'destructive' : 
                                 dashboard.severity === 'high' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {dashboard.category}
                        </Badge>
                      </div>
                    </div>
                    {/* Symptoms Section */}
                    {dashboard.symptoms && dashboard.symptoms.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground mb-2 font-medium">Common Symptoms:</p>
                        <div className="flex flex-wrap gap-1">
                          {dashboard.symptoms.map((symptom: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs capitalize bg-blue-50 text-blue-700 border-blue-200">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Button 
                        className="w-full"
                        onClick={() => handleViewDashboard(dashboard.id)}
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        View Embedded
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(dashboard.url, '_blank', 'noopener,noreferrer')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in New Tab
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Wastewater Surveillance Dashboards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-green-600" />
              Environmental Surveillance (Wastewater)
            </CardTitle>
            <CardDescription>
              Early warning systems through wastewater monitoring for disease detection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {nicdDashboards.environmental.map((dashboard) => (
                <Card key={dashboard.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        {dashboard.icon}
                        <h4 className="font-medium text-sm">{dashboard.name}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">{dashboard.description}</p>
                      {/* Symptoms Section */}
                      {dashboard.symptoms && dashboard.symptoms.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-muted-foreground mb-2 font-medium">Common Symptoms:</p>
                          <div className="flex flex-wrap gap-1">
                            {dashboard.symptoms.map((symptom: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs capitalize bg-green-50 text-green-700 border-green-200">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Button 
                          className="w-full"
                          onClick={() => handleViewDashboard(dashboard.id)}
                        >
                          <Activity className="h-4 w-4 mr-2" />
                          View Embedded
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => window.open(dashboard.url, '_blank', 'noopener,noreferrer')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in New Tab
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Power BI Integration Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Activity className="h-5 w-5 mr-2" />
              NICD Website & Power BI Dashboards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-blue-700">
                Access the full NICD website with all dashboards, or view specific Power BI analytics 
                for comprehensive health surveillance data.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setSelectedDashboard('nicd-main');
                    setShowEmbedded(true);
                  }}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  View NICD Website
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open('https://www.nicd.ac.za/publications/', '_blank', 'noopener,noreferrer')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Publications
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">Official NICD Data</p>
                <p className="text-amber-700">
                  These dashboards provide official health surveillance data from the National Institute for Communicable Diseases. 
                  Data is updated regularly and provides real-time insights for public health monitoring and response.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Embedded Dashboard Modal */}
      {showEmbedded && selectedDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-lg">{getCurrentDashboard()?.name}</h3>
                  <p className="text-sm text-muted-foreground">{getCurrentDashboard()?.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getCurrentDashboard()?.url, '_blank', 'noopener,noreferrer')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseDashboard}
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* Modal Content - iframe */}
            <div className="flex-1 relative">
              {getCurrentDashboard() && (
                <>
                  <iframe
                    src={getCurrentDashboard()?.embedUrl}
                    className="w-full h-full border-0 absolute inset-0"
                    title={getCurrentDashboard()?.name}
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    onLoad={() => {
                      // Hide loading overlay when iframe loads
                      const loadingEl = document.querySelector('.iframe-loading') as HTMLElement;
                      if (loadingEl) loadingEl.style.display = 'none';
                    }}
                    onError={(e) => {
                      console.log('iframe failed to load:', e);
                      // Show fallback message
                      const fallbackEl = document.querySelector('#iframe-fallback') as HTMLElement;
                      if (fallbackEl) {
                        fallbackEl.classList.remove('hidden');
                      }
                    }}
                  />
                  
                  {/* Loading overlay */}
                  <div className="iframe-loading absolute inset-0 bg-white flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                      <div>
                        <p className="font-medium">Loading NICD Dashboard...</p>
                        <p className="text-sm text-muted-foreground">
                          {getCurrentDashboard()?.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          If this takes too long, try opening in a new tab
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fallback Card for CORS/Loading Issues */}
                  <div id="iframe-fallback" className="hidden absolute inset-0 bg-gray-50 p-8 flex items-center justify-center">
                    <Card className="border-amber-200 bg-amber-50 max-w-md">
                      <CardContent className="p-6 text-center space-y-4">
                        <AlertTriangle className="h-12 w-12 text-amber-600 mx-auto" />
                        <div>
                          <h3 className="font-semibold text-amber-800 mb-2">Dashboard Loading Issue</h3>
                          <p className="text-sm text-amber-700 mb-4">
                            This dashboard may have security restrictions that prevent embedding. 
                            You can still access it in a new tab for full functionality.
                          </p>
                          <Button 
                            className="bg-amber-600 hover:bg-amber-700"
                            onClick={() => {
                              window.open(getCurrentDashboard()?.url, '_blank', 'noopener,noreferrer');
                              handleCloseDashboard();
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open {getCurrentDashboard()?.name}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4 text-muted-foreground">
                  <span>🏥 Official NICD Data</span>
                  <span>🔒 Secure Connection</span>
                  <span>⚡ Real-time Updates</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleCloseDashboard}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Close Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fallback Message for Dashboard Loading Issues */}
      <div className="hidden" id="iframe-fallback">
        <Card className="border-amber-200 bg-amber-50 mt-4">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">Dashboard Loading Notice</p>
                <p className="text-amber-700">
                  Some NICD dashboards may require direct access due to security settings. 
                  If the embedded view doesn't load, please use the "Open in New Tab" option.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}