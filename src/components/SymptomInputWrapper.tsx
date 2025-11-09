import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SymptomInput } from './SymptomInput';
import { Symptom } from '../types/doctor';

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
    
    // Store result for navigation
    localStorage.setItem('analysisResult', JSON.stringify({
      result: result.data,
      symptoms,
      timestamp: result.data.timestamp,
      apiUsed: 'analyze'
    }));

    // Navigate directly to analysis results instead of showing modal
    navigate('/analysis', {
      state: {
        symptoms,
        result: {
          possibleConditions: result.data.possibleConditions.map((condition: any) => ({
            name: condition.disease,
            probability: condition.confidence,
            description: `Confidence: ${(condition.confidence * 100).toFixed(1)}%`
          })),
          urgencyLevel: result.data.urgency,
          recommendations: result.data.recommendedActions,
          disclaimer: result.data.summary,
          primaryDiagnosis: result.data.primaryDiagnosis,
          confidence: result.data.confidence,
          confidenceLevel: result.data.confidenceLevel,
          requiresImmediateAttention: result.data.requiresImmediateAttention,
          timestamp: result.data.timestamp
        }
      }
    });
  };

  const handleContinue = () => {
    const storedResult = localStorage.getItem('analysisResult');
    if (storedResult) {
      const parsed = JSON.parse(storedResult);
      navigate('/analysis', {
        state: {
          symptoms,
          result: parsed.result
        }
      });
      localStorage.removeItem('analysisResult');
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
    </div>
  );
}