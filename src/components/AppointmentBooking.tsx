import React, { useState } from 'react';
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
  FileText
} from 'lucide-react';
import { Appointment, Doctor, Symptom } from '../types/doctor';

interface AppointmentBookingProps {
  doctor: Doctor;
  symptoms: Symptom[];
  onBookAppointment: (appointment: Omit<Appointment, 'id' | 'status' | 'reminderSent'>) => Appointment;
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

  // Get available time slots for selected date
  const getAvailableSlots = (date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return doctor.availability[dayName] || [];
  };

  const availableSlots = selectedDate ? getAvailableSlots(selectedDate) : [];

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !patientName || !patientEmail || !patientPhone) {
      return;
    }

    setIsBooking(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

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

    const newAppointment = onBookAppointment(appointmentData);
    setBookedAppointment(newAppointment);
    setIsBooking(false);
    setBookingComplete(true);
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
                    onSelect={setSelectedDate}
                    disabled={(date: Date) => {
                      const day = date.getDay();
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                      return date < new Date() || !doctor.availability[dayName]?.length;
                    }}
                    className="rounded-md border"
                  />
                </div>
                
                <div>
                  <Label className="text-sm mb-2 block">Available Times</Label>
                  {selectedDate ? (
                    availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availableSlots.map((slot: string) => (
                          <Button
                            key={slot}
                            variant={selectedTime === slot ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTime(slot)}
                            className="text-sm"
                          >
                            {slot}
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