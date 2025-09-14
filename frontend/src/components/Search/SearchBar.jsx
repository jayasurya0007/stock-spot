import React, { useState } from 'react';
import { Navigation, MapPin } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [distance, setDistance] = useState('5');
  const [distanceUnit, setDistanceUnit] = useState('km');
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!query || !lat || !lng || !distance) {
      alert('Please fill in all fields');
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

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    setGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toString());
        setLng(position.coords.longitude.toString());
        setGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        alert(errorMessage);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
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
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            disabled={gettingLocation}
          >
            {gettingLocation ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span>Getting Location...</span>
              </>
            ) : (
              <>
                <Navigation size={16} />
                <span>Use Current Location</span>
              </>
            )}
          </button>
        </div>
        
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
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 shadow-md"
        >
          Search Products
        </button>
      </form>
    </div>
  );
};

export default SearchBar;