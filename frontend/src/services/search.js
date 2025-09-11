import api from './api';

export const searchService = {
  searchProducts: async (searchData) => {
    const response = await api.post('/search', searchData);
    return response.data;
  }
};