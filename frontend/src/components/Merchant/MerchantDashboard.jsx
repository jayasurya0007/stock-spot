import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { merchantService } from '../../services/merchants';

const MerchantDashboard = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const data = await merchantService.getMerchants();
        setMerchants(data);
      } catch (err) {
        setError('Failed to fetch merchants');
      } finally {
        setLoading(false);
      }
    };

    fetchMerchants();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <h1>Merchant Dashboard</h1>
      <div className="card">
        <h2 className="card-title">Your Merchants</h2>
        {merchants.length === 0 ? (
          <p>You don't have any merchants yet.</p>
        ) : (
          <div>
            {merchants.map(merchant => (
              <div key={merchant.id} className="card" style={{ marginBottom: '1rem' }}>
                <h3>{merchant.shop_name}</h3>
                <p>{merchant.address}</p>
                <Link 
                  to={`/merchants/${merchant.id}/products`}
                  className="btn btn-primary"
                >
                  View Products
                </Link>
              </div>
            ))}
          </div>
        )}
        <Link to="/merchants/add" className="btn btn-primary">
          Add New Merchant
        </Link>
      </div>
    </div>
  );
};

export default MerchantDashboard;