import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../../services/products';
import { useAuth } from '../../context/AuthContext';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    description: '',
    category: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProduct(id);
        const product = data.product;
        setFormData({
          name: product.name || '',
          price: product.price || '',
          quantity: product.quantity || '',
          description: product.description || '',
          category: product.category || ''
        });
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'merchant') {
      fetchProduct();
    } else {
      setError('Access denied. Only merchants can edit products.');
      setLoading(false);
    }
  }, [id, user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.quantity) {
      return setError('Please fill in all required fields');
    }
    
    try {
      setError('');
      setSubmitLoading(true);
      await productService.updateProduct(id, formData);
      navigate('/'); // Navigate back to dashboard
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update product');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <div className="form-container">
        <h2 className="form-title">Edit Product</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
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
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-secondary"
              disabled={submitLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitLoading}
            >
              {submitLoading ? 'Updating Product...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
