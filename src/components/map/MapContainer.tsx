import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
// @ts-ignore
import MapboxWorker from 'mapbox-gl/dist/mapbox-gl-csp-worker?worker';
import 'mapbox-gl/dist/mapbox-gl.css';
import { toast } from 'sonner';
import bbox from '@turf/bbox';
import centroid from '@turf/centroid';
import ToolbarControl from '../toolbar/CollapsibleToolbar';
import * as GeoJSON from 'geojson';
import PropertyDetailsPanel from '../panels/PropertyDetailsPanel';
import CustomControl from './CustomControl';
import MapOrientationControl from './MapOrientationControl';
import FilterControl from './FilterControl';
import AnalyticsToggleControl from './AnalyticsToggleControl';

interface MapContainerProps {
  onMapReady?: (map: mapboxgl.Map) => void;
  onFeatureClick?: (feature: mapboxgl.MapboxGeoJSONFeature) => void;
  onToggleFilter?: () => void;
  onToggleMapStyle?: () => void;
  onClosePropertyPanel?: () => void;
  onToggleAnalytics?: () => void;
  mapStyle: 'streets' | 'satellite';
  activeFilters: Record<string, any>;
  propertiesGeoJSON: GeoJSON.FeatureCollection | null;
  selectedProperty: Record<string, any> | null;
  showAnalytics: boolean;
  selectedLandUses: string[];
}

const MapContainer: React.FC<MapContainerProps> = ({
  onMapReady,
  onFeatureClick,
  onToggleFilter,
  onToggleMapStyle,
  onClosePropertyPanel,
  onToggleAnalytics,
  mapStyle,
  activeFilters,
  propertiesGeoJSON,
  selectedProperty,
  showAnalytics,
  selectedLandUses,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const currentPropertiesData = useRef<GeoJSON.FeatureCollection | null>(null);
  const hasInitializedLayer = useRef<boolean>(false);
  const isUserInteracting = useRef<boolean>(false);
  const lastFeatureCount = useRef<number>(0);
  const analyticsControlRef = useRef<AnalyticsToggleControl | null>(null);

  // Function to initialize properties layer - defined outside useEffect so it can be reused
  const initializePropertiesLayer = useRef<(() => void) | null>(null);

  /**
   * Get the appropriate fill color based on selected land use filters
   * 
   * Uses Mapbox's data-driven styling to color properties based on their land use:
   * - When NO filters are selected: All properties display in default green/teal
   * - When filters ARE selected: Each property displays in its own land use color
   * 
   * @returns Color value - either a string (uniform color) or Mapbox expression (data-driven)
   */
  const getLandUseColor = (): any => {
    // If no filters selected, use default green for all properties
    if (selectedLandUses.length === 0) {
      return '#088'; // Original teal/green color
    }
    
    // If filters are active, use data-driven styling
    // Each property will display in its own land use color
    return [
      'match',
      ['get', 'land_use', ['get', 'land_details']], // Get land_use from nested land_details object
      'Commercial', '#3B82F6',           // blue-500
      'Residential', '#22C55E',          // green-500
      'Public Institutional', '#A855F7', // purple-500
      'Industrial', '#F97316',           // orange-500
      'reserved', '#F59E0B',             // amber-500
      '#088'  // Default fallback color for unknown types
    ];
  };

  useEffect(() => {
    if (map.current || !mapContainer.current) return; // initialize map only once

    const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    
    if (!mapboxToken) {
      toast.error('Mapbox token is missing. Please check your .env file.');
      return;
    }
    
    mapboxgl.accessToken = mapboxToken;
    // @ts-ignore
    mapboxgl.workerClass = MapboxWorker;

    const getMapStyle = (style: 'streets' | 'satellite') => {
      return style === 'streets' 
        ? 'mapbox://styles/mapbox/streets-v11'
        : 'mapbox://styles/mapbox/satellite-streets-v11';
    };

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: getMapStyle(mapStyle),
        center: [145.60325243415468, -8.63452643523776],
        zoom: 6.622158420062033,
        bearing: 0,
        pitch: 41.43724448102603,
        antialias: true
      });

      map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
      map.current.addControl(new CustomControl(MapOrientationControl), 'top-right');
      
      // TODO: Layer control temporarily hidden - will be implemented later with improved UI/UX
      // map.current.addControl(new ToolbarControl(), 'top-left');
      
      // Add Filter control if onToggleFilter is provided
      if (onToggleFilter) {
        map.current.addControl(new FilterControl(onToggleFilter) as any, 'top-right');
      }
      
      // Add Analytics Toggle control if onToggleAnalytics is provided
      if (onToggleAnalytics) {
        const analyticsControl = new AnalyticsToggleControl({
          isVisible: showAnalytics,
          onToggle: onToggleAnalytics
        });
        analyticsControlRef.current = analyticsControl;
        map.current.addControl(analyticsControl as any, 'top-right');
      }
      
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-right');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      map.current.on('load', () => {
        if (!map.current) return;
       
        setMapInstance(map.current);
        onMapReady?.(map.current);
        toast.success('Map initialized successfully!');
      });

      // Handle style changes - critical for maintaining data when switching map styles
      map.current.on('style.load', () => {
        if (!map.current || !currentPropertiesData.current) return;
        
        // Re-initialize the properties layer after style change
        if (initializePropertiesLayer.current) {
          initializePropertiesLayer.current();
        }
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map. Please check your Mapbox token.');
    }

    return () => {
      map.current?.remove();
    };
  }, [onMapReady]);

  /**
   * Initialize or update properties layer whenever data or map instance changes
   * 
   * RELATED TO: Initial data visibility issue fix
   * This effect works in conjunction with the automatic filter toggle workaround in MapView.tsx
   * 
   * KEY IMPROVEMENTS MADE:
   * 1. Added hasInitializedLayer flag to track first-time initialization
   * 2. Moved camera animations (fitBounds, flyTo) to occur AFTER layer setup completes
   * 3. Increased retry attempts from 10 to 20 for more reliability
   * 4. Uses requestAnimationFrame to ensure layer is rendered before animations start
   * 5. Added detailed console logging for debugging
   * 
   * IMPORTANT: This effect handles both initial layer setup and subsequent updates
   * when filters change. The layer must be properly initialized before any camera
   * animations to ensure visibility.
   * 
   * @see MapView.tsx - Automatic filter toggle workaround
   * @date 2025-10-02
   */
  useEffect(() => {
    if (!mapInstance || !propertiesGeoJSON) return;

    // Store the current data for persistence across style changes
    currentPropertiesData.current = propertiesGeoJSON;

    /**
     * Function to initialize properties layer with timeout-based retry mechanism
     * 
     * This function handles the complex timing of layer initialization:
     * - Waits for map style to be fully loaded before adding layer
     * - Retries with timeout if style isn't ready yet
     * - On initial load, performs camera animations AFTER layer is set up
     * - Uses currentPropertiesData.current to avoid React closure issues
     * 
     * @param retryCount - Current retry attempt (max 20)
     * @param isInitialLoad - Whether this is the first-time layer initialization
     */
    const setupPropertiesLayer = (retryCount = 0, isInitialLoad = false) => {
      const maxRetries = 20; // Increased retries for more reliability
      const currentData = currentPropertiesData.current;
      
      if (!currentData) {
        console.error('No properties data available');
        return;
      }
      
      // Check if style is loaded, if not retry with timeout
      if (!mapInstance.isStyleLoaded()) {
        if (retryCount < maxRetries) {
          console.log(`Waiting for style to load... retry ${retryCount + 1}/${maxRetries}`);
          setTimeout(() => setupPropertiesLayer(retryCount + 1, isInitialLoad), 100);
        } else {
          console.error('Failed to initialize properties layer: style did not load in time');
        }
        return;
      }

      try {
        // Remove existing layer and source if they exist
        if (mapInstance.getLayer('properties-fill')) {
          mapInstance.removeLayer('properties-fill');
        }
        if (mapInstance.getSource('properties')) {
          mapInstance.removeSource('properties');
        }

        // Add source and layer using data from ref
        mapInstance.addSource('properties', {
          type: 'geojson',
          data: currentData,
        });

        // Use dynamic color based on selected land use
        const fillColor = getLandUseColor();
        
        mapInstance.addLayer({
          id: 'properties-fill',
          type: 'fill',
          source: 'properties',
          paint: {
            'fill-color': fillColor,
            'fill-opacity': 0.8,
          },
        });

        // Add click handler (only once)
        const clickHandler = (e: mapboxgl.MapLayerMouseEvent) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            
            if (feature.geometry) {
              try {
                const center = centroid(feature.geometry as GeoJSON.Geometry);
                const [lng, lat] = center.geometry.coordinates;
                
                mapInstance.flyTo({
                  center: [lng, lat],
                  zoom: 17,
                  duration: 1500,
                  essential: true,
                  padding: { top: 50, bottom: 50, left: 400, right: 50 }
                });
              } catch (error) {
                console.error('Error calculating centroid:', error);
              }
            }
            
            onFeatureClick?.(feature);
          }
        };
        
        // Remove any existing click handlers first
        mapInstance.off('click', 'properties-fill', clickHandler);
        mapInstance.on('click', 'properties-fill', clickHandler);
        
        // Mark as initialized if this is the initial load
        if (isInitialLoad) {
          hasInitializedLayer.current = true;
          console.log('✓ Initial properties layer setup complete with', currentData.features.length, 'features');
          
          // Perform camera animations AFTER layer is successfully initialized
          if (currentData.features.length > 0) {
            // Use requestAnimationFrame to ensure layer is rendered before animation
            requestAnimationFrame(() => {
              const bounds = bbox(currentData);
              const [minLng, minLat, maxLng, maxLat] = bounds;

              mapInstance.fitBounds(
                [
                  [minLng, minLat],
                  [maxLng, maxLat],
                ],
                {
                  padding: 20,
                  duration: 2000,
                }
              );

              // After fitting bounds, animate to the final camera position
              mapInstance.once('idle', () => {
                mapInstance.flyTo({
                  center: [147.0061763014421, -6.73090862563501],
                  zoom: 13.750106234497338,
                  bearing: -24.615650949170004,
                  pitch: 15.94762027005949,
                  duration: 3000,
                });
              });
            });
          }
        } else {
          console.log('Properties layer re-initialized with', currentData.features.length, 'features');
        }
      } catch (error) {
        console.error('Error setting up properties layer:', error);
      }
    };

    // Store the setup function so it can be called from style.load event
    // Set this BEFORE calling setupPropertiesLayer to ensure it's available immediately
    initializePropertiesLayer.current = setupPropertiesLayer;

    // Check if we need to initialize or just update
    const source = mapInstance.getSource('properties') as mapboxgl.GeoJSONSource;
    
    if (source) {
      // Layer exists, just update the data
      source.setData(propertiesGeoJSON);
      console.log('Updated properties data with', propertiesGeoJSON.features.length, 'features');
    } else {
      // Layer doesn't exist, initialize it
      const isFirstTimeInit = !hasInitializedLayer.current;
      console.log(isFirstTimeInit ? '🚀 First-time initialization of properties layer with' : 'Re-initializing properties layer with', propertiesGeoJSON.features.length, 'features');
      setupPropertiesLayer(0, isFirstTimeInit);
    }
  }, [propertiesGeoJSON, mapInstance]);

  /**
   * Automatic Camera Positioning Effect
   * 
   * Automatically adjusts the map camera to encompass filtered data whenever:
   * - User searches for properties
   * - User clicks land use filter pills
   * - User applies filters from FilterPanel
   * 
   * BEHAVIOR:
   * - Skips on initial load (preserves the nice initial animation sequence)
   * - Skips when user is actively interacting with map (panning, zooming)
   * - Skips when data changes from full dataset to full dataset
   * - Smoothly animates to fit bounds of filtered properties
   * - Uses appropriate zoom levels for single vs multiple properties
   * - Includes padding to keep properties away from panel edges
   * 
   * @date 2025-10-02
   */
  useEffect(() => {
    // Prerequisites check
    if (!mapInstance || !propertiesGeoJSON || !hasInitializedLayer.current) return;
    
    const currentFeatureCount = propertiesGeoJSON.features.length;
    
    // Skip if no features (empty filter results)
    if (currentFeatureCount === 0) {
      console.log('⚠️ No features to display - keeping current camera position');
      lastFeatureCount.current = currentFeatureCount;
      return;
    }
    
    // Skip if user is actively interacting with the map
    if (isUserInteracting.current) {
      console.log('👆 User is interacting - skipping auto-fit');
      lastFeatureCount.current = currentFeatureCount;
      return;
    }
    
    // Skip if feature count hasn't changed (prevents redundant camera moves)
    if (lastFeatureCount.current === currentFeatureCount && lastFeatureCount.current > 0) {
      console.log('📊 Feature count unchanged - skipping auto-fit');
      return;
    }
    
    try {
      // Calculate bounding box of all features
      const bounds = bbox(propertiesGeoJSON);
      const [minLng, minLat, maxLng, maxLat] = bounds;
      
      // Determine appropriate zoom level based on number of features
      // Single property: zoom in closer for detail
      // Multiple properties: moderate zoom to show all
      const maxZoom = currentFeatureCount === 1 ? 17 : 15.5;
      
      console.log(`🎯 Auto-fitting camera to ${currentFeatureCount} feature(s)`);
      
      // Animate camera to encompass all filtered properties
      mapInstance.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        {
          padding: { 
            top: 80,      // Top padding for search bar
            bottom: 80,   // Bottom padding for info panel
            left: 450,    // Left padding for property details panel when open
            right: 80     // Right padding for controls
          },
          maxZoom: maxZoom,
          duration: 1200, // Smooth 1.2 second animation
          essential: true // Ensures animation completes even if user interrupts
        }
      );
      
      // Update last feature count after successful fit
      lastFeatureCount.current = currentFeatureCount;
      
    } catch (error) {
      console.error('Error calculating bounds for auto-fit:', error);
      // Update count even on error to prevent infinite retry loops
      lastFeatureCount.current = currentFeatureCount;
    }
  }, [propertiesGeoJSON, mapInstance]);

  /**
   * Track user interactions to prevent auto-fit during manual navigation
   * 
   * Sets a flag when user starts interacting and clears it after they stop.
   * This prevents the auto-fit from fighting with user's manual map navigation.
   */
  useEffect(() => {
    if (!mapInstance) return;
    
    const handleInteractionStart = () => {
      isUserInteracting.current = true;
    };
    
    const handleInteractionEnd = () => {
      // Delay clearing the flag to allow completed interactions to settle
      setTimeout(() => {
        isUserInteracting.current = false;
      }, 500);
    };
    
    // Listen for user interaction events
    mapInstance.on('mousedown', handleInteractionStart);
    mapInstance.on('touchstart', handleInteractionStart);
    mapInstance.on('wheel', handleInteractionStart);
    mapInstance.on('dragend', handleInteractionEnd);
    mapInstance.on('zoomend', handleInteractionEnd);
    mapInstance.on('moveend', handleInteractionEnd);
    
    return () => {
      mapInstance.off('mousedown', handleInteractionStart);
      mapInstance.off('touchstart', handleInteractionStart);
      mapInstance.off('wheel', handleInteractionStart);
      mapInstance.off('dragend', handleInteractionEnd);
      mapInstance.off('zoomend', handleInteractionEnd);
      mapInstance.off('moveend', handleInteractionEnd);
    };
  }, [mapInstance]);

  /**
   * Update layer color when selectedLandUses changes
   * 
   * This effect dynamically updates the map layer's fill color when the user
   * selects or deselects land use filter pills, providing immediate visual feedback
   * that matches the selected pill's color.
   * 
   * @date 2025-10-02
   */
  useEffect(() => {
    if (!mapInstance || !mapInstance.getLayer('properties-fill')) return;
    
    const newColor = getLandUseColor();
    
    try {
      mapInstance.setPaintProperty('properties-fill', 'fill-color', newColor);
      console.log('🎨 Updated layer color to:', newColor, 'for land uses:', selectedLandUses);
    } catch (error) {
      console.error('Error updating layer color:', error);
    }
  }, [selectedLandUses, mapInstance]);

  // Update analytics control when showAnalytics changes
  useEffect(() => {
    if (analyticsControlRef.current && onToggleAnalytics) {
      analyticsControlRef.current.updateProps({
        isVisible: showAnalytics,
        onToggle: onToggleAnalytics
      });
    }
  }, [showAnalytics, onToggleAnalytics]);

  // Handle map style changes
  useEffect(() => {
    if (!mapInstance) return;

    const getMapStyle = (style: 'streets' | 'satellite') => {
      return style === 'streets' 
        ? 'mapbox://styles/mapbox/streets-v11'
        : 'mapbox://styles/mapbox/satellite-streets-v11';
    };

    mapInstance.setStyle(getMapStyle(mapStyle));
  }, [mapStyle, mapInstance]);

  return (
    <div className="relative flex-1">
      <div ref={mapContainer} className="absolute inset-0" />
      {selectedProperty && (
        <div className="absolute top-0 left-0 z-10 m-4" style={{ width: '350px', maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
          <PropertyDetailsPanel
            property={selectedProperty}
            onClose={onClosePropertyPanel}
          />
        </div>
      )}
      <div className="absolute bottom-0 w-full bg-gray-900 bg-opacity-75 text-white text-center p-1 text-xs">
       © 2025 Municipality of Lae City | Data:MassGIS,Valuation Roll |
        Map Tiles © Mapbox | © OpenStreetMap | © Maxar Contributors
      </div>
    </div>
  );
};

export default MapContainer;
