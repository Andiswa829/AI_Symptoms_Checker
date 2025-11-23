import React, { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import {
  Stethoscope,
  Bell,
  Globe,
  LogOut,
  Settings,
  MapPin,
  User,
  FileText,
  Activity,
  History,
  Calendar
} from 'lucide-react';
import { LocationData, UserType } from '../types/outbreaks';

interface NavigationHeaderProps {
  user: UserType | null;
  onLogout: () => void;
  onViewOutbreaks: () => void;
  onViewMedicalHistory: () => void;
  onViewSymptomHistory: () => void;
  outbreakCount: number;
  criticalCount: number;
  location: LocationData | null;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  user,
  onLogout,
  onViewOutbreaks,
  onViewMedicalHistory,
  onViewSymptomHistory,
  outbreakCount,
  criticalCount,
  location
}) => {

  console.log('NavigationHeader props:', { user, location, outbreakCount, criticalCount });
  console.log('User details:', {
    hasUser: !!user,
    userEmail: user?.email,
    userFirstName: user?.firstName,
    userAvatar: user?.avatar
  });

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Stethoscope className="h-6 w-6 text-primary-foreground" />
          </div>
          <Button onClick={() => {
            window.location.href = '/welcome';
          }}>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold leading-none">AI Health Assistant</h1>
            <p className="text-xs text-muted-foreground">Smart Symptom Analysis</p>
          </div>
          </Button>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Location Badge */}
          {location && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3" />
              {location.city || location.state || location.country}
            </Badge>
          )}

          {/* Outbreak Alerts */}
          <Button variant="outline" size="sm" onClick={onViewOutbreaks} className="gap-2">
            <Globe className="h-4 w-4" />
            Outbreaks
            {outbreakCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                {outbreakCount}
              </Badge>
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="outline"
            size="sm"
            className="relative gap-2"
          >
            <Bell className="h-4 w-4" />
            {criticalCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
              >
                {criticalCount}
              </Badge>
            )}
          </Button>

          {/* User Menu - Controlled dropdown */}
          {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full hover:bg-muted/50 
                 focus:outline-none focus:ring-2 focus:ring-ring 
                 focus:ring-offset-2 border-2 border-muted-foreground/20 
                 hover:border-primary/50 transition-colors"
                aria-label="User menu"
              >
                <Avatar className="h-8 w-8">
                  {user.avatar ? (
                    <AvatarImage
                      src={user.avatar}
                      alt={user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}
                    />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                      {user.firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end" sideOffset={5}>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={onViewMedicalHistory} className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                <span>Medical History</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={onViewSymptomHistory} className="cursor-pointer">
                <History className="mr-2 h-4 w-4" />
                <span>Symptom Analysis History</span>
              </DropdownMenuItem>

              {/* Regular users can view their appointment bookings/statuses */}
              {!user?.isDoctor && (
                <DropdownMenuItem onClick={() => window.location.href = '/appointments'} className="cursor-pointer">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>My Appointments</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={onLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>):null}

        </div>
      </div>
    </header>
  );
};
