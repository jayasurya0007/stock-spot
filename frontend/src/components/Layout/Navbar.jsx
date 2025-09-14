

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../../public/stockspot-logo.svg';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="logo" sx={{ mr: 2 }} component={RouterLink} to="/">
            <img src={logo} alt="StockSpot Logo" style={{ height: 32, width: 32, display: 'block' }} />
          </IconButton>
          <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none', fontWeight: 700, letterSpacing: 1 }}>
            StockSpot
          </Typography>
          {user ? (
            <>
              {user.role === 'merchant' && (
                <>
                  <Button color="inherit" component={RouterLink} to="/">Dashboard</Button>
                  <Button color="inherit" component={RouterLink} to="/shop/update">Update Shop Details</Button>
                </>
              )}
              <Button color="inherit" component={RouterLink} to="/map">Map View</Button>
              <Button color="inherit" component={RouterLink} to="/search">Search</Button>
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/">Explore</Button>
              <Button color="inherit" component={RouterLink} to="/login">Login</Button>
              <Button color="inherit" component={RouterLink} to="/register">Register</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;