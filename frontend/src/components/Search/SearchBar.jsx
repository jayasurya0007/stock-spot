import React, { useState } from 'react';

const SearchBar = ({ onSearch, userLocation, locationError }) => {
  const [query, setQuery] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [distance, setDistance] = useState(5000);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!query || !lat || !lng) {
      alert('Please fill in all fields');
      return;
    }
    
    onSearch({
      query,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      distance: parseInt(distance)
    });
  };

  const handleUseCurrentLocation = () => {
    setLocationSuccess('');
    if (userLocation.lat && userLocation.lng) {
      setLat(userLocation.lat.toString());
      setLng(userLocation.lng.toString());
      setLocationSuccess('✅ Location set successfully!');
      setTimeout(() => setLocationSuccess(''), 3000);
    } else {
      setIsGettingLocation(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLat(latitude.toString());
            setLng(longitude.toString());
            setIsGettingLocation(false);
            setLocationSuccess('✅ Location set successfully!');
            setTimeout(() => setLocationSuccess(''), 3000);
          },
          (error) => {
            console.error('Error getting location:', error);
            alert('Unable to get your current location. Please enter coordinates manually.');
            setIsGettingLocation(false);
          }
        );
      } else {
        alert('Geolocation is not supported by this browser.');
        setIsGettingLocation(false);
      }
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">Search Products</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="query" className="form-label">Search Query</label>
          <input
            type="text"
            id="query"
            className="form-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you looking for?"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lat" className="form-label">Latitude</label>
          <input
            type="number"
            id="lat"
            className="form-input"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            step="any"
            placeholder="e.g., 13.0827"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lng" className="form-label">Longitude</label>
          <input
            type="number"
            id="lng"
            className="form-input"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            step="any"
            placeholder="e.g., 80.2707"
            required
          />
        </div>
        <div className="form-group">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isGettingLocation}
            className="btn btn-secondary"
            style={{ marginBottom: '1rem' }}
          >
            {isGettingLocation ? 'Getting Location...' : '📍 Use Current Location'}
          </button>
          {locationError && (
            <div className="error" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {locationError}
            </div>
          )}
          {locationSuccess && (
            <div style={{ color: '#28a745', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {locationSuccess}
            </div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="distance" className="form-label">Search Radius (meters)</label>
          <input
            type="range"
            id="distance"
            className="form-input"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            min="1000"
            max="50000"
            step="1000"
          />
          <div>{distance} meters ({(distance / 1000).toFixed(1)} km)</div>
        </div>
        <button type="submit" className="btn btn-primary">
          Search Products
        </button>
      </form>
    </div>
  );
};

export default SearchBar;