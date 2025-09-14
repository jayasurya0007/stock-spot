import api from '../services/api';

export const getHomeMerchants = async () => {
  // Try to get user's geolocation, fallback to Delhi if not available
  const defaultLat = 28.6139;
  const defaultLng = 77.2090;
  const distance = 10000;

  let lat = defaultLat;
  let lng = defaultLng;

  if (typeof window !== 'undefined' && navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      lat = position.coords.latitude;
      lng = position.coords.longitude;
    } catch (e) {
      // If user denies or error, fallback to default
    }
  }

  const response = await api.post('/search/merchants/location', { lat, lng, distance });
  return {
    merchants: response.data.merchants || [],
    location: { lat, lng }
  };
};
