import api from './api';

export const searchService = {
  searchProducts: async (searchData) => {
    const response = await api.post('/search', searchData);
    return response.data;
  },

  searchMerchantsByCity: async (cityName) => {
    const response = await api.post('/search/merchants/city', { cityName });
    return response.data;
  },

  searchMerchantsByLocation: async (lat, lng, distance = 10000) => {
    const response = await api.post('/search/merchants/location', { lat, lng, distance });
    return response.data;
  },

  getMerchantProducts: async (merchantId) => {
    const response = await api.get(`/search/merchants/${merchantId}/products`);
    return response.data;
  }
};