//utils/geocode.js

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
    console.error("Geocoding error:", error);
    return null;
  }
}