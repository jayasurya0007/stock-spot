import React, { useState } from 'react';
import SearchBar from './SearchBar';
import { searchService } from '../../services/search';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapMerchant, setMapMerchant] = useState(null);

  const handleSearch = async (searchData) => {
    try {
      setLoading(true);
      setError('');
      const data = await searchService.searchProducts(searchData);
      setResults(data.results || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Product Search</h1>
      <SearchBar onSearch={handleSearch} />
      {loading && <div className="loading">Searching...</div>}
      {error && <div className="error">{error}</div>}
      {results.length > 0 && (
        <div>
          <h2>Search Results</h2>
          {results.map(product => (
            <div key={product.id} className="card">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p><strong>Price:</strong> ${product.price}</p>
              <p><strong>Quantity:</strong> {product.quantity}</p>
              <p><strong>Merchant:</strong> {product.shop_name}</p>
              <p><strong>Distance:</strong> {(product.distance / 1000).toFixed(2)} km</p>
              <button className="btn btn-secondary" onClick={() => setMapMerchant(product)}>
                View Merchant Location
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Modal for Google Map */}
      {mapMerchant && (
        <div className="modal" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 8, minWidth: 350, minHeight: 350, position: 'relative' }}>
            <button style={{ position: 'absolute', top: 10, right: 10 }} onClick={() => setMapMerchant(null)}>Close</button>
            <h3>{mapMerchant.shop_name} Location</h3>
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
              <Map
                defaultZoom={14}
                defaultCenter={{ lat: mapMerchant.latitude, lng: mapMerchant.longitude }}
                mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
                style={{ width: 320, height: 320 }}
                gestureHandling={'greedy'}
                disableDefaultUI={true}
              >
                <AdvancedMarker
                  position={{ lat: mapMerchant.latitude, lng: mapMerchant.longitude }}
                >
                  <Pin background={'#22ccff'} borderColor={'#1e89a1'} glyphColor={'#0f677a'} />
                </AdvancedMarker>
              </Map>
            </APIProvider>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;