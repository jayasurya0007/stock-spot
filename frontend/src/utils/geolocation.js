// utils/geolocation.js - Better geolocation handling for mobile devices

/**
 * Enhanced geolocation utility with better mobile support and error handling
 */

// Check if geolocation is available and secure
export const isGeolocationAvailable = () => {
  return (
    'geolocation' in navigator &&
    (window.location.protocol === 'https:' || window.location.hostname === 'localhost')
  );
};

// Get user location with improved error handling
export const getCurrentLocation = (options = {}) => {
  return new Promise((resolve, reject) => {
    // Check if geolocation is available
    if (!navigator.geolocation) {
      reject({
        code: 'NOT_SUPPORTED',
        message: 'Geolocation is not supported by this browser',
        userMessage: 'Your browser doesn\'t support location services. Please enter your coordinates manually.'
      });
      return;
    }

    // Check if we're on HTTPS (required for mobile)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      reject({
        code: 'INSECURE_CONTEXT',
        message: 'Geolocation requires HTTPS',
        userMessage: 'Location services require a secure connection. Please enter your coordinates manually.'
      });
      return;
    }

    // Default options with mobile-friendly settings
    const defaultOptions = {
      enableHighAccuracy: false, // More battery efficient for mobile
      timeout: 15000, // Longer timeout for mobile networks
      maximumAge: 600000 // 10 minutes cache
    };

    const finalOptions = { ...defaultOptions, ...options };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let userMessage = '';
        let code = '';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            code = 'PERMISSION_DENIED';
            userMessage = 'Location access was denied. To use this feature, please:\n' +
                         '1. Enable location services in your device settings\n' +
                         '2. Allow location access for this website\n' +
                         '3. Or enter your coordinates manually below';
            break;
          case error.POSITION_UNAVAILABLE:
            code = 'POSITION_UNAVAILABLE';
            userMessage = 'Unable to determine your location. Please check your internet connection or enter coordinates manually.';
            break;
          case error.TIMEOUT:
            code = 'TIMEOUT';
            userMessage = 'Location request timed out. Please try again or enter coordinates manually.';
            break;
          default:
            code = 'UNKNOWN_ERROR';
            userMessage = 'Unable to get your location. Please enter coordinates manually.';
        }

        reject({
          code,
          message: error.message,
          userMessage,
          originalError: error
        });
      },
      finalOptions
    );
  });
};

// Get location with user-friendly UI feedback
export const getLocationWithFeedback = async (setLoadingFn, setErrorFn) => {
  try {
    setLoadingFn(true);
    setErrorFn('');
    
    const location = await getCurrentLocation();
    setLoadingFn(false);
    return location;
  } catch (error) {
    setLoadingFn(false);
    setErrorFn(error.userMessage);
    throw error;
  }
};

// Popular city coordinates as fallbacks
export const popularCityCoordinates = {
  'Mumbai': { lat: 19.0760, lng: 72.8777, name: 'Mumbai, India' },
  'Delhi': { lat: 28.7041, lng: 77.1025, name: 'Delhi, India' },
  'Bangalore': { lat: 12.9716, lng: 77.5946, name: 'Bangalore, India' },
  'Chennai': { lat: 13.0827, lng: 80.2707, name: 'Chennai, India' },
  'Hyderabad': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad, India' },
  'Pune': { lat: 18.5204, lng: 73.8567, name: 'Pune, India' },
  'Kolkata': { lat: 22.5726, lng: 88.3639, name: 'Kolkata, India' },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad, India' },
  'New York': { lat: 40.7128, lng: -74.0060, name: 'New York, USA' },
  'London': { lat: 51.5074, lng: -0.1278, name: 'London, UK' }
};

// Get coordinates for a city
export const getCityCoordinates = (cityName) => {
  return popularCityCoordinates[cityName] || null;
};