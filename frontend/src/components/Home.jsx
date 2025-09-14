
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, Modal, Backdrop, Fade, IconButton } from '@mui/material';
import LeafletMap from './Map/LeafletMap';
import { getHomeMerchants } from '../utils/getHomeMerchants';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
// Dummy featured products data
const featuredProducts = [
  {
    name: 'Organic Apples',
    image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
    price: '₹120/kg',
    shop: 'Fresh Mart',
  },
  {
    name: 'Handmade Soap',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    price: '₹80/pc',
    shop: 'Nature Care',
  },
  {
    name: 'Premium Basmati Rice',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    price: '₹90/kg',
    shop: 'Grain House',
  },
  {
    name: 'Fresh Paneer',
    image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
    price: '₹200/kg',
    shop: 'Dairy Delight',
  },
];

const features = [
  {
    title: 'Smart Search',
    desc: 'Find products and shops instantly with advanced search and filters.',
    icon: '🔍',
  },
  {
    title: 'Interactive Map',
    desc: 'Explore nearby shops and products on a live map.',
    icon: '🗺️',
  },
  {
    title: 'Merchant Dashboard',
    desc: 'Manage your shop, products, and inventory with ease.',
    icon: '📦',
  },
];

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Featured products carousel state
  const [productIdx, setProductIdx] = useState(0);
  const handlePrevProduct = () => setProductIdx((prev) => (prev === 0 ? featuredProducts.length - 1 : prev - 1));
  const handleNextProduct = () => setProductIdx((prev) => (prev === featuredProducts.length - 1 ? 0 : prev + 1));

  // Onboarding tour modal state
  const [openTour, setOpenTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const tourSteps = [
    {
      title: 'Welcome to StockSpot!',
      desc: 'Discover local shops, search for products, and manage your inventory all in one place.',
    },
    {
      title: 'Smart Search',
      desc: 'Use the search bar to find products and shops instantly with advanced filters.',
    },
    {
      title: 'Interactive Map',
      desc: 'Explore nearby shops and products visually on the map.',
    },
    {
      title: 'Merchant Dashboard',
      desc: 'If you are a merchant, manage your shop, products, and inventory with ease.',
    },
  ];
  const handleOpenTour = () => { setOpenTour(true); setTourStep(0); };
  const handleCloseTour = () => setOpenTour(false);
  const handleNextTour = () => setTourStep((prev) => (prev === tourSteps.length - 1 ? prev : prev + 1));
  const handlePrevTour = () => setTourStep((prev) => (prev === 0 ? 0 : prev - 1));

  const handleSearchClick = () => {
    if (isAuthenticated) {
      navigate('/search');
    } else {
      navigate('/login');
    }
  };

  const handleMapClick = () => {
    if (isAuthenticated) {
      navigate('/map');
    } else {
      navigate('/login');
    }
  };

  // Merchant markers and user location for map preview
  const [merchantMarkers, setMerchantMarkers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [merchantCount, setMerchantCount] = useState(0);
  useEffect(() => {
    (async () => {
      try {
        const { merchants, location } = await getHomeMerchants();
        setMerchantMarkers(
          merchants
            .filter(m => m.latitude && m.longitude)
            .map(m => ({
              position: [m.latitude, m.longitude],
              popup: `<b>${m.shop_name}</b><br/>${m.address || ''}`
            }))
        );
        setUserLocation(location);
        setMerchantCount(merchants.length);
      } catch (e) {
        setMerchantMarkers([]);
        setUserLocation(null);
        setMerchantCount(0);
      }
    })();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      {/* Hero & Call to Action */}
      <Box textAlign="center" mb={6}>
        <img src="/stockspot-logo.svg" alt="StockSpot Logo" style={{ height: 80, marginBottom: 16 }} />
        <Typography variant="h3" fontWeight={700} gutterBottom color="primary.main">
          Welcome to StockSpot
        </Typography>
        <Typography variant="h6" color="text.secondary" mb={4}>
          Discover, search, and manage local shop inventory with ease. Find products, explore shops, and connect with merchants in your city.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSearchClick}
          sx={{ mr: 2 }}
        >
          Search Products
        </Button>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          onClick={handleMapClick}
        >
          Explore Map
        </Button>
        <IconButton aria-label="Show onboarding tour" color="primary" sx={{ ml: 2, mt: 1 }} onClick={handleOpenTour}>
          <InfoOutlinedIcon />
        </IconButton>
      </Box>

      {/* Featured Products Carousel */}
      <Box mb={6} textAlign="center">
        <Typography variant="h5" fontWeight={600} mb={2} color="primary.main">
          Featured Products
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
          <IconButton onClick={handlePrevProduct} aria-label="Previous product">
            <ArrowBackIosNewIcon />
          </IconButton>
          <Card sx={{ width: 320, borderRadius: 3, boxShadow: 2, p: 2 }}>
            <img
              src={featuredProducts[productIdx].image}
              alt={featuredProducts[productIdx].name}
              style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }}
            />
            <Typography variant="subtitle1" fontWeight={600}>{featuredProducts[productIdx].name}</Typography>
            <Typography color="text.secondary" fontSize={15}>{featuredProducts[productIdx].shop}</Typography>
            <Typography color="primary" fontWeight={700} mt={1}>{featuredProducts[productIdx].price}</Typography>
          </Card>
          <IconButton onClick={handleNextProduct} aria-label="Next product">
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Onboarding Tour Modal */}
      <Modal
        open={openTour}
        onClose={handleCloseTour}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 400 } }}
      >
        <Fade in={openTour}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 340,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            outline: 'none',
            textAlign: 'center',
          }}>
            <Typography variant="h6" fontWeight={700} mb={1}>{tourSteps[tourStep].title}</Typography>
            <Typography color="text.secondary" mb={3}>{tourSteps[tourStep].desc}</Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Button onClick={handlePrevTour} disabled={tourStep === 0}>Back</Button>
              <Button onClick={handleNextTour} disabled={tourStep === tourSteps.length - 1}>Next</Button>
            </Box>
            <Button onClick={handleCloseTour} sx={{ mt: 2 }} color="primary" variant="outlined" fullWidth>Close</Button>
          </Box>
        </Fade>
      </Modal>

      {/* How It Works */}
      <Box mb={6}>
        <Typography variant="h5" fontWeight={600} mb={2} align="center" color="primary.main">
          How It Works
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h4" mb={1}>🔎</Typography>
                <Typography variant="subtitle1" fontWeight={600} mb={1}>Search</Typography>
                <Typography color="text.secondary">Browse products and shops in your city using our smart search.</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h4" mb={1}>🗺️</Typography>
                <Typography variant="subtitle1" fontWeight={600} mb={1}>Explore</Typography>
                <Typography color="text.secondary">Use the interactive map to find shops and products near you.</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h4" mb={1}>🛒</Typography>
                <Typography variant="subtitle1" fontWeight={600} mb={1}>Connect</Typography>
                <Typography color="text.secondary">Sign up as a merchant to manage your shop and reach more customers.</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Features */}
      <Box mb={6}>
        <Typography variant="h5" fontWeight={600} mb={2} align="center" color="primary.main">
          Features
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, idx) => (
            <Grid item xs={12} sm={4} key={idx}>
              <Card sx={{ borderRadius: 3, boxShadow: 1, textAlign: 'center', py: 3 }}>
                <Typography variant="h3" mb={1}>{feature.icon}</Typography>
                <Typography variant="subtitle1" fontWeight={600} mb={1}>{feature.title}</Typography>
                <Typography color="text.secondary">{feature.desc}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Map Preview */}
      <Box mb={6} textAlign="center">
        <Typography variant="h5" fontWeight={600} mb={2} color="primary.main">
          Explore Shops on the Map
        </Typography>
        {/* Show user location and merchant info */}
        <Box mb={1}>
          {userLocation && (
            <Typography variant="body2" color="text.secondary">
              Showing shops near: <b>Lat {userLocation.lat.toFixed(4)}, Lng {userLocation.lng.toFixed(4)}</b>
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            {merchantCount > 0
              ? `${merchantCount} merchant${merchantCount > 1 ? 's' : ''} found in your area`
              : 'No merchants found nearby'}
          </Typography>
        </Box>
        <Box
          sx={{
            width: '100%',
            maxWidth: 600,
            height: 280,
            mx: 'auto',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: 2,
            border: '2px solid #e3f0ff',
            background: '#f7fafd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <LeafletMap
            center={userLocation ? [userLocation.lat, userLocation.lng] : [28.6139, 77.2090]}
            markers={merchantMarkers}
            style={{ width: '100%', height: '100%', borderRadius: 12 }}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
