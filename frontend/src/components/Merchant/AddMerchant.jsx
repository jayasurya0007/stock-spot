import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { merchantService } from '../../services/merchants';

const AddMerchant = () => {
  const [formData, setFormData] = useState({
    shop_name: '',
    address: '',
    owner_name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.shop_name || !formData.address) {
      return setError('Shop name and address are required');
    }
    
    try {
      setError('');
      setLoading(true);
      await merchantService.addMerchant(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add merchant');
    }
    
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2 className="form-title">Add New Merchant</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="shop_name" className="form-label">Shop Name</label>
            <input
              type="text"
              id="shop_name"
              name="shop_name"
              className="form-input"
              value={formData.shop_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address" className="form-label">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              className="form-input"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="owner_name" className="form-label">Owner Name</label>
            <input
              type="text"
              id="owner_name"
              name="owner_name"
              className="form-input"
              value={formData.owner_name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Adding Merchant...' : 'Add Merchant'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMerchant;