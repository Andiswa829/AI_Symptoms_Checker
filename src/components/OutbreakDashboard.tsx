import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Progress } from './ui/progress';
import { 
  ArrowLeft, 
  Globe, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Activity,
  Filter,
  Search,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import type { OutbreakData, LocationData } from '../App';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [sortBy, setSortBy] = useState('severity');

  const allOutbreaks = [...globalOutbreaks, ...localOutbreaks];

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          bgColor: 'bg-red-50 border-red-200',
          icon: <AlertTriangle className="h-4 w-4" />,
          priority: 4
        };
      case 'high':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          bgColor: 'bg-orange-50 border-orange-200',
          icon: <TrendingUp className="h-4 w-4" />,
          priority: 3
        };
      case 'medium':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          bgColor: 'bg-yellow-50 border-yellow-200',
          icon: <Activity className="h-4 w-4" />,
          priority: 2
        };
      case 'low':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          bgColor: 'bg-green-50 border-green-200',
          icon: <Activity className="h-4 w-4" />,
          priority: 1
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          bgColor: 'bg-gray-50 border-gray-200',
          icon: <Activity className="h-4 w-4" />,
          priority: 0
        };
    }
  };

  const getTrendIcon = (direction?: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-600" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Less than 1 hour ago';
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const filteredOutbreaks = (outbreaks: OutbreakData[]) => {
    return outbreaks
      .filter(outbreak => {
        const matchesSearch = outbreak.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             outbreak.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             outbreak.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSeverity = filterSeverity === 'all' || outbreak.severity === filterSeverity;
        return matchesSearch && matchesSeverity;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'severity':
            return getSeverityConfig(b.severity).priority - getSeverityConfig(a.severity).priority;
          case 'date':
            return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
          case 'cases':
            return (b.caseCount || 0) - (a.caseCount || 0);
          case 'location':
            return a.location.localeCompare(b.location);
          default:
            return 0;
        }
      });
  };

  const getStatistics = () => {
    const total = allOutbreaks.length;
    const critical = allOutbreaks.filter(o => o.severity === 'critical').length;
    const high = allOutbreaks.filter(o => o.severity === 'high').length;
    const totalCases = allOutbreaks.reduce((sum, o) => sum + (o.caseCount || 0), 0);
    const totalDeaths = allOutbreaks.reduce((sum, o) => sum + (o.deathCount || 0), 0);
    
    return { total, critical, high, totalCases, totalDeaths };
  };

  const stats = getStatistics();

  const OutbreakCard = ({ outbreak }: { outbreak: OutbreakData }) => {
    const config = getSeverityConfig(outbreak.severity);
    
    return (
      <Card className={`transition-all hover:shadow-md ${config.bgColor}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base leading-tight mb-1">{outbreak.title}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge className={config.color} variant="outline">
                  {config.icon}
                  <span className="ml-1 capitalize">{outbreak.severity}</span>
                </Badge>
                <div className="flex items-center text-xs text-muted-foreground">
                  {getTrendIcon(outbreak.trendDirection)}
                  <span className="ml-1">{outbreak.trendDirection || 'stable'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {outbreak.description}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Location</p>
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="text-sm truncate">{outbreak.location}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Source</p>
              <Badge variant="secondary" className="text-xs">
                {outbreak.source}
              </Badge>
            </div>
          </div>
          
          {outbreak.caseCount && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span>Cases: {outbreak.caseCount.toLocaleString()}</span>
                <span>Deaths: {(outbreak.deathCount || 0).toLocaleString()}</span>
              </div>
              {outbreak.recoveredCount && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Recovery Rate</span>
                    <span>{Math.round((outbreak.recoveredCount / outbreak.caseCount) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(outbreak.recoveredCount / outbreak.caseCount) * 100} 
                    className="h-1"
                  />
                </div>
              )}
            </div>
          )}
          
          {outbreak.symptoms && outbreak.symptoms.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Key Symptoms</p>
              <div className="flex flex-wrap gap-1">
                {outbreak.symptoms.slice(0, 4).map((symptom, index) => (
                  <Badge key={index} variant="outline" className="text-xs capitalize">
                    {symptom}
                  </Badge>
                ))}
                {outbreak.symptoms.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{outbreak.symptoms.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatDate(outbreak.lastUpdated)}</span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <ExternalLink className="h-3 w-3 mr-1" />
              Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-primary mb-2">Global Health Monitoring</h1>
            <p className="text-muted-foreground">
              Real-time disease outbreak tracking and health alerts
              {location && (
                <span className="block mt-1">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  {location.city ? `${location.city}, ` : ''}{location.country}
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
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Outbreaks</p>
                <p className="text-2xl">{stats.total}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl text-red-600">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl text-orange-600">{stats.high}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cases</p>
                <p className="text-2xl">{stats.totalCases.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fatalities</p>
                <p className="text-2xl">{stats.totalDeaths.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search outbreaks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="severity">Severity</SelectItem>
                <SelectItem value="date">Date Updated</SelectItem>
                <SelectItem value="cases">Case Count</SelectItem>
                <SelectItem value="location">Location</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center text-sm text-muted-foreground">
              Showing {filteredOutbreaks(allOutbreaks).length} outbreak{filteredOutbreaks(allOutbreaks).length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            All Outbreaks ({allOutbreaks.length})
          </TabsTrigger>
          <TabsTrigger value="local">
            Local ({localOutbreaks.length})
          </TabsTrigger>
          <TabsTrigger value="global">
            Global ({globalOutbreaks.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <ScrollArea className="h-[800px]">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredOutbreaks(allOutbreaks).map(outbreak => (
                <OutbreakCard key={outbreak.id} outbreak={outbreak} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="local" className="mt-6">
          <ScrollArea className="h-[800px]">
            {filteredOutbreaks(localOutbreaks).length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg mb-2">No local outbreaks</h3>
                  <p className="text-muted-foreground">
                    No disease outbreaks are currently being monitored in your area.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredOutbreaks(localOutbreaks).map(outbreak => (
                  <OutbreakCard key={outbreak.id} outbreak={outbreak} />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="global" className="mt-6">
          <ScrollArea className="h-[800px]">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredOutbreaks(globalOutbreaks).map(outbreak => (
                <OutbreakCard key={outbreak.id} outbreak={outbreak} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}