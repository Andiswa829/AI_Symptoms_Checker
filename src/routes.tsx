import { createBrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { LoginScreen } from './components/LoginScreen';
import { DoctorSignup } from './components/DoctorSignup';
import { Doctor, DoctorFinder } from './components/DoctorFinder';
import { DoctorDashboard } from './components/DoctorDashboard';
import { PatientMedicalHistoryView } from './components/PatientMedicalHistoryView';
import { OutbreakDashboard } from './components/OutbreakDashboard';
import { AnalysisResults } from './components/AnalysisResults';
import { WelcomeScreen } from './components/WelcomeScreen';
import { User } from './types/outbreaks';
import { Appointment, Patient, PatientMedicalHistory } from './types/doctor';
import { AppointmentBooking } from './components/AppointmentBooking';
import { MedicalDisclaimer } from './components/MedicalDisclaimer';
import { HealthDataCollection } from './components/HealthDataCollection';
import { RootLayout } from './components/RootLayout';
import { SymptomInputWrapper } from './components/SymptomInputWrapper';
import { UserAppointments } from './components/UserAppointments';

// Doctor dashboard wrapper
function DoctorDashboardWrapper() {
  const getDoctorData = () => {
    try {
      const doctorData = localStorage.getItem('doctor');
      if (doctorData) return JSON.parse(doctorData);

      // If no explicit `doctor` stored, check `user` and create a lightweight doctor object
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user?.isDoctor) {
          const generated = {
            id: user.id,
            name: `Dr. ${user.firstName} ${user.lastName}`,
            specialization: user.specialization ||'',
            clinicName: '',
            address: '',
            phone: user.phone || '',
            email: user.email,
            languages: [],
            consultationFee: 0,
            acceptsInsurance: false,
            availability: {}
          };
          // Persist for future use
          localStorage.setItem('doctor', JSON.stringify(generated));
          return generated;
        }
      }

      return null;
    } catch (error) {
      console.error('Error parsing doctor data:', error);
      return null;
    }
  };

  const doctor = getDoctorData();

  if (!doctor) {
    window.location.href = '/';
    return null;
  }

  return (
    <DoctorDashboard
      doctor={doctor}
      onViewPatientHistory={(patient: Patient) => {
        // Store patient data and navigate to medical history view
        localStorage.setItem('selectedPatient', JSON.stringify(patient));
        window.location.href = '/doctor/patient-history';
      }}
      onLogout={() => {
        localStorage.removeItem('doctor');
        window.location.href = '/';
      }}
    />
  );
}

// Patient medical history wrapper
function PatientHistoryWrapper() {
  const getDoctorData = () => {
    try {
      const doctorData = localStorage.getItem('doctor');
      return doctorData ? JSON.parse(doctorData) : null;
    } catch (error) {
      console.error('Error parsing doctor data:', error);
      return null;
    }
  };

  const getPatientData = () => {
    try {
      const patientData = localStorage.getItem('selectedPatient');
      return patientData ? JSON.parse(patientData) : null;
    } catch (error) {
      console.error('Error parsing patient data:', error);
      return null;
    }
  };

  const doctor = getDoctorData();
  const patient = getPatientData();

  if (!doctor || !patient) {
    window.location.href = '/doctor/dashboard';
    return null;
  }

  return (
    <PatientMedicalHistoryView
      patient={patient}
      doctor={doctor}
      onBack={() => {
        localStorage.removeItem('selectedPatient');
        window.location.href = '/doctor/dashboard';
      }}
      onSave={(updatedHistory: PatientMedicalHistory) => {
        // In a real app, this would make an API call to save the updated history
        console.log('Saving updated medical history:', updatedHistory);
        
        // Update the patient data in localStorage for demo purposes
        const updatedPatient = {
          ...patient,
          medicalHistory: updatedHistory
        };
        localStorage.setItem('selectedPatient', JSON.stringify(updatedPatient));
        
        // You would typically show a success message here
        alert('Medical history updated successfully!');
      }}
    />
  );
}

function BookingWrapper() {
  const location = useLocation();
  const { doctor, symptoms } = location.state || {};

  if (!doctor) {
    return window.location.href = '/doctors';
  }

  return (
    <AppointmentBooking
      doctor={doctor}
      symptoms={symptoms || []}
      onBookAppointment={(appointmentData) => {
        // Generate a unique ID and add status
        const appointment: Appointment = {
          ...appointmentData,
          id: `apt-${Date.now()}`,
          status: 'confirmed',
          reminderSent: false,
          patient: {
            id: `p-${Date.now()}`,
            firstName: appointmentData.patientName.split(' ')[0],
            lastName: appointmentData.patientName.split(' ')[1] || '',
            email: appointmentData.patientEmail,
            phone: appointmentData.patientPhone
          }
        };
        // Here you would typically make an API call to save the appointment
        return appointment;
      }}
      onBack={() => window.history.back()}
      onComplete={() => {
        window.location.href = '/welcome';
      }}
    />
  );
}

