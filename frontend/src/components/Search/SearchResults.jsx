import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { searchService } from '../../services/search';
import LeafletMap from '../Map/LeafletMap';
import { LoadingSpinner } from '../Loading';
import { MapPin, Navigation, ExternalLink, Building, X } from 'lucide-react';

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

  // Helper functions for match percentage display
  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (percentage >= 60) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (percentage >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (percentage >= 20) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getMatchLevelFromPercentage = (percentage) => {
    if (percentage >= 80) return 'very high';
    if (percentage >= 60) return 'high';
    if (percentage >= 40) return 'medium';
    if (percentage >= 20) return 'low';
    return 'very low';
  };

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
      setResults([]);
      setExactMatches([]);
      setRelatedProducts([]);
      
      const data = await searchService.searchProducts(searchData);
      console.log('Search response:', data);
      
      const searchResults = data.results || [];
      const exactResults = data.exactMatches || [];
      const relatedResults = data.relatedProducts || [];
      
      console.log('Exact matches:', exactResults);
      console.log('Related products:', relatedResults);
      
      // Sort related products by match percentage in descending order
      const sortedRelatedResults = [...relatedResults].sort((a, b) => {
        const aMatch = a.match_percentage || (Math.max(0, (1 - a.similarity)) * 100);
        const bMatch = b.match_percentage || (Math.max(0, (1 - b.similarity)) * 100);
        return bMatch - aMatch;
      });
      
      setResults(searchResults);
      setExactMatches(exactResults);
      setRelatedProducts(sortedRelatedResults);
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Product Search</h1>
        
        {/* Alternative Search Options */}
        <div className="flex justify-center mb-6">
          <button 
            onClick={() => navigate('/city-search')}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Building size={18} />
            Search using the city
          </button>
        </div>
        
        <SearchBar onSearch={handleSearch} />
        
        {loading && (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <LoadingSpinner size="large" text="Searching for products..." />
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {!loading && !error && results.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Welcome to Product Search!</h3>
            <p className="text-gray-600 mb-4">Enter a product name, set your location, and click "Search Products" to find items near you.</p>
            <div className="text-left max-w-md mx-auto">
              <h4 className="font-medium text-gray-900 mb-2">Search Tips:</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
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
            {/* Results Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-medium">
                Found {exactMatches.length} exact matches and {relatedProducts.length} related products for "{lastQuery}"
              </p>
            </div>
            
            {/* Scrollable Results Container */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Exact Matches Section */}
              {exactMatches.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="bg-green-500 text-white p-1 rounded">🎯</span>
                    Exact Matches ({exactMatches.length})
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exactMatches.map((product, index) => (
                      <div key={`exact-${product.id || index}`} className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
                        <div className="flex justify-between items-start mb-3">
                          <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                            100% Match
                          </span>
                        </div>
                        
                        <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
                        
                        <div className="space-y-1 text-sm mb-3">
                          <p><span className="font-medium">Price:</span> ${product.price}</p>
                          <p><span className="font-medium">Quantity:</span> {product.quantity}</p>
                          <p><span className="font-medium">Merchant:</span> {product.shop_name}</p>
                          <p><span className="font-medium">Distance:</span> {(product.distance / 1000).toFixed(2)} km</p>
                        </div>
                        
                        {product.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            <span className="font-medium">Description:</span> {product.description}
                          </p>
                        )}
                        
                        <button 
                          onClick={() => setMapMerchant(product)}
                          className="w-full flex items-center justify-center gap-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
                        >
                          <MapPin size={14} />
                          View Location
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Products Section */}
              {relatedProducts.length > 0 && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="bg-blue-500 text-white p-1 rounded">🔍</span>
                    Related Products ({relatedProducts.length})
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedProducts.map((product, index) => {
                      const matchPercentage = product.match_percentage || (Math.max(0, (1 - product.similarity)) * 100);
                      const matchLevel = product.match_level || getMatchLevelFromPercentage(matchPercentage);
                      const matchColorClass = getMatchColor(matchPercentage);
                      
                      return (
                        <div key={`related-${product.id || index}`} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                          <div className="flex justify-between items-start mb-3">
                            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${matchColorClass}`}>
                              {matchPercentage.toFixed(1)}% Match
                            </span>
                          </div>
                          
                          <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
                          
                          <div className="space-y-1 text-sm mb-3">
                            <p><span className="font-medium">Price:</span> ${product.price}</p>
                            <p><span className="font-medium">Quantity:</span> {product.quantity}</p>
                            <p><span className="font-medium">Merchant:</span> {product.shop_name}</p>
                            <p><span className="font-medium">Distance:</span> {(product.distance / 1000).toFixed(2)} km</p>
                          </div>
                          
                          {product.description && (
                            <p className="text-sm text-gray-600 mb-3">
                              <span className="font-medium">Description:</span> {product.description}
                            </p>
                          )}
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setMapMerchant(product)}
                              className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                            >
                              <MapPin size={14} />
                              View Location
                            </button>
                          </div>
                          
                          <div className="mt-2 text-xs text-gray-500 text-center">
                            {matchLevel.replace('_', ' ')} similarity
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Modal for Merchant Location using Leaflet */}
        {mapMerchant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">{mapMerchant.shop_name} Location</h3>
                <button 
                  onClick={() => setMapMerchant(null)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="h-64 mb-4 rounded-lg overflow-hidden">
                <LeafletMap
                  center={[mapMerchant.latitude, mapMerchant.longitude]}
                  markers={[{
                    position: [mapMerchant.latitude, mapMerchant.longitude],
                    popup: `<b>${mapMerchant.shop_name}</b><br>${mapMerchant.name || ''}`
                  }]}
                  key={mapMerchant.id || mapMerchant.shop_name}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${mapMerchant.latitude},${mapMerchant.longitude}${userLocation.lat && userLocation.lng ? `&origin=${userLocation.lat},${userLocation.lng}` : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Navigation size={16} />
                  Get Directions (Google Maps)
                  <ExternalLink size={14} />
                </a>
                
                <button 
                  onClick={() => setMapMerchant(null)}
                  className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;