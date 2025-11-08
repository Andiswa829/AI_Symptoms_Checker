import { useEffect, useRef, useState } from 'react';
import { ApiService } from '../utils/api';
import { endpoints } from '../config/env';
import type { DoctorResponse } from '../types/doctor';
import { loadGoogleMaps } from '../services/googleMaps';
import { config } from '../config/env';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ChevronLeft, Search, MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types/outbreaks';

declare global {
  interface Window { google: any; }
}

/* PlaceResult (from Google Places) */
interface PlaceResult {
  place_id: string;
  name: string;
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  geometry?: { location: { lat(): number; lng(): number } };
  photos?: any[];
  types?: string[];
  formatted_phone_number?: string;
  website?: string;
}

/* Doctor interface used by the app (exported here so DoctorFinder provides it) */
export type Doctor = {
  id: string;
  name: string;
  specialization: string;
  qualifications: string[];
  rating?: number;
  reviewCount?: number;
  distance: number;
  address: string;
  phone: string;
  email: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  availability: Record<string, string[]>;
  languages: string[];
  acceptsInsurance: boolean;
  consultationFee: number;
  clinicName: string;
  nextAvailable: string;
};

export type DoctorFinderProps = {
  doctors: Doctor[];
  location: {
    country: string;
    state?: string;
    city?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  } | null;
  symptoms: {
    id: string;
    description: string;
    severity: "mild" | "moderate" | "severe";
    duration: string;
    timestamp: Date;
  }[];
  user: User|null;
  onSelectDoctor: (doctor: Doctor) => void;
  onBack: () => void;
};

// Johannesburg center coordinates
const JOHANNESBURG_CENTER = { lat: -26.2041, lng: 28.0473 };

const MEDICAL_LOCATIONS = [
  { name: "Chris Hani Baragwanath Hospital", lat: -26.2604, lng: 27.9408 },
  { name: "Charlotte Maxeke Hospital", lat: -26.1744, lng: 28.0417 },
  { name: "Helen Joseph Hospital", lat: -26.1796, lng: 27.9850 }
];

const cardHoverStyles = "transition-all duration-200 hover:shadow-lg hover:border-primary cursor-pointer";

