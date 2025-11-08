import { Outlet, useNavigate } from 'react-router-dom';
import { NavigationHeader } from './NavigationHeader';
import { useState, useEffect } from 'react';
import { UserType, LocationData } from '../types/outbreaks';


export function RootLayout() {
  const [user, setUser] = useState<UserType | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [criticalAlerts] = useState<number>(0);
  const [outbreakCount] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user exists in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader
        user={user}
        onLogout={handleLogout}
        onViewOutbreaks={() => navigate('/outbreaks')}
        outbreakCount={outbreakCount}
        criticalCount={criticalAlerts}
        location={location}
      />
      <Outlet />
    </div>
  );
}