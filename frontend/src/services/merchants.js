import api from './api';

export const merchantService = {
  getMerchants: async () => {
    const response = await api.get('/merchant/');
    return response.data;
  },

  addMerchant: async (merchantData) => {
    const response = await api.post('/merchants/add', merchantData);
    return response.data;
  },

  getMerchantProducts: async (merchantId) => {
    const response = await api.get(`/merchant/${merchantId}/products`);
    return response.data;
  },

  getMapData: async () => {
    const response = await api.get('/search/map-data');
    return response.data;
  }
};