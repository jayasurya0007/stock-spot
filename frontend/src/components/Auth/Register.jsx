import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    latitude: '',
    longitude: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      // If merchant, require GPS
      if (formData.role === 'merchant' && (!formData.latitude || !formData.longitude)) {
        setError('Please allow location access for merchant registration');
        setLoading(false);
        return;
      }
      const result = await register({
        email: formData.email,
        password: formData.password,
        role: formData.role,
        latitude: formData.role === 'merchant' ? formData.latitude : undefined,
        longitude: formData.role === 'merchant' ? formData.longitude : undefined
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
                <div className="text-xs text-blue-600 mt-2">{locationStatus}</div>
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
              </>
            )}
          </div>
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
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