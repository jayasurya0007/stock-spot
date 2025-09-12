import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { merchantService } from '../../services/merchants';


const MapView = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const data = await merchantService.getMapData();
        setMerchants(data);
      } catch (err) {
        setError('Failed to fetch merchants');
      } finally {
        setLoading(false);
      }
    };
    fetchMerchants();
  }, []);

  useEffect(() => {
    if (loading || !mapRef.current) return;
    // Only create the map once
    if (!mapInstance.current) {
      const center = merchants.length > 0
        ? [merchants[0].latitude, merchants[0].longitude]
        : [13.0827, 80.2707];
      const map = L.map(mapRef.current).setView(center, 10);
      mapInstance.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
    }
    const map = mapInstance.current;
    // Remove existing markers
    if (map._markerGroup) {
      map.removeLayer(map._markerGroup);
    }
    // Add new markers
    const markerGroup = L.layerGroup();
    merchants.forEach(merchant => {
      const marker = L.marker([merchant.latitude, merchant.longitude]);
      let popupContent = `<b>${merchant.shop_name}</b><br/>`;
      if (merchant.address) popupContent += merchant.address + '<br/>';
      if (merchant.product_count !== undefined) popupContent += `Products: ${merchant.product_count}<br/>`;
      if (merchant.products && merchant.products.length > 0) {
        popupContent += '<b>Top Products:</b><ul>' + merchant.products.slice(0, 3).map(p => `<li>${p.name} (${p.quantity} in stock)</li>`).join('') + '</ul>';
      }
      marker.bindPopup(popupContent);
      markerGroup.addLayer(marker);
    });
    markerGroup.addTo(map);
    map._markerGroup = markerGroup;
    // Optionally, fit bounds to markers if merchants exist
    if (merchants.length > 0) {
      const bounds = L.latLngBounds(merchants.map(m => [m.latitude, m.longitude]));
      map.fitBounds(bounds, { maxZoom: 13 });
    }
    // Cleanup on unmount
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [loading, merchants]);

  if (loading) return <div className="loading">Loading map data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <h1>Merchant Map View</h1>
      <div className="map-container" style={{ height: 400, borderRadius: 12 }} ref={mapRef} />
      <p style={{marginTop: 12}}>All shops are shown on the map. Click a marker for shop details and top products.</p>
    </div>
  );
};

export default MapView;