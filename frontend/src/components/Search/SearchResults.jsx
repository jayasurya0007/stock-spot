import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { searchService } from '../../services/search';
import LeafletMap from '../Map/LeafletMap';
import { LoadingSpinner, SkeletonLoader } from '../Loading';

const SearchResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [exactMatches, setExactMatches] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapMerchant, setMapMerchant] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [searchType, setSearchType] = useState(null);
  const [lastQuery, setLastQuery] = useState('');

  // Get user location for directions
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      );
    }
  }, []);

  const handleSearch = async (searchData) => {
    console.log('Search initiated with data:', searchData);
    try {
      setLoading(true);
      setError('');
      setResults([]); // Clear previous results
      setExactMatches([]);
      setRelatedProducts([]);
      
      const data = await searchService.searchProducts(searchData);
      console.log('Search response:', data);
      
      const searchResults = data.results || [];
      const exactResults = data.exactMatches || [];
      const relatedResults = data.relatedProducts || [];
      
      console.log('Exact matches:', exactResults);
      console.log('Related products:', relatedResults);
      
      setResults(searchResults);
      setExactMatches(exactResults);
      setRelatedProducts(relatedResults);
      setSearchType(data.searchType);
      setLastQuery(searchData.query);
      
      if (searchResults.length === 0) {
        const searchType = data.searchType || 'unknown';
        if (searchType === 'location_only') {
          setError('No products found within the specified radius. Try expanding your search radius or check if there are any merchants in your area.');
        } else {
          setError('No products found matching your search criteria. Try expanding your search radius, using different keywords, or browse all products by leaving the search query empty.');
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Search failed';
      setError(`Search failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ 
      minHeight: '100vh',
      height: 'auto',
      padding: '20px',
      backgroundColor: '#ffffff',
      position: 'relative',
      overflow: 'visible'
    }}>
      <h1>Product Search</h1>
      
      {/* Alternative Search Options */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: '1rem', 
        marginBottom: '1.5rem' 
      }}>
        <button 
          onClick={() => navigate('/city-search')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🏙️ Search using the city
        </button>
      </div>
      
      <SearchBar onSearch={handleSearch} />
      
      {loading && (
        <div style={{ margin: '2rem 0' }}>
          <LoadingSpinner size="large" color="primary" text="Searching for products..." centered />
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <SkeletonLoader type="list" lines={3} />
          </div>
        </div>
      )}
      {error && <div className="error">{error}</div>}
      
      {!loading && !error && results.length === 0 && (
        <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
          <h3>Welcome to Product Search!</h3>
          <p>Enter a product name, set your location, and click "Search Products" to find items near you.</p>
          <div style={{ marginTop: '1rem' }}>
            <h4>Search Tips:</h4>
            <ul style={{ textAlign: 'left', display: 'inline-block' }}>
              <li>Try searching for common items like "rice", "bread", or "milk"</li>
              <li>Use the "Use Current Location" button for accurate results</li>
              <li>Increase the search radius if no results are found</li>
              <li>Check that there are merchants with products in your area</li>
            </ul>
          </div>
        </div>
      )}
      
      {(exactMatches.length > 0 || relatedProducts.length > 0) && (
        <>
          {/* Debug info */}
          <div style={{ padding: '10px', backgroundColor: '#e7f3ff', margin: '10px 0', borderRadius: '4px' }}>
            <strong>Debug:</strong> Found {exactMatches.length} exact matches, {relatedProducts.length} related products
          </div>
          
          {/* Scrollable Results Container */}
          <div className="search-results-container" style={{ 
            maxHeight: '70vh', 
            overflowY: 'scroll',
            border: '2px solid #007bff',
            backgroundColor: '#ffffff'
          }}>
            
            {/* Exact Matches Section */}
            {exactMatches.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  color: '#2c3e50', 
                  borderBottom: '3px solid #28a745', 
                  paddingBottom: '8px',
                  margin: '20px 0 15px 0',
                  fontSize: '1.5rem'
                }}>
                  🎯 Exact Matches ({exactMatches.length})
                </h2>
                
                {exactMatches.map((product, index) => (
                  <div key={`exact-${product.id || index}`} style={{
                    border: '2px solid #28a745',
                    borderRadius: '8px',
                    padding: '20px',
                    margin: '15px 0',
                    backgroundColor: '#f8fff9',
                    minHeight: '150px',
                    boxShadow: '0 2px 4px rgba(40, 167, 69, 0.1)'
                  }}>
                    <h3 style={{ color: '#2c3e50', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        backgroundColor: '#28a745', 
                        color: 'white', 
                        borderRadius: '50%', 
                        width: '24px', 
                        height: '24px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '12px' 
                      }}>
                        {index + 1}
                      </span>
                      {product.name}
                    </h3>
                    <p><strong>Price:</strong> ${product.price}</p>
                    <p><strong>Quantity:</strong> {product.quantity}</p>
                    <p><strong>Merchant:</strong> {product.shop_name}</p>
                    <p><strong>Distance:</strong> {(product.distance / 1000).toFixed(2)} km</p>
                    {product.description && <p><strong>Description:</strong> {product.description}</p>}
                    <button 
                      onClick={() => setMapMerchant(product)}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      📍 View Location
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
              <div>
                <h2 style={{ 
                  color: '#2c3e50', 
                  borderBottom: '3px solid #17a2b8', 
                  paddingBottom: '8px',
                  margin: '20px 0 15px 0',
                  fontSize: '1.3rem'
                }}>
                  🔍 Related Products ({relatedProducts.length})
                </h2>
                
                {relatedProducts.map((product, index) => (
                  <div key={`related-${product.id || index}`} style={{
                    border: '1px solid #17a2b8',
                    borderRadius: '8px',
                    padding: '18px',
                    margin: '12px 0',
                    backgroundColor: '#f8fdff',
                    minHeight: '140px',
                    boxShadow: '0 1px 3px rgba(23, 162, 184, 0.1)'
                  }}>
                    <h3 style={{ color: '#2c3e50', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        backgroundColor: '#17a2b8', 
                        color: 'white', 
                        borderRadius: '50%', 
                        width: '22px', 
                        height: '22px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '11px' 
                      }}>
                        {index + 1}
                      </span>
                      {product.name}
                    </h3>
                    <p><strong>Price:</strong> ${product.price}</p>
                    <p><strong>Quantity:</strong> {product.quantity}</p>
                    <p><strong>Merchant:</strong> {product.shop_name}</p>
                    <p><strong>Distance:</strong> {(product.distance / 1000).toFixed(2)} km</p>
                    <p><strong>Match:</strong> {(Math.max(0, (1 - product.similarity)) * 100).toFixed(1)}% similarity to your search</p>
                    {product.description && <p><strong>Description:</strong> {product.description}</p>}
                    <button 
                      onClick={() => setMapMerchant(product)}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      📍 View Location
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add some padding at the bottom */}
            <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              ⬆️ Scroll up to see more results
            </div>
          </div>
        </>
      )}
      {/* Modal for Merchant Location using Leaflet */}
      {mapMerchant && (
        <div className="modal" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 8, minWidth: 350, minHeight: 350, position: 'relative' }}>
            <button style={{ position: 'absolute', top: 10, right: 10 }} onClick={() => setMapMerchant(null)}>Close</button>
            <h3>{mapMerchant.shop_name} Location</h3>
            <LeafletMap
              center={[mapMerchant.latitude, mapMerchant.longitude]}
              markers={[{
                position: [mapMerchant.latitude, mapMerchant.longitude],
                popup: `<b>${mapMerchant.shop_name}</b>`
              }]}
              key={mapMerchant.id || mapMerchant.shop_name}
            />
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${mapMerchant.latitude},${mapMerchant.longitude}${userLocation.lat && userLocation.lng ? `&origin=${userLocation.lat},${userLocation.lng}` : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ display: 'inline-block', marginTop: 8 }}
              >
                Get Directions (Google Maps)
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;