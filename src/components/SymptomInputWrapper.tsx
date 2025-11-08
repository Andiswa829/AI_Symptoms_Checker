import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SymptomInput } from './SymptomInput';
import { Symptom } from '../types/doctor';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { AlertTriangle, Info, Phone } from 'lucide-react';

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

export function SymptomInputWrapper() {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ApiResponse | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const handleAddSymptom = (symptom: Omit<Symptom, 'id' | 'timestamp'> | Array<Omit<Symptom, 'id' | 'timestamp'>>) => {
    console.log('SymptomInputWrapper handleAddSymptom called with:', symptom);
    
    if (Array.isArray(symptom)) {
      // Handle multiple symptoms
      const newSymptoms = symptom.map((s, index) => ({
        ...s,
        id: `sym-${Date.now()}-${index}-${Math.random()}`, // Unique ID for each
        timestamp: new Date().toISOString()
      }));
      
      console.log('New symptoms created:', newSymptoms);
      console.log('Current symptoms before adding:', symptoms);
      
      setSymptoms(prevSymptoms => [...prevSymptoms, ...newSymptoms]);
      
      console.log('Multiple symptoms updated');
    } else {
      // Handle single symptom
      const newSymptom = {
        ...symptom,
        id: `sym-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString()
      };
      
      console.log('New symptom created:', newSymptom);
      console.log('Current symptoms before adding:', symptoms);
      
      setSymptoms(prevSymptoms => [...prevSymptoms, newSymptom]);
      
      console.log('Single symptom updated');
    }
  };

  const handleRemoveSymptom = (id: string) => {
    setSymptoms(symptoms.filter(s => s.id !== id));
  };

  const handleAnalysisComplete = (result: ApiResponse) => {
    setAnalysisResult(result);
    setShowResultModal(true);
    
    // Store result for navigation
    localStorage.setItem('analysisResult', JSON.stringify({
      result: result.data,
      symptoms,
      timestamp: result.data.timestamp,
      apiUsed: 'analyze'
    }));
  };

  const handleContinueToResults = () => {
    if (analysisResult) {
      navigate('/analysis', {
        state: {
          symptoms,
          result: {
            possibleConditions: analysisResult.data.possibleConditions.map((condition: any) => ({
              name: condition.disease,
              probability: condition.confidence,
              description: `Confidence: ${(condition.confidence * 100).toFixed(1)}%`
            })),
            urgencyLevel: analysisResult.data.urgency,
            recommendations: analysisResult.data.recommendedActions,
            disclaimer: analysisResult.data.summary,
            primaryDiagnosis: analysisResult.data.primaryDiagnosis,
            confidence: analysisResult.data.confidence,
            confidenceLevel: analysisResult.data.confidenceLevel,
            requiresImmediateAttention: analysisResult.data.requiresImmediateAttention,
            timestamp: analysisResult.data.timestamp
          }
        }
      });
      
      localStorage.removeItem('analysisResult');
      setShowResultModal(false);
    }
  };

  const getUrgencyAlert = (result: ApiResponse) => {
    const { data } = result;
    
    // Handle insufficient data case
    if (data.primaryDiagnosis.toLowerCase().includes('insufficient data') || 
        data.confidenceLevel.toLowerCase().includes('very low')) {
      return (
        <Alert className="border-orange-500 bg-orange-50">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="space-y-3">
              <div>
                <strong>Analysis Notice:</strong> Our system requires more detailed information to provide an accurate assessment.
              </div>
              <div className="text-sm">
                <p><strong>Current Status:</strong> {data.confidenceLevel}</p>
                <p><strong>Confidence Level:</strong> {(data.confidence * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-orange-100 p-3 rounded border-l-4 border-orange-400">
                <p className="text-sm font-medium mb-2">What this means:</p>
                <ul className="text-sm list-disc list-inside space-y-1">
                  <li>More symptoms or medical history may be needed</li>
                  <li>A healthcare professional can provide better guidance</li>
                  <li>Consider providing additional details about your symptoms</li>
                </ul>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    // Handle emergency case
    if (data.urgency === 'emergency' || data.requiresImmediateAttention) {
      return (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="space-y-3">
              <div className="text-lg font-bold">⚠️ IMMEDIATE MEDICAL ATTENTION REQUIRED</div>
              <div className="bg-red-100 p-3 rounded border-l-4 border-red-500">
                <p className="font-medium mb-2">Recommended Actions:</p>
                <ul className="list-disc list-inside space-y-1">
                  {data.recommendedActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>If this is a life-threatening emergency, call your local emergency services immediately.</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    // Handle urgent case
    if (data.urgency === 'urgent') {
      return (
        <Alert className="border-orange-500 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="space-y-2">
              <div className="font-bold">Urgent Medical Consultation Recommended</div>
              <p>Please contact a healthcare provider within 24-48 hours.</p>
              <div className="text-sm">
                <strong>Primary Assessment:</strong> {data.primaryDiagnosis}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    // Handle routine case
    return (
      <Alert className="border-blue-500 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="space-y-2">
            <div className="font-bold">Analysis Complete</div>
            <p><strong>Primary Assessment:</strong> {data.primaryDiagnosis}</p>
            <p><strong>Confidence:</strong> {data.confidenceLevel} ({(data.confidence * 100).toFixed(1)}%)</p>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  const handleContinue = () => {
    const storedResult = localStorage.getItem('analysisResult');
    if (storedResult) {
      handleContinueToResults();
    } else {
      navigate('/analysis', { state: { symptoms } });
    }
  };

  return (
    <div>
      <SymptomInput
        symptoms={symptoms}
        onAddSymptom={handleAddSymptom}
        onRemoveSymptom={handleRemoveSymptom}
        onContinue={handleContinue}
        onBack={() => navigate('/health-data')}
        onSubmit={async () => {/* Implementation */}}
        isLoading={false}
        isSubmitting={isSubmitting}
        outbreakData={{ global: [], local: [] }}
        location={null}
        onAnalysisComplete={handleAnalysisComplete}
      />

      {/* Result Modal */}
      {showResultModal && analysisResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2">Analysis Results</h2>
                <p className="text-muted-foreground">{analysisResult.message}</p>
              </div>

              {getUrgencyAlert(analysisResult)}

              <div className="mt-6 flex gap-3">
                {analysisResult.data.urgency === 'emergency' ? (
                  <div className="flex flex-col space-y-2 w-full">
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700"
                      onClick={() => {
                        // Open emergency contact or redirect to emergency services
                        window.open('tel:911', '_self');
                      }}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Emergency Services
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleContinueToResults}
                      className="w-full"
                    >
                      View Detailed Results
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button onClick={handleContinueToResults} className="flex-1">
                      View Detailed Results
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/doctors')}
                      className="flex-1"
                    >
                      Find Doctors
                    </Button>
                  </>
                )}
              </div>

              <div className="mt-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowResultModal(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}