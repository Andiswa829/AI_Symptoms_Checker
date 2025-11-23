export interface DoctorResponse {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  yearsOfExperience: number;
  rating: number;
  isAvailable: boolean;
  latitude: number;
  longitude: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  clinicName: string;
  address: string;
  phone: string;
  email: string;
  languages: string[];
  consultationFee: number;
  acceptsInsurance: boolean;
  availability: {
    [key: string]: string[];
  };
}

export interface Symptom {
  id: string;
  description: string;
  severity: string;
   duration: string;
}

export interface MedicalCondition {
  id: string;
  condition: string;
  diagnosedDate: string;
  doctor: string;
  status: 'active' | 'resolved' | 'chronic';
  notes: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Medication {
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

export interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes: string;
  diagnosedDate: string;
}

export interface FamilyHistory {
  id: string;
  relation: string;
  condition: string;
  ageOfOnset?: number;
  notes: string;
}

export interface PatientMedicalHistory {
  patientId: string;
  conditions: MedicalCondition[];
  medications: Medication[];
  allergies: Allergy[];
  familyHistory: FamilyHistory[];
  lastUpdated: string;
  updatedBy: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  medicalHistory?: PatientMedicalHistory;
}

export interface AppointmentAvailability {
  id: number;
  doctorId: number;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  doctor: any;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patient: Patient;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  reason: string;
  symptoms: Symptom[];
  notes: string;
  status: string;
  reminderSent: boolean;
}