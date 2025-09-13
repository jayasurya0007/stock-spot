import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { merchantService } from '../../services/merchants';
import { productService } from '../../services/products';
import { useAuth } from '../../context/AuthContext';

const MerchantProducts = () => {
  const { id } = useParams(); // This will be undefined if no ID in URL
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let data;
        if (id) {
          // Fetch products for specific merchant (when viewing another merchant's products)
          data = await merchantService.getMerchantProducts(id);
        } else {
          // No ID provided, fetch current user's products (for merchant role)
          if (user?.role === 'merchant') {
            data = await productService.getMyProducts();
          } else {
            setError('Access denied. Only merchants can view their products.');
            return;
          }
        }
        setProducts(data.products || data); // support both array and {products: []}
      } catch (err) {
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [id, user]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  // Check if current user owns the product
  const canEditProduct = (product) => {
    // If viewing own products (no ID), user can edit
    if (!id && user?.role === 'merchant') return true;
    
    // If viewing another merchant's products, check if current user is the owner
    if (id && user?.role === 'merchant') {
      return user.id === product.merchant_id || user.id === parseInt(id);
    }
    
    return false;
  };

  return (
    <div className="container">
      <h2>{id ? 'Products for Merchant' : 'My Products'}</h2>
      {products.length === 0 ? (
        <p>No products found for this merchant.</p>
      ) : (
        <div>
          {products.map(product => (
            <div key={product.id || product._id} className="card" style={{ marginBottom: '1rem' }}>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p><strong>Price:</strong> ${product.price}</p>
              <p><strong>Quantity:</strong> {product.quantity}</p>
              {canEditProduct(product) && (
                <Link to={`/products/edit/${product.id || product._id}`}>Edit</Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MerchantProducts;
