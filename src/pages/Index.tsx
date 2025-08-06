import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Routes, Route } from 'react-router-dom';
import MapView from './MapView';
import DataDashboard from '@/components/dashboard/DataDashboard';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 flex items-center justify-between border-b border-border bg-gis-panel px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="h-6 w-px bg-border" />
              <h2 className="font-semibold text-foreground">Lae Urban Municipal Management System</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<MapView />} />
              <Route path="/dashboard" element={<DataDashboard />} />
              <Route path="/data" element={<div className="p-6"><h1 className="text-2xl font-bold">Data Sources</h1><p className="text-muted-foreground">Manage your data connections and sources.</p></div>} />
              <Route path="/tools/draw" element={<div className="p-6"><h1 className="text-2xl font-bold">Drawing Tools</h1><p className="text-muted-foreground">Advanced drawing and editing tools.</p></div>} />
              <Route path="/tools/measure" element={<div className="p-6"><h1 className="text-2xl font-bold">Measurement Tools</h1><p className="text-muted-foreground">Measure distances, areas, and coordinates.</p></div>} />
              <Route path="/tools/navigation" element={<div className="p-6"><h1 className="text-2xl font-bold">Navigation Tools</h1><p className="text-muted-foreground">GPS navigation and routing tools.</p></div>} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
