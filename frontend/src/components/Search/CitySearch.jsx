import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../../services/search';
import LeafletMap from '../Map/LeafletMap';
import { LoadingSpinner } from '../Loading';
import { ArrowLeft, MapPin, Navigation, ExternalLink, Building, X, Search, Locate } from 'lucide-react';

const CitySearch = () => {
  const navigate = useNavigate();
  const [cityName, setCityName] = useState('');
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [searchMethod, setSearchMethod] = useState('city');

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      );
    }
  }, []);

  const handleCitySearch = async (e) => {
    e.preventDefault();
    if (!cityName.trim()) {
      setError('Please enter a city name');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMerchants([]);
      
      const data = await searchService.searchMerchantsByCity(cityName);
      const merchantResults = data.merchants || [];
      setMerchants(merchantResults);
      
      if (merchantResults.length === 0) {
        setError(`No merchants found in ${cityName}. Please try a different city name.`);
      }
    } catch (err) {
      console.error('City search error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Search failed';
      setError(`Search failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = async () => {
    if (!userLocation.lat || !userLocation.lng) {
      setError('Unable to get your current location. Please enable location services or search by city name.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMerchants([]);
      
      const data = await searchService.searchMerchantsByLocation(userLocation.lat, userLocation.lng);
      const merchantResults = data.merchants || [];
      setMerchants(merchantResults);
      
      if (merchantResults.length === 0) {
        setError('No merchants found in your current area. Try expanding the search or use city search.');
      }
    } catch (err) {
      console.error('Location search error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Search failed';
      setError(`Search failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getMerchantProducts = async (merchantId) => {
    try {
      const data = await searchService.getMerchantProducts(merchantId);
      return data.products || [];
    } catch (err) {
      console.error('Failed to fetch merchant products:', err);
      return [];
    }
  };

  const handleMerchantClick = async (merchant) => {
    const products = await getMerchantProducts(merchant.id);
    setSelectedMerchant({ ...merchant, products });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/search')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mr-4"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Search Merchants</h1>
        </div>

        {/* Search Method Toggle */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Search Method:</h3>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors flex-1">
              <input
                type="radio"
                value="city"
                checked={searchMethod === 'city'}
                onChange={(e) => setSearchMethod(e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <Building size={18} />
              <span>Search by City Name</span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors flex-1">
              <input
                type="radio"
                value="location"
                checked={searchMethod === 'location'}
                onChange={(e) => setSearchMethod(e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <Locate size={18} />
              <span>Use Current Location</span>
            </label>
          </div>

          {searchMethod === 'city' ? (
            <form onSubmit={handleCitySearch} className="space-y-4">
              <div>
                <label htmlFor="cityName" className="block text-sm font-medium text-gray-700 mb-1">
                  City Name *
                </label>
                <input
                  type="text"
                  id="cityName"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  placeholder="e.g., New York, London, Tokyo"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="small" color="white" />
                ) : (
                  <Search size={18} />
                )}
                {loading ? 'Searching...' : 'Search Merchants'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                {userLocation.lat && userLocation.lng 
                  ? `Current location detected: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` 
                  : 'Getting your location...'
                }
              </p>
              <button 
                onClick={handleLocationSearch}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={loading || (!userLocation.lat || !userLocation.lng)}
              >
                {loading ? (
                  <LoadingSpinner size="small" color="white" />
                ) : (
                  <Locate size={18} />
                )}
                {loading ? 'Searching...' : 'Find Nearby Merchants'}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {merchants.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Found {merchants.length} Merchants
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {merchants.map((merchant) => (
                <div 
                  key={merchant.id} 
                  onClick={() => handleMerchantClick(merchant)}
                  className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
                >
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Building size={18} className="text-blue-600" />
                    {merchant.shop_name}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Owner:</span> {merchant.owner_name || 'N/A'}</p>
                    <p><span className="font-medium">Address:</span> {merchant.address || 'N/A'}</p>
                    <p><span className="font-medium">Phone:</span> {merchant.phone || 'N/A'}</p>
                    <p><span className="font-medium">Products Available:</span> {merchant.product_count || 0}</p>
                    {merchant.distance && (
                      <p><span className="font-medium">Distance:</span> {(merchant.distance / 1000).toFixed(2)} km away</p>
                    )}
                  </div>
                  <div className="mt-3 text-blue-600 font-medium flex items-center gap-1">
                    <span>View products and location</span>
                    <MapPin size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Merchant Details Modal */}
        {selectedMerchant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedMerchant.shop_name}</h2>
                <button 
                  onClick={() => setSelectedMerchant(null)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Merchant Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Merchant Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Owner:</span> {selectedMerchant.owner_name || 'N/A'}</p>
                    <p><span className="font-medium">Address:</span> {selectedMerchant.address || 'N/A'}</p>
                    <p><span className="font-medium">Phone:</span> {selectedMerchant.phone || 'N/A'}</p>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">
                    Available Products ({selectedMerchant.products?.length || 0})
                  </h3>
                  {selectedMerchant.products && selectedMerchant.products.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-auto">
                      {selectedMerchant.products.map((product, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                          <h4 className="font-medium text-gray-900 mb-1">{product.name}</h4>
                          <div className="flex justify-between text-sm">
                            <span><strong>Price:</strong> ${product.price}</span>
                            <span><strong>Quantity:</strong> {product.quantity}</span>
                          </div>
                          {product.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {product.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No products available</p>
                  )}
                </div>

                {/* Map */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Location</h3>
                  <div className="h-64 rounded-lg overflow-hidden mb-4">
                    <LeafletMap
                      center={[selectedMerchant.latitude, selectedMerchant.longitude]}
                      markers={[{
                        position: [selectedMerchant.latitude, selectedMerchant.longitude],
                        popup: `<b>${selectedMerchant.shop_name}</b><br/>${selectedMerchant.address || ''}`
                      }]}
                      key={selectedMerchant.id}
                    />
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMerchant.latitude},${selectedMerchant.longitude}${userLocation.lat && userLocation.lng ? `&origin=${userLocation.lat},${userLocation.lng}` : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Navigation size={16} />
                    Get Directions (Google Maps)
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitySearch;