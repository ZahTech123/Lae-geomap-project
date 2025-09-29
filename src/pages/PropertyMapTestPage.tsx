import React, { useState, useEffect } from 'react';
import MapContainer from '../components/map/MapContainer';
import { fetchPropertiesGeoJSON } from '../integrations/supabase/services';
import mapboxgl from 'mapbox-gl';

const PropertyMapTestPage: React.FC = () => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [propertiesGeoJSON, setPropertiesGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getProperties = async () => {
      setLoading(true);
      setError(null);
      const data = await fetchPropertiesGeoJSON();
      if (data) {
        setPropertiesGeoJSON(data);
      } else {
        setError('Failed to fetch properties GeoJSON.');
      }
      setLoading(false);
    };

    getProperties();
  }, []);

  useEffect(() => {
    if (map && propertiesGeoJSON) {
      if (map.getSource('properties')) {
        (map.getSource('properties') as mapboxgl.GeoJSONSource).setData(propertiesGeoJSON);
      } else {
        map.addSource('properties', {
          type: 'geojson',
          data: propertiesGeoJSON,
        });

        map.addLayer({
          id: 'properties-layer',
          type: 'fill',
          source: 'properties',
          layout: {},
          paint: {
            'fill-color': '#0080ff',
            'fill-opacity': 0.5,
          },
        });

        map.addLayer({
          id: 'properties-borders',
          type: 'line',
          source: 'properties',
          layout: {},
          paint: {
            'line-color': '#000000',
            'line-width': 1,
          },
        });
      }

      // Fit map to properties
      const bounds = new mapboxgl.LngLatBounds();
      propertiesGeoJSON.features.forEach(feature => {
        if (feature.geometry.type === 'Polygon') {
          (feature.geometry as GeoJSON.Polygon).coordinates[0].forEach(coord => {
            bounds.extend(coord as [number, number]);
          });
        }
      });
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 20 });
      }
    }
  }, [map, propertiesGeoJSON]);

  const handleMapReady = (mapboxMap: mapboxgl.Map) => {
    setMap(mapboxMap);
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      {loading && <div style={{ padding: '20px' }}>Loading properties...</div>}
      {error && <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>}
      <MapContainer onMapReady={handleMapReady} />
      <div style={{ position: 'absolute', top: 10, left: 10, background: 'white', padding: '10px', zIndex: 1 }}>
        <h3>Fetched Properties:</h3>
        {propertiesGeoJSON && propertiesGeoJSON.features.length > 0 ? (
          <ul>
            {propertiesGeoJSON.features.map((feature, index) => (
              <li key={index}>
                Property ID: {feature.properties?.property_id}, Address: {feature.properties?.address}
              </li>
            ))}
          </ul>
        ) : (
          <p>No properties found or still loading.</p>
        )}
      </div>
    </div>
  );
};

export default PropertyMapTestPage;
