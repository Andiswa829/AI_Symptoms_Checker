import React, { useState, useEffect } from "react";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { MedicalDisclaimer } from "./components/MedicalDisclaimer";
import { SymptomInput } from "./components/SymptomInput";
import { HealthDataCollection, HealthMetrics } from "./components/HealthDataCollection";
import { SymptomChat } from "./components/SymptomChat";
import { AnalysisResults } from "./components/AnalysisResults";
import { OutbreakNotifications } from "./components/OutbreakNotifications";
import { OutbreakAlert } from "./components/OutbreakAlert";
import { DoctorFinder } from "./components/DoctorFinder";
import { AppointmentBooking } from "./components/AppointmentBooking";
import { LoginScreen } from "./components/LoginScreen";
import { NavigationHeader } from "./components/NavigationHeader";
import { OutbreakDashboard } from "./components/OutbreakDashboard";

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "google" | "email";
  preferences: {
    notifications: boolean;
    outbreakAlerts: boolean;
    location: boolean;
  };
  createdAt: Date;
  lastLogin: Date;
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

export type Doctor = {
  id: string;
  name: string;
  specialization: string;
  qualifications: string[];
  rating: number;
  reviewCount: number;
  distance: number;
  address: string;
  phone: string;
  email: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  availability: {
    [key: string]: string[]; // day: available time slots
  };
  languages: string[];
  acceptsInsurance: boolean;
  consultationFee: number;
  profileImage?: string;
  clinicName: string;
  nextAvailable: string;
};

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

