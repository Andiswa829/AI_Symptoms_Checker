import { createBrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { LoginScreen } from './components/LoginScreen';
import { Doctor, DoctorFinder } from './components/DoctorFinder';
import { OutbreakDashboard } from './components/OutbreakDashboard';
import { AnalysisResults } from './components/AnalysisResults';
import { WelcomeScreen } from './components/WelcomeScreen';
import { User } from './types/outbreaks';
import { Appointment } from './types/doctor';
import { AppointmentBooking } from './components/AppointmentBooking';
import { MedicalDisclaimer } from './components/MedicalDisclaimer';
import { HealthDataCollection } from './components/HealthDataCollection';
import { RootLayout } from './components/RootLayout';
import { SymptomInputWrapper } from './components/SymptomInputWrapper';

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
          reminderSent: false
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
            // After successful login, navigate to welcome screen
            console.log('Logged in user:', user);
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(user));
        window.location.href = '/welcome';
          }} 
        />,
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
      }
    ]
  }
]);