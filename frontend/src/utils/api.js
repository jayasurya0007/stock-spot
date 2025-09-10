import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }).then(res => res.data),
  register: (email, password, role) => 
    api.post('/auth/register', { email, password, role }).then(res => res.data),
}

export const searchAPI = {
  search: (query, lat, lng, distance) => 
    api.post('/search', { query, lat, lng, distance }).then(res => res.data),
  getMapData: () => 
    api.get('/search/map-data').then(res => res.data),
}

export const merchantAPI = {
  add: (shopData) => 
    api.post('/merchant/add', shopData).then(res => res.data),
  getProducts: (merchantId) => 
    api.get(`/merchant/${merchantId}/products`).then(res => res.data),
}

export const productAPI = {
  add: (productData) => 
    api.post('/product/add', productData).then(res => res.data),
  update: (productId, productData) => 
    api.put(`/product/${productId}`, productData).then(res => res.data),
  delete: (productId) => 
    api.delete(`/product/${productId}`).then(res => res.data),
}

export default api