import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { merchantService } from '../../services/merchants';
import { useAuth } from '../../context/AuthContext';

const MerchantDashboard = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();
  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const data = await merchantService.getMerchants();
        // Only show the merchant created by this user (should be at most one)
        setMerchants(data.filter(m => m.user_id === user.id));
      } catch (err) {
        setError('Failed to fetch merchant info');
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'merchant') fetchMerchants();
  }, [user]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  if (user?.role !== 'merchant') return null;
  return (
    <div className="container">
      <h1>Merchant Dashboard</h1>
      <div className="card">
        <h2 className="card-title">Your Shop</h2>
        {merchants.length === 0 ? (
          <p>You don't have a shop yet. Please contact admin if this is an error.</p>
        ) : (
          <div>
            <div key={merchants[0].id} className="card" style={{ marginBottom: '1rem' }}>
              <h3>{merchants[0].shop_name}</h3>
              <p>{merchants[0].address}</p>
              <Link 
                to={`/merchants/${merchants[0].id}/products`}
                className="btn btn-primary"
              >
                View Products
              </Link>
            </div>
            <Link to={`/products/add?merchant_id=${merchants[0].id}`} className="btn btn-primary">
              Add Product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantDashboard;