import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { merchantService } from '../../services/merchants';

const MapView = () => {
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <div className="loading">Loading map data...</div>;
  if (error) return <div className="error">{error}</div>;

  // Center on first merchant if available, else Chennai
  const defaultCenter = merchants.length > 0
    ? { lat: merchants[0].latitude, lng: merchants[0].longitude }
    : { lat: 13.0827, lng: 80.2707 };

  return (
    <div className="container">
      <h1>Merchant Map View</h1>
      <div className="map-container">
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <Map
            defaultZoom={10}
            defaultCenter={defaultCenter}
            mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
            gestureHandling={'greedy'}
            disableDefaultUI={true}
          >
            {merchants.map(merchant => (
              <AdvancedMarker
                key={merchant.id}
                position={{ lat: merchant.latitude, lng: merchant.longitude }}
                onClick={() => setSelectedMerchant(merchant)}
              >
                <Pin
                  background={'#22ccff'}
                  borderColor={'#1e89a1'}
                  glyphColor={'#0f677a'}
                />
              </AdvancedMarker>
            ))}
            {selectedMerchant && (
              <InfoWindow
                position={{ 
                  lat: selectedMerchant.latitude, 
                  lng: selectedMerchant.longitude 
                }}
                onCloseClick={() => setSelectedMerchant(null)}
              >
                <div>
                  <h3>{selectedMerchant.shop_name}</h3>
                  <p>{selectedMerchant.address}</p>
                  <p>Products: {selectedMerchant.product_count}</p>
                  {selectedMerchant.products && selectedMerchant.products.length > 0 && (
                    <div>
                      <h4>Top Products:</h4>
                      <ul>
                        {selectedMerchant.products.slice(0, 3).map(product => (
                          <li key={product.name}>
                            {product.name} ({product.quantity} in stock)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>
    </div>
  );
};

export default MapView;