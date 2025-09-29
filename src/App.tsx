import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./integrations/supabase/client";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import MapView from "./pages/MapView";
import DataDashboard from "@/components/dashboard/DataDashboard";
import PropertyMapTestPage from './pages/PropertyMapTestPage';
import DataSourcesPage from './pages/DataSourcesPage';
import DataAnalysisPage from './pages/DataAnalysisPage';
import SettingsPage from './pages/SettingsPage'; // Import the new SettingsPage
import { Session } from '@supabase/supabase-js';

const queryClient = new QueryClient();

const ProtectedRoute = ({ session, children }: { session: Session | null, children: React.ReactNode }) => {
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute session={session}>
                  <Index />
                </ProtectedRoute>
              }
            >
              <Route index element={<MapView />} />
              <Route path="dashboard" element={<DataDashboard />} />
              <Route path="data" element={<DataSourcesPage />} />
              <Route path="data-analysis" element={<DataAnalysisPage />} /> {/* New Data Analysis Route */}
              <Route path="tools/draw" element={<div className="p-6"><h1 className="text-2xl font-bold">Drawing Tools</h1><p className="text-muted-foreground">Advanced drawing and editing tools.</p></div>} />
              <Route path="tools/measure" element={<div className="p-6"><h1 className="text-2xl font-bold">Measurement Tools</h1><p className="text-muted-foreground">Measure distances, areas, and coordinates.</p></div>} />
              <Route path="tools/navigation" element={<div className="p-6"><h1 className="text-2xl font-bold">Navigation Tools</h1><p className="text-muted-foreground">GPS navigation and routing tools.</p></div>} />
              <Route path="test-map" element={<PropertyMapTestPage />} />
              <Route path="settings" element={<SettingsPage />} /> {/* New Settings Route */}
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
