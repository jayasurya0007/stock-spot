import React, { useState } from 'react';
import { Navigation, MapPin, AlertCircle } from 'lucide-react';
import { getCurrentLocation, popularCityCoordinates } from '../../utils/geolocation';
import MobileAlert from '../UI/MobileAlert';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [distance, setDistance] = useState('5');
  const [distanceUnit, setDistanceUnit] = useState('km');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!query || !lat || !lng || !distance) {
      setAlertConfig({
        type: 'error',
        title: 'Missing Information',
        message: 'Please fill in all fields:\n• Product name\n• Your location (latitude & longitude)\n• Search distance'
      });
      setShowAlert(true);
      return;
    }
    
    // Convert distance to meters based on selected unit
    const distanceInMeters = distanceUnit === 'km' 
      ? parseFloat(distance) * 1000 
      : parseFloat(distance);
    
    onSearch({
      query,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      distance: distanceInMeters
    });
  };

  const handleUseCurrentLocation = async () => {
    try {
      setGettingLocation(true);
      setLocationError('');
      
      const location = await getCurrentLocation();
      
      setLat(location.latitude.toString());
      setLng(location.longitude.toString());
      setGettingLocation(false);
      setShowCitySelector(false);
    } catch (error) {
      setGettingLocation(false);
      setLocationError(error.userMessage);
      
      // Show city selector as fallback
      setShowCitySelector(true);
    }
  };

  const handleCitySelect = (cityKey) => {
    const city = popularCityCoordinates[cityKey];
    if (city) {
      setLat(city.lat.toString());
      setLng(city.lng.toString());
      setLocationError('');
      setShowCitySelector(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Search Products</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
            Search Query *
          </label>
          <input
            type="text"
            id="query"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you looking for?"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-1">
              Latitude *
            </label>
            <input
              type="number"
              id="lat"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              step="any"
              placeholder="e.g., 13.0827"
              required
            />
          </div>
          
          <div>
            <label htmlFor="lng" className="block text-sm font-medium text-gray-700 mb-1">
              Longitude *
            </label>
            <input
              type="number"
              id="lng"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              step="any"
              placeholder="e.g., 80.2707"
              required
            />
          </div>
        </div>
        
        <div>
          <button 
            type="button" 
            onClick={handleUseCurrentLocation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={gettingLocation}
          >
            {gettingLocation ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Getting Location...</span>
              </>
            ) : (
              <>
                <Navigation size={16} />
                <span>Use My Current Location</span>
              </>
            )}
          </button>
        </div>

        {/* Location Error Message */}
        {locationError && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900 mb-2">Location Access Issue</h4>
                <p className="text-sm text-orange-800 mb-3 whitespace-pre-line">{locationError}</p>
                <button
                  type="button"
                  onClick={() => setShowCitySelector(!showCitySelector)}
                  className="text-sm bg-orange-600 text-white px-3 py-1 rounded font-medium hover:bg-orange-700 transition-colors"
                >
                  {showCitySelector ? 'Hide' : 'Choose'} Popular Cities
                </button>
              </div>
            </div>
          </div>
        )}

        {/* City Selector */}
        {showCitySelector && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">📍 Select Your City</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.keys(popularCityCoordinates).map((cityKey) => (
                <button
                  key={cityKey}
                  type="button"
                  onClick={() => handleCitySelect(cityKey)}
                  className="text-left p-2 bg-white border border-blue-200 rounded hover:bg-blue-100 transition-colors text-sm"
                >
                  <div className="font-medium text-blue-900">{cityKey}</div>
                  <div className="text-xs text-blue-600">{popularCityCoordinates[cityKey].name}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-blue-600 mt-2">Don't see your city? Enter coordinates manually above.</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">
              Search Radius *
            </label>
            <input
              type="number"
              id="distance"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              min="0.1"
              step="0.1"
              placeholder="e.g., 5"
              required
            />
          </div>
          
          <div>
            <label htmlFor="distanceUnit" className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              id="distanceUnit"
              value={distanceUnit}
              onChange={(e) => setDistanceUnit(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            >
              <option value="meters">Meters</option>
              <option value="km">Kilometers</option>
            </select>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 shadow-md"
        >
          Search Products
        </button>
      </form>

      {/* Mobile-friendly Alert */}
      <MobileAlert
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        actions={alertConfig.actions}
      />
    </div>
  );
};

export default SearchBar;