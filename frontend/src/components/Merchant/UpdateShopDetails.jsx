import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { merchantService } from '../../services/merchants';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../Loading';
import { MapPin, Navigation, Save, X } from 'lucide-react';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (user?.role !== 'merchant') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">This page is only available for merchants.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Update Shop Details</h2>
              <button
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-200">
                {success}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="shop_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Shop Name *
                </label>
                <input
                  type="text"
                  id="shop_name"
                  name="shop_name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  value={formData.shop_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your shop name"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address {!formData.use_manual_coords && '*'}
                </label>
                <textarea
                  id="address"
                  name="address"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  value={formData.address}
                  onChange={handleChange}
                  required={!formData.use_manual_coords}
                  rows="3"
                  placeholder="Enter your shop address"
                  disabled={formData.use_manual_coords}
                />
                {formData.use_manual_coords && (
                  <p className="text-sm text-gray-500 mt-1">
                    Address is optional when using manual coordinates
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="use_manual_coords"
                    name="use_manual_coords"
                    checked={formData.use_manual_coords}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="use_manual_coords" className="ml-2 block text-sm font-medium text-gray-700">
                    Use manual coordinates (latitude/longitude)
                  </label>
                </div>
                
                {formData.use_manual_coords && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                          Latitude *
                        </label>
                        <input
                          type="number"
                          id="latitude"
                          name="latitude"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                          value={formData.latitude}
                          onChange={handleChange}
                          step="any"
                          min="-90"
                          max="90"
                          placeholder="e.g., 40.7128"
                          required={formData.use_manual_coords}
                        />
                      </div>
                      <div>
                        <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                          Longitude *
                        </label>
                        <input
                          type="number"
                          id="longitude"
                          name="longitude"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
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
                      className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 mb-4"
                    >
                      {locationLoading ? (
                        <>
                          <LoadingSpinner size="small" color="gray" />
                          Getting Location...
                        </>
                      ) : (
                        <>
                          <Navigation size={18} />
                          Use My Current Location
                        </>
                      )}
                    </button>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700">
                        Click the button above to automatically fill in your current coordinates, 
                        or enter them manually. Latitude ranges from -90 to 90, longitude from -180 to 180.
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="owner_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    id="owner_name"
                    name="owner_name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    value={formData.owner_name}
                    onChange={handleChange}
                    placeholder="Enter owner name"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="small" color="white" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Update Shop Details
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateShopDetails;