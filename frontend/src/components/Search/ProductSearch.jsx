import React, { useState, useEffect } from 'react';
import LeafletMap from '../Map/LeafletMap';
import React, { useRef } from 'react';
import { searchService } from '../../services/search';

const ProductSearch = () => {
  const [query, setQuery] = useState('');
  const [userLocation, setUserLocation] = useState({ lat: 28.6139, lng: 77.2090 }); // Default: Delhi
  const [locationStatus, setLocationStatus] = useState('Getting your location...');
  const [results, setResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState(5000); // meters
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
      const res = await searchService.searchProducts({
        query,
        lat: userLocation.lat,
        lng: userLocation.lng,
        distance
      });
      // Group results by merchant/shop
      const shops = {};
      res.results.forEach(item => {
        if (!shops[item.merchant_id]) {
          shops[item.merchant_id] = {
            id: item.merchant_id,
            name: item.shop_name,
            address: item.address || '',
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
    // Optionally, scroll to map
    document.getElementById('leaflet-map')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">What are you looking for?</h2>
          <p className="text-gray-600">Search for products and find nearby shops that have them in stock</p>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="relative flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for products (e.g., Teddy Bear, Shampoo, Books...)"
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
              <input
                type="number"
                value={distanceUnit === 'km' ? distance / 1000 : distance}
                min={1}
                max={distanceUnit === 'km' ? 50 : 50000}
                onChange={e => {
                  const val = Number(e.target.value);
                  setDistance(distanceUnit === 'km' ? val * 1000 : val);
                }}
                className="w-28 px-2 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                placeholder={distanceUnit}
                title={`Distance in ${distanceUnit}`}
              />
              <select
                value={distanceUnit}
                onChange={e => {
                  const newUnit = e.target.value;
                  setDistanceUnit(newUnit);
                  // Convert value to new unit
                  setDistance(newUnit === 'km' ? Math.round(distance / 1000) * 1000 : distance);
                }}
                className="px-2 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                style={{ width: 80 }}
              >
                <option value="km">km</option>
                <option value="m">meters</option>
              </select>
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔍 Search
            </button>
          </div>
          <div className="flex items-center justify-center mt-4 text-sm text-gray-500 gap-4">
            <span className="mr-2">📍</span>
            <span>{locationStatus}</span>
              <span className="ml-4">Distance: {distanceUnit === 'km' ? distance/1000 : distance} {distanceUnit}</span>
            <button
              type="button"
              className="btn btn-secondary ml-4"
              onClick={handleUseMyLocation}
            >
              Use My Current Location
            </button>
          </div>
        </div>
      </div>
      {/* Results Section */}
      {loading && <div className="text-center py-8">Searching...</div>}
      {!loading && results.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-8" id="resultsSection">
          {/* Map */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📍 Nearby Shops</h3>
            <LeafletMap ref={mapRef} center={[userLocation.lat, userLocation.lng]} markers={markers} />
          </div>
          {/* Shop List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🏪 Available at</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.map(shop => {
                const matchingProducts = shop.products.filter(product =>
                  product.name.toLowerCase().includes(query.toLowerCase()) && product.quantity > 0
                );
                return (
                    <div key={shop.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleShopClick(shop)}>
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
                      {matchingProducts.map(product => (
                        <div key={product.name} className="flex justify-between items-center bg-gray-50 rounded p-2">
                          <span className="font-medium">{product.name}</span>
                          <div className="text-right">
                            <div className="font-bold text-green-600">₹{product.price}</div>
                            <div className="text-xs text-gray-500">{product.quantity} in stock</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-sm gap-2">
                      <span className="text-blue-600">📞 {shop.phone}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* No Results */}
      {noResults && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center mt-8">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No shops found</h3>
          <p className="text-gray-600">Try searching for a different product or check back later as more merchants join StockSpot!</p>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
