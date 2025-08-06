import React, { useState, useCallback } from 'react';
import MapContainer from '@/components/map/MapContainer';
import LayerPanel from '@/components/panels/LayerPanel';
import GISToolbar from '@/components/toolbar/GISToolbar';
import mapboxgl from 'mapbox-gl';

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

const MapView: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [map, setMap] = useState<mapboxgl.Map | null>(null);

  const handleMapReady = useCallback((mapInstance: mapboxgl.Map) => {
    setMap(mapInstance);
  }, []);

  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool);
    // Here you would implement tool-specific map interactions
    // For example, enable drawing mode, change cursor, etc.
  };

  const handleZoomIn = () => {
    if (map) {
      map.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.zoomOut();
    }
  };

  const handleZoomToFit = () => {
    if (map) {
      map.flyTo({
        center: [147.00, -6.72],
        zoom: 13,
        essential: true
      });
    }
  };

  const handleExport = () => {
    if (map) {
      const canvas = map.getCanvas();
      const link = document.createElement('a');
      link.download = 'map-export.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Toolbar */}
      <div className="p-4 border-b border-border">
        <GISToolbar
          activeTool={activeTool}
          onToolChange={handleToolChange}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomToFit={handleZoomToFit}
          onExport={handleExport}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Layer Panel */}
        <div className="p-4 border-r border-border">
          <LayerPanel />
        </div>

        {/* Map */}
        <MapContainer onMapReady={handleMapReady} />
      </div>
    </div>
  );
};

export default MapView;
