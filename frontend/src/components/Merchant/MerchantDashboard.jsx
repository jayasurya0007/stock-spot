import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/products';
import { useAuth } from '../../context/AuthContext';

const MerchantDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState({});

  const { user } = useAuth();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getMyProducts();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'merchant') {
      fetchProducts();
    }
  }, [user]);

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      setDeleteLoading(prev => ({ ...prev, [productId]: true }));
      await productService.deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete product');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  
  if (user?.role !== 'merchant') {
    return (
      <div className="error">
        <h2>Access Denied</h2>
        <p>This page is only available for merchants.</p>
        <p>Current user role: {user?.role || 'No role'}</p>
        <p>User: {JSON.stringify(user)}</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>My Inventory</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/products/add" className="btn btn-primary">
          Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="card">
          <p>You don't have any products yet. Start by adding your first product!</p>
        </div>
      ) : (
        <div className="card">
          <h2 className="card-title">Your Products ({products.length})</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Product Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Price</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Stock</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{product.name}</td>
                    <td style={{ padding: '12px', maxWidth: '200px' }}>
                      {product.description ? (
                        product.description.length > 50 
                          ? `${product.description.substring(0, 50)}...`
                          : product.description
                      ) : '-'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>${product.price}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <span style={{ 
                        color: product.quantity === 0 ? 'red' : product.quantity < 10 ? 'orange' : 'green',
                        fontWeight: 'bold'
                      }}>
                        {product.quantity}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <Link 
                          to={`/products/edit/${product.id}`}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="btn btn-danger"
                          disabled={deleteLoading[product.id]}
                          style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                        >
                          {deleteLoading[product.id] ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantDashboard;