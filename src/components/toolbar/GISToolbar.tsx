import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  MousePointer,
  Hand,
  Pencil,
  Square,
  Circle,
  MapPin,
  Ruler,
  Navigation,
  Scissors,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Home,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

type Tool = 
  | 'select'
  | 'pan' 
  | 'draw-point'
  | 'draw-line'
  | 'draw-polygon'
  | 'draw-rectangle'
  | 'draw-circle'
  | 'measure-distance'
  | 'measure-area'
  | 'navigate'
  | 'split'
  | 'rotate';

interface GISToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomToFit?: () => void;
  onExport?: () => void;
}

const GISToolbar: React.FC<GISToolbarProps> = ({
  activeTool,
  onToolChange,
  onZoomIn,
  onZoomOut,
  onZoomToFit,
  onExport
}) => {
  const [measurementMode, setMeasurementMode] = useState<'distance' | 'area'>('distance');

  const toolGroups = [
    {
      name: 'Navigation',
      tools: [
        { id: 'select' as Tool, icon: MousePointer, label: 'Select', shortcut: 'V' },
        { id: 'pan' as Tool, icon: Hand, label: 'Pan', shortcut: 'H' },
      ]
    },
    {
      name: 'Drawing',
      tools: [
        { id: 'draw-point' as Tool, icon: MapPin, label: 'Point', shortcut: 'P' },
        { id: 'draw-line' as Tool, icon: Pencil, label: 'Line', shortcut: 'L' },
        { id: 'draw-polygon' as Tool, icon: Square, label: 'Polygon', shortcut: 'G' },
        { id: 'draw-rectangle' as Tool, icon: Square, label: 'Rectangle', shortcut: 'R' },
        { id: 'draw-circle' as Tool, icon: Circle, label: 'Circle', shortcut: 'C' },
      ]
    },
    {
      name: 'Measurement',
      tools: [
        { id: 'measure-distance' as Tool, icon: Ruler, label: 'Distance', shortcut: 'M' },
        { id: 'measure-area' as Tool, icon: Ruler, label: 'Area', shortcut: 'A' },
      ]
    },
    {
      name: 'Advanced',
      tools: [
        { id: 'navigate' as Tool, icon: Navigation, label: 'Navigate', shortcut: 'N' },
        { id: 'split' as Tool, icon: Scissors, label: 'Split', shortcut: 'S' },
        { id: 'rotate' as Tool, icon: RotateCw, label: 'Rotate', shortcut: 'O' },
      ]
    }
  ];

  const handleToolClick = (tool: Tool) => {
    onToolChange(tool);
    toast.success(`${tool.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())} tool activated`);
  };

  const getToolVariant = (tool: Tool) => {
    return activeTool === tool ? 'default' : 'outline';
  };

  const getToolClassName = (tool: Tool) => {
    return activeTool === tool 
      ? 'bg-gis-accent text-white border-gis-accent hover:bg-gis-accent-hover'
      : 'hover:bg-gis-panel-header border-border';
  };

  return (
    <Card className="bg-gis-toolbar border-border shadow-elevated p-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Tool Groups */}
        {toolGroups.map((group, groupIndex) => (
          <div key={group.name} className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {group.tools.map((tool) => (
                <Button
                  key={tool.id}
                  size="sm"
                  variant={getToolVariant(tool.id)}
                  className={`h-9 w-9 p-0 ${getToolClassName(tool.id)}`}
                  onClick={() => handleToolClick(tool.id)}
                  title={`${tool.label} (${tool.shortcut})`}
                >
                  <tool.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
            {groupIndex < toolGroups.length - 1 && (
              <Separator orientation="vertical" className="h-8 bg-border" />
            )}
          </div>
        ))}

        <Separator orientation="vertical" className="h-8 bg-border" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-9 w-9 p-0 hover:bg-gis-panel-header border-border"
            onClick={onZoomIn}
            title="Zoom In (+)"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 w-9 p-0 hover:bg-gis-panel-header border-border"
            onClick={onZoomOut}
            title="Zoom Out (-)"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 w-9 p-0 hover:bg-gis-panel-header border-border"
            onClick={onZoomToFit}
            title="Zoom to Fit (F)"
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8 bg-border" />

        {/* Export */}
        <Button
          size="sm"
          variant="outline"
          className="h-9 w-9 p-0 hover:bg-gis-panel-header border-border"
          onClick={onExport}
          title="Export Map"
        >
          <Download className="h-4 w-4" />
        </Button>

        {/* Active Tool Badge */}
        {activeTool && (
          <div className="ml-auto">
            <Badge variant="secondary" className="bg-gis-accent/20 text-gis-accent border-gis-accent/30">
              {activeTool.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GISToolbar;
