import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Stethoscope,
  Brain,
  TrendingUp,
  BarChart3,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface SymptomAnalysisRecord {
  id: string;
  date: string;
  time: string;
  symptoms: string[];
  duration: string;
  severity: 'mild' | 'moderate' | 'severe';
  analysis: {
    primaryConditions: string[];
    secondaryConditions: string[];
    recommendations: string[];
    urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
    confidence: number;
  };
  status: 'completed' | 'pending' | 'reviewed';
  followUp: {
    recommended: boolean;
    type?: string;
    timeframe?: string;
    completed?: boolean;
  };
  doctorNotes?: string;
}

interface SymptomAnalysisHistoryProps {
  onBack: () => void;
  userId: string;
}

export function SymptomAnalysisHistory({ onBack, userId }: SymptomAnalysisHistoryProps) {
  const [records, setRecords] = useState<SymptomAnalysisRecord[]>([
    {
      id: '1',
      date: '2024-01-15',
      time: '14:30',
      symptoms: ['Headache', 'Fever', 'Fatigue', 'Nausea'],
      duration: '2 days',
      severity: 'moderate',
      analysis: {
        primaryConditions: ['Viral infection', 'Migraine'],
        secondaryConditions: ['Tension headache', 'Dehydration'],
        recommendations: [
          'Rest and adequate sleep',
          'Stay hydrated',
          'Consider over-the-counter pain relief',
          'Monitor temperature'
        ],
        urgencyLevel: 'medium',
        confidence: 78
      },
      status: 'completed',
      followUp: {
        recommended: true,
        type: 'General Practitioner',
        timeframe: 'Within 3 days',
        completed: true
      },
      doctorNotes: 'Patient recovered well with rest and fluids. Viral infection confirmed.'
    },
    {
      id: '2',
      date: '2024-01-10',
      time: '09:15',
      symptoms: ['Chest pain', 'Shortness of breath', 'Dizziness'],
      duration: '30 minutes',
      severity: 'severe',
      analysis: {
        primaryConditions: ['Chest pain investigation required'],
        secondaryConditions: ['Anxiety', 'Heart palpitations'],
        recommendations: [
          'Seek immediate medical attention',
          'Avoid strenuous activity',
          'Monitor symptoms closely'
        ],
        urgencyLevel: 'high',
        confidence: 85
      },
      status: 'reviewed',
      followUp: {
        recommended: true,
        type: 'Emergency Department',
        timeframe: 'Immediately',
        completed: true
      },
      doctorNotes: 'ECG and blood tests normal. Diagnosed with anxiety-related symptoms.'
    },
    {
      id: '3',
      date: '2024-01-05',
      time: '16:45',
      symptoms: ['Cough', 'Sore throat', 'Runny nose'],
      duration: '5 days',
      severity: 'mild',
      analysis: {
        primaryConditions: ['Common cold', 'Upper respiratory infection'],
        secondaryConditions: ['Allergic rhinitis'],
        recommendations: [
          'Rest and fluids',
          'Throat lozenges',
          'Steam inhalation',
          'Monitor for worsening symptoms'
        ],
        urgencyLevel: 'low',
        confidence: 92
      },
      status: 'completed',
      followUp: {
        recommended: false
      }
    }
  ]);

  const [filteredRecords, setFilteredRecords] = useState(records);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    let filtered = records;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.symptoms.some(symptom => 
          symptom.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        record.analysis.primaryConditions.some(condition =>
          condition.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(record => record.status === filterStatus);
    }

    // Urgency filter
    if (filterUrgency !== 'all') {
      filtered = filtered.filter(record => record.analysis.urgencyLevel === filterUrgency);
    }

    setFilteredRecords(filtered);
  }, [searchTerm, filterStatus, filterUrgency, records]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'reviewed':
        return <Eye className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const renderAnalysisCard = (record: SymptomAnalysisRecord) => {
    const isExpanded = expandedRecord === record.id;

    return (
      <Card key={record.id} className="mb-4">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{record.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{record.time}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <Badge className={getStatusColor(record.status)}>
                  {getStatusIcon(record.status)}
                  <span className="ml-1 capitalize">{record.status}</span>
                </Badge>
                <Badge className={getUrgencyColor(record.analysis.urgencyLevel)}>
                  <span className="capitalize">{record.analysis.urgencyLevel} Priority</span>
                </Badge>
                <Badge className={getSeverityColor(record.severity)}>
                  <span className="capitalize">{record.severity}</span>
                </Badge>
              </div>

              <div className="mb-3">
                <h4 className="font-medium text-sm mb-2">Reported Symptoms:</h4>
                <div className="flex flex-wrap gap-1">
                  {record.symptoms.map((symptom, index) => (
                    <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2 font-medium">{record.duration}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="ml-2 font-medium">{record.analysis.confidence}%</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setExpandedRecord(isExpanded ? null : record.id)}
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isExpanded && (
            <div className="border-t pt-4 space-y-4">
              <div>
                <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Primary Conditions Considered:
                </h5>
                <ul className="space-y-1">
                  {record.analysis.primaryConditions.map((condition, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-blue-500"></div>
                      {condition}
                    </li>
                  ))}
                </ul>
              </div>

              {record.analysis.secondaryConditions.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm mb-2">Secondary Conditions Considered:</h5>
                  <ul className="space-y-1">
                    {record.analysis.secondaryConditions.map((condition, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-gray-400"></div>
                        {condition}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Recommendations:
                </h5>
                <ul className="space-y-1">
                  {record.analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>

              {record.followUp.recommended && (
                <div>
                  <h5 className="font-medium text-sm mb-2">Follow-up Recommendations:</h5>
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        {record.followUp.type} visit recommended
                      </span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Timeframe: {record.followUp.timeframe}
                    </p>
                    {record.followUp.completed && (
                      <div className="flex items-center gap-1 mt-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">Follow-up completed</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {record.doctorNotes && (
                <div>
                  <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Doctor's Notes:
                  </h5>
                  <div className="bg-green-50 p-3 rounded-md">
                    <p className="text-sm text-green-800">{record.doctorNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderStatsCard = () => {
    const totalAnalyses = records.length;
    const completedAnalyses = records.filter(r => r.status === 'completed').length;
    const highUrgencyCount = records.filter(r => r.analysis.urgencyLevel === 'high' || r.analysis.urgencyLevel === 'emergency').length;
    const followUpCompletionRate = records.filter(r => r.followUp.recommended && r.followUp.completed).length / records.filter(r => r.followUp.recommended).length * 100;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalAnalyses}</p>
                <p className="text-sm text-muted-foreground">Total Analyses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{completedAnalyses}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{highUrgencyCount}</p>
                <p className="text-sm text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{isNaN(followUpCompletionRate) ? 0 : Math.round(followUpCompletionRate)}%</p>
                <p className="text-sm text-muted-foreground">Follow-up Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-primary">Symptom Analysis History</h1>
            <p className="text-muted-foreground">Review your past symptom analyses and health insights</p>
          </div>
        </div>
      </div>

      {renderStatsCard()}

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search symptoms or conditions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
            </select>
            
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Priority</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Analyses</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="high-priority">High Priority</TabsTrigger>
          <TabsTrigger value="follow-up">Follow-up Required</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No analyses found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterStatus !== 'all' || filterUrgency !== 'all'
                    ? "Try adjusting your search criteria or filters"
                    : "You haven't performed any symptom analyses yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map(record => renderAnalysisCard(record))
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          {filteredRecords
            .filter(record => {
              const recordDate = new Date(record.date);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return recordDate >= weekAgo;
            })
            .map(record => renderAnalysisCard(record))}
        </TabsContent>

        <TabsContent value="high-priority" className="space-y-4">
          {filteredRecords
            .filter(record => record.analysis.urgencyLevel === 'high' || record.analysis.urgencyLevel === 'emergency')
            .map(record => renderAnalysisCard(record))}
        </TabsContent>

        <TabsContent value="follow-up" className="space-y-4">
          {filteredRecords
            .filter(record => record.followUp.recommended && !record.followUp.completed)
            .map(record => renderAnalysisCard(record))}
        </TabsContent>
      </Tabs>
    </div>
  );
}