import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Polygon, InfoWindow } from '@react-google-maps/api';

// Map container style
const containerStyle = {
  width: '100%',
  height: '400px'
};

// Default center (will be overridden by farm data)
const defaultCenter = {
  lat: 6.4627193,
  lng: -2.8256303
};

// Map options
const mapOptions = {
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  zoomControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

// Farm polygon style
const polygonOptions = {
  fillColor: '#4CAF50',
  fillOpacity: 0.3,
  strokeColor: '#4CAF50',
  strokeOpacity: 1,
  strokeWeight: 2,
  clickable: true,
  draggable: false,
  editable: false,
  geodesic: false,
  zIndex: 1
};

const FarmMapGoogle = ({ data }) => {
  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: '' // You will need to add your API key here
  });

  const [map, setMap] = useState(null);
  const [farmPolygons, setFarmPolygons] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [infoPosition, setInfoPosition] = useState(null);

  // Parse farm polygon data from the provided dataset
  useEffect(() => {
    if (!data || data.length < 1) return;
    
    const polygons = [];
    
    // Extract farmer data from the first object
    if (data[0]?.v_farmer) {
      data[0].v_farmer.forEach(farmer => {
        try {
          if (farmer.attributes?.polygon) {
            // Parse the polygon JSON string
            const polygonData = JSON.parse(farmer.attributes.polygon);
            
            if (polygonData.plot && polygonData.plot.length > 0) {
              // Google Maps expects an array of LatLng objects
              const coordinates = polygonData.plot.map(point => ({
                lat: point.lat,
                lng: point.lng
              }));
              
              // Calculate center point for the info window
              const centerLat = coordinates.reduce((sum, point) => sum + point.lat, 0) / coordinates.length;
              const centerLng = coordinates.reduce((sum, point) => sum + point.lng, 0) / coordinates.length;
              
              polygons.push({
                id: farmer.v_id,
                name: farmer.attributes.name || farmer.v_id,
                coordinates: coordinates,
                center: { lat: centerLat, lng: centerLng },
                attributes: farmer.attributes
              });
            }
          }
        } catch (error) {
          console.error('Error parsing polygon data for farmer:', farmer.v_id, error);
        }
      });
    }
    
    setFarmPolygons(polygons);
  }, [data]);

  // Map load callback
  const onLoad = useCallback(function callback(map) {
    if (farmPolygons.length > 0) {
      // Create bounds to fit all polygons
      const bounds = new window.google.maps.LatLngBounds();
      
      farmPolygons[0].coordinates.forEach(point => {
        bounds.extend(new window.google.maps.LatLng(point.lat, point.lng));
      });
      
      map.fitBounds(bounds);
    }
    setMap(map);
  }, [farmPolygons]);

  // Map unmount callback
  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  // Handle polygon click
  const handlePolygonClick = (farm) => {
    setSelectedFarm(farm);
    setInfoPosition(farm.center);
  };

  // Close info window
  const handleInfoClose = () => {
    setSelectedFarm(null);
    setInfoPosition(null);
  };

  // Show loading message if Maps API is not yet loaded
  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps...</div>;
  }

  // If no polygons found, display a message
  if (farmPolygons.length === 0) {
    return <div className="no-farms-message">No farm boundaries available</div>;
  }

  return (
    <div className="farm-map-google-container">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={farmPolygons.length > 0 ? farmPolygons[0].center : defaultCenter}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {farmPolygons.map((farm) => (
          <Polygon
            key={farm.id}
            paths={farm.coordinates}
            options={polygonOptions}
            onClick={() => handlePolygonClick(farm)}
          />
        ))}

        {selectedFarm && infoPosition && (
          <InfoWindow
            position={infoPosition}
            onCloseClick={handleInfoClose}
          >
            <div className="farm-info">
              <h3>{selectedFarm.name}</h3>
              <p>ID: {selectedFarm.id}</p>
              {Object.entries(selectedFarm.attributes).map(([key, value]) => (
                key !== 'polygon' && (
                  <div key={key} className="attribute-row">
                    <span className="attribute-key">{key}: </span>
                    <span className="attribute-value">
                      {typeof value === 'boolean' 
                        ? value ? '✓' : '✗' 
                        : String(value)}
                    </span>
                  </div>
                )
              ))}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default FarmMapGoogle;