import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import  LoadingSpinner from "../Loading/LoadingSpinner";
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    latitude: '',
    longitude: '',
    shop_name: '',
    address: '',
    owner_name: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // If merchant role selected, try to get location
    if (e.target.name === 'role' && e.target.value === 'merchant') {
      if (navigator.geolocation) {
        setLocationLoading(true);
        setLocationStatus('Getting your location...');
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setFormData(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
            setLocationStatus('Location detected ✓');
            setLocationLoading(false);
          },
          () => {
            setLocationStatus('Failed to get location');
            setLocationLoading(false);
          }
        );
      } else {
        setLocationStatus('Geolocation not supported');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      return setError('Please fill in all fields');
    }
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    try {
      setError('');
      setLoading(true);
      // If merchant, require GPS and shop name
      if (formData.role === 'merchant') {
        if (!formData.latitude || !formData.longitude) {
          setError('Please allow location access for merchant registration');
          setLoading(false);
          return;
        }
        if (!formData.shop_name) {
          setError('Shop name is required for merchant registration');
          setLoading(false);
          return;
        }
      }
      
      const result = await register({
        email: formData.email,
        password: formData.password,
        role: formData.role,
        latitude: formData.role === 'merchant' ? formData.latitude : undefined,
        longitude: formData.role === 'merchant' ? formData.longitude : undefined,
        shop_name: formData.role === 'merchant' ? formData.shop_name : undefined,
        address: formData.role === 'merchant' ? formData.address : undefined,
        owner_name: formData.role === 'merchant' ? formData.owner_name : undefined,
        phone: formData.role === 'merchant' ? formData.phone : undefined
      });
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to register');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-6 sm:px-8 sm:py-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="bg-blue-100 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <UserPlus size={28} className="text-blue-600 sm:w-8 sm:h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Join StockSpot to discover local stores and products</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 sm:mb-6 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">User</option>
                <option value="merchant">Merchant</option>
                <option value="admin">Admin</option>
              </select>
              
              {formData.role === 'merchant' && (
                <div className="mt-4 space-y-4">
                  {(locationStatus || locationLoading) && (
                    <div className="text-sm text-blue-600 flex items-center">
                      {locationLoading && <LoadingSpinner size="small" color="primary" className="mr-2" />}
                      {locationStatus}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="Latitude"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                        value={formData.latitude}
                        onChange={e => setFormData(f => ({ ...f, latitude: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="Longitude"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                        value={formData.longitude}
                        onChange={e => setFormData(f => ({ ...f, longitude: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all text-sm"
                    onClick={() => {
                      if (navigator.geolocation) {
                        setLocationStatus('Getting your location...');
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setFormData(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
                            setLocationStatus('Location detected ✓');
                          },
                          () => setLocationStatus('Failed to get location')
                        );
                      } else {
                        setLocationStatus('Geolocation not supported');
                      }
                    }}
                  >
                    Use My Current Location
                  </button>
                  
                  {/* Merchant Information Fields */}
                  <div className="pt-4 mt-4 border-t">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Shop Information</h3>
                    
                    <div className="mb-4">
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
                        placeholder="Enter your shop name"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Shop Address
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your shop address"
                        rows="2"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          placeholder="Enter owner's name"
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
                  </div>
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 shadow-md flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" color="white" />
                  <span className="ml-2">Creating Account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;