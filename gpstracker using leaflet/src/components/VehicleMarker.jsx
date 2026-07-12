import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Create a custom SVG marker icon based on the vehicle's theme color
const createVehicleIcon = (color, status) => {
  // Use a modern pulsing background if on delivery or active
  const pulseClass = status === 'On Delivery' ? 'ping-pulse' : '';
  
  return L.divIcon({
    html: `
      <div class="marker-container">
        ${status === 'On Delivery' ? `<span class="marker-ping" style="background-color: ${color};"></span>` : ''}
        <div class="marker-icon" style="border-color: ${color}; color: ${color};">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <!-- Sleek Truck Icon -->
            <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </div>
        <div class="marker-arrow" style="border-top-color: ${color};"></div>
      </div>
    `,
    className: 'custom-leaflet-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40], // Anchor is at bottom-middle of the container
    popupAnchor: [0, -42],
  });
};

const VehicleMarker = ({ vehicle }) => {
  const { truckNo, driver, status, color, position } = vehicle;
  const icon = createVehicleIcon(color, status);

  return (
    <Marker position={position} icon={icon}>
      <Popup className="custom-popup">
        <div className="popup-content">
          <div className="popup-header" style={{ borderBottomColor: color }}>
            <span className="truck-icon" style={{ backgroundColor: `${color}15`, color: color }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </span>
            <div className="header-text">
              <h3>{truckNo}</h3>
              <p>GPS Live Telemetry</p>
            </div>
          </div>
          <div className="popup-body">
            <div className="info-row">
              <span className="info-label">Driver</span>
              <span className="info-value driver-name">{driver}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Status</span>
              <span 
                className="status-badge" 
                style={{ 
                  backgroundColor: `${color}15`, 
                  color: color,
                  borderColor: `${color}30`
                }}
              >
                {status}
              </span>
            </div>
            <div className="info-row coordinates">
              <span className="info-label">Location</span>
              <div className="coord-values">
                <span>Lat: <strong>{position[0].toFixed(5)}</strong></span>
                <span>Lng: <strong>{position[1].toFixed(5)}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default VehicleMarker;
