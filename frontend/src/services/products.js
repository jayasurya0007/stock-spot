import api from './api';

export const productService = {
  addProduct: async (productData) => {
    const response = await api.post('/product/add', productData);
    return response.data;
  },

  updateProduct: async (productId, productData) => {
    const response = await api.put(`/product/${productId}`, productData);
    return response.data;
  },

  deleteProduct: async (productId) => {
    const response = await api.delete(`/product/${productId}`);
    return response.data;
  }
};