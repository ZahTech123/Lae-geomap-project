import React, { useState, useCallback, useEffect } from 'react';
import MapContainer from '@/components/map/MapContainer';
import GISToolbar from '@/components/toolbar/GISToolbar';
import PropertyDetailsPanel from '@/components/panels/PropertyDetailsPanel';
import FilterPanel from '@/components/panels/FilterPanel';
import MapSearchBar from '@/components/map/MapSearchBar';
import LandUseFilterPills from '@/components/map/LandUseFilterPills';
import MapStyleSwitcher from '@/components/map/MapStyleSwitcher';
import MapAnalyticsCards from '@/components/map/MapAnalyticsCards';
import mapboxgl from 'mapbox-gl';
import { useOutletContext } from 'react-router-dom';
import { fetchPropertiesGeoJSON } from '@/integrations/supabase/services';
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
  const [selectedProperty, setSelectedProperty] = useState<Record<string, any> | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [selectedLandUses, setSelectedLandUses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const [uniqueZoneIds, setUniqueZoneIds] = useState<string[]>([]);
  const [uniqueZoningCodes, setUniqueZoningCodes] = useState<string[]>([]);
  const [uniquePermitStatuses, setUniquePermitStatuses] = useState<string[]>([]);
  const [uniquePaymentStatuses, setUniquePaymentStatuses] = useState<string[]>([]);
  const [allPropertiesGeoJSON, setAllPropertiesGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  const [propertiesGeoJSON, setPropertiesGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  const [mapOrientation, setMapOrientation] = useState({
    zoom: 13,
    center: { lng: 147.00, lat: -6.72 },
    bearing: 0,
    pitch: 0,
  });
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);

  const handleMapReady = useCallback((mapInstance: mapboxgl.Map) => {
    setMap(mapInstance);

    const startOrientation = {
      zoom: 7.593376435895668,
      center: {
        lng: 145.88438933689577,
        lat: -7.665758588644223
      },
      bearing: 13.646197967470016,
      pitch: 53.67076250992105
    };

    const endOrientation = {
      zoom: 14.165234491561991,
      center: {
        lng: 147.00736799081943,
        lat: -6.732205626110769
      },
      bearing: -19.158114498486498,
      pitch: 43.169381994904455
    };

    // Set initial position without animation
    mapInstance.setZoom(startOrientation.zoom);
    mapInstance.setCenter(startOrientation.center);
    mapInstance.setBearing(startOrientation.bearing);
    mapInstance.setPitch(startOrientation.pitch);

    // Animate to the end position
    mapInstance.on('load', () => {
      mapInstance.flyTo({
        ...endOrientation,
        duration: 8000, // 8 seconds for a smooth flight
        essential: true
      });
    });

    const updateOrientation = () => {
      setMapOrientation({
        zoom: mapInstance.getZoom(),
        center: mapInstance.getCenter(),
        bearing: mapInstance.getBearing(),
        pitch: mapInstance.getPitch(),
      });
    };

    mapInstance.on('move', updateOrientation);
    mapInstance.on('zoom', updateOrientation);
    mapInstance.on('rotate', updateOrientation);
    mapInstance.on('pitch', updateOrientation);

    updateOrientation(); // Initial update
  }, [setMap]);

  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool);
    // Here you would implement tool-specific map interactions
    // For example, enable drawing mode, change cursor, etc.
  };

  const handleFeatureClick = (feature: mapboxgl.MapboxGeoJSONFeature) => {
    if (feature.properties) {
      setSelectedProperty(feature.properties);
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
      if (geojsonData && geojsonData.features) {
        setAllPropertiesGeoJSON(geojsonData);
        setPropertiesGeoJSON(geojsonData); // Initially, show all properties

        // Debug: Log first feature to see available properties
        if (geojsonData.features.length > 0) {
          console.log('Sample feature properties:', geojsonData.features[0].properties);
        }

        const zones = new Set<string>();
        const zoningCodes = new Set<string>();
        const permitStatuses = new Set<string>();
        const paymentStatuses = new Set<string>();
        
        geojsonData.features.forEach(feature => {
          const properties = feature.properties;
          if (properties) {
            if (properties.zone_id) zones.add(properties.zone_id);
            if (properties.zoning_code) zoningCodes.add(properties.zoning_code);
            if (properties.permit_status) permitStatuses.add(properties.permit_status);
            if (properties.payment_status) paymentStatuses.add(properties.payment_status);
          }
        });
        
        setUniqueZoneIds(Array.from(zones).sort());
        setUniqueZoningCodes(Array.from(zoningCodes).sort());
        setUniquePermitStatuses(Array.from(permitStatuses).sort());
        setUniquePaymentStatuses(Array.from(paymentStatuses).sort());
      }
    };

    loadInitialData();
  }, []);

  const handleToggleFilter = () => {
    setShowFilterPanel(prev => !prev);
  };

  const handleToggleMapStyle = () => {
    setMapStyle(prev => prev === 'streets' ? 'satellite' : 'streets');
  };

  const handleToggleLandUse = (landUse: string) => {
    setSelectedLandUses(prev => {
      if (prev.includes(landUse)) {
        return prev.filter(lu => lu !== landUse);
      } else {
        return [...prev, landUse];
      }
    });
  };

  const handleToggleAnalytics = () => {
    setShowAnalytics(prev => !prev);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSelectProperty = (property: any) => {
    setSelectedProperty(property);
    // Optionally zoom to the property on the map
    if (map && property.geometry?.coordinates) {
      const coords = property.geometry.coordinates;
      map.flyTo({
        center: coords,
        zoom: 16,
        essential: true
      });
    }
  };

  const handleClosePropertyPanel = () => {
    setSelectedProperty(null);
  };

  const handleApplyFilters = (filters: Record<string, any>) => {
    setActiveFilters(filters);
  };

  /**
   * WORKAROUND: Automatic filter toggle on initial load to force data rendering
   * 
   * ISSUE:
   * There's a timing/race condition between map initialization, style loading, and data layer setup
   * that causes the properties data layer to not render on initial page load. The layer is technically
   * added to the map, but remains invisible until some state change forces a re-render.
   * 
   * ROOT CAUSE:
   * The Mapbox map undergoes several initialization phases:
   * 1. Map instance creation
   * 2. Style loading
   * 3. Camera animations (fitBounds, flyTo)
   * While these are happening, the properties layer initialization competes for resources,
   * and the layer may be added but not properly rendered/visible.
   * 
   * SOLUTION:
   * Manually triggering a filter toggle (which causes propertiesGeoJSON to update) forces
   * the layer to re-render and become visible. This workaround:
   * 1. Waits 500ms for map to settle after all initialization
   * 2. Programmatically toggles a dummy filter value on
   * 3. After 150ms, toggles it back off
   * 4. This state change forces the filter effect to run, updating the layer and making it visible
   * 
   * WHY THIS WORKS:
   * When selectedLandUses changes, it triggers the filter useEffect which calls setPropertiesGeoJSON,
   * which then triggers MapContainer's useEffect to update the layer source data. This forced
   * update ensures the layer becomes visible.
   * 
   * ALTERNATIVE APPROACHES CONSIDERED:
   * - Delaying layer initialization: Didn't work reliably
   * - Using map.once('idle'): Still had race conditions
   * - requestAnimationFrame: Helped but wasn't sufficient alone
   * 
   * NOTE FOR FUTURE DEVELOPERS:
   * If you find a better solution (e.g., Mapbox API updates that fix the timing issue),
   * you can remove this workaround. Test thoroughly by refreshing the page multiple times
   * to ensure data appears consistently on initial load.
   * 
   * @see MapContainer.tsx - Layer initialization improvements
   * @date 2025-10-02
   */
  useEffect(() => {
    if (!initialLoadComplete && map && allPropertiesGeoJSON && propertiesGeoJSON) {
      console.log('🔄 Triggering automatic filter toggle to force initial data render...');
      
      // Wait a bit for the map to settle, then trigger a quick filter toggle
      const timer = setTimeout(() => {
        // Toggle a dummy filter on
        setSelectedLandUses(['_dummy_trigger_']);
        
        // Then immediately toggle it off after a short delay
        setTimeout(() => {
          setSelectedLandUses([]);
          setInitialLoadComplete(true);
          console.log('✓ Initial load workaround complete - data should now be visible');
        }, 150);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [map, allPropertiesGeoJSON, propertiesGeoJSON, initialLoadComplete]);

  // Apply all filters whenever any filter changes
  useEffect(() => {
    if (!allPropertiesGeoJSON) return;

    const filteredFeatures = allPropertiesGeoJSON.features.filter(feature => {
      const properties = feature.properties;
      if (!properties) return false;

      // Apply search filter
      if (searchTerm.length >= 2) {
        const lowerSearch = searchTerm.toLowerCase();
        const matchesSearch = 
          properties.parcel_id?.toLowerCase().includes(lowerSearch) ||
          properties.address?.toLowerCase().includes(lowerSearch) ||
          properties.owner_name?.toLowerCase().includes(lowerSearch) ||
          properties.building_name?.toLowerCase().includes(lowerSearch);
        
        if (!matchesSearch) return false;
      }

      // Apply land use filter
      if (selectedLandUses.length > 0) {
        const landDetails = properties.land_details as any;
        const propertyLandUse = landDetails?.land_use;
        if (!propertyLandUse || !selectedLandUses.includes(propertyLandUse)) {
          return false;
        }
      }

      // Apply other filters from FilterPanel
      if (activeFilters.section && properties.section?.toString() !== activeFilters.section) return false;
      if (activeFilters.lot && properties.lot?.toString() !== activeFilters.lot) return false;
      if (activeFilters.parcelId && !properties.parcel_id?.toLowerCase().includes(activeFilters.parcelId.toLowerCase())) return false;
      if (activeFilters.buildingId && !properties.building_id?.toLowerCase().includes(activeFilters.buildingId.toLowerCase())) return false;
      if (activeFilters.buildingName && !properties.building_name?.toLowerCase().includes(activeFilters.buildingName.toLowerCase())) return false;
      if (activeFilters.valNo && properties.val_no?.toString() !== activeFilters.valNo) return false;
      if (activeFilters.address && !properties.address?.toLowerCase().includes(activeFilters.address.toLowerCase())) return false;
      if (activeFilters.ownerName && !properties.owner_name?.toLowerCase().includes(activeFilters.ownerName.toLowerCase())) return false;
      if (activeFilters.zoningCode && properties.zoning_code !== activeFilters.zoningCode) return false;
      if (activeFilters.permitStatus && properties.permit_status !== activeFilters.permitStatus) return false;
      if (activeFilters.paymentStatus && properties.payment_status !== activeFilters.paymentStatus) return false;

      return true;
    });

    setPropertiesGeoJSON({
      type: 'FeatureCollection',
      features: filteredFeatures,
    });
  }, [allPropertiesGeoJSON, activeFilters, selectedLandUses, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {showFilterPanel && (
          <div className="h-full flex-shrink-0">
            <FilterPanel 
              onApplyFilters={handleApplyFilters}
              onClose={handleToggleFilter}
              uniqueZoneIds={uniqueZoneIds}
              uniqueZoningCodes={uniqueZoningCodes}
              uniquePermitStatuses={uniquePermitStatuses}
              uniquePaymentStatuses={uniquePaymentStatuses}
            />
          </div>
        )}
        
        {/* Map */}
        <MapContainer
          onMapReady={handleMapReady}
          onFeatureClick={handleFeatureClick}
          onToggleFilter={handleToggleFilter}
          onToggleMapStyle={handleToggleMapStyle}
          onClosePropertyPanel={handleClosePropertyPanel}
          onToggleAnalytics={handleToggleAnalytics}
          mapStyle={mapStyle}
          activeFilters={activeFilters}
          propertiesGeoJSON={propertiesGeoJSON}
          selectedProperty={selectedProperty}
          showAnalytics={showAnalytics}
          selectedLandUses={selectedLandUses}
        />

        {/* Search Bar - Positioned over map with dynamic positioning based on panel states */}
        <div className={`absolute top-4 z-10 pointer-events-none transition-all duration-300 ${
          showFilterPanel 
            ? 'opacity-0 pointer-events-none left-4' 
            : selectedProperty 
              ? 'left-[374px] opacity-100' 
              : 'left-4 opacity-100'
        }`}>
          <div className="pointer-events-auto">
            <MapSearchBar
              properties={allPropertiesGeoJSON?.features.map(f => f.properties) || []}
              onSelectProperty={handleSelectProperty}
              onSearch={handleSearch}
            />
          </div>
        </div>

        {/* Land Use Pills - Positioned over map */}
        <div className="absolute top-2 right-16 z-10 pointer-events-none">
          <div className="pointer-events-auto flex gap-2 items-center">
            <MapStyleSwitcher
              currentStyle={mapStyle}
              onToggleStyle={handleToggleMapStyle}
            />
            <LandUseFilterPills
              selectedLandUses={selectedLandUses}
              onToggleLandUse={handleToggleLandUse}
            />
          </div>
        </div>

        {/* Analytics Cards - Positioned over map at bottom with left padding */}
        {showAnalytics && (
          <div className="absolute bottom-8 left-[370px] z-10 pointer-events-none transition-all duration-300 ease-in-out opacity-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="pointer-events-auto">
              <MapAnalyticsCards propertiesGeoJSON={propertiesGeoJSON} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
