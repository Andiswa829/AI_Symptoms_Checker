import React, { useEffect, useState } from "react";
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
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Stethoscope,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Globe,
  Shield,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { AuthService } from "../services/authService";
import { config } from "../config/env";
import { User } from '../types/outbreaks';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // auth fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // profile fields for registration
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [gender, setGender] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // track whether the Google branded button was rendered into the DOM
  const [googleButtonRendered, setGoogleButtonRendered] = useState(false);

  useEffect(() => {
    const init = () => {
      if (!config.googleClientId) return;
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: config.googleClientId,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const el = document.getElementById("google-signin-button");
        if (el) {
          window.google.accounts.id.renderButton(el, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "continue_with",
          });
          setGoogleButtonRendered(true);
        }
      }
    };

    if (!window.google) {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.onload = init;
      document.head.appendChild(s);
    } else {
      init();
    }
  }, []);

  async function handleGoogleResponse(response: any) {
    try {
      setIsLoading(true);
      setError("");
      if (!response?.credential) throw new Error("No Google credential returned");
      const user = await AuthService.loginWithGoogle(response.credential);
      handleLogin(user); // Changed from onLogin(user)
    } catch (e: any) {
      setError(e?.message || "Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoogleLogin() {
    setError("");
    if (!config.googleClientId) {
      setError("Google sign-in not configured");
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setError("Google Identity Services not available");
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isSignUp) {
        // registration validation
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
          setError("Please fill all required fields for registration.");
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        const payload = {
          email,
          password,
          confirmPassword,
          firstName,
          lastName,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
          gender,
        };

        const user = await AuthService.registerWithEmail(payload);
        handleLogin(user); // Changed from onLogin(user)
      } else {
        // login validation
        if (!email || !password) {
          setError("Please provide email and password.");
          return;
        }

        const user = await AuthService.loginWithEmail({ email, password });
        handleLogin(user); // Changed from onLogin(user)
      }
    } catch (e: any) {
      setError(e?.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  }

  function handleDemo() {
    const demo: User = {
      id: "demo-user",
      name: "Demo User",
      firstName: "Demo",
      lastName: "User",
      email: "demo@example.com",
      provider: "demo",
      accessToken: undefined,
      dateOfBirth: null,
      gender: undefined,
      preferences: { notifications: true, outbreakAlerts: true, location: true },
      createdAt: new Date(),
      lastLogin: new Date(),

    };
    handleLogin(demo); // Changed from onLogin(demo)
  }

  const handleLogin = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    onLogin(userData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">AI Symptoms Checker</h1>
          <p className="text-muted-foreground">Get personalized health insights powered by AI</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">{isSignUp ? "Create your account" : "Welcome back"}</CardTitle>
            <CardDescription className="text-center">
              {isSignUp ? "Sign up to access personalized health insights" : "Sign in to your account to continue"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {config.googleClientId && (
              <>
                <div className="space-y-2">
                  {/* <Button onClick={handleGoogleLogin} variant="outline" className="w-full h-12 text-base" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    Continue with Google
                  </Button> */}

                  <div id="google-signin-button" className="w-full"></div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={isLoading} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={isLoading} className="h-11" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of birth</Label>
                    <Input id="dateOfBirth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} disabled={isLoading} className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="w-full h-11 px-3 border rounded" disabled={isLoading}>
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input id="email" placeholder="Enter your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className="pl-9 h-11" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input id="password" placeholder="Enter your password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className="pl-9 pr-10 h-11" required minLength={6} />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1 h-9 w-9 px-0" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" placeholder="Confirm password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} className="h-11" required minLength={6} />
                </div>
              )}

              <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {isSignUp ? "Create Account" : "Sign In"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
            </div>

            <Button onClick={handleDemo} variant="secondary" className="w-full h-12 text-base" disabled={isLoading}>Continue without Logging in</Button>

            <div className="text-center">
              <Button variant="link" onClick={() => { setIsSignUp(!isSignUp); setError(""); }} className="text-sm" disabled={isLoading}>
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 space-y-4">
          <h3 className="text-center text-lg font-semibold">Why Choose AI Symptoms Checker?</h3>
          <div className="grid gap-4">
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/50">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div><h4 className="font-medium">AI-Powered Analysis</h4><p className="text-sm text-muted-foreground">Advanced machine learning for accurate symptom assessment</p></div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/50">
              <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
              <div><h4 className="font-medium">Real-time Health Data</h4><p className="text-sm text-muted-foreground">Live disease outbreaks and health trends in your area</p></div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/50">
              <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
              <div><h4 className="font-medium">Privacy Protected</h4><p className="text-sm text-muted-foreground">Your health data is encrypted and secure</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// types for Google Identity Services
declare global {
  interface Window {
    google: any;
  }
}