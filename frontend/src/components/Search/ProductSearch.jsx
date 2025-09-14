import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Card, CardContent, Typography, Grid, CircularProgress, Snackbar, Alert, IconButton, InputAdornment, Fade, Collapse, useMediaQuery, Chip, MenuItem, Select, FormControl, InputLabel, Tooltip, Avatar, Skeleton, Fab, Grow } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LeafletMap from '../Map/LeafletMap';
import { searchService } from '../../services/search';

const ProductSearch = () => {
  const [query, setQuery] = useState('');
  const [userLocation, setUserLocation] = useState({ lat: 28.6139, lng: 77.2090 }); // Default: Delhi
  const [locationStatus, setLocationStatus] = useState('Getting your location...');
  const [results, setResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState(5000); // meters
  const [distanceUnit, setDistanceUnit] = useState('km');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const mapRef = useRef();
  const isMobile = useMediaQuery('(max-width:600px)');

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus('Location detected ✓');
        },
        () => setLocationStatus('Using default location (Delhi)')
      );
    }
  }, []);

  // Prepare markers for map
  const markers = results.map(shop => ({
    position: [shop.lat, shop.lng],
    popup: `<b>${shop.name}</b><br/>${shop.address || ''}<br/>${shop.distance ? (shop.distance/1000).toFixed(2) + ' km away' : ''}`
  }));

  // Center map on shop when clicked
  const handleShopClick = (shop) => {
    if (mapRef.current && mapRef.current.setView) {
      mapRef.current.setView([shop.lat, shop.lng], 15);
    }
    // Optionally, scroll to map
    document.getElementById('leaflet-map')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box
      maxWidth="lg"
      mx="auto"
      px={isMobile ? 0 : 4}
      py={0}
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #e3f0ff 0%, #f7fafd 100%)',
        transition: 'background 0.6s',
        position: 'relative',
      }}
    >
      {/* Branded Header */}
      <Box textAlign="center" pt={isMobile ? 4 : 8} pb={isMobile ? 2 : 4}>
        <Avatar src="/stockspot-logo.svg" alt="StockSpot Logo" sx={{ width: 64, height: 64, mx: 'auto', mb: 1, boxShadow: 2 }} />
        <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} color="primary.main" gutterBottom>
          Find Products Near You
        </Typography>
        <Typography color="text.secondary" fontSize={isMobile ? 15 : 18}>
          Search for products, filter by category, and discover shops in your city.
        </Typography>
      </Box>
      {/* Search Bar Section */}
      <Card sx={{ mb: 4, p: isMobile ? 2 : 4, borderRadius: 3, boxShadow: 3, maxWidth: 900, mx: 'auto' }}>
        <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} alignItems={isMobile ? 'stretch' : 'center'} gap={2}>
          <Tooltip title="Type a product name (e.g., Rice, Soap, Toys)" arrow>
            <TextField
              label="Search Products"
              variant="outlined"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: query && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setQuery('')} edge="end" aria-label="clear search">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: 200, transition: 'box-shadow 0.3s' }}
              helperText="Press Enter or click Search"
            />
          </Tooltip>
          <Tooltip title="Filter by product category" arrow>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={e => setCategory(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="grocery">Grocery</MenuItem>
                <MenuItem value="personal-care">Personal Care</MenuItem>
                <MenuItem value="stationery">Stationery</MenuItem>
                <MenuItem value="toys">Toys</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Tooltip>
          <Tooltip title="Sort results by distance, price, or name" arrow>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={e => setSortBy(e.target.value)}
              >
                <MenuItem value="distance">Distance</MenuItem>
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </FormControl>
          </Tooltip>
          <Tooltip title="Set search radius" arrow>
            <TextField
              label="Radius"
              type="number"
              value={distanceUnit === 'km' ? distance / 1000 : distance}
              onChange={e => {
                const val = Number(e.target.value);
                setDistance(distanceUnit === 'km' ? val * 1000 : val);
              }}
              InputProps={{
                endAdornment: (
                  <Select
                    value={distanceUnit}
                    onChange={e => {
                      const newUnit = e.target.value;
                      setDistanceUnit(newUnit);
                      setDistance(newUnit === 'km' ? Math.round(distance / 1000) * 1000 : distance);
                    }}
                    sx={{ ml: 1 }}
                  >
                    <MenuItem value="km">km</MenuItem>
                    <MenuItem value="m">meters</MenuItem>
                  </Select>
                )
              }}
              sx={{ maxWidth: 120 }}
              helperText="How far to search"
            />
          </Tooltip>
          <Tooltip title="Search for products" arrow>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              sx={{ minWidth: 120 }}
              disabled={loading}
            >
              Search
            </Button>
          </Tooltip>
          <Tooltip title="Use your current location" arrow>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<LocationOnIcon />}
              onClick={handleUseMyLocation}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              Use My Location
            </Button>
          </Tooltip>
        </Box>
        <Box mt={2} textAlign="center" color="text.secondary">
          {locationStatus}
        </Box>
      </Card>

      {/* Map Section (collapsible on mobile) */}
      <Collapse in={showMap} timeout={400}>
        <Fade in={showMap} timeout={400}>
          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 2, p: 2, position: isMobile ? 'static' : 'sticky', top: isMobile ? undefined : 24, zIndex: 1 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight={600} color="primary.main">Nearby Shops Map</Typography>
              {isMobile && (
                <IconButton onClick={() => setShowMap(false)} aria-label="Hide map">
                  <ExpandLessIcon />
                </IconButton>
              )}
            </Box>
            <Box id="leaflet-map" sx={{ height: 320, mt: 2 }}>
              <LeafletMap ref={mapRef} center={[userLocation.lat, userLocation.lng]} markers={markers} />
            </Box>
          </Card>
        </Fade>
      </Collapse>
      {isMobile && !showMap && (
        <Button fullWidth variant="outlined" startIcon={<ExpandMoreIcon />} onClick={() => setShowMap(true)} sx={{ mb: 2 }}>
          Show Map
        </Button>
      )}

      {/* Results Section */}
      {loading && (
        <Grid container spacing={3} id="resultsSection">
          {[...Array(6)].map((_, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card sx={{ borderRadius: 3, boxShadow: 2, p: 2 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box flex={1}>
                      <Skeleton variant="text" width="60%" height={28} />
                      <Skeleton variant="text" width="40%" height={18} />
                    </Box>
                  </Box>
                  <Skeleton variant="rectangular" width="100%" height={48} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" width="100%" height={24} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {!loading && results.length > 0 && (
        <Box>
          {/* Exact Matches Section */}
          <Box mb={4}>
            <Typography variant="h5" fontWeight={700} color="success.main" sx={{ borderBottom: '3px solid #28a745', pb: 1, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
               Exact Matches
            </Typography>
            <Grid container spacing={3}>
              {results.filter(shop => shop.products.some(product => product.name.toLowerCase() === query.toLowerCase())).map((shop, idx) => {
                const exactProducts = shop.products.filter(product => product.name.toLowerCase() === query.toLowerCase() && product.quantity > 0);
                if (exactProducts.length === 0) return null;
                return (
                  <Grid item xs={12} sm={6} md={6} key={shop.id + '-exact'}>
                    <Grow in timeout={400 + idx * 100}>
                      <Card
                        sx={{
                          borderRadius: 4,
                          boxShadow: 4,
                          p: 2.5,
                          cursor: 'pointer',
                          borderLeft: '6px solid #28a745',
                          '&:hover': { boxShadow: 10, transform: 'translateY(-3px) scale(1.015)' },
                          minHeight: 220,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                        onClick={() => handleShopClick(shop)}
                      >
                        <CardContent sx={{ p: 0 }}>
                          <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Avatar sx={{ bgcolor: 'success.main', width: 44, height: 44, fontWeight: 700, fontSize: 22 }}>
                              {shop.name?.[0] || 'S'}
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="h6" fontWeight={700} color="success.main" gutterBottom noWrap>{shop.name}</Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom noWrap>{shop.address}</Typography>
                            </Box>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Chip label={`${exactProducts.length} item${exactProducts.length > 1 ? 's' : ''}`} color="success" size="small" />
                            {shop.distance && (
                              <Chip label={`${shop.distance.toFixed(2)} km`} color="info" size="small" />
                            )}
                          </Box>
                          <Box mt={1} mb={2}>
                            {exactProducts.map(product => (
                              <Box key={product.name} display="flex" justifyContent="space-between" alignItems="center" bgcolor="#eaffea" borderRadius={2} px={1.5} py={0.7} mb={0.7} boxShadow={1}>
                                <Typography fontWeight={600} color="text.primary">{product.name}</Typography>
                                <Box textAlign="right">
                                  <Typography fontWeight={700} color="success.main">₹{product.price}</Typography>
                                  <Typography variant="caption" color="text.secondary">{product.quantity} in stock</Typography>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                          <Box display="flex" alignItems="center" gap={1} mt={2}>
                            <Typography variant="body2" color="success.main" fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <span role="img" aria-label="phone">📞</span> {shop.phone}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
          {/* Related Products Section */}
          <Box mb={6} sx={{ background: 'linear-gradient(90deg, #f0faff 0%, #f7fafd 100%)', borderRadius: 3, boxShadow: 1, px: { xs: 1, sm: 3 }, py: 2 }}>
            <Box position="sticky" top={0} zIndex={2} bgcolor="inherit" pb={1} mb={2}>
              <Typography variant="h6" fontWeight={800} color="info.main" sx={{ borderBottom: '3px solid #17a2b8', display: 'flex', alignItems: 'center', gap: 1 }}>
                🔍 Related Products
                <Chip label={`${results.filter(shop => shop.products.some(product => product.name.toLowerCase() !== query.toLowerCase())).reduce((acc, shop) => acc + shop.products.filter(product => product.name.toLowerCase() !== query.toLowerCase()).length, 0)} found`} color="info" size="small" sx={{ ml: 2 }} />
              </Typography>
            </Box>
            <Grid container spacing={4}>
              {results.filter(shop => shop.products.some(product => product.name.toLowerCase() !== query.toLowerCase())).map((shop, idx) => {
                const relatedProducts = shop.products.filter(product => product.name.toLowerCase() !== query.toLowerCase() && product.quantity > 0);
                if (relatedProducts.length === 0) return null;
                return (
                  <Grid item xs={12} sm={6} md={6} key={shop.id + '-related'}>
                    <Grow in timeout={400 + idx * 100}>
                      <Card
                        sx={{
                          borderRadius: 4,
                          boxShadow: 6,
                          p: 2.5,
                          cursor: 'pointer',
                          borderLeft: '6px solid #17a2b8',
                          background: 'rgba(23,162,184,0.04)',
                          '&:hover': { boxShadow: 12, transform: 'translateY(-4px) scale(1.02)', background: 'rgba(23,162,184,0.09)' },
                          minHeight: 240,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                        onClick={() => handleShopClick(shop)}
                      >
                        <CardContent sx={{ p: 0 }}>
                          <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48, fontWeight: 700, fontSize: 24, boxShadow: 2 }}>{shop.name?.[0] || 'S'}</Avatar>
                            <Box flex={1}>
                              <Typography variant="h6" fontWeight={800} color="info.main" gutterBottom noWrap>{shop.name}</Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom noWrap>{shop.address}</Typography>
                            </Box>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Chip label={`${relatedProducts.length} item${relatedProducts.length > 1 ? 's' : ''}`} color="info" size="small" />
                            {shop.distance && (
                              <Chip label={`${shop.distance.toFixed(2)} km`} color="primary" size="small" />
                            )}
                          </Box>
                          <Box mt={1} mb={2}>
                            {relatedProducts.map(product => (
                              <Box key={product.name} display="flex" justifyContent="space-between" alignItems="center" bgcolor="#f0faff" borderRadius={2} px={1.5} py={0.7} mb={0.7} boxShadow={1}>
                                <Typography fontWeight={700} color="text.primary">{product.name}</Typography>
                                <Box textAlign="right">
                                  <Typography fontWeight={800} color="info.main">₹{product.price}</Typography>
                                  <Typography variant="caption" color="text.secondary">{product.quantity} in stock</Typography>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                          <Box display="flex" alignItems="center" gap={1} mt={2}>
                            <Typography variant="body2" color="info.main" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <span role="img" aria-label="phone">📞</span> {shop.phone}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Box>
      )}
      {/* No Results Illustration */}
      {noResults && (
        <Card sx={{ p: 6, textAlign: 'center', mt: 6, borderRadius: 3, boxShadow: 2, maxWidth: 500, mx: 'auto' }}>
          <Box fontSize={64} mb={2}>😔</Box>
          <Typography variant="h6" fontWeight={700} mb={1}>No shops found</Typography>
          <Typography color="text.secondary">Try searching for a different product or check back later as more merchants join StockSpot!</Typography>
        </Card>
      )}
      {/* Floating Help Button */}
      <Tooltip title="Need help?" arrow>
        <Fab color="primary" aria-label="help" sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 2000 }} onClick={() => setShowHelp(true)}>
          <HelpOutlineIcon />
        </Fab>
      </Tooltip>
      {/* Help Dialog */}
      <Collapse in={showHelp}>
        <Card sx={{ position: 'fixed', bottom: 100, right: 32, zIndex: 2100, maxWidth: 320, p: 3, borderRadius: 3, boxShadow: 6 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="h6" fontWeight={700}>How to use Product Search</Typography>
            <IconButton onClick={() => setShowHelp(false)}><ClearIcon /></IconButton>
          </Box>
          <Typography color="text.secondary" fontSize={15} mb={1}>• Enter a product name and press Search.<br/>• Filter by category, sort, and set your search radius.<br/>• Click "Use My Location" for best results.<br/>• Click a shop card for more info and map view.</Typography>
        </Card>
      </Collapse>
      {/* Error Snackbar */}
      <Snackbar open={!!error || openSnackbar} autoHideDuration={4000} onClose={() => { setError(''); setOpenSnackbar(false); }} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => { setError(''); setOpenSnackbar(false); }} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductSearch;