export default function App() {
  const [currentStep, setCurrentStep] = useState<
    | "welcome"
    | "login"
    | "disclaimer"
    | "input"
    | "health_data"
    | "chat"
    | "results"
    | "doctors"
    | "booking"
    | "outbreaks"
  >("welcome");
  const [user, setUser] = useState<User | null>(null);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [healthData, setHealthData] = useState<HealthMetrics | null>(null);
  const [chatMessages, setChatMessages] = useState<
    ChatMessage[]
  >([]);
  const [analysisResult, setAnalysisResult] =
    useState<AnalysisResult | null>(null);
  const [outbreakData, setOutbreakData] = useState<{
    global: OutbreakData[];
    local: OutbreakData[];
    lastUpdated: Date | null;
  }>({
    global: [],
    local: [],
    lastUpdated: null,
  });
  const [location, setLocation] = useState<LocationData | null>(
    null,
  );
  const [showOutbreakPanel, setShowOutbreakPanel] =
    useState(false);
  const [criticalAlerts, setCriticalAlerts] = useState<
    OutbreakData[]
  >([]);
  const [nearbyDoctors, setNearbyDoctors] = useState<Doctor[]>(
    [],
  );
  const [selectedDoctor, setSelectedDoctor] =
    useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<
    Appointment[]
  >([]);

  useEffect(() => {
    // Get user location for local outbreak alerts
    getUserLocation();

    // Load dummy outbreak data
    loadDummyOutbreakData();

    // Set up periodic updates every 30 minutes
    const interval = setInterval(
      loadDummyOutbreakData,
      30 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (location) {
      fetchNearbyDoctors();
    }
  }, [location]);

  useEffect(() => {
    // Check for critical alerts when outbreak data updates
    const critical = [
      ...outbreakData.global,
      ...outbreakData.local,
    ].filter((outbreak) => outbreak.severity === "critical");
    setCriticalAlerts(critical);
  }, [outbreakData]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Reverse geocoding to get location details
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
            );
            const data = await response.json();

            setLocation({
              country: data.countryName || "Unknown",
              state: data.principalSubdivision || undefined,
              city: data.city || undefined,
              coordinates: { lat: latitude, lng: longitude },
            });
          } catch (error) {
            console.log(
              "Error getting location details:",
              error,
            );
            // Fallback to basic location
            setLocation({
              country: "Unknown",
              coordinates: { lat: latitude, lng: longitude },
            });
          }
        },
        (error) => {
          console.log("Error getting location:", error);
          // Default to a general location (South Africa coordinates for demo)
          setLocation({
            country: "South Africa",
            city: "Johannesburg",
            coordinates: { lat: 51.5074, lng: -0.1278 },
          });
        },
        { timeout: 10000, enableHighAccuracy: false },
      );
    } else {
      // Default to South Africa coordinates for demo
      setLocation({
        country: "South Africa",
        city: "Johannesburg",
        coordinates: { lat: 51.5074, lng: -0.1278 },
      });
    }
  };

  const loadDummyOutbreakData = () => {
    // Comprehensive dummy outbreak data
    const globalOutbreaks: OutbreakData[] = [
      {
        id: "global-1",
        title: "H5N1 Avian Influenza Outbreak",
        description:
          "WHO reports increasing cases of H5N1 bird flu with human transmission in Southeast Asia. Poultry workers at highest risk.",
        severity: "high",
        location:
          "Southeast Asia (Vietnam, Thailand, Indonesia)",
        countries: ["Vietnam", "Thailand", "Indonesia"],
        lastUpdated: new Date(
          Date.now() - 2 * 60 * 60 * 1000,
        ).toISOString(), // 2 hours ago
        source: "WHO",
        affectedPopulation: 1250,
        symptoms: ["fever", "cough", "respiratory", "fatigue"],
        prevention: [
          "Avoid contact with poultry",
          "Practice good hygiene",
          "Seek medical attention if exposed",
        ],
        caseCount: 1250,
        deathCount: 89,
        recoveredCount: 856,
        trendDirection: "up",
      },
      {
        id: "global-2",
        title: "Marburg Virus Disease Outbreak",
        description:
          "Critical outbreak of Marburg virus disease reported in Central Africa with high mortality rate. International health emergency declared.",
        severity: "critical",
        location: "Central Africa (DRC, Uganda)",
        countries: ["Democratic Republic of Congo", "Uganda"],
        lastUpdated: new Date(
          Date.now() - 4 * 60 * 60 * 1000,
        ).toISOString(), // 4 hours ago
        source: "WHO",
        affectedPopulation: 456,
        symptoms: [
          "fever",
          "headache",
          "vomiting",
          "diarrhea",
          "fatigue",
        ],
        prevention: [
          "Avoid contact with infected persons",
          "Use protective equipment",
          "Practice strict hygiene",
        ],
        caseCount: 456,
        deathCount: 178,
        recoveredCount: 134,
        trendDirection: "up",
      },
      {
        id: "global-3",
        title: "Dengue Fever Surge",
        description:
          "Unprecedented surge in dengue fever cases across Latin America due to climate conditions and urbanization.",
        severity: "high",
        location: "Latin America (Brazil, Colombia, Peru)",
        countries: ["Brazil", "Colombia", "Peru"],
        lastUpdated: new Date(
          Date.now() - 6 * 60 * 60 * 1000,
        ).toISOString(), // 6 hours ago
        source: "PAHO",
        affectedPopulation: 892340,
        symptoms: [
          "fever",
          "headache",
          "body aches",
          "nausea",
          "rash",
        ],
        prevention: [
          "Eliminate standing water",
          "Use mosquito repellent",
          "Wear protective clothing",
        ],
        caseCount: 892340,
        deathCount: 1246,
        recoveredCount: 785890,
        trendDirection: "stable",
      },
      {
        id: "global-4",
        title: "Cholera Outbreak",
        description:
          "Cholera outbreak spreading in Eastern Africa due to poor sanitation and water contamination.",
        severity: "medium",
        location: "Eastern Africa (Kenya, Somalia, Ethiopia)",
        countries: ["Kenya", "Somalia", "Ethiopia"],
        lastUpdated: new Date(
          Date.now() - 12 * 60 * 60 * 1000,
        ).toISOString(), // 12 hours ago
        source: "WHO",
        affectedPopulation: 3456,
        symptoms: [
          "diarrhea",
          "vomiting",
          "dehydration",
          "fatigue",
        ],
        prevention: [
          "Drink safe water",
          "Practice good hygiene",
          "Avoid contaminated food",
        ],
        caseCount: 3456,
        deathCount: 89,
        recoveredCount: 2890,
        trendDirection: "down",
      },
    ];

    const localOutbreaks: OutbreakData[] = location
      ? [
          {
            id: "local-1",
            title: "Seasonal Flu Increase",
            description: `Higher than usual seasonal influenza activity reported in ${location.country}. Health authorities recommend vaccination.`,
            severity: "medium",
            location: location.country,
            countries: [location.country],
            lastUpdated: new Date(
              Date.now() - 1 * 60 * 60 * 1000,
            ).toISOString(), // 1 hour ago
            source: "National Health Service",
            affectedPopulation: 12456,
            symptoms: [
              "fever",
              "cough",
              "body aches",
              "fatigue",
              "sore throat",
            ],
            prevention: [
              "Get vaccinated",
              "Wash hands frequently",
              "Avoid close contact with sick individuals",
            ],
            caseCount: 12456,
            deathCount: 23,
            recoveredCount: 11890,
            trendDirection: "up",
          },
          {
            id: "local-2",
            title: "Norovirus in Care Facilities",
            description: `Norovirus outbreaks reported in several care facilities across ${location.city || location.country}. Enhanced infection control measures in place.`,
            severity: "low",
            location: location.city || location.country,
            countries: [location.country],
            lastUpdated: new Date(
              Date.now() - 8 * 60 * 60 * 1000,
            ).toISOString(), // 8 hours ago
            source: "Local Health Department",
            affectedPopulation: 234,
            symptoms: [
              "nausea",
              "vomiting",
              "diarrhea",
              "fatigue",
            ],
            prevention: [
              "Practice hand hygiene",
              "Avoid contaminated surfaces",
              "Stay hydrated",
            ],
            caseCount: 234,
            deathCount: 0,
            recoveredCount: 189,
            trendDirection: "stable",
          },
        ]
      : [];

    setOutbreakData({
      global: globalOutbreaks,
      local: localOutbreaks,
      lastUpdated: new Date(),
    });
  };

  const fetchNearbyDoctors = async () => {
    if (!location?.coordinates) return;

    // Mock doctors data - in a real app, this would be an API call
   const mockDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Thandi Mokoena",
    specialization: "General Practice",
    qualifications: ["MBChB", "FCP(SA)"],
    rating: 4.8,
    reviewCount: 245,
    distance: 0.3,
    address: "101 Jan Smuts Avenue, Rosebank, Johannesburg, 2196",
    phone: "+27 82 123 4567",
    email: "thandi.mokoena@cityhealth.co.za",
    coordinates: {
      lat: location.coordinates.lat + 0.002,
      lng: location.coordinates.lng + 0.001,
    },
    availability: {
      Monday: ["09:00", "10:30", "14:00", "15:30"],
      Tuesday: ["09:30", "11:00", "14:30", "16:00"],
      Wednesday: ["10:00", "11:30", "15:00"],
      Thursday: ["09:00", "13:30", "15:00", "16:30"],
      Friday: ["09:30", "11:00", "14:00"],
    },
    languages: ["English", "Zulu"],
    acceptsInsurance: true,
    consultationFee: 850,
    clinicName: "City Health Clinic",
    nextAvailable: "Today 14:00",
  },
  {
    id: "2",
    name: "Dr. Michael Naidoo",
    specialization: "Internal Medicine",
    qualifications: ["MBChB", "MMed", "PhD"],
    rating: 4.9,
    reviewCount: 312,
    distance: 0.7,
    address: "22 Parktown Road, Parktown, Johannesburg, 2193",
    phone: "+27 83 987 6543",
    email: "michael.naidoo@medcenter.co.za",
    coordinates: {
      lat: location.coordinates.lat - 0.003,
      lng: location.coordinates.lng + 0.004,
    },
    availability: {
      Monday: ["08:30", "10:00", "13:30", "15:00"],
      Tuesday: ["09:00", "11:30", "14:00", "16:30"],
      Wednesday: ["08:30", "10:30", "13:00", "15:30"],
      Thursday: ["09:30", "11:00", "14:30"],
      Friday: ["08:00", "10:00", "13:30", "15:00"],
    },
    languages: ["English", "Hindi"],
    acceptsInsurance: true,
    consultationFee: 1200,
    clinicName: "Advanced Medical Center",
    nextAvailable: "Tomorrow 09:00",
  },
  {
    id: "3",
    name: "Dr. Emily van der Merwe",
    specialization: "Family Medicine",
    qualifications: ["MBChB", "FCFP(SA)"],
    rating: 4.7,
    reviewCount: 189,
    distance: 1.2,
    address: "78 Kloof Street, Gardens, ParkTown, 8001",
    phone: "+27 72 456 7890",
    email: "emily.vdmerwe@familycare.co.za",
    coordinates: {
      lat: location.coordinates.lat + 0.005,
      lng: location.coordinates.lng - 0.002,
    },
    availability: {
      Monday: ["10:00", "11:30", "14:30", "16:00"],
      Tuesday: ["09:00", "10:30", "13:30", "15:30"],
      Wednesday: ["08:30", "11:00", "14:00", "15:00"],
      Thursday: ["09:30", "11:30", "13:00", "16:30"],
      Friday: ["10:00", "13:30", "15:00"],
    },
    languages: ["English", "Afrikaans"],
    acceptsInsurance: true,
    consultationFee: 950,
    clinicName: "Family Care Practice",
    nextAvailable: "Today 16:00",
  },
  {
    id: "4",
    name: "Dr. James Molefe",
    specialization: "Emergency Medicine",
    qualifications: ["MBChB", "DipPEC(SA)"],
    rating: 4.6,
    reviewCount: 156,
    distance: 2.1,
    address: "321 Nelson Mandela Avenue, Sandton, Johannesburg, 2196",
    phone: "+27 84 745 6789",
    email: "james.molefe@emergency.co.za",
    coordinates: {
      lat: location.coordinates.lat - 0.008,
      lng: location.coordinates.lng - 0.003,
    },
    availability: {
      Monday: ["08:00", "12:00", "16:00", "20:00"],
      Tuesday: ["08:00", "12:00", "16:00", "20:00"],
      Wednesday: ["08:00", "12:00", "16:00", "20:00"],
      Thursday: ["08:00", "12:00", "16:00", "20:00"],
      Friday: ["08:00", "12:00", "16:00"],
      Saturday: ["10:00", "14:00", "18:00"],
      Sunday: ["10:00", "14:00", "18:00"],
    },
    languages: ["English", "Tswana"],
    acceptsInsurance: true,
    consultationFee: 1500,
    clinicName: "City Emergency Center",
    nextAvailable: "Today 12:00",
  },
  {
    id: "5",
    name: "Dr. Priya Govender",
    specialization: "General Practice",
    qualifications: ["MBChB", "DCH(SA)", "DipObst(SA)"],
    rating: 4.9,
    reviewCount: 278,
    distance: 0.9,
    address: "654 Rivonia Road, Sandton, Johannesburg, 2191",
    phone: "+27 81 756 7890",
    email: "priya.govender@communityhealth.co.za",
    coordinates: {
      lat: location.coordinates.lat + 0.004,
      lng: location.coordinates.lng + 0.003,
    },
    availability: {
      Monday: ["09:00", "10:30", "13:30", "15:00", "16:30"],
      Tuesday: ["08:30", "10:00", "14:00", "15:30"],
      Wednesday: ["09:30", "11:00", "13:00", "14:30", "16:00"],
      Thursday: ["08:00", "10:30", "13:30", "15:00"],
      Friday: ["09:00", "11:30", "14:00", "15:30"],
    },
    languages: ["English", "Tamil"],
    acceptsInsurance: true,
    consultationFee: 900,
    clinicName: "Community Health Practice",
    nextAvailable: "Today 15:00",
  },
];


    setNearbyDoctors(mockDoctors);
  };

  const getOutbreakContext = (
    symptoms: Symptom[],
  ): OutbreakContext[] => {
    const allOutbreaks = [
      ...outbreakData.global,
      ...outbreakData.local,
    ];
    const context: OutbreakContext[] = [];

    allOutbreaks.forEach((outbreak) => {
      const symptomKeywords = symptoms.map((s) =>
        s.description.toLowerCase(),
      );
      const outbreakSymptoms = outbreak.symptoms || [];

      // Calculate relevance based on symptom overlap and location
      let relevanceScore = 0;
      let matchedSymptoms: string[] = [];

      symptomKeywords.forEach((symptom) => {
        outbreakSymptoms.forEach((outbreakSymptom) => {
          if (
            symptom.includes(outbreakSymptom) ||
            outbreakSymptom.includes(symptom)
          ) {
            relevanceScore += 0.3;
            matchedSymptoms.push(outbreakSymptom);
          }
        });
      });

      // Bonus for local outbreaks
      if (
        outbreak.countries?.includes(location?.country || "") ||
        outbreak.states?.includes(location?.state || "")
      ) {
        relevanceScore += 0.4;
      }

      // Bonus for high severity
      if (
        outbreak.severity === "high" ||
        outbreak.severity === "critical"
      ) {
        relevanceScore += 0.2;
      }

      if (relevanceScore > 0.3) {
        context.push({
          outbreak,
          relevanceScore,
          reason:
            matchedSymptoms.length > 0
              ? `Your symptoms match reported symptoms: ${matchedSymptoms.join(", ")}`
              : "Local outbreak in your area",
        });
      }
    });

    return context
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentStep("welcome");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentStep("welcome");
    setSymptoms([]);
    setHealthData(null);
    setChatMessages([]);
    setAnalysisResult(null);
    setSelectedDoctor(null);
  };

  const addSymptom = (
    symptom: Omit<Symptom, "id" | "timestamp">,
  ) => {
    const newSymptom: Symptom = {
      ...symptom,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setSymptoms((prev) => [...prev, newSymptom]);
  };

  const removeSymptom = (id: string) => {
    setSymptoms((prev) => prev.filter((s) => s.id !== id));
  };

  const addChatMessage = (
    content: string,
    type: "user" | "ai",
  ) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, message]);
  };

  const analyzeSymptoms = () => {
    // Get outbreak context for symptoms
    const outbreakContext = getOutbreakContext(symptoms);

    // Enhanced mock AI analysis with outbreak context and health data
    let urgencyLevel: "low" | "medium" | "high" | "emergency" = "medium";
    let additionalRecommendations: string[] = [];
    let healthDataInsights: string[] = [];

    // Analyze health data for additional insights
    if (healthData) {
      // Check vital signs for concerning patterns
      if (healthData.heartRate.status === "elevated" || healthData.heartRate.status === "high") {
        urgencyLevel = urgencyLevel === "low" ? "medium" : "high";
        healthDataInsights.push("Elevated heart rate detected - may indicate infection or stress");
      }
      
      if (healthData.bodyTemperature.status === "fever") {
        urgencyLevel = urgencyLevel === "low" ? "medium" : "high";
        healthDataInsights.push("Fever detected - suggests possible viral or bacterial infection");
      }
      
      if (healthData.oxygenSaturation.status === "low") {
        urgencyLevel = "high";
        healthDataInsights.push("Low oxygen saturation - respiratory assessment recommended");
      }
      
      if (healthData.bloodPressure.status === "high") {
        healthDataInsights.push("Elevated blood pressure noted - monitor cardiovascular health");
      }
      
      if (healthData.sleepData.quality === "poor") {
        healthDataInsights.push("Poor sleep quality may be affecting immune function");
        additionalRecommendations.push("Focus on improving sleep hygiene and getting adequate rest");
      }
      
      if (healthData.stressLevel.status === "high" || healthData.stressLevel.status === "very_high") {
        healthDataInsights.push("High stress levels detected - may impact recovery");
        additionalRecommendations.push("Consider stress management techniques and relaxation");
      }
    }

    // Check if severe symptoms override health data assessment
    if (symptoms.some((s) => s.severity === "severe")) {
      urgencyLevel = "high";
    }

    const mockResult: AnalysisResult = {
      possibleConditions: [
        {
          name: "Common Cold",
          probability: healthData?.bodyTemperature.status === "fever" ? 85 : 75,
          description:
            "A viral infection affecting the upper respiratory tract",
        },
        {
          name: "Seasonal Allergies",
          probability: healthData?.heartRate.status === "normal" ? 50 : 35,
          description:
            "Allergic reaction to environmental allergens",
        },
        {
          name: "Sinusitis",
          probability: healthData?.respiratoryRate.status === "elevated" ? 40 : 30,
          description: "Inflammation of the sinuses",
        },
      ],
      urgencyLevel,
      recommendations: [
        "Get adequate rest and stay hydrated",
        "Consider over-the-counter pain relievers",
        "Monitor symptoms for any worsening",
        "Consult with a healthcare provider if symptoms persist",
        ...additionalRecommendations,
        ...(outbreakContext.length > 0
          ? [
              "Be aware of current disease outbreaks in your area",
              "Follow local health department guidelines",
            ]
          : []),
        ...(healthDataInsights.length > 0
          ? ["Health data analysis: " + healthDataInsights.join(", ")]
          : []),
      ],
      disclaimer:
        "This analysis is for informational purposes only and should not replace professional medical advice. Health data analysis is based on recent vital signs.",
      outbreakContext,
    };

    setAnalysisResult(mockResult);
    setCurrentStep("results");
  };

  const bookAppointment = (
    appointmentData: Omit<
      Appointment,
      "id" | "status" | "reminderSent"
    >,
  ) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Date.now().toString(),
      status: "scheduled",
      reminderSent: false,
    };

    setAppointments((prev) => [...prev, newAppointment]);
    return newAppointment;
  };

  const resetChecker = () => {
    setCurrentStep("welcome");
    setSymptoms([]);
    setHealthData(null);
    setChatMessages([]);
    setAnalysisResult(null);
    setSelectedDoctor(null);
  };

  const dismissAlert = (alertId: string) => {
    setCriticalAlerts((prev) =>
      prev.filter((alert) => alert.id !== alertId),
    );
  };

  // Show login screen if not authenticated
  if (!user && currentStep !== "login") {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onShowLogin={() => setCurrentStep("login")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <NavigationHeader
        user={user}
        onLogout={handleLogout}
        onViewOutbreaks={() => setCurrentStep("outbreaks")}
        outbreakCount={
          outbreakData.global.length + outbreakData.local.length
        }
        criticalCount={criticalAlerts.length}
        location={location}
      />

      {/* Critical outbreak alerts - removed to prevent popup after login */}
      {/* {criticalAlerts.map(alert => (
        <OutbreakAlert
          key={alert.id}
          outbreak={alert}
          onDismiss={() => dismissAlert(alert.id)}
        />
      ))} */}

      {/* Outbreak notifications panel */}
      {/*<OutbreakNotifications
        globalOutbreaks={outbreakData.global}
        localOutbreaks={outbreakData.local}
        location={location}
        isOpen={showOutbreakPanel}
        onToggle={() =>
          setShowOutbreakPanel(!showOutbreakPanel)
        }
        lastUpdated={outbreakData.lastUpdated}
      />*/}

      {currentStep === "login" && (
        <LoginScreen
          onLogin={handleLogin}
          onShowLogin={() => setCurrentStep("welcome")}
        />
      )}

      {currentStep === "welcome" && (
        <WelcomeScreen
          onGetStarted={() => setCurrentStep("disclaimer")}
          outbreakCount={
            outbreakData.global.length +
            outbreakData.local.length
          }
          location={location}
          user={user}
          onViewOutbreaks={() => setCurrentStep("outbreaks")}
          onBookAppointment={() => setCurrentStep("doctors")}
        />
      )}

      {currentStep === "disclaimer" && (
        <MedicalDisclaimer
          onAccept={() => setCurrentStep("input")}
          onBack={() => setCurrentStep("welcome")}
        />
      )}

      {currentStep === "outbreaks" && (
        <OutbreakDashboard
          globalOutbreaks={outbreakData.global}
          localOutbreaks={outbreakData.local}
          location={location}
          onBack={() => setCurrentStep("welcome")}
          lastUpdated={outbreakData.lastUpdated}
        />
      )}

      {currentStep === "input" && (
        <SymptomInput
          symptoms={symptoms}
          onAddSymptom={addSymptom}
          onRemoveSymptom={removeSymptom}
          onContinue={() => setCurrentStep("health_data")}
          onBack={() => setCurrentStep("disclaimer")}
          outbreakData={outbreakData}
          location={location}
        />
      )}

      {currentStep === "health_data" && (
        <HealthDataCollection
          onDataCollected={setHealthData}
          onBack={() => setCurrentStep("input")}
          onContinue={() => setCurrentStep("chat")}
          user={user}
        />
      )}

      {currentStep === "chat" && (
        <SymptomChat
          symptoms={symptoms}
          messages={chatMessages}
          onAddMessage={addChatMessage}
          onAnalyze={analyzeSymptoms}
          onBack={() => setCurrentStep("health_data")}
          outbreakContext={getOutbreakContext(symptoms)}
        />
      )}

      {currentStep === "results" && analysisResult && (
        <AnalysisResults
          result={analysisResult}
          symptoms={symptoms}
          onStartOver={resetChecker}
          outbreakData={outbreakData}
          location={location}
          onFindDoctors={() => setCurrentStep("doctors")}
        />
      )}

      {currentStep === "doctors" && (
        <DoctorFinder
          doctors={nearbyDoctors}
          location={location}
          symptoms={symptoms}
          onSelectDoctor={(doctor) => {
            setSelectedDoctor(doctor);
            setCurrentStep("booking");
          }}
          onBack={() => setCurrentStep("results")}
        />
      )}

      {currentStep === "booking" && selectedDoctor && (
        <AppointmentBooking
          doctor={selectedDoctor}
          symptoms={symptoms}
          onBookAppointment={bookAppointment}
          onBack={() => setCurrentStep("doctors")}
          onComplete={() => setCurrentStep("results")}
        />
      )}
    </div>
  );
}