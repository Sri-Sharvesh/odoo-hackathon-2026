import React, { useState, useEffect } from 'react';
import { initialVehicles } from './data/vehicles';
import FleetMap from './components/FleetMap';
import 'leaflet/dist/leaflet.css';

function App() {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [autoCenter, setAutoCenter] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  // Live simulation of GPS movement in different directions every second
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles((prevVehicles) =>
        prevVehicles.map((vehicle) => {
          let latDelta = 0;
          let lngDelta = 0;
          const speed = 0.0002; // Base speed factor
          
          // Add a tiny random jitter to make it feel like authentic live GPS telemetry
          const jitter = () => (Math.random() - 0.5) * 0.00004;

          switch (vehicle.id) {
            case 1:
              // Arjun moves North-East
              latDelta = speed * 0.8 + jitter();
              lngDelta = speed * 1.0 + jitter();
              break;
            case 2:
              // Rahul moves South-West
              latDelta = -speed * 0.9 + jitter();
              lngDelta = -speed * 0.7 + jitter();
              break;
            case 3:
              // Karthik moves North-West
              latDelta = speed * 0.6 + jitter();
              lngDelta = -speed * 1.1 + jitter();
              break;
            default:
              break;
          }

          return {
            ...vehicle,
            position: [
              vehicle.position[0] + latDelta,
              vehicle.position[1] + lngDelta,
            ],
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Compute live statistics for the dashboard header/sidebar
  const stats = {
    total: vehicles.length,
    onDelivery: vehicles.filter((v) => v.status === 'On Delivery').length,
    available: vehicles.filter((v) => v.status === 'Available').length,
    maintenance: vehicles.filter((v) => v.status === 'Maintenance').length,
  };

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || null;

  const handleVehicleSelect = (id) => {
    if (selectedVehicleId === id) {
      // Clear selection if clicked again
      setSelectedVehicleId(null);
    } else {
      setSelectedVehicleId(id);
      // Turn off general bounding-box auto-centering when focusing on a specific vehicle
      setAutoCenter(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Panel */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-section">
            <span className="live-pulse"></span>
            <h1>FLEET.TRACK</h1>
          </div>
          <p className="subtitle">Real-time GPS Dispatch Center</p>
        </div>

        {/* Fleet Metrics Row */}
        <section className="metrics-grid" aria-label="Fleet Metrics">
          <div className="metric-card total">
            <span className="metric-value">{stats.total}</span>
            <span className="metric-label">Total Fleet</span>
          </div>
          <div className="metric-card on-delivery">
            <span className="metric-value">{stats.onDelivery}</span>
            <span className="metric-label">Delivering</span>
          </div>
          <div className="metric-card available">
            <span className="metric-value">{stats.available}</span>
            <span className="metric-label">Available</span>
          </div>
          <div className="metric-card maintenance">
            <span className="metric-value">{stats.maintenance}</span>
            <span className="metric-label">Service</span>
          </div>
        </section>

        {/* Global Map Controls */}
        <div className="control-section">
          <h3>Map Controls</h3>
          <div className="toggle-container">
            <label className="toggle-switch" htmlFor="autocenter-toggle">
              <input
                id="autocenter-toggle"
                type="checkbox"
                checked={autoCenter}
                onChange={(e) => {
                  setAutoCenter(e.target.checked);
                  if (e.target.checked) setSelectedVehicleId(null); // Clear selected single tracking focus
                }}
              />
              <span className="slider"></span>
            </label>
            <div className="toggle-text">
              <span className="toggle-label">Auto-Center Map</span>
              <span className="toggle-desc">Fit all active vehicles in viewport</span>
            </div>
          </div>
        </div>

        {/* Vehicle List */}
        <div className="vehicle-list-wrapper">
          <h2 className="section-title">Vehicles ({vehicles.length})</h2>
          <div className="vehicle-list">
            {vehicles.map((vehicle) => {
              const isSelected = selectedVehicleId === vehicle.id;
              return (
                <div
                  key={vehicle.id}
                  className={`vehicle-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleVehicleSelect(vehicle.id)}
                  style={{ '--hover-color': vehicle.color }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleVehicleSelect(vehicle.id);
                    }
                  }}
                >
                  <div className="card-header">
                    <span 
                      className="status-dot" 
                      style={{ backgroundColor: vehicle.color }}
                    ></span>
                    <span className="truck-plate">{vehicle.truckNo}</span>
                    <span 
                      className="card-status-badge" 
                      style={{ color: vehicle.color, backgroundColor: `${vehicle.color}12` }}
                    >
                      {vehicle.status}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="info-item">
                      <span className="info-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      <span className="info-text">{vehicle.driver}</span>
                    </div>
                    <div className="info-item location">
                      <span className="info-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </span>
                      <span className="info-text">
                        {vehicle.position[0].toFixed(5)}, {vehicle.position[1].toFixed(5)}
                      </span>
                    </div>
                  </div>
                  <div className="card-action">
                    <button className="track-btn" style={{ borderColor: vehicle.color, color: vehicle.color }}>
                      {isSelected ? 'Tracking Active' : 'Fly to Vehicle'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Map Viewport */}
      <main className="map-container-area">
        <FleetMap 
          vehicles={vehicles} 
          autoCenter={autoCenter} 
          selectedVehicle={selectedVehicle} 
        />
      </main>
    </div>
  );
}

export default App;
