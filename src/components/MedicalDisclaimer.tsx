import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { 
  AlertTriangle, 
  Shield, 
  FileText, 
  Heart, 
  ArrowLeft,
  CheckCircle 
} from "lucide-react";

interface MedicalDisclaimerProps {
  onAccept: () => void;
  onBack: () => void;
}

export function MedicalDisclaimer({ onAccept, onBack }: MedicalDisclaimerProps) {
  const [agreements, setAgreements] = useState({
    notMedicalAdvice: false,
    emergencyAwareness: false,
    dataPrivacy: false,
    accurateInformation: false
  });

  const allAgreed = Object.values(agreements).every(agreed => agreed);

  const handleAgreementChange = (key: keyof typeof agreements, checked: boolean) => {
    setAgreements(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-medium">Important Medical Disclaimer</h1>
          <p className="text-muted-foreground">
            Please read and accept the following terms before proceeding
          </p>
        </div>
      </div>

      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Emergency Warning:</strong> If you are experiencing a medical emergency, 
          stop using this application immediately and call your local emergency number.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle>Medical Disclaimer & Terms of Use</CardTitle>
          <CardDescription>
            This AI-powered symptom checker is designed to provide health information and guidance, 
            but it is not a substitute for professional medical advice, diagnosis, or treatment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Not Medical Advice */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium">Not Medical Advice</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  The information provided by this application is for educational and informational purposes only. 
                  It should not be considered as medical advice, diagnosis, or treatment recommendations. 
                  Always consult with qualified healthcare professionals for medical concerns.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-8">
              <Checkbox 
                id="notMedicalAdvice"
                checked={agreements.notMedicalAdvice}
                onCheckedChange={(checked) => handleAgreementChange("notMedicalAdvice", checked as boolean)}
              />
              <label htmlFor="notMedicalAdvice" className="text-sm">
                I understand this is not medical advice and will consult healthcare professionals for medical concerns
              </label>
            </div>
          </div>

          <Separator />

          {/* Emergency Situations */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium">Emergency Situations</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This application should not be used for emergency medical situations. If you are experiencing:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 ml-4 space-y-1">
                  <li>• Severe chest pain or difficulty breathing</li>
                  <li>• Signs of stroke (sudden numbness, confusion, trouble speaking)</li>
                  <li>• Severe bleeding or trauma</li>
                  <li>• Loss of consciousness or severe confusion</li>
                  <li>• Severe allergic reactions</li>
                  <li>• Any life-threatening symptoms</li>
                </ul>
                <p className="text-sm text-red-600 mt-2 font-medium">
                  Seek immediate emergency medical care or call emergency services.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-8">
              <Checkbox 
                id="emergencyAwareness"
                checked={agreements.emergencyAwareness}
                onCheckedChange={(checked) => handleAgreementChange("emergencyAwareness", checked as boolean)}
              />
              <label htmlFor="emergencyAwareness" className="text-sm">
                I understand when to seek emergency medical care and will not rely on this app for emergencies
              </label>
            </div>
          </div>

          <Separator />

          {/* Data Privacy */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium">Health Data Privacy</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your health information is important to us. We collect and process your health data 
                  (symptoms, vital signs, health metrics) solely to provide you with personalized health insights. 
                  Your data is encrypted, securely stored, and only used for the purposes of this assessment.
                </p>
                <ul className="text-sm text-muted-foreground mt-2 ml-4 space-y-1">
                  <li>• We do not share your personal health information with third parties</li>
                  <li>• Data is encrypted both in transit and at rest</li>
                  <li>• You can request deletion of your data at any time</li>
                  <li>• We comply with applicable health data protection regulations</li>
                </ul>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-8">
              <Checkbox 
                id="dataPrivacy"
                checked={agreements.dataPrivacy}
                onCheckedChange={(checked) => handleAgreementChange("dataPrivacy", checked as boolean)}
              />
              <label htmlFor="dataPrivacy" className="text-sm">
                I consent to the collection and processing of my health data as described above
              </label>
            </div>
          </div>

          <Separator />

          {/* Accurate Information */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium">Accurate Information</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  The accuracy of our health assessment depends on the information you provide. 
                  Please ensure that all symptoms, health data, and personal information you enter 
                  is accurate and complete to the best of your knowledge.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-8">
              <Checkbox 
                id="accurateInformation"
                checked={agreements.accurateInformation}
                onCheckedChange={(checked) => handleAgreementChange("accurateInformation", checked as boolean)}
              />
              <label htmlFor="accurateInformation" className="text-sm">
                I will provide accurate and complete information to the best of my knowledge
              </label>
            </div>
          </div>

          <Separator />

          {/* Additional Disclaimers */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Additional Important Information:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• This application is not intended to replace regular medical check-ups</li>
              <li>• AI-generated assessments may not catch all conditions or symptoms</li>
              <li>• Local disease outbreak information is provided for awareness only</li>
              <li>• Doctor finder and appointment booking are informational services</li>
              <li>• Always follow local health authority guidelines and recommendations</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={onBack} 
              variant="outline" 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={onAccept}
              disabled={!allAgreed}
              className="flex-1"
            >
              I Accept & Continue to Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}