import React from 'react';
import mapboxgl from 'mapbox-gl';
import { Button } from '@/components/ui/button';
import { RotateCcw, RotateCw, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MapOrientationControlProps {
  map: mapboxgl.Map | null;
}

const MapOrientationControl: React.FC<MapOrientationControlProps> = ({ map }) => {
  const rotateLeft = () => {
    if (!map) return;
    map.easeTo({ bearing: map.getBearing() - 10, duration: 200 });
  };

  const rotateRight = () => {
    if (!map) return;
    map.easeTo({ bearing: map.getBearing() + 10, duration: 200 });
  };

  const pitchUp = () => {
    if (!map) return;
    map.easeTo({ pitch: map.getPitch() + 10, duration: 200 });
  };

  const pitchDown = () => {
    if (!map) return;
    map.easeTo({ pitch: map.getPitch() - 10, duration: 200 });
  };

  return (
    <div className="flex flex-col">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={rotateLeft} className="w-7 h-7 rounded-none grid place-items-center">
              <RotateCcw className="h-4 w-4" style={{ color: 'hsl(var(--gis-accent))' }} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Rotate Left</p>
          </TooltipContent>
        </Tooltip>
        <hr className="border-t border-gray-300" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={rotateRight} className="w-7 h-7 rounded-none grid place-items-center">
              <RotateCw className="h-4 w-4" style={{ color: 'hsl(var(--gis-accent))' }} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Rotate Right</p>
          </TooltipContent>
        </Tooltip>
        <hr className="border-t border-gray-300" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={pitchUp} className="w-7 h-7 rounded-none grid place-items-center">
              <ArrowUp className="h-4 w-4" style={{ color: 'hsl(var(--gis-accent))' }} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Pitch Up</p>
          </TooltipContent>
        </Tooltip>
        <hr className="border-t border-gray-300" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={pitchDown} className="w-7 h-7 rounded-none grid place-items-center">
              <ArrowDown className="h-4 w-4" style={{ color: 'hsl(var(--gis-accent))' }} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Pitch Down</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default MapOrientationControl;
