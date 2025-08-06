import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Map,
  Layers,
  Ruler,
  BarChart3,
  Settings,
  Globe,
  Navigation,
  Pencil,
  Database,
} from "lucide-react";
import morobeFlag from "@/assets/morobe-flag.png";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Map View", url: "/", icon: Map },
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Data Sources", url: "/data", icon: Database },
];

const toolItems = [
  { title: "Drawing Tools", url: "/tools/draw", icon: Pencil },
  { title: "Measurement", url: "/tools/measure", icon: Ruler },
  { title: "Navigation", url: "/tools/navigation", icon: Navigation },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const isExpanded = [...mainItems, ...toolItems].some((i) => isActive(i.url));
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-gis-accent/20 text-gis-accent border-r-2 border-gis-accent font-medium" 
      : "hover:bg-gis-panel-header/50 hover:text-gis-accent";

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} bg-gis-panel border-r border-border shadow-panel transition-all duration-300`}
      collapsible="icon"
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              src={morobeFlag} 
              alt="Morobe Provincial Flag" 
              className="w-full h-full object-cover"
            />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg text-foreground">LUMMS</h1>
              <p className="text-xs text-muted-foreground">Municipal Management</p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gis-accent font-semibold">
            {!collapsed && "Main"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gis-accent font-semibold">
            {!collapsed && "Tools"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}