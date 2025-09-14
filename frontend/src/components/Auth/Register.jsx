import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

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
  const [openSnackbar, setOpenSnackbar] = useState(false);

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
      setError('Please fill in all fields');
      setOpenSnackbar(true);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setOpenSnackbar(true);
      return;
    }
    try {
      setError('');
      setLoading(true);
      if (formData.role === 'merchant' && (!formData.latitude || !formData.longitude)) {
        setError('Please allow location access for merchant registration');
        setOpenSnackbar(true);
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
        setOpenSnackbar(true);
      }
    } catch (err) {
      setError('Failed to register');
      setOpenSnackbar(true);
    }
    setLoading(false);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Box sx={{ width: 400, p: 4, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h5" component="h2" mb={2} align="center">Create Account</Typography>
        {/* Error Snackbar */}
        <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={() => setOpenSnackbar(false)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="merchant">Merchant</MenuItem>
          </TextField>
          {formData.role === 'merchant' && (
            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">{locationStatus}</Typography>
            </Box>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, position: 'relative' }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
          </Button>
        </form>
        <Box mt={2} textAlign="center">
          Already have an account? <Link to="/login">Login here</Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;