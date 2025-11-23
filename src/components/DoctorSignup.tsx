import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Stethoscope,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  MapPin,
  GraduationCap,
  Building,
  FileText,
  Shield,
  ArrowLeft,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { AuthService } from "../services/authService";
import { ApiService } from "../utils/api";
import { config } from "../config/env";

interface DoctorData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  practiceNumber: string;
  specialization: string;
  yearsOfExperience: string;
  hospitalAffiliation: string;
  clinicAddress: string;
  city: string;
  province: string;
  postalCode: string;
  qualifications: string;
  bio: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  gender?: string;
  latitude?: number | undefined;
  longitude?: number | undefined;
}

interface DoctorSignupProps {
  onSignupComplete: () => void;
  onBackToLogin: () => void;
}

export function DoctorSignup({ onSignupComplete, onBackToLogin }: DoctorSignupProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  const [doctorData, setDoctorData] = useState<DoctorData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    practiceNumber: "",
    specialization: "",
    yearsOfExperience: "",
    hospitalAffiliation: "",
    clinicAddress: "",
    city: "",
    province: "",
    postalCode: "",
    qualifications: "",
    bio: "",
    termsAccepted: false,
    privacyAccepted: false,
    gender: undefined,
    latitude: undefined,
    longitude: undefined,
  });

  const specializations = [
    "General Practice",
    "Internal Medicine",
    "Cardiology",
    "Dermatology",
    "Emergency Medicine",
    "Family Medicine",
    "Gastroenterology",
    "Neurology",
    "Oncology",
    "Pediatrics",
    "Psychiatry",
    "Radiology",
    "Surgery - General",
    "Surgery - Orthopedic",
    "Surgery - Cardiac",
    "Pulmonology",
    "Endocrinology",
    "Infectious Disease",
    "Other"
  ];

  const southAfricanProvinces = [
    "Eastern Cape",
    "Free State",
    "Gauteng",
    "KwaZulu-Natal",
    "Limpopo",
    "Mpumalanga",
    "Northern Cape",
    "North West",
    "Western Cape"
  ];

  const updateField = (field: keyof DoctorData, value: string | boolean | number | undefined) => {
    setDoctorData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError("");
  };

  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any | null>(null);

  // Load Google Maps script (Places) and initialize autocomplete on the clinic address input
  useEffect(() => {
    const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load script: ' + src));
      document.head.appendChild(s);
    });

    const initAutocomplete = async () => {
      try {
        const key = config.googleMapsApiKey;
        const src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`;
        await loadScript(src);

        if (addressInputRef.current && (window as any).google) {
          // @ts-ignore
          autocompleteRef.current = new (window as any).google.maps.places.Autocomplete(addressInputRef.current, { types: ['address'] });
          autocompleteRef.current.setFields(['formatted_address', 'geometry']);
          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();
            if (!place) return;
            const formatted = place.formatted_address as string | undefined;
            const loc = place.geometry?.location;
            const lat = loc ? loc.lat() : undefined;
            const lng = loc ? loc.lng() : undefined;
            if (formatted) updateField('clinicAddress', formatted);
            if (typeof lat === 'number') updateField('latitude', lat);
            if (typeof lng === 'number') updateField('longitude', lng);
          });
        }
      } catch (err) {
        // silently fail - autocomplete is a progressive enhancement
        console.warn('Google Maps Places could not be loaded', err);
      }
    };

    initAutocomplete();

    return () => {
      try {
        if (autocompleteRef.current) {
          autocompleteRef.current = null;
        }
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!doctorData.email || !doctorData.password || !doctorData.confirmPassword) {
          setError("Please fill in all required fields");
          return false;
        }
        if (doctorData.password !== doctorData.confirmPassword) {
          setError("Passwords do not match");
          return false;
        }
        if (doctorData.password.length < 6) {
          setError("Password must be at least 6 characters long");
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(doctorData.email)) {
          setError("Please enter a valid email address");
          return false;
        }
        break;
      case 2:
        if (!doctorData.firstName || !doctorData.lastName || !doctorData.phoneNumber || !doctorData.practiceNumber) {
          setError("Please fill in all required personal information fields");
          return false;
        }
        break;
      case 3:
        if (!doctorData.specialization || !doctorData.yearsOfExperience || !doctorData.qualifications) {
          setError("Please fill in all required professional information fields");
          return false;
        }
        break;
      case 4:
        if (!doctorData.city || !doctorData.province) {
          setError("Please fill in at least city and province");
          return false;
        }
        break;
      case 5:
        if (!doctorData.termsAccepted || !doctorData.privacyAccepted) {
          setError("Please accept the terms and conditions and privacy policy");
          return false;
        }
        break;
    }
    setError("");
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setError("");
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setIsLoading(true);
    setError("");

    try {
      // Build payload matching the DoctorRegistrationRequest model
      const payload = {
        FirstName: doctorData.firstName,
        LastName: doctorData.lastName,
        Password: doctorData.password,
        Email: doctorData.email,
        Specialization: doctorData.specialization,
        LicenseNumber: doctorData.practiceNumber,
        PhoneNumber: doctorData.phoneNumber || undefined,
        Address: doctorData.clinicAddress || undefined,
        City: doctorData.city || undefined,
        Province: doctorData.province || undefined,
        PostalCode: doctorData.postalCode || undefined,
        Latitude: doctorData.latitude !== undefined ? doctorData.latitude : undefined,
        Longitude: doctorData.longitude !== undefined ? doctorData.longitude : undefined,
        Gender: doctorData.gender || undefined,
        YearsOfExperience: parseInt(doctorData.yearsOfExperience) || 0,
      };

      console.log('Registering doctor via API with payload:', payload);
      const resp = await ApiService.post('/api/auth/register/doctor', payload);
      console.log('Doctor registration response:', resp);

      setSuccess('Doctor registration submitted successfully! Your account will be reviewed and activated within 24-48 hours.');
      // Call the success callback after a short delay
      setTimeout(() => onSignupComplete(), 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Account Information</h3>
        <p className="text-sm text-muted-foreground">Create your doctor account credentials</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="doctor@hospital.com"
            value={doctorData.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={doctorData.password}
            onChange={(e) => updateField('password', e.target.value)}
            className="pl-10 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm password"
            value={doctorData.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            className="pl-10 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Personal Information</h3>
        <p className="text-sm text-muted-foreground">Tell us about yourself</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="firstName"
              placeholder="John"
              value={doctorData.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="lastName"
              placeholder="Smith"
              value={doctorData.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number *</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="phoneNumber"
            placeholder="+27 11 123 4567"
            value={doctorData.phoneNumber}
            onChange={(e) => updateField('phoneNumber', e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="practiceNumber">Practice Number *</Label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="practiceNumber"
            placeholder="MP12345"
            value={doctorData.practiceNumber}
            onChange={(e) => updateField('practiceNumber', e.target.value)}
            className="pl-10"
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">Your HPCSA practice number</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <Select value={doctorData.gender} onValueChange={(value: string) => updateField('gender', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select gender (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Professional Information</h3>
        <p className="text-sm text-muted-foreground">Your medical background and expertise</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialization">Specialization *</Label>
        <Select value={doctorData.specialization} onValueChange={(value: string) => updateField('specialization', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your specialization" />
          </SelectTrigger>
          <SelectContent>
            {specializations.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
        <Select value={doctorData.yearsOfExperience} onValueChange={(value: string) => updateField('yearsOfExperience', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select years of experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-2">0-2 years</SelectItem>
            <SelectItem value="3-5">3-5 years</SelectItem>
            <SelectItem value="6-10">6-10 years</SelectItem>
            <SelectItem value="11-15">11-15 years</SelectItem>
            <SelectItem value="16-20">16-20 years</SelectItem>
            <SelectItem value="20+">20+ years</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hospitalAffiliation">Hospital/Clinic Affiliation</Label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="hospitalAffiliation"
            placeholder="e.g., Johannesburg Hospital"
            value={doctorData.hospitalAffiliation}
            onChange={(e) => updateField('hospitalAffiliation', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="qualifications">Qualifications *</Label>
        <div className="relative">
          <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Textarea
            id="qualifications"
            placeholder="e.g., MBChB (Wits), FC Paed (SA), MMed (Paed)"
            value={doctorData.qualifications}
            onChange={(e) => updateField('qualifications', e.target.value)}
            className="pl-10 min-h-[80px]"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Professional Bio (Optional)</Label>
        <Textarea
          id="bio"
          placeholder="Brief description of your experience and areas of interest..."
          value={doctorData.bio}
          onChange={(e) => updateField('bio', e.target.value)}
          className="min-h-[100px]"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Practice Location</h3>
        <p className="text-sm text-muted-foreground">Where do you practice?</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clinicAddress">Clinic/Practice Address</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="clinicAddress"
            ref={addressInputRef}
            placeholder="123 Medical Centre, Health Street"
            value={doctorData.clinicAddress}
            onChange={(e) => {
              // clear any previously set lat/lng when user edits the address
              updateField('clinicAddress', e.target.value);
              updateField('latitude', undefined);
              updateField('longitude', undefined);
            }}
            className="pl-10 w-full rounded-md border bg-transparent px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            placeholder="Johannesburg"
            value={doctorData.city}
            onChange={(e) => updateField('city', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="province">Province *</Label>
          <Select value={doctorData.province} onValueChange={(value: string) => updateField('province', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select province" />
            </SelectTrigger>
            <SelectContent>
              {southAfricanProvinces.map((province) => (
                <SelectItem key={province} value={province}>
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="postalCode">Postal Code</Label>
        <Input
          id="postalCode"
          placeholder="2000"
          value={doctorData.postalCode}
          onChange={(e) => updateField('postalCode', e.target.value)}
        />
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Terms & Conditions</h3>
        <p className="text-sm text-muted-foreground">Please review and accept the terms</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="terms"
            checked={doctorData.termsAccepted}
            onCheckedChange={(checked: boolean) => updateField('termsAccepted', checked)}
            className="mt-1"
          />
          <div className="flex-1">
            <Label htmlFor="terms" className="text-sm font-medium">
              I accept the Terms and Conditions *
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              By checking this box, you agree to our platform's terms of service, including professional conduct guidelines and patient data handling requirements.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="privacy"
            checked={doctorData.privacyAccepted}
            onCheckedChange={(checked: boolean) => updateField('privacyAccepted', checked)}
            className="mt-1"
          />
          <div className="flex-1">
            <Label htmlFor="privacy" className="text-sm font-medium">
              I accept the Privacy Policy *
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              You acknowledge that you have read and understood our privacy policy regarding how we collect, use, and protect your personal and professional information.
            </p>
          </div>
        </div>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Account Verification:</strong> Your doctor account will undergo verification within 24-48 hours. 
          We may contact you for additional documentation to verify your medical credentials.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-700 mb-2">Registration Submitted!</h2>
              <p className="text-sm text-muted-foreground">
                {success}
              </p>
            </div>
            <Button onClick={onSignupComplete} className="w-full">
              Continue to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Stethoscope className="h-8 w-8 text-primary mr-2" />
            <CardTitle className="text-2xl">Doctor Registration</CardTitle>
          </div>
          <CardDescription>
            Join our healthcare network and help patients with AI-powered symptom analysis
          </CardDescription>
          
          {/* Progress indicator */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <React.Fragment key={step}>
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${step <= currentStep 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {step}
                  </div>
                  {step < 5 && (
                    <div 
                      className={`w-8 h-0.5 
                        ${step < currentStep ? 'bg-primary' : 'bg-muted'}
                      `}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-2">
            Step {currentStep} of 5
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {renderStepContent()}

          <div className="flex justify-between pt-6">
            <div className="flex space-x-2">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={isLoading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
              
              <Button
                variant="ghost"
                onClick={onBackToLogin}
                disabled={isLoading}
              >
                Back to Login
              </Button>
            </div>

            {currentStep < 5 ? (
              <Button onClick={nextStep} disabled={isLoading}>
                Next
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}