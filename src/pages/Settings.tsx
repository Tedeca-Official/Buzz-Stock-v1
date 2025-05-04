
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuthSettings } from "@/contexts/AuthSettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun, Settings as SettingsIcon, LogIn } from "lucide-react";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSettings } = useAuthSettings();
  const { userDatabase } = useAuth();
  const { toast } = useToast();
  
  const handleSaveLoginSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("defaultEmail") as string;
    const role = formData.get("defaultRole") as "admin" | "worker";
    const autoLogin = formData.get("autoLogin") === "on";
    
    // Validate email exists in user database
    const userExists = userDatabase.some(user => user.email === email);
    
    if (!userExists) {
      toast({
        title: "Invalid Email",
        description: "The email you entered doesn't exist in the system.",
        variant: "destructive",
      });
      return;
    }
    
    updateSettings({
      defaultEmail: email,
      defaultRole: role,
      autoLogin
    });
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Appearance Settings */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              {theme === "dark" ? 
                <Moon className="h-5 w-5 text-savvy-primary dark:text-savvy-accent" /> : 
                <Sun className="h-5 w-5 text-savvy-primary dark:text-savvy-accent" />
              }
              <CardTitle className="dark:text-white">Appearance</CardTitle>
            </div>
            <CardDescription className="dark:text-gray-400">
              Customize the application appearance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme-toggle" className="dark:text-white">Dark Mode</Label>
                <Switch 
                  id="theme-toggle" 
                  checked={theme === "dark"} 
                  onCheckedChange={toggleTheme}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Login Settings */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-savvy-primary dark:text-savvy-accent" />
              <CardTitle className="dark:text-white">Login Settings</CardTitle>
            </div>
            <CardDescription className="dark:text-gray-400">
              Configure your login preferences
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSaveLoginSettings}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultEmail" className="dark:text-white">Default Email</Label>
                <Input
                  id="defaultEmail"
                  name="defaultEmail"
                  defaultValue={settings.defaultEmail}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultRole" className="dark:text-white">Default Role</Label>
                <Select name="defaultRole" defaultValue={settings.defaultRole}>
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="autoLogin" className="dark:text-white">Auto Login</Label>
                <Switch 
                  id="autoLogin"
                  name="autoLogin"
                  defaultChecked={settings.autoLogin}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Auto login will use the default email and password on application start.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit"
                className="w-full bg-savvy-primary hover:bg-savvy-primary/90 dark:bg-savvy-accent dark:hover:bg-savvy-accent/90"
              >
                Save Login Settings
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* General Settings */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-savvy-primary dark:text-savvy-accent" />
              <CardTitle className="dark:text-white">General Settings</CardTitle>
            </div>
            <CardDescription className="dark:text-gray-400">
              Configure general application settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">
              Additional settings will be available in future updates.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
