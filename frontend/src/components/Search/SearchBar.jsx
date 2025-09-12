import React, { useState } from 'react';

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
            className="btn btn-secondary"
            disabled={gettingLocation}
            style={{ marginBottom: '1rem' }}
          >
            {gettingLocation ? 'Getting Location...' : 'Use Current Location'}
          </button>
        </div>
        <div className="form-group">
          <label htmlFor="distance" className="form-label">Search Radius</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="number"
              id="distance"
              className="form-input"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              min="0.1"
              step="0.1"
              placeholder="e.g., 5"
              required
              style={{ flex: '2' }}
            />
            <select
              value={distanceUnit}
              onChange={(e) => setDistanceUnit(e.target.value)}
              className="form-input"
              style={{ flex: '1' }}
            >
              <option value="meters">meters</option>
              <option value="km">km</option>
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          Search Products
        </button>
      </form>
    </div>
  );
};

export default SearchBar;