import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
// @ts-ignore
import MapboxWorker from 'mapbox-gl/dist/mapbox-gl-csp-worker?worker';
import 'mapbox-gl/dist/mapbox-gl.css';
import { toast } from 'sonner';
import bbox from '@turf/bbox';
import ToolbarControl from '../toolbar/CollapsibleToolbar';
import * as GeoJSON from 'geojson';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton component
import { Loader2 } from 'lucide-react'; // Import Loader2 for spinner

interface MapContainerProps {
  onMapReady?: (map: mapboxgl.Map) => void;
  onFeatureClick?: (feature: mapboxgl.MapboxGeoJSONFeature) => void;
  activeFilters: Record<string, any>;
  propertiesGeoJSON: GeoJSON.FeatureCollection | null; // New prop for filtered data
}

const MapContainer: React.FC<MapContainerProps> = ({ onMapReady, onFeatureClick, activeFilters, propertiesGeoJSON }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true); // Loading state for map initialization
  const [isPropertiesUpdating, setIsPropertiesUpdating] = useState(false); // Loading state for properties update

  useEffect(() => {
    if (map.current || !mapContainer.current) return; // initialize map only once

    const mapboxToken = 'pk.eyJ1Ijoiam9obnNraXBvbGkiLCJhIjoiY201c3BzcDYxMG9neDJscTZqeXQ4MGk4YSJ9.afrO8Lq1P6mIUbSyQ6VCsQ';
    mapboxgl.accessToken = mapboxToken;
    // @ts-ignore
    mapboxgl.workerClass = MapboxWorker;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [147.00, -6.72], // Default center for Lae City
        zoom: 13, // Default zoom for Lae City
        pitch: 45,
        bearing: -17.6,
        antialias: true
      });

      map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
      map.current.addControl(new ToolbarControl(), 'top-left');
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      map.current.on('load', () => {
        if (!map.current) return;

        map.current.addSource('properties', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
        });

        map.current.addLayer({
          id: 'properties-fill',
          type: 'fill',
          source: 'properties',
          paint: {
            'fill-color': '#088',
            'fill-opacity': 0.8,
          },
        });

        map.current.on('click', 'properties-fill', (e) => {
          if (e.features && e.features.length > 0) {
            onFeatureClick?.(e.features[0]);
          }
        });
       
        setMapInstance(map.current);
        onMapReady?.(map.current);
        setIsMapLoading(false); // Map is ready
        toast.success('Map initialized successfully!');
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map. Please check your Mapbox token.');
      setIsMapLoading(false); // Ensure loading state is reset even on error
    }

    return () => {
      map.current?.remove();
    };
  }, [onMapReady]);

  useEffect(() => {
    if (!map.current || !propertiesGeoJSON) return;

    setIsPropertiesUpdating(true); // Set loading to true before updating properties

    // Parse JSON strings in feature properties for easier filtering
    const parsedGeojsonData = {
      ...propertiesGeoJSON,
      features: propertiesGeoJSON.features.map(feature => {
        const newProperties = { ...feature.properties };
        if (typeof newProperties.prop_details === 'string') {
          try {
            newProperties.parsed_prop_details = JSON.parse(newProperties.prop_details);
          } catch (e) {
            console.error('Error parsing prop_details:', e);
          }
        }
        if (typeof newProperties.owner_details === 'string') {
          try {
            newProperties.parsed_owner_details = JSON.parse(newProperties.owner_details);
          } catch (e) {
            console.error('Error parsing owner_details:', e);
          }
        }
        return { ...feature, properties: newProperties };
      }),
    };

    const source = map.current.getSource('properties') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(parsedGeojsonData);
    }
    setIsPropertiesUpdating(false); // Set loading to false after updating properties
  }, [propertiesGeoJSON, mapInstance]);

  if (isMapLoading) {
    return (
      <div className="relative flex-1 flex items-center justify-center">
        <Skeleton className="absolute inset-0" />
        <Loader2 className="h-12 w-12 animate-spin text-primary z-10" />
      </div>
    );
  }

  return (
    <div className="relative flex-1">
      <div ref={mapContainer} className="absolute inset-0" />
      {isPropertiesUpdating && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-25 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
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
