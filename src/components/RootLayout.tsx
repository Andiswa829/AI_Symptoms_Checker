import { Outlet, useNavigate } from 'react-router-dom';
import { NavigationHeader } from './NavigationHeader';
import { MedicalHistory } from './MedicalHistory';
import { SymptomAnalysisHistory } from './SymptomAnalysisHistory';
import { useState, useEffect } from 'react';
import { UserType, LocationData } from '../types/outbreaks';


export function RootLayout() {
  const [user, setUser] = useState<UserType | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [criticalAlerts] = useState<number>(0);
  const [outbreakCount] = useState<number>(0);
  const [currentView, setCurrentView] = useState<string>('main');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user exists in localStorage
    const savedUser = localStorage.getItem('user');
    console.log('RootLayout: Checking localStorage for user', { savedUser });
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      console.log('RootLayout: Found saved user', parsedUser);
      setUser(parsedUser);
    } 
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const handleViewMedicalHistory = () => {
    setCurrentView('medical-history');
  };

  const handleViewSymptomHistory = () => {
    setCurrentView('symptom-history');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  if (currentView === 'medical-history' && user) {
    return (
      <div className="min-h-screen bg-background">
        <MedicalHistory onBack={handleBackToMain} userId={user.id} />
      </div>
    );
  }

  if (currentView === 'symptom-history' && user) {
    return (
      <div className="min-h-screen bg-background">
        <SymptomAnalysisHistory onBack={handleBackToMain} userId={user.id} />
      </div>
    );
  }

  console.log('RootLayout: Rendering with user', user);
  
  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader
        user={user}
        onLogout={handleLogout}
        onViewOutbreaks={() => navigate('/outbreaks')}
        onViewMedicalHistory={handleViewMedicalHistory}
        onViewSymptomHistory={handleViewSymptomHistory}
        outbreakCount={outbreakCount}
        criticalCount={criticalAlerts}
        location={location}
      />
      <Outlet />
    </div>
  );
}