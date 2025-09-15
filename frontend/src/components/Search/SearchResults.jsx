import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { MapPin, Navigation, ExternalLink, Building, X } from 'lucide-react';

// LoadingSpinner Component
const LoadingSpinner = ({ size = "medium", text = "Loading..." }) => {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12"
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
      {text && <p className="mt-2 text-gray-600">{text}</p>}
    </div>
  );
};

// LeafletMap Component (simplified for example)
const LeafletMap = ({ center, markers, key }) => {
  // This is a placeholder for the actual Leaflet map implementation
  return (
    <div className="w-full h-full bg-blue-100 flex items-center justify-center rounded-lg">
      <div className="text-center text-blue-800 p-4">
        <MapPin size={32} className="mx-auto mb-2" />
        <p className="font-semibold">Map View</p>
        <p className="text-sm">Center: {center[0]}, {center[1]}</p>
        <p className="text-xs">{markers.length} marker(s) displayed</p>
      </div>
    </div>
  );
};

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

  // Mock search service for demonstration
  const searchService = {
    searchProducts: async (searchData) => {
      // This is a mock implementation for demonstration
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            results: [],
            exactMatches: [],
            relatedProducts: [],
            searchType: 'standard'
          });
        }, 1500);
      });
    }
  };

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
    <div className="min-h-screen bg-gray-50 py-4 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Product Search</h1>
        
        {/* Alternative Search Options */}
        <div className="flex justify-center mb-4 md:mb-6">
          <button 
            onClick={() => navigate('/city-search')}
            className="flex items-center gap-2 px-4 py-2 md:py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm md:text-base"
          >
            <Building size={16} />
            Search using the city
          </button>
        </div>
        
        <SearchBar onSearch={handleSearch} />
        
        {loading && (
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 text-center">
            <LoadingSpinner size="large" text="Searching for products..." />
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 md:p-4 rounded-lg mb-4 md:mb-6 text-sm md:text-base">
            {error}
          </div>
        )}
        
        {!loading && !error && results.length === 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-200 p-4 md:p-6 lg:p-8 text-center">
            <div className="text-4xl md:text-6xl mb-3 md:mb-4">🛍️</div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">Find Products Near You!</h3>
            <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base lg:text-lg">Search for any product and discover local stores that have it in stock.</p>
            
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 max-w-lg mx-auto">
              <h4 className="font-semibold text-gray-900 mb-3 md:mb-4 flex items-center justify-center gap-2 text-sm md:text-base">
                <span>💡</span> How to Search
              </h4>
              <div className="space-y-2 md:space-y-3 text-left text-xs md:text-sm">
                <div className="flex items-start gap-2 md:gap-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs font-bold">1</span>
                  <span className="text-gray-700">Type what you're looking for (e.g., "bread", "milk", "phone")</span>
                </div>
                <div className="flex items-start gap-2 md:gap-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs font-bold">2</span>
                  <span className="text-gray-700">Click "Use Current Location" or enter your coordinates</span>
                </div>
                <div className="flex items-start gap-2 md:gap-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs font-bold">3</span>
                  <span className="text-gray-700">Set how far you're willing to travel</span>
                </div>
                <div className="flex items-start gap-2 md:gap-3">
                  <span className="bg-green-100 text-green-600 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs font-bold">✓</span>
                  <span className="text-gray-700">Hit "Search Products" and find nearby stores!</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {(exactMatches.length > 0 || relatedProducts.length > 0) && (
          <>
            {/* Results Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                <span className="text-xl md:text-2xl">🎉</span>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Search Results</h2>
              </div>
              <p className="text-gray-700 text-sm md:text-base">
                Great news! We found <span className="font-semibold text-green-700">{exactMatches.length} perfect matches</span>
                {relatedProducts.length > 0 && (
                  <> and <span className="font-semibold text-blue-700">{relatedProducts.length} similar products</span></>
                )} for "{lastQuery}" in your area.
              </p>
              <div className="flex items-center gap-2 mt-2 md:mt-3 text-xs md:text-sm text-gray-600">
                <span>💡</span>
                <span>Tap "View Store Location" to get directions to any store</span>
              </div>
            </div>
            
            {/* Scrollable Results Container */}
            <div className="space-y-4 md:space-y-6">
              {/* Exact Matches Section */}
              {exactMatches.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-green-50 px-4 md:px-6 py-3 md:py-4 border-b border-green-200">
                    <h2 className="text-base md:text-lg font-semibold text-green-900 flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Perfect Matches ({exactMatches.length})
                    </h2>
                    <p className="text-xs md:text-sm text-green-700 mt-1">These products exactly match what you're looking for</p>
                  </div>
                  
                  <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                    {exactMatches.map((product, index) => (
                      <div key={`exact-${product.id || index}`} className="bg-green-50 border border-green-200 rounded-xl p-3 md:p-4 hover:shadow-md transition-all">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2 md:mb-3">
                          <div className="flex-1 mb-2 md:mb-0">
                            <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-1">{product.name}</h3>
                            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-xs md:text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <span className="font-medium text-green-600">₹{product.price}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                📦 {product.quantity} available
                              </span>
                              <span className="flex items-center gap-1">
                                🏪 {product.shop_name}
                              </span>
                              <span className="flex items-center gap-1">
                                📍 {(product.distance / 1000).toFixed(1)} km away
                              </span>
                            </div>
                          </div>
                          <span className="bg-green-500 text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-medium self-start md:self-auto">
                            Perfect Match
                          </span>
                        </div>
                        
                        {product.description && (
                          <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3 bg-white p-2 md:p-3 rounded-lg border border-green-100">
                            {product.description}
                          </p>
                        )}
                        
                        <button 
                          onClick={() => setMapMerchant(product)}
                          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 md:py-3 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm md:text-base"
                        >
                          <MapPin size={14} />
                          View Store Location
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Products Section */}
              {relatedProducts.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-blue-50 px-4 md:px-6 py-3 md:py-4 border-b border-blue-200">
                    <h2 className="text-base md:text-lg font-semibold text-blue-900 flex items-center gap-2">
                      <span className="text-blue-600">🔍</span>
                      Similar Products ({relatedProducts.length})
                    </h2>
                    <p className="text-xs md:text-sm text-blue-700 mt-1">These products might also interest you</p>
                  </div>
                  
                  <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                    {relatedProducts.map((product, index) => {
                      const matchPercentage = product.match_percentage || (Math.max(0, (1 - product.similarity)) * 100);
                      const matchLevel = product.match_level || getMatchLevelFromPercentage(matchPercentage);
                      
                      // Simplified match display
                      const getSimpleMatchText = (percentage) => {
                        if (percentage >= 80) return { text: 'Very Similar', color: 'bg-green-100 text-green-800', icon: '⭐' };
                        if (percentage >= 60) return { text: 'Similar', color: 'bg-blue-100 text-blue-800', icon: '👍' };
                        if (percentage >= 40) return { text: 'Somewhat Similar', color: 'bg-yellow-100 text-yellow-800', icon: '👌' };
                        return { text: 'Might Match', color: 'bg-gray-100 text-gray-800', icon: '🤔' };
                      };
                      
                      const matchInfo = getSimpleMatchText(matchPercentage);
                      
                      return (
                        <div key={`related-${product.id || index}`} className="bg-blue-50 border border-blue-200 rounded-xl p-3 md:p-4 hover:shadow-md transition-all">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2 md:mb-3">
                            <div className="flex-1 mb-2 md:mb-0">
                              <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-1">{product.name}</h3>
                              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-xs md:text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <span className="font-medium text-blue-600">₹{product.price}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  📦 {product.quantity} available
                                </span>
                                <span className="flex items-center gap-1">
                                  🏪 {product.shop_name}
                                </span>
                                <span className="flex items-center gap-1">
                                  📍 {(product.distance / 1000).toFixed(1)} km away
                                </span>
                              </div>
                            </div>
                            <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-medium ${matchInfo.color} self-start md:self-auto`}>
                              {matchInfo.icon} {matchInfo.text}
                            </span>
                          </div>
                          
                          {product.description && (
                            <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3 bg-white p-2 md:p-3 rounded-lg border border-blue-100">
                              {product.description}
                            </p>
                          )}
                          
                          <button 
                            onClick={() => setMapMerchant(product)}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 md:py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm md:text-base"
                          >
                            <MapPin size={14} />
                            View Store Location
                          </button>
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
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 md:p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 md:p-6 rounded-t-xl sticky top-0">
                <div className="flex justify-between items-center">
                  <div className="max-w-[70%]">
                    <h3 className="text-lg md:text-xl font-bold truncate">{mapMerchant.shop_name}</h3>
                    <p className="text-blue-100 text-xs md:text-sm">📍 Store Location</p>
                  </div>
                  <button 
                    onClick={() => setMapMerchant(null)}
                    className="text-white hover:text-gray-200 p-1 md:p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4 md:p-6">
                <div className="h-48 md:h-64 mb-3 md:mb-4 rounded-lg overflow-hidden border border-gray-200">
                  <LeafletMap
                    center={[mapMerchant.latitude, mapMerchant.longitude]}
                    markers={[{
                      position: [mapMerchant.latitude, mapMerchant.longitude],
                      popup: `<b>${mapMerchant.shop_name}</b><br>${mapMerchant.name || ''}`
                    }]}
                    key={mapMerchant.id || mapMerchant.shop_name}
                  />
                </div>
                
                {/* Store Info */}
                <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
                    <div>
                      <span className="text-gray-600">Product:</span>
                      <p className="font-medium text-gray-900 truncate">{mapMerchant.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <p className="font-medium text-green-600">₹{mapMerchant.price}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Stock:</span>
                      <p className="font-medium text-gray-900">{mapMerchant.quantity} available</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Distance:</span>
                      <p className="font-medium text-blue-600">{(mapMerchant.distance / 1000).toFixed(1)} km away</p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-2 md:space-y-3">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${mapMerchant.latitude},${mapMerchant.longitude}${userLocation.lat && userLocation.lng ? `&origin=${userLocation.lat},${userLocation.lng}` : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 md:py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm md:text-base"
                  >
                    <Navigation size={16} />
                    Get Directions
                    <ExternalLink size={12} />
                  </a>
                  
                  <button 
                    onClick={() => setMapMerchant(null)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 md:py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm md:text-base"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;