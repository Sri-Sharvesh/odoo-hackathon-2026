import React from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import VehicleMarker from './VehicleMarker';

// Internal controller component to handle map viewport operations (flyTo, fitBounds)
const MapController = ({ vehicles, autoCenter, selectedVehicle }) => {
  const map = useMap();

  React.useEffect(() => {
    if (selectedVehicle) {
      // Focus on the explicitly selected vehicle
      map.setView(selectedVehicle.position, 14, {
        animate: true,
        duration: 0.8
      });
    } else if (autoCenter && vehicles.length > 0) {
      // Compute bounds for all vehicles to keep them all in view
      const bounds = L.latLngBounds(vehicles.map(v => v.position));
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 14, // Prevent zooming too close if all markers are close
        animate: true,
        duration: 0.5
      });
    }
  }, [vehicles, autoCenter, selectedVehicle, map]);

  return null;
};

const FleetMap = ({ vehicles, autoCenter, selectedVehicle }) => {
  // Default map center: Chennai Central
  const defaultCenter = [13.0827, 80.2707];
  const defaultZoom = 12;

  return (
    <div className="map-wrapper">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        scrollWheelZoom={true}
        zoomControl={false} // Disable standard top-left zoom controls so we can place them custom or just keep it clean
        className="leaflet-map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Custom Zoom Control at Bottom Right */}
        <CustomZoomControl />

        {/* Map Controller for dynamic flying & centering */}
        <MapController 
          vehicles={vehicles} 
          autoCenter={autoCenter} 
          selectedVehicle={selectedVehicle} 
        />

        {/* Render markers for each vehicle */}
        {vehicles.map((vehicle) => (
          <VehicleMarker key={vehicle.id} vehicle={vehicle} />
        ))}
      </MapContainer>
    </div>
  );
};

// Custom Zoom Control component to place zoom buttons at a better aesthetic position
const CustomZoomControl = () => {
  const map = useMap();
  
  return (
    <div className="custom-zoom-controls">
      <button 
        onClick={() => map.zoomIn()} 
        title="Zoom In"
        aria-label="Zoom In"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <button 
        onClick={() => map.zoomOut()} 
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
};

export default FleetMap;
