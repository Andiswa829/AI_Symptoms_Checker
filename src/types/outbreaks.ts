import { Doctor } from "./doctor";

export type User = {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar?: string;
  provider: "google" | "email" | "demo";
  accessToken?: string;
  dateOfBirth?: string | null;
  gender?: string | undefined;
  preferences: {
    notifications: boolean;
    outbreakAlerts: boolean;
    location: boolean;
  };
  createdAt: Date;
  lastLogin: Date;
  externalProvider?:string;
  isDoctor: boolean;
  isAdmin: boolean;
};

export type UserType = {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar?: string;
  provider: "google" | "email" | "demo";
  accessToken?: string;
  dateOfBirth?: string | null;
  gender?: string | undefined;
  preferences: {
    notifications: boolean;
    outbreakAlerts: boolean;
    location: boolean;
  };
  createdAt: Date;
  lastLogin: Date;
  isDoctor: boolean;
  isAdmin: boolean;
};

export type Symptom = {
  id: string;
  description: string;
  severity: "mild" | "moderate" | "severe";
  duration: string;
  timestamp: Date;
};

export type ChatMessage = {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
};

export type AnalysisResult = {
  possibleConditions: Array<{
    name: string;
    probability: number;
    description: string;
  }>;
  urgencyLevel: "low" | "medium" | "high" | "emergency";
  recommendations: string[];
  disclaimer: string;
  outbreakContext?: OutbreakContext[];
};

export type OutbreakData = {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  location: string;
  countries?: string[];
  states?: string[];
  lastUpdated: string;
  source: string;
  affectedPopulation?: number;
  symptoms?: string[];
  prevention?: string[];
  caseCount?: number;
  deathCount?: number;
  recoveredCount?: number;
  trendDirection?: "up" | "down" | "stable";
};

export type OutbreakContext = {
  outbreak: OutbreakData;
  relevanceScore: number;
  reason: string;
};

export type LocationData = {
  country: string;
  state?: string;
  city?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
};
// Remove Doctor type definition here, use the one from DoctorFinder.tsx

export type Appointment = {
  id: string;
  doctorId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  reason: string;
  symptoms: Symptom[];
  status: "scheduled" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  reminderSent: boolean;
};

export type DoctorFinderProps = {
  doctors: Doctor[];
  location: LocationData | null;
  symptoms: Symptom[];
  onSelectDoctor: (doctor: Doctor) => void;
  onBack: () => void;
  user: User | null;
};