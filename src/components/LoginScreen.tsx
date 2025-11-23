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
import { GoogleFitService } from "../services/googleFitService";
import { config } from "../config/env";
import { User } from '../types/outbreaks';

// Google OAuth2 Types
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: any) => void;
            include_granted_scopes?: boolean;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
    googleOAuthClient?: any;
  }
}

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
      
      // Initialize Google OAuth2 for access tokens (Google Fit)
      if (window.google?.accounts?.oauth2) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: config.googleClientId,
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/fitness.activity.read',
            'https://www.googleapis.com/auth/fitness.body.read',
            'https://www.googleapis.com/auth/fitness.heart_rate.read',
            'https://www.googleapis.com/auth/fitness.sleep.read',
            'https://www.googleapis.com/auth/fitness.location.read'
          ].join(' '),
          callback: handleGoogleOAuth2Response,
          include_granted_scopes: true,
          // Note: OAuth2 token client doesn't return id_token, only access_token
          // Backend should verify the access_token instead, or use the ID token flow
        });
        
        // Store the client for later use
        (window as any).googleOAuthClient = client;
      }

      // Also keep the ID token flow for fallback
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: config.googleClientId,
          callback: handleGoogleIdResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      }
      
      setGoogleButtonRendered(true);
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

  async function handleGoogleOAuth2Response(response: any) {
    try {
      setIsLoading(true);
      setError("");
      //debugger;

      console.log("Google OAuth2 response:", response);
      console.log("Google access token:", response.access_token);
      console.log("Google ID token:", response.id_token || "Not available");

      if (!response.access_token) {
        throw new Error("No Google access token received");
      }

      // Try to fetch profile and post full payload to backend first
      try {
        const userInfo = await GoogleFitService.getUserProfile(response.access_token);
        
        // OAuth2 token client doesn't provide id_token - backend should verify access_token
        // Or we could fetch an id_token separately if backend requires it
        const payload = {
          idToken: response.id_token ?? "", // Use empty string when not provided by OAuth2 flow
          accessToken: response.access_token, // Backend should verify this token
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
          email: userInfo.email,
          picture: userInfo.picture,
        };

        console.log("Sending to backend - has id_token:", !!payload.idToken, "has access_token:", !!payload.accessToken);

        // Authenticate with backend first
        const user = await AuthService.loginWithGoogle(payload as any);

        // If backend auth succeeded, then process other Google APIs (Google Fit) before finishing login
        try {
          await GoogleFitService.testGoogleFitAccess(response.access_token);
          console.log("✅ Google Fit API access successful!");
        } catch (fitError) {
          console.warn("⚠️ Google Fit API access failed:", fitError);
        }

        handleLogin(user);
        return;
      } catch (backendErr) {
        console.warn('Backend google auth failed, falling back to local flow', backendErr);
        // Continue to fallback local handling
      }

      // Fallback: handle locally if backend auth failed
      await handleGoogleAccessTokenOnly(response.access_token);

    } catch (e: any) {
      console.error("Google OAuth2 error:", e);
      setError(e?.message || "Google OAuth2 sign-in failed");
    } 
    // finally {
    //   //setIsLoading(false);
    // }
  }

  async function handleGoogleAccessTokenOnly(accessToken: string) {
    try {
      // Get user info using the access token
      const userInfo = await GoogleFitService.getUserProfile(accessToken);
      console.log("Google user info:", userInfo);

      // Build payload to send to backend
      const payload = {
        idToken: "",
        accessToken,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        email: userInfo.email,
        picture: userInfo.picture,
      } as any;

      try {
        const user = await AuthService.loginWithGoogle(payload);

        // Backend auth succeeded - process Google Fit data before completing login
        try {
          await GoogleFitService.testGoogleFitAccess(accessToken);
          console.log("✅ Google Fit API access successful!");
        } catch (fitError) {
          console.warn("⚠️ Google Fit API access failed:", fitError);
        }

        handleLogin(user);
        return;
      } catch (e) {
        console.warn('Backend google auth failed, falling back to local user', e);
      }

      // If backend auth fails, fallback to a local-only user so the app remains usable
      const user: User = {
        id: userInfo.id,
        name: userInfo.name,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        email: userInfo.email,
        avatar: userInfo.picture,
        provider: "google",
        accessToken: accessToken,
        externalProvider: "google",
        dateOfBirth: null,
        gender: undefined,
        preferences: { notifications: true, outbreakAlerts: true, location: true },
        createdAt: new Date(),
        lastLogin: new Date(),
        isDoctor: userInfo.isDoctor || false,
        isAdmin: userInfo.isAdmin || false,
      };

      console.log("Created fallback user from Google OAuth2:", user);
      handleLogin(user);

    } catch (e: any) {
      console.error("Error handling access token:", e);
      setError("Failed to authenticate with Google: " + (e.message || "Unknown error"));
    }
  }

  async function handleGoogleIdResponse(response: any) {
    try {
      setIsLoading(true);
      setError("");
      if (!response?.credential) throw new Error("No Google credential returned");

      console.log("Google ID response:", response);
      console.log("Google credential (ID token):", response.credential);
      console.log("Note: ID token flow doesn't provide access token for Google Fit");

      // Decode ID token to extract claims
      const idToken = response.credential;
      const decode = (token: string) => {
        try {
          const parts = token.split('.');
          if (parts.length < 2) return null;
          const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const json = decodeURIComponent(atob(payload).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          return JSON.parse(json);
        } catch (e) {
          return null;
        }
      };

      const claims = decode(idToken) || {} as any;
      const payload = {
        idToken,
        accessToken: undefined,
        firstName: claims.given_name,
        lastName: claims.family_name,
        email: claims.email,
        picture: claims.picture,
      };

      const user = await AuthService.loginWithGoogle(payload as any);
      handleLogin(user);
    } catch (e: any) {
      console.error("Google ID token error:", e);
      setError(e?.message || "Google sign-in failed");
    } 
    // finally {
    // //  setIsLoading(false);
    // }
  }

  function handleGoogleLogin() {
    setError("");
    if (!config.googleClientId) {
      setError("Google sign-in not configured");
      return;
    }
    
    // Try OAuth2 flow first (for Google Fit access)
    const oauthClient = (window as any).googleOAuthClient;
    if (oauthClient) {
      console.log("Initiating Google OAuth2 flow for Google Fit access...");
      oauthClient.requestAccessToken({ prompt: 'consent' });
    } else if (window.google?.accounts?.id) {
      console.log("Falling back to ID token flow...");
      window.google.accounts.id.prompt();
    } else {
      setError("Google Identity Services not available");
    }
  }

  function handleTraditionalGoogleLogin() {
    setError("");
    if (!config.googleClientId) {
      setError("Google sign-in not configured");
      return;
    }
    
    // Use traditional ID token flow (no Google Fit access)
    if (window.google?.accounts?.id) {
      console.log("Using traditional Google Sign-In (ID token only)...");
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
    } 
    // finally {
    //  // setIsLoading(false);
    // }
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
      isDoctor: false,
      isAdmin: false,

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
                  <Button onClick={handleGoogleLogin} variant="outline" className="w-full h-12 text-base" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    Continue with Google (+ Google Fit)
                  </Button>
                  
                  <Button onClick={handleTraditionalGoogleLogin} variant="outline" className="w-full h-10 text-sm" disabled={isLoading}>
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google (ID token - no Fit access)
                  </Button>
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

            <div className="text-center space-y-2">
              <Button variant="link" onClick={() => { setIsSignUp(!isSignUp); setError(""); }} className="text-sm" disabled={isLoading}>
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </Button>
              <div className="border-t pt-2">
                <p className="text-xs text-muted-foreground mb-2">Healthcare Provider?</p>
                <Button 
                  variant="link" 
                  onClick={() => window.location.href = '/doctor-signup'} 
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={isLoading}
                >
                  <Stethoscope className="w-4 h-4 mr-1" />
                  Register as a Doctor
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
}