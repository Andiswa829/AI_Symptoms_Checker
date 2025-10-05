import React, { useState } from "react";
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
  Shield,
  Globe,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import type { User } from "../App";

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onShowLogin: () => void;
}

export function LoginScreen({
  onLogin,
  onShowLogin,
}: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    // Simulate Google OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock successful Google login
    const googleUser: User = {
      id: "google-123456",
      name: "John Doe",
      email: "john.doe@gmail.com",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      provider: "google",
      preferences: {
        notifications: true,
        outbreakAlerts: true,
        location: true,
      },
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    setIsLoading(false);
    onLogin(googleUser);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic validation
    if (!email || !password || (isSignUp && !name)) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock successful email login/signup
    const emailUser: User = {
      id: `email-${Date.now()}`,
      name: isSignUp ? name : "Demo User",
      email: email,
      provider: "email",
      preferences: {
        notifications: true,
        outbreakAlerts: true,
        location: true,
      },
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    setIsLoading(false);
    onLogin(emailUser);
  };

  const handleDemoLogin = () => {
    const demoUser: User = {
      id: "demo-user",
      name: "Demo User",
      email: "demo@healthchecker.com",
      provider: "email",
      preferences: {
        notifications: true,
        outbreakAlerts: true,
        location: true,
      },
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    onLogin(demoUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center mb-8">
          <Stethoscope className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-2xl text-primary">
            AI Symptoms Checker
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-md">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription>
              {isSignUp
                ? "Join thousands of users monitoring their health with AI-powered insights"
                : "Sign in to access your health assessments and outbreak alerts"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Google Login */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full h-12 text-base"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2" />
              ) : (
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Form */}
            <form
              onSubmit={handleEmailAuth}
              className="space-y-4"
            >
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    disabled={isLoading}
                    className="pl-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                ) : null}
                {isSignUp ? "Create Account" : "Sign In"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            {/* Demo Login */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              {/* <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Try Demo
                </span>
              </div> */}
            </div>

            <Button
              onClick={handleDemoLogin}
              variant="secondary"
              className="w-full h-12 text-base"
            >
              Continue without Logging in
            </Button>

            {/* Toggle Sign Up/Sign In */}
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 space-y-4">
          <h3 className="text-center text-lg">
            Why Choose AI Symptoms Checker?
          </h3>
          <div className="grid gap-4">
            <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm">AI-Powered Analysis</h4>
                <p className="text-xs text-muted-foreground">
                  Get instant insights about your symptoms
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Globe className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm">Outbreak Monitoring</h4>
                <p className="text-xs text-muted-foreground">
                  Stay informed about health alerts in your area
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Stethoscope className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="text-sm">Doctor Booking</h4>
                <p className="text-xs text-muted-foreground">
                  Find and book appointments with nearby doctors
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <div className="flex items-start space-x-2">
            <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="mb-1">Your privacy is protected</p>
              <p>
                We use industry-standard encryption and never
                share your personal health information without
                your consent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}