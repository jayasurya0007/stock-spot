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

  getMyMerchantDetails: async () => {
    const response = await api.get('/merchant/my-details');
    return response.data;
  },

  updateMerchantDetails: async (merchantData) => {
    const response = await api.put('/merchant/my-details', merchantData);
    return response.data;
  },

  getMapData: async () => {
    const response = await api.get('/search/map-data');
    return response.data;
  },

  getAddressFromCoords: async (latitude, longitude) => {
    const response = await api.get(`/merchant/address-from-coords?latitude=${latitude}&longitude=${longitude}`);
    return response.data;
  }
};