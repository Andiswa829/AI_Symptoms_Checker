import React, { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { 
  Stethoscope, 
  Bell, 
  Globe, 
  User, 
  LogOut, 
  Settings,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import type { User, LocationData } from '../App';

interface NavigationHeaderProps {
  user: User | null;
  onLogout: () => void;
  onViewOutbreaks: () => void;
  outbreakCount: number;
  criticalCount: number;
  location: LocationData | null;
}

export function NavigationHeader({ 
  user, 
  onLogout, 
  onViewOutbreaks, 
  outbreakCount, 
  criticalCount,
  location 
}: NavigationHeaderProps) {
  if (!user) return null;

  return (
    <header className="bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <Stethoscope className="h-6 w-6 text-primary" />
            <h1 className="text-xl text-primary">AI Symptoms Checker</h1>
          </div>

          {/* Center - Location and Status */}
          <div className="hidden md:flex items-center space-x-4">
            {location && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  {location.city ? `${location.city}, ` : ''}{location.country}
                </span>
              </div>
            )}
          </div>

          {/* Right Side - Notifications and User */}
          <div className="flex items-center space-x-3">
            {/* Outbreak Notifications */}
            <Button
              variant="outline"
              size="sm"
              onClick={onViewOutbreaks}
              className="relative"
            >
              <Globe className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Outbreaks</span>
              {outbreakCount > 0 && (
                <Badge 
                  variant={criticalCount > 0 ? "destructive" : "secondary"}
                  className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {outbreakCount}
                </Badge>
              )}
              {criticalCount > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </Button>

            {/* General Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {user.preferences.notifications && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <div className="flex items-center mt-2">
                      <Badge variant="outline" className="text-xs">
                        {user.provider === 'google' ? 'Google Account' : 'Email Account'}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onViewOutbreaks}>
                  <Globe className="mr-2 h-4 w-4" />
                  <span>Health Alerts</span>
                  {criticalCount > 0 && (
                    <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 text-xs flex items-center justify-center">
                      {criticalCount}
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Mobile Location */}
        <div className="md:hidden pb-3">
          {location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>
                {location.city ? `${location.city}, ` : ''}{location.country}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}