export function DoctorFinder({ doctors, location, symptoms, user, onSelectDoctor, onBack }: DoctorFinderProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const serviceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number }>(JOHANNESBURG_CENTER);
  const [radius, setRadius] = useState<number>(5000); // 5km radius
  const [doctorsState, setDoctors] = useState<DoctorResponse[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const initMapAndLoadDoctors = async () => {
      try {
        setLoading(true);

        // 1. First fetch doctors
        const doctorsResponse = await ApiService.get(endpoints.doctors.list);
        setDoctors(doctorsResponse);

        // 2. Then initialize map
        const apiKey = config.googleMapsApiKey;
        const google = await loadGoogleMaps(apiKey);

        const pos = await getCurrentPosition().catch(() => null);
        const mapCenter = pos ?
          { lat: pos.coords.latitude, lng: pos.coords.longitude } :
          JOHANNESBURG_CENTER;

        setCenter(mapCenter);

        if (mapRef.current) {
          mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            center: mapCenter,
            zoom: 12,
            streetViewControl: false,
            mapTypeControl: false,
            styles: [
              {
                featureType: "poi.medical",
                elementType: "labels",
                stylers: [{ visibility: "on" }]
              },
              {
                featureType: "poi.business",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          });

          // 3. Add markers only after map is initialized and doctors are loaded
          // Add hospitals
          MEDICAL_LOCATIONS.forEach(loc => {
            const marker = new google.maps.Marker({
              position: { lat: loc.lat, lng: loc.lng },
              map: mapInstanceRef.current,
              title: loc.name,
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
              }
            });

            const info = new google.maps.InfoWindow({
              content: `<div style="min-width:180px">
                <strong>${escapeHtml(loc.name)}</strong>
                <div style="font-size:12px">Hospital/Medical Center</div>
              </div>`
            });

            marker.addListener('click', () => info.open(mapInstanceRef.current, marker));
            markersRef.current.push(marker);
          });

          // Add doctors
          doctorsResponse.forEach((doc: DoctorResponse, idx: number) => {
            console.log('Adding doctor marker:', doc);
            const marker = new google.maps.Marker({
              position: { lat: doc.latitude, lng: doc.longitude },
              map: mapInstanceRef.current,
              title: `${doc.firstName} ${doc.lastName}`,
              label: { text: String(idx + 1), color: 'white' },
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
              }
            });

            const info = new google.maps.InfoWindow({
              content: `
                <div style="min-width:200px">
                  <strong>${doc.firstName} ${doc.lastName}</strong>
                  <div style="font-size:12px">${doc.specialization}</div>
                  <div style="font-size:12px">${doc.address}, ${doc.city}</div>
                  <div style="font-size:12px">Rating: ${doc.rating} • ${doc.yearsOfExperience} years exp.</div>
                  <div style="margin-top:8px">
                    <button 
                      id="select-doctor-${doc.id}" 
                      style="padding:6px 12px;border-radius:4px;background:#2563eb;color:white;border:none;cursor:pointer"
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              `
            });

            marker.addListener('click', () => {
              info.open(mapInstanceRef.current, marker);

              // Add click handler after info window is opened
              google.maps.event.addListenerOnce(info, 'domready', () => {
                const button = document.getElementById(`select-doctor-${doc.id}`);
                if (button) {
                  button.addEventListener('click', () => {
                    const mappedDoctor: Doctor = {
                      id: doc.id.toString(),
                      name: `${doc.firstName} ${doc.lastName}`,
                      specialization: doc.specialization,
                      qualifications: [`${doc.yearsOfExperience} years experience`],
                      rating: doc.rating,
                      reviewCount: 0,
                      distance: 0,
                      address: `${doc.address}, ${doc.city}`,
                      phone: doc.phoneNumber,
                      email: doc.email,
                      coordinates: {
                        lat: doc.latitude,
                        lng: doc.longitude
                      },
                      availability: {},
                      languages: ['English'],
                      acceptsInsurance: true,
                      consultationFee: 0,
                      clinicName: '',
                      nextAvailable: new Date().toISOString()
                    };
                    onSelectDoctor?.(mappedDoctor);
                    info.close(); // Close the info window after selection
                  });
                }
              });
            });

            markersRef.current.push(marker);
          });
        }

      } catch (error) {
        console.error('Failed to initialize map or fetch doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    initMapAndLoadDoctors();
    return () => { clearMarkers(); };
  }, []);

  // Remove the second useEffect that was fetching doctors
  // Remove the addMedicalLocations function as it's now integrated above

  async function performSearch(loc: { lat: number; lng: number }, r: number) {
    if (!serviceRef.current) return;
    setLoading(true);

    const request = {
      location: new window.google.maps.LatLng(loc.lat, loc.lng),
      radius: r,
      type: ['doctor', 'hospital'],
      keyword: 'doctor OR hospital OR clinic OR medical centre',
    };

    serviceRef.current.nearbySearch(request, (results: PlaceResult[], status: string) => {
      setLoading(false);
      if (status !== window.google.maps.places.PlacesServiceStatus.OK || !results) {
        console.warn('Places search failed:', status);
        return;
      }
      setPlaces(results);
      renderMarkers(results);
    });
  }

  function clearMarkers() {
    markersRef.current.forEach(m => m.setMap && m.setMap(null));
    markersRef.current = [];
  }

  function mapPlaceToDoctor(p: PlaceResult): Doctor {
    const lat = p.geometry?.location?.lat?.() ?? 0;
    const lng = p.geometry?.location?.lng?.() ?? 0;
    return {
      id: p.place_id,
      name: p.name,
      specialization: deriveSpecializationFromTypes(p.types) ?? '',
      qualifications: [],
     // reviewCount: p.user_ratings_total ?? 0,
      rating: p.rating ?? 0,
      distance: 0,
      address: p.vicinity ?? '',
      phone: (p as any).formatted_phone_number ?? undefined,
      email: '',
      coordinates: { lat, lng },
      availability: {},
      languages: [],
      acceptsInsurance: false,
      consultationFee: 0,
      clinicName: '',
      nextAvailable: ''
    };
  }

  function renderMarkers(results: PlaceResult[]) {
    clearMarkers();
    const map = mapInstanceRef.current;
    if (!map) return;
    results.forEach((p, idx) => {
      const pos = p.geometry?.location ? { lat: p.geometry.location.lat(), lng: p.geometry.location.lng() } : null;
      if (!pos) return;
      const marker = new window.google.maps.Marker({
        position: pos,
        map,
        title: p.name,
        label: { text: String(idx + 1), color: 'white' },
      });
      const info = new window.google.maps.InfoWindow({
        content: `<div style="min-width:180px">
            <strong>${escapeHtml(p.name)}</strong>
            <div style="font-size:12px">${escapeHtml(p.vicinity || '')}</div>
            <div style="margin-top:6px">
              <button 
                id="select-doctor-${p.place_id}" 
                style="padding:6px 8px;border-radius:4px;background:#2563eb;color:white;border:none;cursor:pointer"
              >
                Select
              </button>
            </div>
          </div>
        `
      });

      marker.addListener('click', () => info.open(map, marker));
      window.google.maps.event.addListenerOnce(info, 'domready', () => {
        const el = document.getElementById(`select-doctor-${p.place_id}`);
        if (el) {
          el.addEventListener('click', () => {
            const doctor = mapPlaceToDoctor(p);
            onSelectDoctor?.(doctor);
          });
        }
      });

      markersRef.current.push(marker);
    });
  }

  async function recenterToUser() {
    const pos = await getCurrentPosition().catch(() => null);
    if (!pos) return;
    const newCenter = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    setCenter(newCenter);
    mapInstanceRef.current?.setCenter(newCenter);
    performSearch(newCenter, radius);
  }

  // Update the back button handler
  const handleBack = () => {
    navigate('/welcome');
  };

  const handleBookAppointment = (doctor: Doctor) => {
    onSelectDoctor?.(doctor);
    navigate('/booking', {
      state: {
        doctor,
        symptoms
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-white p-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Find Doctors</h1>
            <p className="text-sm text-muted-foreground">
              {location?.city ? `${location.city}, ` : ''}
              {location?.country || 'South Africa'}
            </p>
          </div>
          <Button onClick={recenterToUser}>
            <MapPin className="h-4 w-4 mr-2" />
            Use my location
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-4 p-4 h-[calc(100vh-80px)]">
        {/* Map */}
        <div className="relative h-full rounded-lg overflow-hidden border">
          <div className="absolute inset-0" ref={mapRef}></div>
        </div>

        {/* Doctor List */}
        <div className="flex flex-col h-full">
          {/* Search and Filters */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2">
              <select
                value={radius}
                onChange={(e) => {
                  const r = Number(e.target.value);
                  setRadius(r);
                  if (center) performSearch(center, r);
                }}
                className="h-10 px-3 rounded-md border"
              >
                <option value={2000}>2 km</option>
                <option value={5000}>5 km</option>
                <option value={10000}>10 km</option>
                <option value={20000}>20 km</option>
              </select>
              <div className="text-sm text-muted-foreground">
                {doctorsState.length} doctors found
              </div>
            </div>
          </div>

          {/* Doctor Cards */}
          <div className="overflow-auto flex-1 -mx-2 px-2">
            <div className="space-y-3">
              {doctorsState.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
                  onClick={() => {
                    mapInstanceRef.current?.panTo({ lat: doc.latitude, lng: doc.longitude });
                    mapInstanceRef.current?.setZoom(15);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{doc.firstName} {doc.lastName}</h3>
                      <p className="text-sm text-primary">{doc.specialization}</p>
                    </div>
                    <Badge variant="outline">
                      {doc.yearsOfExperience} years exp.
                    </Badge>
                  </div>

                  <div className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {doc.address}, {doc.city}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e:any) => {
                        e.stopPropagation();
                        mapInstanceRef.current?.panTo({ lat: doc.latitude, lng: doc.longitude });
                        mapInstanceRef.current?.setZoom(15);
                      }}
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      View on map
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="pointer-events-auto"
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const mappedDoctor: Doctor = {
                          id: doc.id.toString(),
                          name: `${doc.firstName} ${doc.lastName}`,
                          specialization: doc.specialization,
                          qualifications: [`${doc.yearsOfExperience} years experience`],
                          distance: 0,
                          address: `${doc.address}, ${doc.city}`,
                          phone: doc.phoneNumber,
                          email: doc.email,
                          coordinates: {
                            lat: doc.latitude,
                            lng: doc.longitude
                          },
                          availability: {},
                          languages: ['English'],
                          acceptsInsurance: true,
                          consultationFee: 0,
                          clinicName: '',
                          nextAvailable: new Date().toISOString()
                        };
                        handleBookAppointment(mappedDoctor);
                      }}
                    >
                      Book Appointment
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* helpers */
function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
  });
}

function escapeHtml(s: string) {
  return String(s ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m] as string));
}

function deriveSpecializationFromTypes(types?: string[]): string | undefined {
  if (!types || types.length === 0) return undefined;
  if (types.includes('hospital')) return 'Hospital';
  if (types.includes('clinic')) return 'Clinic';
  if (types.includes('doctor')) return 'General Practitioner';
  return types.join(', ');
}