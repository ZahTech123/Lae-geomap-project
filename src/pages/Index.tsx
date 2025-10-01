import React, { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import mapboxgl from 'mapbox-gl';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, Map, BarChart3, Database, Brain } from 'lucide-react';
import UserDropdown from '@/components/layout/UserDropdown';

const mainNavItems = [
  { title: "Map View", url: "/", icon: Map },
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Data Sources", url: "/data", icon: Database },
  { title: "Data Analysis", url: "/data-analysis", icon: Brain },
];

const Index = () => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-gis-accent/20 text-gis-accent border-b-2 border-gis-accent font-medium" 
      : "hover:bg-gis-panel-header/50 hover:text-gis-accent";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 flex items-center justify-between border-b border-border bg-gis-panel px-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://i.ibb.co/QvgzsHJ3/morobe-flag.jpg" 
                    alt="Morobe Provincial Flag" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-foreground ">LAE URBAN</h1>
                  <p className="text-xs text-muted-foreground">Municipal Management</p>
                </div>
              </div>
              <nav className="hidden md:flex items-center space-x-4 ml-6">
                {mainNavItems.map((item) => (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    end
                    className={({ isActive }) => `flex items-center px-3 py-2 rounded-md text-sm font-medium ${getNavCls({ isActive })}`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.title}
                  </NavLink>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center gap-2">
              <Link to="/settings">
                <Button size="sm" variant="outline" className="h-8">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <UserDropdown />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            <Outlet context={{ map, setMap }} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
