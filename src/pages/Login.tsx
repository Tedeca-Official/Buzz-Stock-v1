
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthSettings } from "@/contexts/AuthSettingsContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";

const Login = () => {
  const { settings } = useAuthSettings();
  const [email, setEmail] = useState(settings.defaultEmail || "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(settings.autoLogin);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auto login if enabled
  useEffect(() => {
    const performAutoLogin = async () => {
      if (settings.autoLogin) {
        setIsLoading(true);
        try {
          // Use default credentials
          const success = await login(settings.defaultEmail, settings.defaultRole === "admin" ? "admin123" : "worker123");
          if (success) {
            navigate("/dashboard");
            toast({
              title: "Auto Login Successful",
              description: `Logged in as ${settings.defaultEmail}`,
            });
          }
        } catch (error) {
          console.error("Auto login failed:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    performAutoLogin();
  }, [settings.autoLogin, settings.defaultEmail, settings.defaultRole, login, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!email || !password) {
      setErrorMessage("Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate("/dashboard");
        toast({
          title: "Login successful",
          description: "Welcome to Stock Savvy",
        });
      } else {
        setErrorMessage("Invalid email or password");
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      // Handle specific Firebase auth errors
      let errorMsg = "An unexpected error occurred";
      if (error.code === 'auth/user-not-found') {
        errorMsg = "User not found. Please check your email";
      } else if (error.code === 'auth/wrong-password') {
        errorMsg = "Incorrect password";
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = "Invalid email format";
      } else if (error.code === 'auth/too-many-requests') {
        errorMsg = "Too many login attempts. Please try again later";
      }
      
      setErrorMessage(errorMsg);
      toast({
        title: "Login error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-savvy-primary dark:text-savvy-accent">Stock Savvy</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Smart inventory management
          </p>
        </div>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Log in to your account</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Enter your credentials below to access the system
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 p-3 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@stocksavvy.com"
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={remember}
                  onCheckedChange={(checked) => setRemember(checked === true)}
                />
                <Label 
                  htmlFor="remember" 
                  className="text-sm text-gray-600 dark:text-gray-300"
                >
                  Remember me
                </Label>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Firebase Authentication enabled</p>
                <p>Sign in with your Firebase account</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-savvy-primary hover:bg-savvy-primary/90 dark:bg-savvy-accent dark:hover:bg-savvy-accent/90"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log in"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
