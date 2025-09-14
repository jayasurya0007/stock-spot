import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../Loading';

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
    <div className="container">
      <div className="form-container">
        <h2 className="form-title">Create Account</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="role" className="form-label">Role</label>
            <select
              id="role"
              name="role"
              className="form-input"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">User</option>
              <option value="merchant">Merchant</option>
              <option value="admin">Admin</option>
            </select>
            {formData.role === 'merchant' && (
              <>
                {(locationStatus || locationLoading) && (
                  <div className="text-xs text-blue-600 mt-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {locationLoading && <LoadingSpinner size="small" color="primary" />}
                    {locationStatus}
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    className="form-input"
                    value={formData.latitude}
                    onChange={e => setFormData(f => ({ ...f, latitude: e.target.value }))}
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    className="form-input"
                    value={formData.longitude}
                    onChange={e => setFormData(f => ({ ...f, longitude: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
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
                </div>
                
                {/* Merchant Information Fields */}
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Shop Information</h3>
                  
                  <div className="form-group">
                    <label htmlFor="shop_name" className="form-label">Shop Name *</label>
                    <input
                      type="text"
                      id="shop_name"
                      name="shop_name"
                      className="form-input"
                      value={formData.shop_name}
                      onChange={handleChange}
                      placeholder="Enter your shop name"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="address" className="form-label">Shop Address</label>
                    <textarea
                      id="address"
                      name="address"
                      className="form-input"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your shop address"
                      rows="2"
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
                      placeholder="Enter owner's name"
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
                </div>
              </>
            )}
          </div>
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{ 
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {loading && <LoadingSpinner size="small" color="white" />}
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;