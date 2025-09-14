
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      setOpenSnackbar(true);
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
        setOpenSnackbar(true);
      }
    } catch (err) {
      setError('Failed to login');
      setOpenSnackbar(true);
    }
    
    setLoading(false);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #e3f0ff 0%, #f7fafd 100%)',
        transition: 'background 0.6s',
      }}
    >
      <Box
        sx={{
          width: 370,
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 6,
          transition: 'box-shadow 0.3s, transform 0.3s',
          '&:hover': { boxShadow: 12, transform: 'translateY(-2px) scale(1.01)' },
        }}
      >
        <Box display="flex" justifyContent="center" mb={2}>
          <img src="/stockspot-logo.svg" alt="StockSpot Logo" style={{ height: 56 }} />
        </Box>
        <Typography variant="h5" component="h2" mb={2} align="center" fontWeight={700} color="primary.main">
          Login to StockSpot
        </Typography>
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            InputProps={{
              style: { transition: 'box-shadow 0.3s' },
            }}
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              style: { transition: 'box-shadow 0.3s' },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, position: 'relative', transition: 'box-shadow 0.3s, transform 0.3s' }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
        </form>
        <Box mt={2} textAlign="center">
          Need an account? <Link to="/register">Register here</Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;