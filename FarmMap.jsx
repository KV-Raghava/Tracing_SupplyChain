import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
// This is needed because Leaflet's default marker icons use relative paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const FarmMap = ({ data }) => {
  const [farmPolygons, setFarmPolygons] = useState([]);
  const [mapCenter, setMapCenter] = useState([0, 0]);
  
  useEffect(() => {
    if (!data || data.length < 1) return;
    
    const polygons = [];
    let hasSetCenter = false;
    
    // Extract farmer data from the first object
    if (data[0]?.v_farmer) {
      data[0].v_farmer.forEach(farmer => {
        try {
          if (farmer.attributes?.polygon) {
            // Parse the polygon JSON string
            const polygonData = JSON.parse(farmer.attributes.polygon);
            
            if (polygonData.plot && polygonData.plot.length > 0) {
              // Convert to format needed by Leaflet ([lat, lng] pairs)
              const coordinates = polygonData.plot.map(point => [point.lat, point.lng]);
              
              polygons.push({
                id: farmer.v_id,
                name: farmer.attributes.name || farmer.v_id,
                coordinates: coordinates
              });
              
              // Set map center to the first point of the first polygon if not set
              if (!hasSetCenter && coordinates.length > 0) {
                setMapCenter(coordinates[0]);
                hasSetCenter = true;
              }
            }
          }
        } catch (error) {
          console.error('Error parsing polygon data for farmer:', farmer.v_id, error);
        }
      });
    }
    
    setFarmPolygons(polygons);
  }, [data]);
  
  // If no polygons found, display a message
  if (farmPolygons.length === 0) {
    return <div className="no-farms-message">No farm boundaries available</div>;
  }
  
  return (
    <div className="farm-map-container" style={{ height: '400px', width: '100%' }}>
      <MapContainer
        center={mapCenter}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {farmPolygons.map(farm => (
          <Polygon
            key={farm.id}
            positions={farm.coordinates}
            pathOptions={{
              color: '#4CAF50',
              weight: 2,
              fillColor: '#4CAF50',
              fillOpacity: 0.2
            }}
          >
            <Tooltip sticky>
              <div>
                <strong>{farm.name}</strong>
                <div>ID: {farm.id}</div>
              </div>
            </Tooltip>
          </Polygon>
        ))}
      </MapContainer>
    </div>
  );
};

export default FarmMap;