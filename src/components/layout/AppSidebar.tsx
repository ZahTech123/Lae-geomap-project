import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} bg-gis-panel border-r border-border shadow-panel transition-all duration-300`}
      collapsible="icon"
    >
      <SidebarContent>
</SidebarContent>
    </Sidebar>
  );
}
