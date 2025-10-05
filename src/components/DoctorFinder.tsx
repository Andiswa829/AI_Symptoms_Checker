import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Phone, 
  Clock, 
  Filter,
  Navigation,
  Calendar,
  Heart,
  Stethoscope
} from 'lucide-react';
import type { Doctor, LocationData, Symptom } from '../App';

interface DoctorFinderProps {
  doctors: Doctor[];
  location: LocationData | null;
  symptoms: Symptom[];
  onSelectDoctor: (doctor: Doctor) => void;
  onBack: () => void;
}

export function DoctorFinder({ doctors, location, symptoms, onSelectDoctor, onBack }: DoctorFinderProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const [mapCenter, setMapCenter] = useState(
    location?.coordinates || { lat: 51.5074, lng: -0.1278 }
  );

  const specialties = ['all', ...new Set(doctors.map(d => d.specialization))];

  const filteredDoctors = doctors
    .filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           doctor.clinicName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialty = filterSpecialty === 'all' || doctor.specialization === filterSpecialty;
      return matchesSearch && matchesSpecialty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return b.rating - a.rating;
        case 'availability':
          return a.nextAvailable.localeCompare(b.nextAvailable);
        default:
          return 0;
      }
    });

  const DoctorCard = ({ doctor }: { doctor: Doctor }) => (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedDoctor?.id === doctor.id ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => setSelectedDoctor(doctor)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{doctor.name}</CardTitle>
            <CardDescription className="text-sm">{doctor.specialization}</CardDescription>
            <p className="text-sm text-muted-foreground mt-1">{doctor.clinicName}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center mb-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="text-sm">{doctor.rating}</span>
              <span className="text-xs text-muted-foreground ml-1">({doctor.reviewCount})</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {doctor.distance} km away
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="truncate">{doctor.address}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>Next available: {doctor.nextAvailable}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="h-4 w-4 mr-2" />
            <span>{doctor.phone}</span>
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {doctor.languages.slice(0, 2).map((lang, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {lang}
              </Badge>
            ))}
            {doctor.languages.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{doctor.languages.length - 2}
              </Badge>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm">R{doctor.consultationFee}</p>
            {doctor.acceptsInsurance && (
              <Badge variant="outline" className="text-xs">Insurance</Badge>
            )}
          </div>
        </div>
        
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onSelectDoctor(doctor);
          }}
          className="w-full mt-3"
          size="sm"
        >
          Book Appointment
        </Button>
      </CardContent>
    </Card>
  );

  const MapView = () => (
    <div className="relative w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden">
      {/* Mock map background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-green-100 via-blue-50 to-gray-100"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      {/* User location marker */}
      {location?.coordinates && (
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{
            left: '50%',
            top: '50%'
          }}
        >
          <div className="relative">
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse" />
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Your Location
            </div>
          </div>
        </div>
      )}
      
      {/* Doctor location markers */}
      {filteredDoctors.map((doctor, index) => {
        const offsetX = (doctor.coordinates.lng - mapCenter.lng) * 8000 + 50;
        const offsetY = (mapCenter.lat - doctor.coordinates.lat) * 8000 + 50;
        
        return (
          <div
            key={doctor.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer"
            style={{
              left: `${Math.max(5, Math.min(95, offsetX))}%`,
              top: `${Math.max(5, Math.min(95, offsetY))}%`
            }}
            onClick={() => setSelectedDoctor(doctor)}
          >
            <div className={`relative group ${selectedDoctor?.id === doctor.id ? 'z-30' : ''}`}>
              <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs transition-all hover:scale-110 ${
                selectedDoctor?.id === doctor.id 
                  ? 'bg-red-600 scale-110' 
                  : doctor.nextAvailable.includes('Today') 
                    ? 'bg-green-600' 
                    : 'bg-blue-600'
              }`}>
                <Stethoscope className="w-4 h-4" />
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-40">
                <div className="bg-black text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                  <p className="font-medium">{doctor.name}</p>
                  <p className="text-gray-300">{doctor.specialization}</p>
                  <div className="flex items-center mt-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>{doctor.rating}</span>
                    <span className="mx-1">•</span>
                    <span>{doctor.distance}km</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button size="sm" variant="secondary" className="w-10 h-10 p-0">
          +
        </Button>
        <Button size="sm" variant="secondary" className="w-10 h-10 p-0">
          −
        </Button>
        <Button size="sm" variant="secondary" className="w-10 h-10 p-0">
          <Navigation className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
        <h4 className="text-xs mb-2">Legend</h4>
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-600 rounded-full mr-2" />
            <span>Your location</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-600 rounded-full mr-2" />
            <span>Available today</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-600 rounded-full mr-2" />
            <span>Available later</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-600 rounded-full mr-2" />
            <span>Selected</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Results
        </Button>
        <h1 className="text-3xl text-primary mb-2">Find Doctors Near You</h1>
        <p className="text-muted-foreground">
          {location && `Showing healthcare providers near ${location.city || location.country}`}
        </p>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search doctors, clinics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty === 'all' ? 'All Specialties' : specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="availability">Availability</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDoctors.map(doctor => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
          
          {filteredDoctors.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg mb-2">No doctors found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="map" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MapView />
            </div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {selectedDoctor ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{selectedDoctor.name}</CardTitle>
                    <CardDescription>{selectedDoctor.specialization}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span>{selectedDoctor.rating}</span>
                          <span className="text-sm text-muted-foreground ml-1">
                            ({selectedDoctor.reviewCount} reviews)
                          </span>
                        </div>
                        <Badge variant="outline">{selectedDoctor.distance} km</Badge>
                      </div>
                      
                      <div className="text-sm">
                        <p className="text-muted-foreground mb-1">Address:</p>
                        <p>{selectedDoctor.address}</p>
                      </div>
                      
                      <div className="text-sm">
                        <p className="text-muted-foreground mb-1">Next Available:</p>
                        <p className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {selectedDoctor.nextAvailable}
                        </p>
                      </div>
                      
                      <div className="text-sm">
                        <p className="text-muted-foreground mb-1">Consultation Fee:</p>
                        <p>R{selectedDoctor.consultationFee}</p>
                      </div>
                      
                      <Button 
                        onClick={() => onSelectDoctor(selectedDoctor)}
                        className="w-full"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Click on a doctor marker to see details
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {/* Quick access to nearby doctors */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Nearby Doctors</h4>
                {filteredDoctors.slice(0, 3).map(doctor => (
                  <Card 
                    key={doctor.id} 
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">{doctor.name}</p>
                          <p className="text-xs text-muted-foreground">{doctor.specialization}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-xs">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            {doctor.rating}
                          </div>
                          <p className="text-xs text-muted-foreground">{doctor.distance} km</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}