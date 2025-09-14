import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/MapView.css';

const LeafletMap = React.forwardRef(({ center, markers }, ref) => {
  const containerRef = useRef(null);
  const mapInstance = useRef(null);

  // Fix for default markers in Leaflet
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Expose setView to parent via ref
  React.useImperativeHandle(ref, () => ({
    setView: (coords, zoom = 13) => {
      if (mapInstance.current) {
        mapInstance.current.setView(coords, zoom);
      }
    }
  }), []);

  useEffect(() => {
    // Remove any existing map instance
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }
    
    if (!containerRef.current) return;
    
    // Create map
    const map = L.map(containerRef.current).setView(center, 13);
    mapInstance.current = map;
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add markers
    markers.forEach(({ position, popup }) => {
      L.marker(position).addTo(map).bindPopup(popup);
    });
    
    // Cleanup on unmount
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [center, markers]);

  return (
    <div 
      ref={containerRef} 
      className="map-container"
    />
  );
});

export default LeafletMap;