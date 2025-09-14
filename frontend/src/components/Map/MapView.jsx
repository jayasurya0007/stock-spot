import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { merchantService } from '../../services/merchants';
import { LoadingSpinner } from '../Loading';
import '../../styles/MapView.css';

// Better default locations for major Indian cities (city-level zoom)
const getDefaultLocation = () => {
  // You can enhance this to detect user's timezone or use IP-based location
  // For now, using Chennai as default but with better zoom
  return {
    coords: [13.0827, 80.2707], // Chennai
    zoom: 13,
    name: 'Chennai, India'
  };
};

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
      html: `<div class="shop-marker">
        <span>🏪</span>
      </div>`,
      className: 'custom-shop-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  const createUserIcon = () => {
    return L.divIcon({
      html: `<div class="user-marker">
        <div class="user-location-dot"></div>
        <div class="user-location-pulse"></div>
      </div>`,
      className: 'custom-user-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  const zoomToUserLocation = () => {
    if (userLocation && mapInstance.current) {
      // Clear any existing directions when zooming to user location
      if (directionsRoute) {
        mapInstance.current.removeLayer(directionsRoute);
        setDirectionsRoute(null);
      }
      
      mapInstance.current.setView([userLocation.lat, userLocation.lng], 18, {
        animate: true,
        duration: 1.5
      });
      
      // Show a temporary popup at user location
      L.popup()
        .setLatLng([userLocation.lat, userLocation.lng])
        .setContent(`
          <div class="user-location-popup">
            <h4>📍 Your Current Location</h4>
            <p>Lat: ${userLocation.lat.toFixed(6)}</p>
            <p>Lng: ${userLocation.lng.toFixed(6)}</p>
            <small>Zoomed to street level view</small>
          </div>
        `)
        .openOn(mapInstance.current);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    // If user location already exists, just zoom to it
    if (userLocation) {
      zoomToUserLocation();
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
        
        // Zoom to user location if map is already initialized (this is from button click)
        if (mapInstance.current) {
          mapInstance.current.setView([newLocation.lat, newLocation.lng], 18, {
            animate: true,
            duration: 1.5
          });
          
          // Show a welcome popup for button-triggered location detection
          L.popup()
            .setLatLng([newLocation.lat, newLocation.lng])
            .setContent(`
              <div class="user-location-popup">
                <h4>🎯 Location Found!</h4>
                <p>Welcome to your location</p>
                <p>Lat: ${newLocation.lat.toFixed(6)}</p>
                <p>Lng: ${newLocation.lng.toFixed(6)}</p>
                <small>Click the button again to zoom here anytime</small>
              </div>
            `)
            .openOn(mapInstance.current);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationLoading(false);
        setError('Unable to retrieve your location. Please check your permissions.');
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
        <div class="map-popup">
          <h4>🗺️ Directions to ${shopName}</h4>
          <p>Distance: ~${distance.toFixed(2)} km</p>
          <button onclick="window.clearDirections()" class="map-btn map-btn-danger">
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

    // Get user location on component mount immediately for better initial view
    if (!publicView) {
      // Start location detection immediately without loading state for initial view
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(newLocation);
          },
          (error) => {
            console.log('Initial location detection failed, using default location');
            // Don't set error state for initial load, just use default
          },
          {
            enableHighAccuracy: true,
            timeout: 5000, // Shorter timeout for initial load
            maximumAge: 300000 // 5 minutes cache
          }
        );
      }
    }
  }, [publicView]);

  // Separate effect to update map view when user location changes
  useEffect(() => {
    if (userLocation && mapInstance.current && !publicView) {
      // If map is already initialized and we just got user location, smoothly transition to it
      mapInstance.current.setView([userLocation.lat, userLocation.lng], 14, {
        animate: true,
        duration: 2.0 // Smooth 2-second transition to user location
      });
    }
  }, [userLocation, publicView]);

  useEffect(() => {
    if (loading || !mapRef.current) return;
    
    // Only create the map once
    if (!mapInstance.current) {
      const defaultLocation = getDefaultLocation();
      const center = userLocation 
        ? [userLocation.lat, userLocation.lng]
        : merchants.length > 0
        ? [merchants[0].latitude, merchants[0].longitude]
        : defaultLocation.coords; // Use better default location
      
      // Set better zoom levels for city-level view instead of country-level
      const initialZoom = userLocation ? 14 : merchants.length > 0 ? 13 : defaultLocation.zoom;
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
        <div class="shop-popup">
          <h3>${merchant.shop_name}</h3>
          ${merchant.address ? `<p>${merchant.address}</p>` : ''}
          ${merchant.owner_name ? `<p><strong>Owner:</strong> ${merchant.owner_name}</p>` : ''}
          ${merchant.phone ? `<p><strong>Phone:</strong> ${merchant.phone}</p>` : ''}
          <div class="popup-buttons">
            <button onclick="window.viewShopProducts(${merchant.id})" class="map-btn map-btn-primary">
              View Products (${merchant.product_count || 0})
            </button>
            <button onclick="window.showDirections(${merchant.latitude}, ${merchant.longitude}, '${merchant.shop_name.replace(/'/g, "\\'")}')" class="map-btn map-btn-success">
              🗺️ Directions
            </button>
            <button onclick="window.openGoogleMaps(${merchant.latitude}, ${merchant.longitude}, '${merchant.shop_name.replace(/'/g, "\\'")}', '${(merchant.address || '').replace(/'/g, "\\'")}')" class="map-btn map-btn-warning">
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
        <div class="user-popup">
          <h4>📍 Your Location</h4>
          <p>Lat: ${userLocation.lat.toFixed(4)}</p>
          <p>Lng: ${userLocation.lng.toFixed(4)}</p>
        </div>
      `);
      map._userMarker = userMarker;
      userMarker.addTo(map);
    }
    
    // Smart bounds fitting - only if we don't have user location centered already
    const allMarkers = [];
    if (merchants.length > 0) {
      allMarkers.push(...merchants.map(m => [m.latitude, m.longitude]));
    }
    if (userLocation) {
      allMarkers.push([userLocation.lat, userLocation.lng]);
    }
    
    // Only fit bounds if we have multiple markers or no user location
    if (allMarkers.length > 1 && (!userLocation || merchants.length > 3)) {
      const bounds = L.latLngBounds(allMarkers);
      
      // Smart zoom based on number of markers and area
      let maxZoom = 16;
      if (allMarkers.length <= 3) {
        maxZoom = 14; // Few markers get medium zoom
      } else if (allMarkers.length <= 8) {
        maxZoom = 13; // Several markers get city-level view
      } else {
        maxZoom = 12; // Many markers get wider city view
      }
      
      map.fitBounds(bounds, { 
        maxZoom: maxZoom,
        padding: [30, 30] // More padding for better visibility
      });
    } else if (allMarkers.length === 0) {
      // No markers, show default city region with city-level zoom
      const defaultLocation = getDefaultLocation();
      map.setView(defaultLocation.coords, defaultLocation.zoom);
    }
    // If we have user location and few merchants, the map is already centered on user location
    
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

  if (loading) {
    return (
      <div className="map-loading-container">
        <div className="map-loading-header">
          <div className="skeleton-loader skeleton-text"></div>
        </div>
        <div className="map-loading-placeholder">
          <LoadingSpinner size="large" color="primary" text="Loading map data..." />
        </div>
      </div>
    );
  }
  
  if (error) return <div className="map-error">{error}</div>;

  return (
    <div className="map-view-container">
      <div className="map-header">
        <h1 className="map-title">
          {publicView ? 'Explore Shops' : 'Shop Locations'}
        </h1>
        
        {!publicView && (
          <div className="map-controls">
            <button
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="btn btn-secondary location-btn"
              title={userLocation ? "Zoom close to your current location (street level view)" : "Find and zoom to your current location"}
            >
              <div className="btn-content">
                {locationLoading && <LoadingSpinner size="small" color="white" />}
                {locationLoading ? 'Getting Location...' : userLocation ? '� Zoom Close to My Location' : '📍 Find My Location'}
              </div>
            </button>
            
            {directionsRoute && (
              <button
                onClick={clearDirections}
                className="btn btn-danger"
              >
                🗺️ Clear Directions
              </button>
            )}
            
            {userLocation && (
              <div className="location-status">
                Location found ✓
              </div>
            )}
          </div>
        )}
      </div>

      <div className="map-legend">
        <div className="legend-items">
          {!publicView && userLocation && (
            <div className="legend-item">
              <div className="user-location-dot"></div>
              <span>Your Location</span>
            </div>
          )}
          
          <div className="legend-item">
            <div className="shop-marker-legend">🏪</div>
            <span>Shops ({merchants.length})</span>
          </div>
          
          <div className="legend-hint">
            Click on shop markers to view their products
          </div>
        </div>
      </div>

      <div className="map-container" ref={mapRef} />
    </div>
  );
};

export default MapView;