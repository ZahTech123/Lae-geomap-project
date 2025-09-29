import { useState } from "react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const layers = [
  { id: "roads", name: "Roads" },
  { id: "cadastre", name: "Cadastre" },
];

export default function GISSidebar({ onLayerToggle }: { onLayerToggle?: (layerId: string, visible: boolean) => void }) {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});
  const [layerStates, setLayerStates] = useState<{ [key: string]: boolean }>({
    roads: true,
    cadastre: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLayerToggle = (layerId: string) => {
    setLayerStates((prev) => {
      const newState = { ...prev, [layerId]: !prev[layerId] };
      if (onLayerToggle) onLayerToggle(layerId, newState[layerId]);
      return newState;
    });
  };

  const sections = [
    {
      title: "PROPERTY MAPPING PORTAL",
      links: [
        {
          title: "MassGIS Property Mapping",
          content: null,
        },
        {
          title: "GIS Valuation Blocks",
          content: null,
        },
      ],
    },
    {
      title: "MASS VALUATION",
      links: [
        {
          title: "Mass Valuation Roll System",
          content: null,
        },
        {
          title: "Automated GIS-Based Revenue ManagementSystem",
          content: null,
        },
        {
          title: "Payment Statues",
          content: null,
        },
      ],
    },
  ];

  return (
    <SidebarMenu>
      {sections.map((section, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuButton
            asChild
            onClick={() => toggleSection(section.title)}
            className="flex justify-between items-center cursor-pointer"
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-gis-accent font-semibold">{section.title}</span>
              <span className="text-sm text-gray-500">
                {openSections[section.title] ? "▲" : "▼"}
              </span>
            </div>
          </SidebarMenuButton>

          {openSections[section.title] && (
            <div className="ml-4 mt-2 space-y-2">
              {section.links.map((link, linkIndex) => (
                <div key={linkIndex}>
                  <h4 className="text-gis-accent font-semibold">{link.title}</h4>
                  {link.content && (
                    <div className="p-2 bg-white rounded border text-sm shadow-sm">
                      {link.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
