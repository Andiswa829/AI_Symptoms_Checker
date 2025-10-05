import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, AlertTriangle, ExternalLink, MapPin } from 'lucide-react';
import type { OutbreakData } from '../App';

interface OutbreakAlertProps {
  outbreak: OutbreakData;
  onDismiss: () => void;
}

export function OutbreakAlert({ outbreak, onDismiss }: OutbreakAlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Auto-dismiss after 30 seconds for non-critical alerts
    if (outbreak.severity !== 'critical') {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 30000);
      
      return () => clearTimeout(timer);
    }
  }, [outbreak.severity]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Allow animation to complete
  };

  const getSeverityConfig = () => {
    switch (outbreak.severity) {
      case 'critical':
        return {
          bgColor: 'bg-red-100 border-red-500',
          textColor: 'text-red-900',
          iconColor: 'text-red-600',
          badgeColor: 'bg-red-600 text-white',
          pulseColor: 'bg-red-600'
        };
      case 'high':
        return {
          bgColor: 'bg-orange-100 border-orange-500',
          textColor: 'text-orange-900',
          iconColor: 'text-orange-600',
          badgeColor: 'bg-orange-600 text-white',
          pulseColor: 'bg-orange-600'
        };
      default:
        return {
          bgColor: 'bg-yellow-100 border-yellow-500',
          textColor: 'text-yellow-900',
          iconColor: 'text-yellow-600',
          badgeColor: 'bg-yellow-600 text-white',
          pulseColor: 'bg-yellow-600'
        };
    }
  };

  const config = getSeverityConfig();

  if (!isVisible) return null;

  return (
    <div className={`
      fixed top-0 left-0 right-0 z-50 transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
    `}>
      <Alert className={`
        rounded-none border-l-0 border-r-0 border-t-0 border-b-4 
        ${config.bgColor} ${config.textColor}
        shadow-lg
      `}>
        <div className="flex items-start justify-between w-full">
          <div className="flex items-start space-x-3 flex-1">
            <div className="relative">
              <AlertTriangle className={`h-5 w-5 ${config.iconColor}`} />
              {outbreak.severity === 'critical' && (
                <div className={`
                  absolute -top-1 -right-1 w-3 h-3 ${config.pulseColor} rounded-full 
                  animate-pulse
                `} />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="text-sm font-medium truncate">
                  {outbreak.title}
                </h4>
                <Badge className={`${config.badgeColor} text-xs`}>
                  {outbreak.severity.toUpperCase()}
                </Badge>
              </div>
              
              <AlertDescription className={`${config.textColor} text-sm`}>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{outbreak.location}</span>
                  <span className="text-xs opacity-75">•</span>
                  <span className="text-xs opacity-75">{outbreak.source}</span>
                </div>
                
                <p className={`${isExpanded ? '' : 'line-clamp-1'} cursor-pointer`}
                   onClick={() => setIsExpanded(!isExpanded)}>
                  {outbreak.description}
                </p>
                
                {isExpanded && outbreak.symptoms && outbreak.symptoms.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs opacity-75 mb-1">Symptoms to watch for:</p>
                    <div className="flex flex-wrap gap-1">
                      {outbreak.symptoms.slice(0, 4).map((symptom, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs capitalize bg-white/50"
                        >
                          {symptom}
                        </Badge>
                      ))}
                      {outbreak.symptoms.length > 4 && (
                        <Badge variant="outline" className="text-xs bg-white/50">
                          +{outbreak.symptoms.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </AlertDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            {isExpanded && (
              <Button variant="outline" size="sm" className="text-xs h-7">
                <ExternalLink className="h-3 w-3 mr-1" />
                Details
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className={`h-7 w-7 p-0 hover:bg-white/20 ${config.textColor}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {outbreak.severity === 'critical' && (
          <div className="mt-3 pt-3 border-t border-current/20">
            <p className="text-xs opacity-90">
              <strong>Critical Alert:</strong> This is a high-priority health emergency. 
              Follow local health authority guidance and seek medical attention if you experience symptoms.
            </p>
          </div>
        )}
      </Alert>
    </div>
  );
}