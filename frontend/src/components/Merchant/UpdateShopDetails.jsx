import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { merchantService } from '../../services/merchants';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner, SkeletonLoader } from '../Loading';

const UpdateShopDetails = () => {
  const [formData, setFormData] = useState({
    shop_name: '',
    address: '',
    owner_name: '',
    phone: '',
    latitude: '',
    longitude: '',
    use_manual_coords: false
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchMerchantDetails = async () => {
      try {
        const data = await merchantService.getMyMerchantDetails();
        setFormData({
          shop_name: data.shop_name || '',
          address: data.address || '',
          owner_name: data.owner_name || '',
          phone: data.phone || '',
          latitude: data.latitude || '',
          longitude: data.longitude || '',
          use_manual_coords: false
        });
      } catch (err) {
        setError('Failed to fetch merchant details');
      } finally {
        setFetchLoading(false);
      }
    };

    if (user?.role === 'merchant') {
      fetchMerchantDetails();
    } else {
      setFetchLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLocationLoading(true);
    setError('');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
          use_manual_coords: true
        });
        setLocationLoading(false);
        setSuccess('Current location captured successfully!');
        setTimeout(() => setSuccess(''), 3000);
      },
      (error) => {
        setLocationLoading(false);
        let errorMessage = 'Failed to get current location. ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        setError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.shop_name) {
      return setError('Shop name is required');
    }

    // Validate coordinates if manual coordinates are being used
    if (formData.use_manual_coords) {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        return setError('Please provide valid latitude and longitude values');
      }
      
      if (lat < -90 || lat > 90) {
        return setError('Latitude must be between -90 and 90');
      }
      
      if (lng < -180 || lng > 180) {
        return setError('Longitude must be between -180 and 180');
      }
    } else if (!formData.address) {
      return setError('Please provide either an address or use manual coordinates');
    }
    
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await merchantService.updateMerchantDetails(formData);
      setSuccess('Shop details updated successfully!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update shop details');
    }
    
    setLoading(false);
  };

  if (fetchLoading) {
    return (
      <div className="container">
        <div className="form-container">
          <SkeletonLoader type="text" lines={1} height="32px" width="250px" />
          <div style={{ marginTop: '2rem' }}>
            <SkeletonLoader type="card" />
          </div>
        </div>
      </div>
    );
  }
  
  if (user?.role !== 'merchant') {
    return (
      <div className="error">
        <h2>Access Denied</h2>
        <p>This page is only available for merchants.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="form-container">
        <h2 className="form-title">Update Shop Details</h2>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
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
              placeholder="Enter your shop name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">
              Address {!formData.use_manual_coords && '*'}
            </label>
            <textarea
              id="address"
              name="address"
              className="form-input"
              value={formData.address}
              onChange={handleChange}
              required={!formData.use_manual_coords}
              rows="3"
              placeholder="Enter your shop address"
              disabled={formData.use_manual_coords}
            />
            {formData.use_manual_coords && (
              <small style={{ color: '#666', marginTop: '0.25rem', display: 'block' }}>
                Address is optional when using manual coordinates
              </small>
            )}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <input
                type="checkbox"
                id="use_manual_coords"
                name="use_manual_coords"
                checked={formData.use_manual_coords}
                onChange={handleChange}
                style={{ marginRight: '0.5rem' }}
              />
              <label htmlFor="use_manual_coords" style={{ margin: 0, cursor: 'pointer' }}>
                Use manual coordinates (latitude/longitude)
              </label>
            </div>
            
            {formData.use_manual_coords && (
              <>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="latitude" className="form-label">Latitude *</label>
                    <input
                      type="number"
                      id="latitude"
                      name="latitude"
                      className="form-input"
                      value={formData.latitude}
                      onChange={handleChange}
                      step="any"
                      min="-90"
                      max="90"
                      placeholder="e.g., 40.7128"
                      required={formData.use_manual_coords}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="longitude" className="form-label">Longitude *</label>
                    <input
                      type="number"
                      id="longitude"
                      name="longitude"
                      className="form-input"
                      value={formData.longitude}
                      onChange={handleChange}
                      step="any"
                      min="-180"
                      max="180"
                      placeholder="e.g., -74.0060"
                      required={formData.use_manual_coords}
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="btn btn-secondary"
                  style={{ 
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {locationLoading ? (
                    <>
                      <span style={{ 
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        border: '2px solid #fff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></span>
                      Getting Location...
                    </>
                  ) : (
                    <>
                      📍 Use My Current Location
                    </>
                  )}
                </button>
                
                <small style={{ color: '#666', display: 'block', marginBottom: '1rem' }}>
                  Click the button above to automatically fill in your current coordinates, 
                  or enter them manually. Latitude ranges from -90 to 90, longitude from -180 to 180.
                </small>
              </>
            )}
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
              placeholder="Enter owner name"
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
              placeholder="Enter phone number"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {loading && <LoadingSpinner size="small" color="white" />}
              {loading ? 'Updating...' : 'Update Shop Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateShopDetails;