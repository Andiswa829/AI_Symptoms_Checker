import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Alert, AlertDescription } from './ui/alert';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Calendar as CalendarIcon,
  CheckCircle,
  AlertCircle,
  User,
  FileText,
  Loader2
} from 'lucide-react';
import { Appointment, Doctor, Symptom, AppointmentAvailability } from '../types/doctor';
import { ApiService } from '../utils/api';
import { endpoints } from '../config/env';

interface AppointmentBookingProps {
  doctor: Doctor;
  symptoms: Symptom[];
  onBookAppointment: (appointment: Omit<Appointment, 'id' | 'status' | 'reminderSent' | 'patient'>) => Appointment;
  onBack: () => void;
  onComplete: () => void;
}

export function AppointmentBooking({ 
  doctor, 
  symptoms, 
  onBookAppointment, 
  onBack, 
  onComplete 
}: AppointmentBookingProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);
  const [bookingError, setBookingError] = useState('');
  const [availability, setAvailability] = useState<AppointmentAvailability[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  // New: available times returned by the availableSlots endpoint (array of ISO datetimes)
  const [availableTimes, setAvailableTimes] = useState<{ time: string; id: string }[]>([]);
  const [loadingAvailableTimes, setLoadingAvailableTimes] = useState(false);
  const [availableTimesError, setAvailableTimesError] = useState('');

  // Fetch doctor availability
  const fetchDoctorAvailability = async (doctorId: string) => {
    try {
      setLoadingAvailability(true);
      setAvailabilityError('');
      const response = await ApiService.get(`/api/Appointments/${doctorId}/availability`);
      console.log('Fetched availability:', response);
      setAvailability(response);
    } catch (error) {
      console.error('Failed to fetch doctor availability:', error);
      setAvailabilityError('Failed to load doctor availability. Please try again.');
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Load availability when component mounts or doctor changes
  useEffect(() => {
    console.log('Doctor ID changed, fetching availability for doctor:', doctor.id);
    if (doctor.id) {
      fetchDoctorAvailability(doctor.id);
    }
  }, [doctor.id]);

  // Fetch availableSlots (ISO datetime strings) for the selected date from the API
  const fetchAvailableSlotsForDate = async (doctorId: string, date: Date) => {
    try {
      setLoadingAvailableTimes(true);
      setAvailableTimesError('');

      // Build date param as a full ISO timestamp with milliseconds and 'Z' (UTC)
      // Example: "2025-11-23T00:00:00.000Z" or "2025-11-23T19:59:50.568Z"
      const y = date.getFullYear();
      const m = date.getMonth(); // zero-based
      const d = date.getDate();
      const dateAtMidnightUtc = new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
      const dateParam = dateAtMidnightUtc.toISOString();

      const encoded = encodeURIComponent(dateParam);
      const url = `/api/Appointments/${doctorId}/availableSlots?date=${encoded}`;
      console.log('Fetching availableSlots from:', url);
      const resp = await ApiService.get(url) as string[];
      console.log('availableSlots response:', resp);

      // Response is array of ISO datetimes like "2025-11-23T15:30:00"
      const times = (resp || []).map((dt: string) => {
        const parts = dt.split('T');
        const timePart = parts[1] ? parts[1].slice(0,5) : dt; // HH:MM
        return { time: timePart, id: dt };
      });

      setAvailableTimes(times);
    } catch (err) {
      console.error('Failed to fetch availableSlots:', err);
      setAvailableTimes([]);
      setAvailableTimesError('Failed to load available times.');
    } finally {
      setLoadingAvailableTimes(false);
    }
  };

  // Trigger fetching availableSlots when selectedDate or doctor changes
  useEffect(() => {
    if (!doctor.id || !selectedDate) {
      setAvailableTimes([]);
      return;
    }

    fetchAvailableSlotsForDate(doctor.id, selectedDate);
  }, [doctor.id, selectedDate]);

  // Get available time slots for selected date from API data
  const getAvailableSlots = (date: Date) => {
    console.log('Calculating available slots for date:', date);
    console.log('All availability data:', availability);
    if (!availability.length) return [];
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const selectedDateString = `${year}-${month}-${day}`;
    console.log('Selected date string:', selectedDateString);
    
    const daySlots = availability.filter(slot => {
      // Extract just the date part in case slot.date includes time
      const slotDateOnly = typeof slot.date === 'string' ? slot.date.split('T')[0] : slot.date;
      console.log('Comparing slot date:', slotDateOnly, 'with selected date:', selectedDateString, 'isAvailable:', slot.isAvailable);
      return slotDateOnly === selectedDateString && slot.isAvailable;
    });
    
    console.log('Filtered day slots:', daySlots);
    
    const slots: { time: string; id: string }[] = [];
    daySlots.forEach(slot => {
      const slotDateOnly = typeof slot.date === 'string' ? slot.date.split('T')[0] : slot.date;
      const start = new Date(`${slotDateOnly}T${slot.startTime}`);
      const end = new Date(`${slotDateOnly}T${slot.endTime}`);
      console.log('Creating slots from', slot.startTime, 'to', slot.endTime, 'start:', start, 'end:', end);
      const slotDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
      
      let current = new Date(start);
      while (current < end) {
        const timeSlot = {
          time: String(current.getHours()).padStart(2, '0') + ':' + String(current.getMinutes()).padStart(2, '0'),
          id: `${slot.id}-${current.toISOString()}`
        };
        slots.push(timeSlot);
        current = new Date(current.getTime() + slotDuration);
      }
    });
    
    console.log('Generated time slots:', slots);
    return slots;
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset selected time when date changes
  };


  // Prefer availableTimes from the availableSlots endpoint; fallback to existing availability parsing
  const availableSlots = availableTimes.length > 0
    ? availableTimes
    : (selectedDate ? getAvailableSlots(selectedDate) : []);
console.log('Available slots for selected date:', availableSlots);
  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !patientName || !patientEmail || !patientPhone) {
      return;
    }

    setIsBooking(true);
    setBookingError('');

    const appointmentData = {
      doctorId: doctor.id,
      patientName,
      patientEmail,
      patientPhone,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      reason: reason || `Consultation regarding ${symptoms.map(s => s.description).join(', ')}`,
      symptoms,
      notes
    };

    // Try to include the logged-in user's id in the API payload if available
    let userId: string | null = null;
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        userId = parsed?.id ?? null;
      }
    } catch (err) {
      console.warn('Failed to read user from localStorage', err);
      userId = null;
    }

    // Send userId to the backend but avoid adding it to the object passed to onBookAppointment
    const apiPayload = userId ? { ...appointmentData, userId } : appointmentData;

    try {
      // Attempt to persist the appointment to the API (include userId in API payload when available)
      const resp = await ApiService.post(endpoints.appointments.book, apiPayload);
      console.log('Appointment booked via API:', resp);
      // If API returns an appointment object, use that as the booked appointment
      const createdAppointment = (resp as Appointment) || onBookAppointment(appointmentData);
      // Notify parent (for demo storage) and set state
      const newAppointment = onBookAppointment(appointmentData);
      setBookedAppointment(createdAppointment || newAppointment);
      setBookingComplete(true);
    } catch (error: any) {
      console.error('Failed to book appointment:', error);
      setBookingError(error?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const isFormValid = () => {
    return selectedDate && selectedTime && patientName && patientEmail && patientPhone;
  };

  if (bookingComplete && bookedAppointment) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl text-primary mb-2">Appointment Booked Successfully!</h1>
          <p className="text-muted-foreground">
            Your appointment has been scheduled and confirmation details have been sent to your email.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg mb-3">Doctor Information</h3>
                <div className="space-y-2">
                  <p><strong>{doctor.name}</strong></p>
                  <p className="text-muted-foreground">{doctor.specialization}</p>
                  <p className="text-muted-foreground">{doctor.clinicName}</p>
                  {/* <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>{doctor.rating}</span>
                    <span className="text-muted-foreground ml-1">({doctor.reviewCount} reviews)</span>
                  </div> */}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg mb-3">Appointment Schedule</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{selectedDate?.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{selectedTime}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{doctor.address}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg mb-3">Patient Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Name:</strong> {patientName}</p>
                  <p><strong>Email:</strong> {patientEmail}</p>
                  <p><strong>Phone:</strong> {patientPhone}</p>
                </div>
                <div>
                  <p><strong>Appointment ID:</strong> {bookedAppointment.id}</p>
                  <p><strong>Status:</strong> 
                    <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                      {bookedAppointment.status}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>
            
            {reason && (
              <div>
                <h3 className="text-lg mb-2">Reason for Visit</h3>
                <p className="text-muted-foreground">{reason}</p>
              </div>
            )}
            
            {symptoms.length > 0 && (
              <div>
                <h3 className="text-lg mb-2">Symptoms to Discuss</h3>
                <div className="flex flex-wrap gap-2">
                  {symptoms.map(symptom => (
                    <Badge key={symptom.id} variant="outline" className="capitalize">
                      {symptom.description} ({symptom.severity})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Please arrive 15 minutes before your appointment time</li>
              <li>• Bring a valid ID and insurance card if applicable</li>
              <li>• Bring a list of current medications you're taking</li>
              <li>• You will receive a reminder email 24 hours before your appointment</li>
              <li>• If you need to cancel or reschedule, please call at least 24 hours in advance</li>
              <li>• Consultation fee: R{doctor.consultationFee} (payable at the clinic)</li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={onComplete}>
              Return to Results
            </Button>
            <Button onClick={() => window.print()}>
              Print Confirmation
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            A confirmation email has been sent to {patientEmail}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Doctor List
        </Button>
        <h1 className="text-3xl text-primary mb-2">Book Appointment</h1>
        <p className="text-muted-foreground">
          Schedule your consultation with {doctor.name}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Doctor Information */}
        <Card>
          <CardHeader>
            <CardTitle>Doctor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg">{doctor.name}</h3>
              <p className="text-muted-foreground">{doctor.specialization}</p>
              <p className="text-sm text-muted-foreground">{doctor.clinicName}</p>
            </div>
            
            {/* <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span>{doctor.rating}</span>
              <span className="text-muted-foreground ml-1">({doctor.reviewCount} reviews)</span>
            </div> */}
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{doctor.address}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{doctor.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{doctor.email}</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Languages:</p>
              <div className="flex flex-wrap gap-1">
                {doctor.languages.map((lang:string, index:number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-sm">
                <strong>Consultation Fee:</strong> R{doctor.consultationFee}
              </p>
              {doctor.acceptsInsurance && (
                <Badge variant="outline" className="mt-1">
                  Accepts Insurance
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Booking Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientName">Full Name *</Label>
                  <Input
                    id="patientName"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="patientPhone">Phone Number *</Label>
                  <Input
                    id="patientPhone"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+27 7123 456789"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="patientEmail">Email Address *</Label>
                <Input
                  id="patientEmail"
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Select Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm mb-2 block">Choose Date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    disabled={(date: Date) => {
                      return date < new Date();
                    }}
                    className="rounded-md border"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm">Available Times</Label>
                    {availabilityError && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchDoctorAvailability(doctor.id)}
                        disabled={loadingAvailability}
                      >
                        {loadingAvailability ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Retry'
                        )}
                      </Button>
                    )}
                  </div>
                  {selectedDate ? (
                    loadingAvailability ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm text-muted-foreground">Loading available times...</span>
                      </div>
                    ) : availabilityError ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {availabilityError}
                        </AlertDescription>
                      </Alert>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availableSlots.map((slot: { time: string; id: string }) => (
                          <Button
                            key={slot.id}
                            variant={selectedTime === slot.time ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTime(slot.time)}
                            className="text-sm"
                          >
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No available appointments on this date. Please select another date.
                        </AlertDescription>
                      </Alert>
                    )
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Please select a date to see available times
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reason">Reason for Visit</Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., General consultation, symptom evaluation..."
                />
              </div>
              
              {symptoms.length > 0 && (
                <div>
                  <Label className="text-sm mb-2 block">Symptoms to Discuss</Label>
                  <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
                    {symptoms.map(symptom => (
                      <Badge key={symptom.id} variant="outline" className="capitalize">
                        {symptom.description} ({symptom.severity})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information you'd like the doctor to know..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Booking Summary */}
          {selectedDate && selectedTime && (
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Doctor:</span>
                    <span>{doctor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consultation Fee:</span>
                    <span>R{doctor.consultationFee}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Booking Error */}
          {bookingError && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{bookingError}</AlertDescription>
            </Alert>
          )}

          {/* Book Button */}
          <Button 
            onClick={handleBooking}
            disabled={!isFormValid() || isBooking}
            size="lg"
            className="w-full"
          >
            {isBooking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Booking Appointment...
              </>
            ) : (
              'Book Appointment'
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            By booking this appointment, you agree to our terms and conditions.
            You will receive a confirmation email once the booking is complete.
          </p>
        </div>
      </div>
    </div>
  );
}