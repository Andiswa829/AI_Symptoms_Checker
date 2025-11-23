import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  FileText,
  Heart,
  Pill,
  AlertTriangle,
  Calendar,
  User,
  Activity,
  Save,
  X,
  Shield,
  CheckCircle,
  Clock
} from "lucide-react";
import { 
  Patient, 
  PatientMedicalHistory, 
  MedicalCondition, 
  Medication, 
  Allergy, 
  FamilyHistory,
  Doctor 
} from "../types/doctor";

interface PatientMedicalHistoryViewProps {
  patient: Patient;
  doctor: Doctor;
  onBack: () => void;
  onSave: (updatedHistory: PatientMedicalHistory) => void;
}

export function PatientMedicalHistoryView({ 
  patient, 
  doctor, 
  onBack, 
  onSave 
}: PatientMedicalHistoryViewProps) {
  const [activeTab, setActiveTab] = useState("conditions");
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize medical history state
  const [medicalHistory, setMedicalHistory] = useState<PatientMedicalHistory>(
    patient.medicalHistory || {
      patientId: patient.id,
      conditions: [],
      medications: [],
      allergies: [],
      familyHistory: [],
      lastUpdated: new Date().toISOString(),
      updatedBy: doctor.name
    }
  );

  // Form states for new items
  const [newCondition, setNewCondition] = useState<Partial<MedicalCondition>>({});
  const [newMedication, setNewMedication] = useState<Partial<Medication>>({});
  const [newAllergy, setNewAllergy] = useState<Partial<Allergy>>({});
  const [newFamilyHistory, setNewFamilyHistory] = useState<Partial<FamilyHistory>>({});

  const resetForms = () => {
    setNewCondition({});
    setNewMedication({});
    setNewAllergy({});
    setNewFamilyHistory({});
    setIsEditing(false);
    setEditingItem(null);
  };

  const handleSave = () => {
    const updatedHistory = {
      ...medicalHistory,
      lastUpdated: new Date().toISOString(),
      updatedBy: doctor.name
    };
    onSave(updatedHistory);
    setHasChanges(false);
    setIsEditing(false);
    resetForms();
  };

  const handleAddCondition = () => {
    if (!newCondition.condition || !newCondition.diagnosedDate) return;
    
    const condition: MedicalCondition = {
      id: Date.now().toString(),
      condition: newCondition.condition,
      diagnosedDate: newCondition.diagnosedDate,
      doctor: newCondition.doctor || doctor.name,
      status: (newCondition.status as MedicalCondition['status']) || 'active',
      notes: newCondition.notes || '',
      severity: (newCondition.severity as MedicalCondition['severity']) || 'medium'
    };
    
    setMedicalHistory(prev => ({
      ...prev,
      conditions: [...prev.conditions, condition]
    }));
    setNewCondition({});
    setHasChanges(true);
  };

  const handleAddMedication = () => {
    if (!newMedication.name || !newMedication.dosage) return;
    
    const medication: Medication = {
      id: Date.now().toString(),
      name: newMedication.name,
      dosage: newMedication.dosage,
      frequency: newMedication.frequency || '',
      startDate: newMedication.startDate || new Date().toISOString().split('T')[0],
      endDate: newMedication.endDate,
      prescribingDoctor: newMedication.prescribingDoctor || doctor.name,
      purpose: newMedication.purpose || '',
      status: (newMedication.status as Medication['status']) || 'active'
    };
    
    setMedicalHistory(prev => ({
      ...prev,
      medications: [...prev.medications, medication]
    }));
    setNewMedication({});
    setHasChanges(true);
  };

  const handleAddAllergy = () => {
    if (!newAllergy.allergen || !newAllergy.reaction) return;
    
    const allergy: Allergy = {
      id: Date.now().toString(),
      allergen: newAllergy.allergen,
      reaction: newAllergy.reaction,
      severity: (newAllergy.severity as Allergy['severity']) || 'mild',
      notes: newAllergy.notes || '',
      diagnosedDate: newAllergy.diagnosedDate || new Date().toISOString().split('T')[0]
    };
    
    setMedicalHistory(prev => ({
      ...prev,
      allergies: [...prev.allergies, allergy]
    }));
    setNewAllergy({});
    setHasChanges(true);
  };

  const handleAddFamilyHistory = () => {
    if (!newFamilyHistory.relation || !newFamilyHistory.condition) return;
    
    const familyHistory: FamilyHistory = {
      id: Date.now().toString(),
      relation: newFamilyHistory.relation,
      condition: newFamilyHistory.condition,
      ageOfOnset: newFamilyHistory.ageOfOnset,
      notes: newFamilyHistory.notes || ''
    };
    
    setMedicalHistory(prev => ({
      ...prev,
      familyHistory: [...prev.familyHistory, familyHistory]
    }));
    setNewFamilyHistory({});
    setHasChanges(true);
  };

  const handleDeleteCondition = (id: string) => {
    setMedicalHistory(prev => ({
      ...prev,
      conditions: prev.conditions.filter(c => c.id !== id)
    }));
    setHasChanges(true);
  };

  const handleDeleteMedication = (id: string) => {
    setMedicalHistory(prev => ({
      ...prev,
      medications: prev.medications.filter(m => m.id !== id)
    }));
    setHasChanges(true);
  };

  const handleDeleteAllergy = (id: string) => {
    setMedicalHistory(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a.id !== id)
    }));
    setHasChanges(true);
  };

  const handleDeleteFamilyHistory = (id: string) => {
    setMedicalHistory(prev => ({
      ...prev,
      familyHistory: prev.familyHistory.filter(f => f.id !== id)
    }));
    setHasChanges(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": case "mild": return "bg-green-100 text-green-800";
      case "medium": case "moderate": return "bg-yellow-100 text-yellow-800";
      case "high": case "severe": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "chronic": return "bg-blue-100 text-blue-800";
      case "resolved": return "bg-gray-100 text-gray-800";
      case "discontinued": return "bg-red-100 text-red-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const renderConditionsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Medical Conditions</h3>
        <Button onClick={() => setIsEditing(!isEditing)} variant="outline" size="sm">
          {isEditing ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </div>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Add New Condition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Condition *</Label>
                <Input
                  placeholder="e.g., Hypertension"
                  value={newCondition.condition || ''}
                  onChange={(e) => setNewCondition(prev => ({...prev, condition: e.target.value}))}
                />
              </div>
              <div>
                <Label>Diagnosed Date *</Label>
                <Input
                  type="date"
                  value={newCondition.diagnosedDate || ''}
                  onChange={(e) => setNewCondition(prev => ({...prev, diagnosedDate: e.target.value}))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select 
                  value={newCondition.status || ''} 
                  onValueChange={(value: MedicalCondition['status']) => 
                    setNewCondition(prev => ({...prev, status: value}))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="chronic">Chronic</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Severity</Label>
                <Select 
                  value={newCondition.severity || ''} 
                  onValueChange={(value: MedicalCondition['severity']) => 
                    setNewCondition(prev => ({...prev, severity: value}))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes about the condition..."
                value={newCondition.notes || ''}
                onChange={(e) => setNewCondition(prev => ({...prev, notes: e.target.value}))}
              />
            </div>
            <Button onClick={handleAddCondition} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Condition
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {medicalHistory.conditions.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No medical conditions recorded</p>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Add Condition
              </Button>
            )}
          </div>
        ) : (
          medicalHistory.conditions.map((condition) => (
            <Card key={condition.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium">{condition.condition}</h4>
                    <p className="text-sm text-gray-600">Diagnosed: {condition.diagnosedDate}</p>
                    <p className="text-sm text-gray-600">Doctor: {condition.doctor}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={getStatusColor(condition.status)}>
                      {condition.status}
                    </Badge>
                    <Badge className={getSeverityColor(condition.severity)}>
                      {condition.severity}
                    </Badge>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCondition(condition.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {condition.notes && (
                  <p className="text-sm text-gray-700 mt-2">{condition.notes}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderMedicationsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Current Medications</h3>
        <Button onClick={() => setIsEditing(!isEditing)} variant="outline" size="sm">
          {isEditing ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </div>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Add New Medication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Medication Name *</Label>
                <Input
                  placeholder="e.g., Lisinopril"
                  value={newMedication.name || ''}
                  onChange={(e) => setNewMedication(prev => ({...prev, name: e.target.value}))}
                />
              </div>
              <div>
                <Label>Dosage *</Label>
                <Input
                  placeholder="e.g., 10mg"
                  value={newMedication.dosage || ''}
                  onChange={(e) => setNewMedication(prev => ({...prev, dosage: e.target.value}))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Frequency</Label>
                <Input
                  placeholder="e.g., Once daily"
                  value={newMedication.frequency || ''}
                  onChange={(e) => setNewMedication(prev => ({...prev, frequency: e.target.value}))}
                />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newMedication.startDate || ''}
                  onChange={(e) => setNewMedication(prev => ({...prev, startDate: e.target.value}))}
                />
              </div>
            </div>
            <div>
              <Label>Purpose</Label>
              <Input
                placeholder="e.g., Blood pressure management"
                value={newMedication.purpose || ''}
                onChange={(e) => setNewMedication(prev => ({...prev, purpose: e.target.value}))}
              />
            </div>
            <Button onClick={handleAddMedication} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {medicalHistory.medications.length === 0 ? (
          <div className="text-center py-8">
            <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No medications recorded</p>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            )}
          </div>
        ) : (
          medicalHistory.medications.map((medication) => (
            <Card key={medication.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium">{medication.name}</h4>
                    <p className="text-sm text-gray-600">{medication.dosage} - {medication.frequency}</p>
                    <p className="text-sm text-gray-600">Prescribed by: {medication.prescribingDoctor}</p>
                    <p className="text-sm text-gray-600">Started: {medication.startDate}</p>
                    {medication.purpose && (
                      <p className="text-sm text-gray-600">Purpose: {medication.purpose}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={getStatusColor(medication.status)}>
                      {medication.status}
                    </Badge>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMedication(medication.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderAllergiesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Allergies & Reactions</h3>
        <Button onClick={() => setIsEditing(!isEditing)} variant="outline" size="sm">
          {isEditing ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </div>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Add New Allergy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Allergen *</Label>
                <Input
                  placeholder="e.g., Penicillin"
                  value={newAllergy.allergen || ''}
                  onChange={(e) => setNewAllergy(prev => ({...prev, allergen: e.target.value}))}
                />
              </div>
              <div>
                <Label>Severity</Label>
                <Select 
                  value={newAllergy.severity || ''} 
                  onValueChange={(value: Allergy['severity']) => 
                    setNewAllergy(prev => ({...prev, severity: value}))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Reaction *</Label>
              <Input
                placeholder="e.g., Skin rash and swelling"
                value={newAllergy.reaction || ''}
                onChange={(e) => setNewAllergy(prev => ({...prev, reaction: e.target.value}))}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes about the allergy..."
                value={newAllergy.notes || ''}
                onChange={(e) => setNewAllergy(prev => ({...prev, notes: e.target.value}))}
              />
            </div>
            <Button onClick={handleAddAllergy} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Allergy
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {medicalHistory.allergies.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No allergies recorded</p>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Add Allergy
              </Button>
            )}
          </div>
        ) : (
          medicalHistory.allergies.map((allergy) => (
            <Card key={allergy.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium">{allergy.allergen}</h4>
                    <p className="text-sm text-gray-600">Reaction: {allergy.reaction}</p>
                    <p className="text-sm text-gray-600">Diagnosed: {allergy.diagnosedDate}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={getSeverityColor(allergy.severity)}>
                      {allergy.severity}
                    </Badge>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAllergy(allergy.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {allergy.notes && (
                  <p className="text-sm text-gray-700 mt-2">{allergy.notes}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderFamilyHistoryTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Family History</h3>
        <Button onClick={() => setIsEditing(!isEditing)} variant="outline" size="sm">
          {isEditing ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </div>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Add Family Medical History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Relation *</Label>
                <Input
                  placeholder="e.g., Father, Mother, Sibling"
                  value={newFamilyHistory.relation || ''}
                  onChange={(e) => setNewFamilyHistory(prev => ({...prev, relation: e.target.value}))}
                />
              </div>
              <div>
                <Label>Condition *</Label>
                <Input
                  placeholder="e.g., Diabetes Type 2"
                  value={newFamilyHistory.condition || ''}
                  onChange={(e) => setNewFamilyHistory(prev => ({...prev, condition: e.target.value}))}
                />
              </div>
            </div>
            <div>
              <Label>Age of Onset (Optional)</Label>
              <Input
                type="number"
                placeholder="e.g., 45"
                value={newFamilyHistory.ageOfOnset || ''}
                onChange={(e) => setNewFamilyHistory(prev => ({...prev, ageOfOnset: parseInt(e.target.value)}))}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional details about the condition..."
                value={newFamilyHistory.notes || ''}
                onChange={(e) => setNewFamilyHistory(prev => ({...prev, notes: e.target.value}))}
              />
            </div>
            <Button onClick={handleAddFamilyHistory} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Family History
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {medicalHistory.familyHistory.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No family history recorded</p>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Add Family History
              </Button>
            )}
          </div>
        ) : (
          medicalHistory.familyHistory.map((history) => (
            <Card key={history.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium">{history.relation} - {history.condition}</h4>
                    {history.ageOfOnset && (
                      <p className="text-sm text-gray-600">Age of onset: {history.ageOfOnset}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFamilyHistory(history.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {history.notes && (
                  <p className="text-sm text-gray-700 mt-2">{history.notes}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Medical History</h1>
              <p className="text-gray-600">
                {patient.firstName} {patient.lastName} - DOB: {patient.dateOfBirth || 'Not provided'}
              </p>
            </div>
          </div>
          {hasChanges && (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={resetForms}>
                Cancel Changes
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* Doctor Access Notice */}
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Doctor Access:</strong> You have permission to view and update this patient's medical history. 
            All changes will be logged and attributed to your account.
          </AlertDescription>
        </Alert>

        {/* Last Updated Info */}
        {medicalHistory.lastUpdated && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Last updated: {new Date(medicalHistory.lastUpdated).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Updated by: {medicalHistory.updatedBy}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Medical History Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="conditions">
                  <Heart className="h-4 w-4 mr-2" />
                  Conditions
                </TabsTrigger>
                <TabsTrigger value="medications">
                  <Pill className="h-4 w-4 mr-2" />
                  Medications
                </TabsTrigger>
                <TabsTrigger value="allergies">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Allergies
                </TabsTrigger>
                <TabsTrigger value="family">
                  <User className="h-4 w-4 mr-2" />
                  Family History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="conditions" className="mt-6">
                {renderConditionsTab()}
              </TabsContent>
              
              <TabsContent value="medications" className="mt-6">
                {renderMedicationsTab()}
              </TabsContent>
              
              <TabsContent value="allergies" className="mt-6">
                {renderAllergiesTab()}
              </TabsContent>
              
              <TabsContent value="family" className="mt-6">
                {renderFamilyHistoryTab()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}