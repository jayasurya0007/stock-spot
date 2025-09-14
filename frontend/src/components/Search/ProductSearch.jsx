import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LeafletMap from '../Map/LeafletMap';
import { searchService } from '../../services/search';
import { LoadingSpinner } from '../Loading';
import { Search, Locate, MapPin, Phone, ArrowLeft } from 'lucide-react';

const ProductSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [userLocation, setUserLocation] = useState({ lat: 28.6139, lng: 77.2090 });
  const [locationStatus, setLocationStatus] = useState('Getting your location...');
  const [results, setResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState(5);
  const [distanceUnit, setDistanceUnit] = useState('km');
  const mapRef = useRef();

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus('Location detected ✓');
        },
        () => setLocationStatus('Using default location (Delhi)')
      );
    } else {
      setLocationStatus('Using default location (Delhi)');
    }
  }, []);

  // Handler for manual location update
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      setLocationStatus('Getting your location...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus('Location detected ✓');
        },
        () => setLocationStatus('Failed to get location')
      );
    } else {
      setLocationStatus('Geolocation not supported');
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setNoResults(false);
    try {
      // Convert distance to meters based on unit
      const distanceInMeters = distanceUnit === 'km' ? distance * 1000 : distance;
      
      const res = await searchService.searchProducts({
        query,
        lat: userLocation.lat,
        lng: userLocation.lng,
        distance: distanceInMeters
      });
      
      // Group results by merchant/shop
      const shops = {};
      res.results.forEach(item => {
        if (!shops[item.merchant_id]) {
          shops[item.merchant_id] = {
            id: item.merchant_id,
            name: item.shop_name,
            address: item.address || '',
            phone: item.phone || '',
            lat: item.latitude,
            lng: item.longitude,
            products: [],
            distance: item.distance
          };
        }
        shops[item.merchant_id].products.push({
          name: item.name,
          price: item.price,
          quantity: item.quantity
        });
      });
      
      const shopList = Object.values(shops).sort((a, b) => a.distance - b.distance);
      setResults(shopList);
      setNoResults(shopList.length === 0);
    } catch (err) {
      setNoResults(true);
    }
    setLoading(false);
  };

  // Prepare markers for map
  const markers = results.map(shop => ({
    position: [shop.lat, shop.lng],
    popup: `<b>${shop.name}</b><br/>${shop.address || ''}<br/>${shop.distance ? (shop.distance/1000).toFixed(2) + ' km away' : ''}`
  }));

  // Center map on shop when clicked
  const handleShopClick = (shop) => {
    if (mapRef.current && mapRef.current.setView) {
      mapRef.current.setView([shop.lat, shop.lng], 15);
    }
    // Scroll to map
    document.getElementById('leaflet-map')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mr-4"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Product Search</h1>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">What are you looking for?</h2>
            <p className="text-gray-600">Search for products and find nearby shops that have them in stock</p>
          </div>
          
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search for products (e.g., Teddy Bear, Shampoo, Books...)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="small" color="white" />
                ) : (
                  <Search size={18} />
                )}
                Search
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Search within:</span>
                <input
                  type="number"
                  value={distanceUnit === 'km' ? distance : distance / 1000}
                  min={1}
                  max={distanceUnit === 'km' ? 50 : 50000}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setDistance(distanceUnit === 'km' ? val : val * 1000);
                  }}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
                <select
                  value={distanceUnit}
                  onChange={e => {
                    const newUnit = e.target.value;
                    setDistanceUnit(newUnit);
                    // Convert value to new unit
                    if (newUnit === 'km') {
                      setDistance(distance / 1000);
                    } else {
                      setDistance(distance * 1000);
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                >
                  <option value="km">km</option>
                  <option value="m">meters</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} />
                <span>{locationStatus}</span>
              </div>
              
              <button
                onClick={handleUseMyLocation}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                <Locate size={16} />
                Use My Current Location
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <LoadingSpinner size="large" text="Searching for products..." />
          </div>
        )}
        
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="resultsSection">
            {/* Map */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📍 Nearby Shops</h3>
              <div className="h-96 rounded-lg overflow-hidden">
                <LeafletMap 
                  ref={mapRef} 
                  center={[userLocation.lat, userLocation.lng]} 
                  markers={markers} 
                />
              </div>
            </div>
            
            {/* Shop List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🏪 Available at ({results.length} shops)</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {results.map(shop => {
                  const matchingProducts = shop.products.filter(product =>
                    product.name.toLowerCase().includes(query.toLowerCase()) && product.quantity > 0
                  );
                  
                  return (
                    <div 
                      key={shop.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleShopClick(shop)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">{shop.name}</h4>
                          <p className="text-sm text-gray-600">{shop.address}</p>
                        </div>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          {matchingProducts.length} item{matchingProducts.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        {matchingProducts.map((product, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                            <span className="font-medium text-gray-900">{product.name}</span>
                            <div className="text-right">
                              <div className="font-bold text-green-600">${product.price}</div>
                              <div className="text-xs text-gray-500">{product.quantity} in stock</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {shop.phone && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Phone size={14} />
                          <span>{shop.phone}</span>
                        </div>
                      )}
                      
                      {shop.distance && (
                        <div className="text-xs text-gray-500 mt-2">
                          {(shop.distance / 1000).toFixed(2)} km away
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* No Results */}
        {noResults && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No shops found</h3>
            <p className="text-gray-600 mb-4">
              Try searching for a different product or check back later as more merchants join StockSpot!
            </p>
            <button
              onClick={() => {
                setQuery('');
                setNoResults(false);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Try Another Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSearch;