import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Settings as SettingsIcon, Sun, Moon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/contexts/ThemeContext";

const API_KEY_STORAGE_KEY = "gemini_api_key";

const SettingsPage: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    toast({
      title: "API Key Saved",
      description: "Your Google Gemini API key has been saved successfully.",
    });
  };

  const handleThemeChange = (value: string) => {
    const newTheme = value as 'light' | 'dark';
    setTheme(newTheme);
    toast({
      title: "Theme Updated",
      description: `Switched to ${newTheme} mode successfully.`,
    });
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" /> Application Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Settings */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Appearance</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Customize the appearance of the application
              </p>
            </div>
            <div className="space-y-3">
              <Label htmlFor="theme-selector">Theme</Label>
              <RadioGroup
                id="theme-selector"
                value={theme}
                onValueChange={handleThemeChange}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="light" id="light" />
                  <Label 
                    htmlFor="light" 
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <Sun className="h-5 w-5 text-amber-500" />
                    <div className="flex-1">
                      <div className="font-medium">Light Mode</div>
                      <div className="text-sm text-muted-foreground">
                        Bright and clean interface
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label 
                    htmlFor="dark" 
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <Moon className="h-5 w-5 text-blue-400" />
                    <div className="flex-1">
                      <div className="font-medium">Dark Mode</div>
                      <div className="text-sm text-muted-foreground">
                        Easy on the eyes in low light
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                Current theme: <span className="font-semibold capitalize">{theme}</span>
              </p>
            </div>
          </div>

          {/* API Key Settings */}
          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label className="text-base font-semibold">API Configuration</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your API keys and integrations
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gemini-api-key">Google Gemini API Key</Label>
              <Input
                id="gemini-api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Google Gemini API Key"
              />
              <p className="text-sm text-muted-foreground">
                This key is used for AI data analysis. It will be stored locally in your browser.
              </p>
            </div>
            <Button onClick={handleSaveApiKey}>Save API Key</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