// Add wrapper for HealthDataCollection to get user data
function HealthDataWrapper() {
  // Get user data from localStorage
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  const user = getUserData();

  return (
    <HealthDataCollection
      onDataCollected={(healthData) => {
        // Handle health data
        console.log('Health data collected:', healthData);
        // Store health data for later use
        localStorage.setItem('healthData', JSON.stringify(healthData));
      }}
      onBack={() => {
        window.location.href = '/disclaimer';
      }}
      onContinue={() => {
        window.location.href = '/assessment';
      }}
      user={user}
    />
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <LoginScreen 
          onLogin={(user: User) => {
            // After successful login, check if user is a doctor
            console.log('Logged in user:', user);
            
              // If backend/user info indicates this user is a doctor, open doctor dashboard
              if (user.isDoctor) {
              // Create a doctor object for the dashboard
              const doctorData = {
                id: user.id,
                name: `Dr. ${user.firstName} ${user.lastName}`,
                specialization: "General Practice", // You would get this from doctor database
                clinicName: "Medical Center",
                address: "123 Medical Street, Johannesburg",
                phone: "+27 11 123 4567",
                email: user.email,
                languages: ["English", "Afrikaans"],
                consultationFee: 500,
                acceptsInsurance: true,
                availability: {
                  monday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
                  tuesday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
                  wednesday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
                  thursday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
                  friday: ["09:00", "10:00", "11:00", "14:00", "15:00"]
                }
              };
                // Store doctor and user data then redirect to doctor dashboard
                localStorage.setItem('doctor', JSON.stringify(doctorData));
                localStorage.setItem('user', JSON.stringify(user));
                window.location.href = '/doctor/dashboard';
            } else {
              // Store user data and redirect to patient welcome screen
              localStorage.setItem('user', JSON.stringify(user));
              window.location.href = '/welcome';
            }
          }} 
        />,
      },
      {
        path: '/doctor-signup',
        element: <DoctorSignup 
          onSignupComplete={() => {
            window.location.href = '/';
          }}
          onBackToLogin={() => {
            window.location.href = '/';
          }}
        />,
      },
      {
        path: '/doctor/dashboard',
        element: <DoctorDashboardWrapper />
      },
      {
        path: '/doctor/patient-history',
        element: <PatientHistoryWrapper />
      },
      {
        path: '/welcome',
        element: <WelcomeScreen 
          onGetStarted={() => {
            window.location.href = '/disclaimer'; // Start with disclaimer
          }}
          onViewOutbreaks={() => {
            window.location.href = '/outbreaks';
          }}
          onBookAppointment={() => {
            window.location.href = '/doctors';
          }}
        />,
      },
      {
        path: '/doctors',
        element: <DoctorFinder 
          doctors={[]}
          location={null}
          symptoms={[]}
          user={null}
          onSelectDoctor={(doctor: Doctor) => {
            console.log('Selected doctor:', doctor);
            // Implement appointment booking logic here
          }}
          onBack={() => {
            window.location.href = '/welcome';
          }}
        />,
      },
      {
        path: '/disclaimer',
        element: <MedicalDisclaimer 
          onAccept={() => {
            window.location.href = '/health-data';
          }}
          onBack={() => {
            window.location.href = '/welcome';
          }}
        />,
      },
      {
        path: '/health-data',
        element: <HealthDataWrapper /> // Use wrapper instead of direct component
      },
      {
        path: '/assessment',
        element: <SymptomInputWrapper />
      },
      {
        path: '/analysis',
        element: <AnalysisResults 
          result={{
            possibleConditions: [],
            urgencyLevel: 'low',
            recommendations: [],
            disclaimer: '',
            outbreakContext: undefined
          }}
          symptoms={[]}
          onStartOver={() => {
            window.location.href = '/assessment';
          }}
          outbreakData={{
            global: [],
            local: []
          }}
          location={null}
          onFindDoctors={() => {
            window.location.href = '/doctors';
          }}
        />,
      },
      {
        path: '/outbreaks',
        element: <OutbreakDashboard 
          globalOutbreaks={[]}
          localOutbreaks={[]}
          location={null}
          onBack={() => {
            window.location.href = '/welcome';
          }}
          lastUpdated={null}
        />,
      },
      {
        path: '/booking',
        element: <BookingWrapper />
      },
      {
        path: '/appointments',
        element: <UserAppointments />
      }
    ]
  }
]);