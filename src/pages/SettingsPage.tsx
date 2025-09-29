import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const API_KEY_STORAGE_KEY = "gemini_api_key";

const SettingsPage: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const { toast } = useToast();

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

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" /> Application Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
