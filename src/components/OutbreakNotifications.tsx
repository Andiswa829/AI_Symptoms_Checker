import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Globe, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  Users, 
  TrendingUp,
  ExternalLink,
  Bell,
  Info
} from 'lucide-react';
import type { OutbreakData, LocationData } from '../App';

interface OutbreakNotificationsProps {
  globalOutbreaks: OutbreakData[];
  localOutbreaks: OutbreakData[];
  location: LocationData | null;
  isOpen: boolean;
  onToggle: () => void;
  lastUpdated: Date | null;
}

export function OutbreakNotifications({
  globalOutbreaks,
  localOutbreaks,
  location,
  isOpen,
  onToggle,
  lastUpdated
}: OutbreakNotificationsProps) {
  const [selectedOutbreak, setSelectedOutbreak] = useState<OutbreakData | null>(null);

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <AlertTriangle className="h-4 w-4" />,
          bgColor: 'bg-red-50 border-red-200'
        };
      case 'high':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: <TrendingUp className="h-4 w-4" />,
          bgColor: 'bg-orange-50 border-orange-200'
        };
      case 'medium':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Info className="h-4 w-4" />,
          bgColor: 'bg-yellow-50 border-yellow-200'
        };
      case 'low':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <Info className="h-4 w-4" />,
          bgColor: 'bg-green-50 border-green-200'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Info className="h-4 w-4" />,
          bgColor: 'bg-gray-50 border-gray-200'
        };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const getHighestSeverityCount = () => {
    const allOutbreaks = [...globalOutbreaks, ...localOutbreaks];
    const critical = allOutbreaks.filter(o => o.severity === 'critical').length;
    const high = allOutbreaks.filter(o => o.severity === 'high').length;
    
    if (critical > 0) return { count: critical, type: 'critical' };
    if (high > 0) return { count: high, type: 'high' };
    return { count: allOutbreaks.length, type: 'total' };
  };

  const severityCount = getHighestSeverityCount();

  const OutbreakCard = ({ outbreak }: { outbreak: OutbreakData }) => {
    const config = getSeverityConfig(outbreak.severity);
    
    return (
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md ${config.bgColor}`}
        onClick={() => setSelectedOutbreak(outbreak)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm leading-tight">{outbreak.title}</CardTitle>
            <Badge className={config.color} variant="outline">
              {config.icon}
              <span className="ml-1 capitalize">{outbreak.severity}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {outbreak.description}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {outbreak.location}
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDate(outbreak.lastUpdated)}
            </div>
          </div>
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              {outbreak.source}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  const OutbreakDetails = ({ outbreak }: { outbreak: OutbreakData }) => {
    const config = getSeverityConfig(outbreak.severity);
    
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg leading-tight">{outbreak.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{outbreak.location}</p>
          </div>
          <Badge className={config.color}>
            {config.icon}
            <span className="ml-1 capitalize">{outbreak.severity}</span>
          </Badge>
        </div>
        
        <p className="text-sm">{outbreak.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="mb-1">Source</h4>
            <p className="text-muted-foreground">{outbreak.source}</p>
          </div>
          <div>
            <h4 className="mb-1">Last Updated</h4>
            <p className="text-muted-foreground">{formatDate(outbreak.lastUpdated)}</p>
          </div>
        </div>
        
        {outbreak.symptoms && outbreak.symptoms.length > 0 && (
          <div>
            <h4 className="text-sm mb-2">Reported Symptoms</h4>
            <div className="flex flex-wrap gap-1">
              {outbreak.symptoms.map((symptom, index) => (
                <Badge key={index} variant="outline" className="text-xs capitalize">
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {outbreak.prevention && outbreak.prevention.length > 0 && (
          <div>
            <h4 className="text-sm mb-2">Prevention Measures</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              {outbreak.prevention.map((measure, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  {measure}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <Button variant="outline" size="sm" className="w-full">
          <ExternalLink className="h-4 w-4 mr-2" />
          View Official Report
        </Button>
      </div>
    );
  };

  return (
    <>
      {/* Floating notification button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={onToggle}
          variant={severityCount.type === 'critical' ? 'destructive' : 
                   severityCount.type === 'high' ? 'default' : 'outline'}
          size="sm"
          className="relative"
        >
          <Bell className="h-4 w-4 mr-2" />
          Outbreaks
          {severityCount.count > 0 && (
            <Badge 
              variant={severityCount.type === 'critical' ? 'destructive' : 'secondary'}
              className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {severityCount.count}
            </Badge>
          )}
        </Button>
      </div>

      {/* Outbreak notifications sheet */}
      <Sheet open={isOpen} onOpenChange={onToggle}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Disease Outbreak Alerts
            </SheetTitle>
            <SheetDescription>
              Stay informed about current health emergencies and disease outbreaks
              {location && (
                <span className="block mt-1">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  {location.city ? `${location.city}, ` : ''}{location.state ? `${location.state}, ` : ''}{location.country}
                </span>
              )}
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6">
            {lastUpdated && (
              <div className="flex items-center text-xs text-muted-foreground mb-4">
                <Clock className="h-3 w-3 mr-1" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            
            {selectedOutbreak ? (
              <div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedOutbreak(null)}
                  className="mb-4"
                >
                  ← Back to list
                </Button>
                <OutbreakDetails outbreak={selectedOutbreak} />
              </div>
            ) : (
              <Tabs defaultValue="local" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="local" className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Local ({localOutbreaks.length})
                  </TabsTrigger>
                  <TabsTrigger value="global" className="flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    Global ({globalOutbreaks.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="local" className="mt-4">
                  <ScrollArea className="h-[600px]">
                    {localOutbreaks.length === 0 ? (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          No local outbreak alerts for your area at this time.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-3">
                        {localOutbreaks.map((outbreak) => (
                          <OutbreakCard key={outbreak.id} outbreak={outbreak} />
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="global" className="mt-4">
                  <ScrollArea className="h-[600px]">
                    {globalOutbreaks.length === 0 ? (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          No global outbreak alerts available at this time.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-3">
                        {globalOutbreaks.map((outbreak) => (
                          <OutbreakCard key={outbreak.id} outbreak={outbreak} />
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}