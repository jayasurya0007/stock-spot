import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { merchantService } from '../../services/merchants';

// Fix for default markers in Leaflet with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = ({ publicView = false }) => {
  const [merchants, setMerchants] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');
  const [directionsRoute, setDirectionsRoute] = useState(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const navigate = useNavigate();

  // Create custom icons
  const createShopIcon = () => {
    return L.divIcon({
      html: `<div style="
        background-color: #e74c3c;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        z-index: 500;
        position: relative;
      ">🏪</div>`,
      className: 'custom-shop-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  const createUserIcon = () => {
    return L.divIcon({
      html: `<div style="
        background-color: #3498db;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 3px 6px rgba(0,0,0,0.4);
        animation: pulse 2s infinite;
        z-index: 1000;
        position: relative;
      "></div>`,
      className: 'custom-user-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setUserLocation(newLocation);
        setLocationLoading(false);
        
        // Zoom to user location if map is already initialized
        if (mapInstance.current) {
          mapInstance.current.setView([newLocation.lat, newLocation.lng], 16, {
            animate: true,
            duration: 1.0
          });
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const showDirections = (shopLat, shopLng, shopName) => {
    if (!userLocation) {
      alert('Please enable location access first by clicking "Find My Location"');
      return;
    }

    if (!mapInstance.current) return;

    // Clear existing route
    if (directionsRoute) {
      mapInstance.current.removeLayer(directionsRoute);
    }

    // Create a simple polyline between user location and shop
    const latlngs = [
      [userLocation.lat, userLocation.lng],
      [shopLat, shopLng]
    ];

    const route = L.polyline(latlngs, { 
      color: '#3498db', 
      weight: 4, 
      opacity: 0.8,
      dashArray: '10, 5'
    }).addTo(mapInstance.current);

    setDirectionsRoute(route);

    // Fit the map to show both points
    const group = new L.featureGroup([
      L.marker([userLocation.lat, userLocation.lng]),
      L.marker([shopLat, shopLng])
    ]);
    mapInstance.current.fitBounds(group.getBounds().pad(0.1));

    // Calculate approximate distance
    const distance = calculateDistance(userLocation.lat, userLocation.lng, shopLat, shopLng);
    
    // Show info popup
    L.popup()
      .setLatLng([shopLat, shopLng])
      .setContent(`
        <div style="text-align: center;">
          <h4 style="margin: 0 0 8px 0; color: #3498db;">🗺️ Directions to ${shopName}</h4>
          <p style="margin: 4px 0; color: #666;">Distance: ~${distance.toFixed(2)} km</p>
          <button onclick="window.clearDirections()" 
                  style="background: #e74c3c; color: white; border: none; padding: 6px 12px; 
                         border-radius: 4px; cursor: pointer; font-size: 12px; margin-top: 8px;">
            Clear Directions
          </button>
        </div>
      `)
      .openOn(mapInstance.current);
  };

  const clearDirections = () => {
    if (directionsRoute && mapInstance.current) {
      mapInstance.current.removeLayer(directionsRoute);
      setDirectionsRoute(null);
      mapInstance.current.closePopup();
    }
  };

  // Helper function to calculate distance between two points
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Function to open Google Maps with navigation
  const openGoogleMaps = (shopLat, shopLng, shopName, shopAddress) => {
    let googleMapsUrl;
    
    if (userLocation) {
      // If user location is available, show directions from user location to shop
      // This will open Google Maps with turn-by-turn navigation
      googleMapsUrl = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${shopLat},${shopLng}/@${shopLat},${shopLng},15z`;
    } else {
      // If no user location, open the shop location for viewing
      const query = shopName && shopAddress 
        ? encodeURIComponent(`${shopName}, ${shopAddress}`)
        : `${shopLat},${shopLng}`;
      googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    }
    
    // Open in new tab/window
    window.open(googleMapsUrl, '_blank');
  };

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

    // Get user location on component mount
    if (!publicView) {
      getCurrentLocation();
    }
  }, [publicView]);

  useEffect(() => {
    if (loading || !mapRef.current) return;
    
    // Only create the map once
    if (!mapInstance.current) {
      const center = userLocation 
        ? [userLocation.lat, userLocation.lng]
        : merchants.length > 0
        ? [merchants[0].latitude, merchants[0].longitude]
        : [13.0827, 80.2707]; // Default to Chennai, India
      
      // Set higher zoom for better initial view
      const initialZoom = userLocation ? 14 : merchants.length > 0 ? 13 : 11;
      const map = L.map(mapRef.current).setView(center, initialZoom);
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
    if (map._userMarker) {
      map.removeLayer(map._userMarker);
    }
    
    // Add new markers group
    const markerGroup = L.layerGroup();
    
    // Add shop markers first (they'll be at lower z-index)
    merchants.forEach(merchant => {
      const marker = L.marker([merchant.latitude, merchant.longitude], {
        icon: createShopIcon(),
        zIndexOffset: 100 // Lower z-index for shop markers
      });
      
      let popupContent = `
        <div style="min-width: 240px;">
          <h3 style="margin: 0 0 8px 0; color: #2c3e50;">${merchant.shop_name}</h3>
          ${merchant.address ? `<p style="margin: 4px 0; color: #666;">${merchant.address}</p>` : ''}
          ${merchant.owner_name ? `<p style="margin: 4px 0; color: #666;"><strong>Owner:</strong> ${merchant.owner_name}</p>` : ''}
          ${merchant.phone ? `<p style="margin: 4px 0; color: #666;"><strong>Phone:</strong> ${merchant.phone}</p>` : ''}
          <div style="margin-top: 12px; display: flex; gap: 6px; flex-wrap: wrap;">
            <button onclick="window.viewShopProducts(${merchant.id})" 
                    style="background: #3498db; color: white; border: none; padding: 6px 12px; 
                           border-radius: 4px; cursor: pointer; font-size: 13px; flex: 1; min-width: 100px;">
              View Products (${merchant.product_count || 0})
            </button>
            <button onclick="window.showDirections(${merchant.latitude}, ${merchant.longitude}, '${merchant.shop_name.replace(/'/g, "\\'")}')" 
                    style="background: #27ae60; color: white; border: none; padding: 6px 12px; 
                           border-radius: 4px; cursor: pointer; font-size: 13px; flex: 1; min-width: 100px;">
              🗺️ Directions
            </button>
            <button onclick="window.openGoogleMaps(${merchant.latitude}, ${merchant.longitude}, '${merchant.shop_name.replace(/'/g, "\\'")}', '${(merchant.address || '').replace(/'/g, "\\'")}')" 
                    style="background: #e67e22; color: white; border: none; padding: 6px 12px; 
                           border-radius: 4px; cursor: pointer; font-size: 13px; flex: 1; min-width: 100px;">
              📍 Google Maps
            </button>
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      markerGroup.addLayer(marker);
    });
    
    markerGroup.addTo(map);
    map._markerGroup = markerGroup;
    
    // Add user location marker last (it'll be on top)
    if (userLocation) {
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: createUserIcon(),
        zIndexOffset: 1000 // Higher z-index for user location
      });
      userMarker.bindPopup(`
        <div style="text-align: center;">
          <h4 style="margin: 0 0 8px 0; color: #3498db;">📍 Your Location</h4>
          <p style="margin: 0; color: #666;">Lat: ${userLocation.lat.toFixed(4)}</p>
          <p style="margin: 0; color: #666;">Lng: ${userLocation.lng.toFixed(4)}</p>
        </div>
      `);
      map._userMarker = userMarker;
      userMarker.addTo(map);
    }
    
    // Fit bounds to include all markers with smart zoom
    const allMarkers = [];
    if (merchants.length > 0) {
      allMarkers.push(...merchants.map(m => [m.latitude, m.longitude]));
    }
    if (userLocation) {
      allMarkers.push([userLocation.lat, userLocation.lng]);
    }
    
    if (allMarkers.length > 0) {
      const bounds = L.latLngBounds(allMarkers);
      
      // Smart zoom based on number of markers and area
      let maxZoom = 16;
      if (allMarkers.length === 1) {
        maxZoom = 15; // Single marker gets closer zoom
      } else if (allMarkers.length <= 3) {
        maxZoom = 14; // Few markers get medium zoom
      } else {
        maxZoom = 13; // Many markers get wider view
      }
      
      map.fitBounds(bounds, { 
        maxZoom: maxZoom,
        padding: [30, 30] // More padding for better visibility
      });
    } else {
      // No markers, show Chennai region with good zoom
      map.setView([13.0827, 80.2707], 11);
    }
    
    // Global functions for shop navigation and directions
    window.viewShopProducts = (merchantId) => {
      navigate(`/merchant/${merchantId}/products`);
    };

    window.showDirections = (shopLat, shopLng, shopName) => {
      showDirections(shopLat, shopLng, shopName);
    };

    window.clearDirections = () => {
      clearDirections();
    };

    window.openGoogleMaps = (shopLat, shopLng, shopName, shopAddress) => {
      openGoogleMaps(shopLat, shopLng, shopName, shopAddress);
    };

    // Cleanup on unmount
    return () => {
      // Clear directions if they exist
      if (directionsRoute && mapInstance.current) {
        mapInstance.current.removeLayer(directionsRoute);
      }
      
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      
      // Clean up global functions
      delete window.viewShopProducts;
      delete window.showDirections;
      delete window.clearDirections;
      delete window.openGoogleMaps;
    };
  }, [loading, merchants, userLocation, navigate]);

  if (loading) return <div className="loading">Loading map data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0 }}>
          {publicView ? 'Explore Shops' : 'Shop Locations'}
        </h1>
        
        {!publicView && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="btn btn-secondary"
              style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
            >
              {locationLoading ? 'Getting Location...' : userLocation ? '📍 Zoom to My Location' : '📍 Find My Location'}
            </button>
            
            {directionsRoute && (
              <button
                onClick={clearDirections}
                className="btn btn-danger"
                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
              >
                🗺️ Clear Directions
              </button>
            )}
            
            {userLocation && (
              <div style={{ 
                padding: '0.5rem 1rem', 
                background: '#e8f4fd', 
                borderRadius: '4px', 
                fontSize: '0.8rem',
                color: '#2c3e50'
              }}>
                Location found ✓
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {!publicView && userLocation && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                background: '#3498db', 
                borderRadius: '50%',
                border: '3px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                animation: 'pulse 2s infinite'
              }}></div>
              <span style={{ fontSize: '0.9rem', color: '#2c3e50', fontWeight: 'bold' }}>Your Location</span>
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '26px', 
              height: '26px', 
              background: '#e74c3c', 
              borderRadius: '50%', 
              border: '3px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '12px' 
            }}>🏪</div>
            <span style={{ fontSize: '0.9rem', color: '#2c3e50' }}>Shops ({merchants.length})</span>
          </div>
          
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            Click on shop markers to view their products
          </div>
        </div>
      </div>

      <div className="map-container" ref={mapRef} />
    </div>
  );
};

export default MapView;