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

export interface Appointment {
  id: string;
  doctorId: string;
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