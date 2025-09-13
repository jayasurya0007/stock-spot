import api from './api';

export const merchantService = {
  getMerchants: async () => {
    const response = await api.get('/merchant/');
    return response.data;
  },

  addMerchant: async (merchantData) => {
    const response = await api.post('/merchant/add', merchantData);
    return response.data;
  },

  getMerchantProducts: async (merchantId) => {
    const response = await api.get(`/merchant/${merchantId}/products`);
    return response.data;
  },

  getMerchantInfo: async () => {
    const response = await api.get('/merchant/my-info');
    return response.data;
  },

  updateMerchantLocation: async (locationData) => {
    const response = await api.put('/merchant/update-location', locationData);
    return response.data;
  },

  getMapData: async () => {
    const response = await api.get('/search/map-data');
    return response.data;
  }
};