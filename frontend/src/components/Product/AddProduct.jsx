import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/products';
import { merchantService } from '../../services/merchants';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    merchant_id: '',
    name: '',
    price: '',
    quantity: '',
    description: '',
    category: ''
  });
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const data = await merchantService.getMerchants();
        setMerchants(data);
      } catch (err) {
        setError('Failed to fetch merchants');
      }
    };

    fetchMerchants();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.merchant_id || !formData.name || !formData.price || !formData.quantity) {
      return setError('Please fill in all required fields');
    }
    
    try {
      setError('');
      setLoading(true);
      await productService.addProduct(formData);
      navigate(`/merchants/${formData.merchant_id}/products`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add product');
    }
    
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2 className="form-title">Add New Product</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="merchant_id" className="form-label">Merchant</label>
            <select
              id="merchant_id"
              name="merchant_id"
              className="form-input"
              value={formData.merchant_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a merchant</option>
              {merchants.map(merchant => (
                <option key={merchant.id} value={merchant.id}>
                  {merchant.shop_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Product Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="price" className="form-label">Price</label>
            <input
              type="number"
              id="price"
              name="price"
              className="form-input"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="quantity" className="form-label">Quantity</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              className="form-input"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-input"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>
          <div className="form-group">
            <label htmlFor="category" className="form-label">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              className="form-input"
              value={formData.category}
              onChange={handleChange}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;