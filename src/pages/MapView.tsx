import React, { useState, useCallback, useEffect } from 'react';
import MapContainer from '@/components/map/MapContainer';
import GISToolbar from '@/components/toolbar/GISToolbar';
import PropertyDetailsPanel from '@/components/panels/PropertyDetailsPanel';
import FilterPanel from '@/components/panels/FilterPanel'; // Import FilterPanel
import mapboxgl from 'mapbox-gl';
import { useOutletContext } from 'react-router-dom';
import { fetchPropertiesGeoJSON } from '@/integrations/supabase/services'; // Import fetchPropertiesGeoJSON
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

interface MapViewProps {}

type IndexContext = {
  map: mapboxgl.Map | null;
  setMap: (map: mapboxgl.Map | null) => void;
};

const MapView: React.FC<MapViewProps> = () => {
  const { map, setMap } = useOutletContext<IndexContext>();
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState<Record<string, any> | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false); // State for filter panel visibility
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({}); // State for active filters
  const [uniqueZoneIds, setUniqueZoneIds] = useState<string[]>([]); // State for unique Zone IDs
  const [uniqueLandUseValues, setUniqueLandUseValues] = useState<string[]>([]); // State for unique Land Use values
  const [allPropertiesGeoJSON, setAllPropertiesGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null); // All properties
  const [propertiesGeoJSON, setPropertiesGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null); // Filtered properties

  const handleMapReady = useCallback((mapInstance: mapboxgl.Map) => {
    setMap(mapInstance);
  }, [setMap]);

  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool);
    // Here you would implement tool-specific map interactions
    // For example, enable drawing mode, change cursor, etc.
  };

  const handleFeatureClick = (feature: mapboxgl.MapboxGeoJSONFeature) => {
    if (feature.properties && feature.properties.prop_details) {
      try {
        const prop_details = JSON.parse(feature.properties.prop_details);
        const owner_details = feature.properties.owner_details
          ? JSON.parse(feature.properties.owner_details)
          : null;

        const combinedDetails = {
          prop_details,
          owner_details,
        };

        setSelectedPropertyId(prop_details.property_id);
        setSelectedPropertyDetails(combinedDetails);
      } catch (error) {
        console.error('Failed to parse feature properties:', error);
      }
    }
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

  useEffect(() => {
    const loadInitialData = async () => {
      const geojsonData = await fetchPropertiesGeoJSON();
      if (geojsonData) {
        setAllPropertiesGeoJSON(geojsonData);
        setPropertiesGeoJSON(geojsonData); // Initially, show all properties

        const zones = new Set<string>();
        const landUses = new Set<string>();
        geojsonData.features.forEach(feature => {
          if (typeof feature.properties?.prop_details === 'string') {
            try {
              const prop_details = JSON.parse(feature.properties.prop_details);
              if (prop_details.zone_id) {
                zones.add(prop_details.zone_id);
              }
              if (prop_details.land_use) {
                landUses.add(prop_details.land_use);
              }
            } catch (e) {
              console.error('Error parsing prop_details:', e);
            }
          }
        });
        setUniqueZoneIds(Array.from(zones).sort());
        setUniqueLandUseValues(Array.from(landUses).sort());
      }
    };

    loadInitialData();
  }, []);

  const handleToggleFilter = () => {
    setShowFilterPanel(prev => !prev);
  };

  const handleApplyFilters = (filters: Record<string, any>) => {
    setActiveFilters(filters);

    if (!allPropertiesGeoJSON) return;

    const filteredFeatures = allPropertiesGeoJSON.features.filter(feature => {
      if (typeof feature.properties?.prop_details === 'string') {
        try {
          const prop_details = JSON.parse(feature.properties.prop_details);
          const { landUse, zoneId, ownerName, taxStatus } = filters;

          if (landUse && prop_details.land_use !== landUse) {
            return false;
          }
          if (zoneId && prop_details.zone_id !== zoneId) {
            return false;
          }
          // Add more filtering logic for ownerName and taxStatus if needed
          return true;
        } catch (e) {
          console.error('Error parsing prop_details for filtering:', e);
          return false;
        }
      }
      return false;
    });

    setPropertiesGeoJSON({
      type: 'FeatureCollection',
      features: filteredFeatures,
    });
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
          onToggleFilter={handleToggleFilter} // Pass the toggle handler
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <MapContainer
          onMapReady={handleMapReady}
          onFeatureClick={handleFeatureClick}
          activeFilters={activeFilters}
          propertiesGeoJSON={propertiesGeoJSON} // Pass the filtered GeoJSON data
        />
        {/* Sidebar */}
        <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
          {showFilterPanel ? (
            <FilterPanel 
              onApplyFilters={handleApplyFilters} 
              uniqueZoneIds={uniqueZoneIds}
              uniqueLandUseValues={uniqueLandUseValues} 
            />
          ) : (
            <PropertyDetailsPanel
              propertyId={selectedPropertyId}
              propertyDetails={selectedPropertyDetails}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
