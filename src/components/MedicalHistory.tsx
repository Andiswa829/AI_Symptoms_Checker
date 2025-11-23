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
  X
} from "lucide-react";

interface MedicalCondition {
  id: string;
  condition: string;
  diagnosedDate: string;
  doctor: string;
  status: 'active' | 'resolved' | 'chronic';
  notes: string;
  severity: 'low' | 'medium' | 'high';
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribingDoctor: string;
  purpose: string;
  status: 'active' | 'discontinued' | 'completed';
}

interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes: string;
  diagnosedDate: string;
}

interface FamilyHistory {
  id: string;
  relation: string;
  condition: string;
  ageOfOnset?: number;
  notes: string;
}

interface MedicalHistoryProps {
  onBack: () => void;
  userId: string;
}

export function MedicalHistory({ onBack, userId }: MedicalHistoryProps) {
  const [activeTab, setActiveTab] = useState("conditions");
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // State for medical conditions
  const [conditions, setConditions] = useState<MedicalCondition[]>([
    {
      id: '1',
      condition: 'Hypertension',
      diagnosedDate: '2022-03-15',
      doctor: 'Dr. Smith',
      status: 'chronic',
      notes: 'Well controlled with medication',
      severity: 'medium'
    }
  ]);

  // State for medications
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      startDate: '2022-03-15',
      prescribingDoctor: 'Dr. Smith',
      purpose: 'Blood pressure management',
      status: 'active'
    }
  ]);

  // State for allergies
  const [allergies, setAllergies] = useState<Allergy[]>([
    {
      id: '1',
      allergen: 'Penicillin',
      reaction: 'Skin rash and swelling',
      severity: 'moderate',
      notes: 'Avoid all penicillin-based antibiotics',
      diagnosedDate: '2020-06-10'
    }
  ]);

  // State for family history
  const [familyHistory, setFamilyHistory] = useState<FamilyHistory[]>([
    {
      id: '1',
      relation: 'Father',
      condition: 'Diabetes Type 2',
      ageOfOnset: 45,
      notes: 'Managed with diet and medication'
    }
  ]);

  // Form states
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

  const handleAddCondition = () => {
    if (!newCondition.condition || !newCondition.diagnosedDate) return;
    
    const condition: MedicalCondition = {
      id: Date.now().toString(),
      condition: newCondition.condition || '',
      diagnosedDate: newCondition.diagnosedDate || '',
      doctor: newCondition.doctor || '',
      status: newCondition.status || 'active',
      notes: newCondition.notes || '',
      severity: newCondition.severity || 'medium'
    };
    
    setConditions([...conditions, condition]);
    setNewCondition({});
  };

  const handleAddMedication = () => {
    if (!newMedication.name || !newMedication.dosage) return;
    
    const medication: Medication = {
      id: Date.now().toString(),
      name: newMedication.name || '',
      dosage: newMedication.dosage || '',
      frequency: newMedication.frequency || '',
      startDate: newMedication.startDate || '',
      endDate: newMedication.endDate,
      prescribingDoctor: newMedication.prescribingDoctor || '',
      purpose: newMedication.purpose || '',
      status: newMedication.status || 'active'
    };
    
    setMedications([...medications, medication]);
    setNewMedication({});
  };

  const handleAddAllergy = () => {
    if (!newAllergy.allergen || !newAllergy.reaction) return;
    
    const allergy: Allergy = {
      id: Date.now().toString(),
      allergen: newAllergy.allergen || '',
      reaction: newAllergy.reaction || '',
      severity: newAllergy.severity || 'mild',
      notes: newAllergy.notes || '',
      diagnosedDate: newAllergy.diagnosedDate || ''
    };
    
    setAllergies([...allergies, allergy]);
    setNewAllergy({});
  };

  const handleAddFamilyHistory = () => {
    if (!newFamilyHistory.relation || !newFamilyHistory.condition) return;
    
    const history: FamilyHistory = {
      id: Date.now().toString(),
      relation: newFamilyHistory.relation || '',
      condition: newFamilyHistory.condition || '',
      ageOfOnset: newFamilyHistory.ageOfOnset,
      notes: newFamilyHistory.notes || ''
    };
    
    setFamilyHistory([...familyHistory, history]);
    setNewFamilyHistory({});
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
      case 'mild':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'chronic':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'discontinued':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderConditionsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Medical Conditions</h3>
        <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
          {isEditing ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {isEditing ? 'Cancel' : 'Add New'}
        </Button>
      </div>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Medical Condition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Condition *</Label>
                <Input
                  placeholder="e.g., Hypertension"
                  value={newCondition.condition || ''}
                  onChange={(e) => setNewCondition({...newCondition, condition: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Diagnosed Date *</Label>
                <Input
                  type="date"
                  value={newCondition.diagnosedDate || ''}
                  onChange={(e) => setNewCondition({...newCondition, diagnosedDate: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Doctor</Label>
                <Input
                  placeholder="Dr. Smith"
                  value={newCondition.doctor || ''}
                  onChange={(e) => setNewCondition({...newCondition, doctor: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newCondition.status} onValueChange={(value: any) => setNewCondition({...newCondition, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="chronic">Chronic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={newCondition.severity} onValueChange={(value: any) => setNewCondition({...newCondition, severity: value})}>
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
            
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes about the condition..."
                value={newCondition.notes || ''}
                onChange={(e) => setNewCondition({...newCondition, notes: e.target.value})}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleAddCondition}>
                <Save className="h-4 w-4 mr-2" />
                Save Condition
              </Button>
              <Button variant="outline" onClick={resetForms}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {conditions.map((condition) => (
          <Card key={condition.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <h4 className="font-medium">{condition.condition}</h4>
                    <Badge className={getStatusColor(condition.status)}>
                      {condition.status}
                    </Badge>
                    <Badge className={getSeverityColor(condition.severity)}>
                      {condition.severity}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><Calendar className="h-3 w-3 inline mr-1" />Diagnosed: {condition.diagnosedDate}</p>
                    {condition.doctor && <p><User className="h-3 w-3 inline mr-1" />Doctor: {condition.doctor}</p>}
                    {condition.notes && <p className="mt-2">{condition.notes}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConditions(conditions.filter(c => c.id !== condition.id))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMedicationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Current & Past Medications</h3>
        <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
          {isEditing ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {isEditing ? 'Cancel' : 'Add New'}
        </Button>
      </div>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Medication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Medication Name *</Label>
                <Input
                  placeholder="e.g., Lisinopril"
                  value={newMedication.name || ''}
                  onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Dosage *</Label>
                <Input
                  placeholder="e.g., 10mg"
                  value={newMedication.dosage || ''}
                  onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Input
                  placeholder="e.g., Once daily"
                  value={newMedication.frequency || ''}
                  onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newMedication.startDate || ''}
                  onChange={(e) => setNewMedication({...newMedication, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={newMedication.endDate || ''}
                  onChange={(e) => setNewMedication({...newMedication, endDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newMedication.status} onValueChange={(value: any) => setNewMedication({...newMedication, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prescribing Doctor</Label>
                <Input
                  placeholder="Dr. Smith"
                  value={newMedication.prescribingDoctor || ''}
                  onChange={(e) => setNewMedication({...newMedication, prescribingDoctor: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Input
                  placeholder="e.g., Blood pressure management"
                  value={newMedication.purpose || ''}
                  onChange={(e) => setNewMedication({...newMedication, purpose: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleAddMedication}>
                <Save className="h-4 w-4 mr-2" />
                Save Medication
              </Button>
              <Button variant="outline" onClick={resetForms}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {medications.map((medication) => (
          <Card key={medication.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Pill className="h-4 w-4 text-blue-500" />
                    <h4 className="font-medium">{medication.name} - {medication.dosage}</h4>
                    <Badge className={getStatusColor(medication.status)}>
                      {medication.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><Activity className="h-3 w-3 inline mr-1" />Frequency: {medication.frequency}</p>
                    <p><Calendar className="h-3 w-3 inline mr-1" />Started: {medication.startDate}</p>
                    {medication.endDate && <p>Ended: {medication.endDate}</p>}
                    {medication.prescribingDoctor && <p><User className="h-3 w-3 inline mr-1" />Prescribed by: {medication.prescribingDoctor}</p>}
                    {medication.purpose && <p className="mt-2">Purpose: {medication.purpose}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setMedications(medications.filter(m => m.id !== medication.id))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-primary">Medical History</h1>
            <p className="text-muted-foreground">Manage your health records and medical information</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="allergies">Allergies</TabsTrigger>
          <TabsTrigger value="family">Family History</TabsTrigger>
        </TabsList>

        <TabsContent value="conditions">
          {renderConditionsTab()}
        </TabsContent>

        <TabsContent value="medications">
          {renderMedicationsTab()}
        </TabsContent>

        <TabsContent value="allergies">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Allergies & Reactions</h3>
              <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
                {isEditing ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {isEditing ? 'Cancel' : 'Add New'}
              </Button>
            </div>

            {isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add New Allergy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Allergen *</Label>
                      <Input
                        placeholder="e.g., Penicillin"
                        value={newAllergy.allergen || ''}
                        onChange={(e) => setNewAllergy({...newAllergy, allergen: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Severity</Label>
                      <Select value={newAllergy.severity} onValueChange={(value: any) => setNewAllergy({...newAllergy, severity: value})}>
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
                  
                  <div className="space-y-2">
                    <Label>Reaction *</Label>
                    <Input
                      placeholder="e.g., Skin rash and swelling"
                      value={newAllergy.reaction || ''}
                      onChange={(e) => setNewAllergy({...newAllergy, reaction: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Diagnosed Date</Label>
                    <Input
                      type="date"
                      value={newAllergy.diagnosedDate || ''}
                      onChange={(e) => setNewAllergy({...newAllergy, diagnosedDate: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Additional notes..."
                      value={newAllergy.notes || ''}
                      onChange={(e) => setNewAllergy({...newAllergy, notes: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleAddAllergy}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Allergy
                    </Button>
                    <Button variant="outline" onClick={resetForms}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {allergies.map((allergy) => (
                <Card key={allergy.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <h4 className="font-medium">{allergy.allergen}</h4>
                          <Badge className={getSeverityColor(allergy.severity)}>
                            {allergy.severity}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p><Activity className="h-3 w-3 inline mr-1" />Reaction: {allergy.reaction}</p>
                          {allergy.diagnosedDate && <p><Calendar className="h-3 w-3 inline mr-1" />Diagnosed: {allergy.diagnosedDate}</p>}
                          {allergy.notes && <p className="mt-2">{allergy.notes}</p>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setAllergies(allergies.filter(a => a.id !== allergy.id))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="family">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Family Medical History</h3>
              <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
                {isEditing ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {isEditing ? 'Cancel' : 'Add New'}
              </Button>
            </div>

            {isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add Family Medical History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Relation *</Label>
                      <Select value={newFamilyHistory.relation} onValueChange={(value: string) => setNewFamilyHistory({...newFamilyHistory, relation: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="father">Father</SelectItem>
                          <SelectItem value="mother">Mother</SelectItem>
                          <SelectItem value="brother">Brother</SelectItem>
                          <SelectItem value="sister">Sister</SelectItem>
                          <SelectItem value="grandfather-paternal">Grandfather (Paternal)</SelectItem>
                          <SelectItem value="grandmother-paternal">Grandmother (Paternal)</SelectItem>
                          <SelectItem value="grandfather-maternal">Grandfather (Maternal)</SelectItem>
                          <SelectItem value="grandmother-maternal">Grandmother (Maternal)</SelectItem>
                          <SelectItem value="uncle">Uncle</SelectItem>
                          <SelectItem value="aunt">Aunt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Condition *</Label>
                      <Input
                        placeholder="e.g., Diabetes Type 2"
                        value={newFamilyHistory.condition || ''}
                        onChange={(e) => setNewFamilyHistory({...newFamilyHistory, condition: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Age of Onset</Label>
                      <Input
                        type="number"
                        placeholder="45"
                        value={newFamilyHistory.ageOfOnset || ''}
                        onChange={(e) => setNewFamilyHistory({...newFamilyHistory, ageOfOnset: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Additional details about the condition..."
                      value={newFamilyHistory.notes || ''}
                      onChange={(e) => setNewFamilyHistory({...newFamilyHistory, notes: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleAddFamilyHistory}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Family History
                    </Button>
                    <Button variant="outline" onClick={resetForms}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {familyHistory.map((history) => (
                <Card key={history.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-purple-500" />
                          <h4 className="font-medium">{history.relation}</h4>
                          <span className="text-muted-foreground">-</span>
                          <span className="font-medium">{history.condition}</span>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {history.ageOfOnset && <p>Age of onset: {history.ageOfOnset} years</p>}
                          {history.notes && <p className="mt-2">{history.notes}</p>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setFamilyHistory(familyHistory.filter(h => h.id !== history.id))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}