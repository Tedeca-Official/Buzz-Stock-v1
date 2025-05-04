
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { UserRole } from "./AuthContext";

interface AuthSettings {
  autoLogin: boolean;
  defaultEmail: string;
  defaultRole: UserRole;
}

interface AuthSettingsContextType {
  settings: AuthSettings;
  updateSettings: (newSettings: Partial<AuthSettings>) => void;
}

const defaultSettings: AuthSettings = {
  autoLogin: false,
  defaultEmail: "admin@stocksavvy.com",
  defaultRole: "admin"
};

const AUTH_SETTINGS_KEY = "stocksavvy_auth_settings";

const AuthSettingsContext = createContext<AuthSettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
});

export const AuthSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<AuthSettings>(() => {
    try {
      const savedSettings = localStorage.getItem(AUTH_SETTINGS_KEY);
      return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    } catch (error) {
      console.error("Error loading auth settings:", error);
      return defaultSettings;
    }
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(AUTH_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AuthSettings>) => {
    setSettings(prevSettings => {
      const updatedSettings = { ...prevSettings, ...newSettings };
      toast({
        title: "Settings Updated",
        description: "Your authentication settings have been saved."
      });
      return updatedSettings;
    });
  };

  return (
    <AuthSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AuthSettingsContext.Provider>
  );
};

export const useAuthSettings = () => useContext(AuthSettingsContext);
