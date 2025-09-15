//utils/geocode.js

/**
 * Forward geocoding: Convert address to coordinates
 * @param {string} address - The address to geocode
 * @returns {Promise<Object|null>} Location object with lat, lng or null
 */
export async function geocodeAddress(address) {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const resp = await fetch(url);
    const data = await resp.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].geometry.location; // { lat, lng }
    }
    return null;
  } catch (error) {
    console.error("Forward geocoding error:", error);
    return null;
  }
}

/**
 * Reverse geocoding: Convert coordinates to address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string|null>} Formatted address or null
 */
export async function reverseGeocode(lat, lng) {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const resp = await fetch(url);
    const data = await resp.json();
    
    if (data.status === 'REQUEST_DENIED') {
      console.error('🚨 Google Maps API error:', data.error_message);
      return null;
    }
    
    if (data.results && data.results.length > 0) {
      // Return the most detailed formatted address
      return data.results[0].formatted_address;
    }
    return null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

/**
 * Get a more concise address from coordinates (street + area + city)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string|null>} Concise address or null
 */
export async function getShortAddress(lat, lng) {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const resp = await fetch(url);
    const data = await resp.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const addressComponents = result.address_components;
      
      // Extract key components for a concise address
      let streetNumber = '';
      let route = '';
      let sublocality = '';
      let locality = '';
      let adminArea = '';
      
      addressComponents.forEach(component => {
        const types = component.types;
        if (types.includes('street_number')) {
          streetNumber = component.long_name;
        } else if (types.includes('route')) {
          route = component.long_name;
        } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
          sublocality = component.long_name;
        } else if (types.includes('locality')) {
          locality = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          adminArea = component.short_name;
        }
      });
      
      // Build concise address
      const parts = [];
      if (streetNumber && route) {
        parts.push(`${streetNumber} ${route}`);
      } else if (route) {
        parts.push(route);
      }
      
      if (sublocality) parts.push(sublocality);
      if (locality) parts.push(locality);
      if (adminArea) parts.push(adminArea);
      
      return parts.join(', ') || result.formatted_address;
    }
    return null;
  } catch (error) {
    console.error("Short address geocoding error:", error);
    return null;
  }
}