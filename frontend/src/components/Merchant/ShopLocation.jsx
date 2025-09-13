import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { merchantService } from '../../services/merchants';

const ShopLocation = () => {
  const [formData, setFormData] = useState({
    shop_name: '',
    address: '',
    latitude: '',
    longitude: '',
    owner_name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [locationStatus, setLocationStatus] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMerchantData = async () => {
      try {
        const data = await merchantService.getMerchantInfo();
        if (data.merchant) {
          setFormData({
            shop_name: data.merchant.shop_name || '',
            address: data.merchant.address || '',
            latitude: data.merchant.latitude || '',
            longitude: data.merchant.longitude || '',
            owner_name: data.merchant.owner_name || '',
            phone: data.merchant.phone || ''
          });
        }
      } catch (err) {
        setError('Failed to fetch merchant information');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchMerchantData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLocationStatus('Getting your location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          setLocationStatus('Location detected ✓');
        },
        (error) => {
          setLocationStatus('Failed to get location: ' + error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setLocationStatus('Geolocation is not supported by this browser');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.shop_name || !formData.address || !formData.latitude || !formData.longitude) {
      return setError('Please fill in all required fields');
    }
    
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      await merchantService.updateMerchantLocation(formData);
      setSuccess('Shop location updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update shop location');
    }
    
    setLoading(false);
  };

  if (fetchLoading) return <div className="loading">Loading merchant information...</div>;

  return (
    <div className="container">
      <div className="form-container">
        <h2 className="form-title">Update Shop Location</h2>
        {error && <div className="error">{error}</div>}
        {success && <div className="success" style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="shop_name" className="form-label">Shop Name *</label>
            <input
              type="text"
              id="shop_name"
              name="shop_name"
              className="form-input"
              value={formData.shop_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">Address *</label>
            <textarea
              id="address"
              name="address"
              className="form-input"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="owner_name" className="form-label">Owner Name</label>
            <input
              type="text"
              id="owner_name"
              name="owner_name"
              className="form-input"
              value={formData.owner_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location Coordinates *</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <button
                type="button"
                onClick={getCurrentLocation}
                className="btn btn-secondary"
                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
              >
                Get Current Location
              </button>
              {locationStatus && (
                <span style={{ fontSize: '0.9rem', color: locationStatus.includes('✓') ? 'green' : 'orange' }}>
                  {locationStatus}
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="latitude" className="form-label">Latitude</label>
                <input
                  type="number"
                  id="latitude"
                  name="latitude"
                  className="form-input"
                  value={formData.latitude}
                  onChange={handleChange}
                  step="any"
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="longitude" className="form-label">Longitude</label>
                <input
                  type="number"
                  id="longitude"
                  name="longitude"
                  className="form-input"
                  value={formData.longitude}
                  onChange={handleChange}
                  step="any"
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Updating...' : 'Update Shop Location'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/')}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>

        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
          <h4>Tips:</h4>
          <ul>
            <li>Use "Get Current Location" for accurate coordinates</li>
            <li>Make sure location services are enabled in your browser</li>
            <li>The address will be used for customer searches</li>
            <li>Coordinates help customers find your exact location</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShopLocation;