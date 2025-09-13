import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/products';

const MerchantProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getMyProducts();
        setProducts(data.products || []);
      } catch (err) {
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <h2>My Products</h2>
      {products.length === 0 ? (
        <p>No products found. Start by adding your first product!</p>
      ) : (
        <div>
          {products.map(product => (
            <div key={product.id || product._id} className="card" style={{ marginBottom: '1rem' }}>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p><strong>Price:</strong> ${product.price}</p>
              <p><strong>Quantity:</strong> {product.quantity}</p>
              <Link to={`/products/edit/${product.id || product._id}`}>Edit</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MerchantProducts;
