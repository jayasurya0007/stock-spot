import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { merchantService } from '../../services/merchants';

const MerchantProducts = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await merchantService.getMerchantProducts(id);
        setProducts(data.products || data); // support both array and {products: []}
      } catch (err) {
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <h2>Products for Merchant</h2>
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
              <Link to={`/products/edit/${product.id || product._id}`}>Edit</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MerchantProducts;
