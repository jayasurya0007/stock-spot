import React, { useState, useEffect } from 'react';
// import Button from '@mui/material/Button';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../../services/search';
import LeafletMap from '../Map/LeafletMap';
import { Card, CardContent, Typography, Button, Box, Chip, Grid, Avatar } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const CitySearch = () => {
  const navigate = useNavigate();
  const [cityName, setCityName] = useState('');
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [searchMethod, setSearchMethod] = useState('city'); // 'city' or 'location'

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      );
    }
  }, []);

  const handleCitySearch = async (e) => {
    e.preventDefault();
    if (!cityName.trim()) {
      setError('Please enter a city name');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMerchants([]);
      
      const data = await searchService.searchMerchantsByCity(cityName);
      console.log('City search response:', data);
      
      const merchantResults = data.merchants || [];
      setMerchants(merchantResults);
      
      if (merchantResults.length === 0) {
        setError(`No merchants found in ${cityName}. Please try a different city name.`);
      }
    } catch (err) {
      console.error('City search error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Search failed';
      setError(`Search failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = async () => {
    if (!userLocation.lat || !userLocation.lng) {
      setError('Unable to get your current location. Please enable location services or search by city name.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMerchants([]);
      
      const data = await searchService.searchMerchantsByLocation(userLocation.lat, userLocation.lng);
      console.log('Location search response:', data);
      
      const merchantResults = data.merchants || [];
      setMerchants(merchantResults);
      
      if (merchantResults.length === 0) {
        setError('No merchants found in your current area. Try expanding the search or use city search.');
      }
    } catch (err) {
      console.error('Location search error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Search failed';
      setError(`Search failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getMerchantProducts = async (merchantId) => {
    try {
      const data = await searchService.getMerchantProducts(merchantId);
      return data.products || [];
    } catch (err) {
      console.error('Failed to fetch merchant products:', err);
      return [];
    }
  };

  const handleMerchantClick = async (merchant) => {
    const products = await getMerchantProducts(merchant.id);
    setSelectedMerchant({ ...merchant, products });
  };

  return (
    <div className="container" style={{ 
      minHeight: '100vh',
      height: 'auto',
      padding: '20px',
      backgroundColor: '#ffffff',
      position: 'relative',
      overflow: 'visible'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/search')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          ← Back to Product Search
        </button>
        <h1 style={{ margin: 0 }}>Search Merchants by City</h1>
      </div>

      {/* Search Method Toggle */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Choose Search Method:</h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="radio"
              value="city"
              checked={searchMethod === 'city'}
              onChange={(e) => setSearchMethod(e.target.value)}
            />
            Search by City Name
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="radio"
              value="location"
              checked={searchMethod === 'location'}
              onChange={(e) => setSearchMethod(e.target.value)}
            />
            Use Current Location
          </label>
        </div>

        {searchMethod === 'city' ? (
          <form onSubmit={handleCitySearch}>
            <div className="form-group">
              <label htmlFor="cityName" className="form-label">City Name</label>
              <input
                type="text"
                id="cityName"
                className="form-input"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="e.g., New York, London, Tokyo"
                style={{ marginBottom: '1rem' }}
              />
            </div>
            <Button
              type="submit"
              variant="contained"
              color="info"
              startIcon={<LocationCityIcon />}
              disabled={loading}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
                fontSize: 16,
                boxShadow: 2,
                textTransform: 'none',
                mt: 1,
                mb: 1,
                '&:hover': {
                  backgroundColor: 'info.dark',
                  boxShadow: 4,
                },
              }}
              aria-label="Search using the city"
            >
              {loading ? 'Searching...' : 'Search using the city'}
            </Button>
          </form>
        ) : (
          <div>
            <p>
              {userLocation.lat && userLocation.lng 
                ? `Current location detected: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` 
                : 'Getting your location...'
              }
            </p>
            <button 
              onClick={handleLocationSearch}
              className="btn btn-primary"
              disabled={loading || (!userLocation.lat || !userLocation.lng)}
            >
              {loading ? 'Searching...' : '📍 Find Nearby Merchants'}
            </button>
          </div>
        )}
      </div>

      {error && <div className="error" style={{ marginBottom: '2rem' }}>{error}</div>}

      {merchants.length > 0 && (
        <Box className="card" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
            Found {merchants.length} Merchants
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {merchants.map((merchant, idx) => (
              <Grid item xs={12} md={6} key={merchant.id}>
                <Card
                  onClick={() => handleMerchantClick(merchant)}
                  sx={{
                    borderLeft: '6px solid #28a745',
                    borderRadius: 2,
                    boxShadow: 2,
                    p: 2,
                    mb: 2,
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: 6 },
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1} gap={2}>
                      <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32, fontWeight: 700 }}>{idx + 1}</Avatar>
                      <Typography variant="h6" fontWeight={700}>{merchant.shop_name}</Typography>
                    </Box>
                    <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                      <Chip label={`Price: $${merchant.price}`} color="success" size="small" />
                      <Chip label={`Qty: ${merchant.quantity}`} color="info" size="small" />
                      <Chip label={`Dist: ${merchant.distance} km`} color="primary" size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={1}><b>Description:</b> {merchant.description}</Typography>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<LocationOnIcon />}
                      sx={{ mt: 1, borderRadius: 2, fontWeight: 'bold' }}
                      aria-label="View merchant location"
                    >
                      View Location
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Merchant Details Modal */}
      {selectedMerchant && (
        <div className="modal" style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          background: 'rgba(0,0,0,0.5)', 
          zIndex: 1000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div style={{ 
            background: '#fff', 
            padding: 20, 
            borderRadius: 8, 
            minWidth: '80vw', 
            maxWidth: '90vw',
            minHeight: '80vh',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative' 
          }}>
            <button 
              style={{ position: 'absolute', top: 10, right: 10, fontSize: '20px' }} 
              onClick={() => setSelectedMerchant(null)}
            >
              ✕
            </button>
            
            <h2>{selectedMerchant.shop_name}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
              
              {/* Merchant Info */}
              <div>
                <h3>Merchant Information</h3>
                <p><strong>Owner:</strong> {selectedMerchant.owner_name || 'N/A'}</p>
                <p><strong>Address:</strong> {selectedMerchant.address || 'N/A'}</p>
                <p><strong>Phone:</strong> {selectedMerchant.phone || 'N/A'}</p>
                
                <h3 style={{ marginTop: '2rem' }}>Available Products ({selectedMerchant.products?.length || 0})</h3>
                {selectedMerchant.products && selectedMerchant.products.length > 0 ? (
                  <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                    {selectedMerchant.products.map((product, index) => (
                      <div key={index} style={{
                        border: '1px solid #eee',
                        borderRadius: '4px',
                        padding: '10px',
                        margin: '5px 0',
                        backgroundColor: '#f8f9fa'
                      }}>
                        <h4 style={{ margin: '0 0 5px 0' }}>{product.name}</h4>
                        <p style={{ margin: '2px 0' }}><strong>Price:</strong> ${product.price}</p>
                        <p style={{ margin: '2px 0' }}><strong>Quantity:</strong> {product.quantity}</p>
                        {product.description && (
                          <p style={{ margin: '2px 0', fontSize: '0.9em', color: '#666' }}>
                            {product.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No products available</p>
                )}
              </div>

              {/* Map */}
              <div>
                <h3>Location</h3>
                <LeafletMap
                  center={[selectedMerchant.latitude, selectedMerchant.longitude]}
                  markers={[{
                    position: [selectedMerchant.latitude, selectedMerchant.longitude],
                    popup: `<b>${selectedMerchant.shop_name}</b><br/>${selectedMerchant.address || ''}`
                  }]}
                  key={selectedMerchant.id}
                />
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMerchant.latitude},${selectedMerchant.longitude}${userLocation.lat && userLocation.lng ? `&origin=${userLocation.lat},${userLocation.lng}` : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    Get Directions (Google Maps)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitySearch;