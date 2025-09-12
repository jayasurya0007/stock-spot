import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../../services/products';
import { useAuth } from '../../context/AuthContext';

const MerchantProducts = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchProducts = async () => {
    try {
      const data = await merchantService.getMerchantProducts(id);
      setProducts(data.products || data);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [id]);

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.deleteProduct(productId);
      fetchProducts();
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  // Only allow the merchant who owns this shop to manage products
  if (user?.role !== 'merchant' || (user?.merchant_id && user.merchant_id !== id)) {
    return <div className="container"><h2>Not authorized to view these products.</h2></div>;
  }
  return (
    <div className="container">
      <h2>Your Products</h2>
      {products.length === 0 ? (
        <p>No products found for your shop.</p>
      ) : (
        <div>
          {products.map(product => (
            <div key={product.id || product._id} className="card" style={{ marginBottom: '1rem' }}>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p><strong>Price:</strong> ${product.price}</p>
              <p><strong>Quantity:</strong> {product.quantity}</p>
              <div className="flex gap-2">
                <Link to={`/products/edit/${product.id || product._id}`} className="btn btn-secondary">Edit</Link>
                <button className="btn btn-danger" onClick={() => handleDelete(product.id || product._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MerchantProducts;
