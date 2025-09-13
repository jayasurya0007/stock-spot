import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { merchantService } from '../../services/merchants';
import { productService } from '../../services/products';
import { useAuth } from '../../context/AuthContext';

const MerchantProducts = () => {
  const { id } = useParams(); // This will be undefined if no ID in URL
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
        const productsArray = data.products || data;
        setProducts(productsArray);
        setFilteredProducts(productsArray); // Initially show all products
      } catch (err) {
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [id, user]);

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Function to highlight search terms in text
  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === searchTerm.toLowerCase()) {
        return (
          <span 
            key={index} 
            style={{ 
              backgroundColor: '#fff3cd', 
              color: '#856404',
              fontWeight: 'bold',
              padding: '0 2px',
              borderRadius: '2px'
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0 }}>{id ? 'Products for Merchant' : 'My Products'}</h2>
        
        {products.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>
              {filteredProducts.length} of {products.length} products
            </span>
          </div>
        )}
      </div>

      {products.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="Search products by name, description, or category..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={{
                width: '100%',
                padding: '0.75rem 2.5rem 0.75rem 1rem',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3498db'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
            <div style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#666',
              fontSize: '1.2rem'
            }}>
              🔍
            </div>
          </div>
          
          {searchQuery && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
              {filteredProducts.length > 0 
                ? `Found ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} matching "${searchQuery}"`
                : `No products found matching "${searchQuery}"`
              }
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    marginLeft: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: '#3498db',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '0.9rem'
                  }}
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <p>No products found for this merchant.</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <p>No products match your search criteria.</p>
          <button
            onClick={() => setSearchQuery('')}
            className="btn btn-secondary"
            style={{ marginTop: '1rem' }}
          >
            Show All Products
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredProducts.map(product => (
            <div 
              key={product.id || product._id} 
              className="card" 
              style={{ 
                padding: '1.5rem', 
                border: '1px solid #ddd', 
                borderRadius: '8px',
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.3rem' }}>
                  {searchQuery ? highlightSearchTerm(product.name, searchQuery) : product.name}
                </h3>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#27ae60' }}>
                    ${product.price}
                  </div>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: product.quantity === 0 ? '#e74c3c' : product.quantity < 10 ? '#f39c12' : '#27ae60',
                    fontWeight: 'bold'
                  }}>
                    Stock: {product.quantity}
                  </div>
                </div>
              </div>
              
              {product.description && (
                <p style={{ margin: '0 0 1rem 0', color: '#666', lineHeight: '1.5' }}>
                  {searchQuery ? highlightSearchTerm(product.description, searchQuery) : product.description}
                </p>
              )}
              
              {product.category && (
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: '#ecf0f1',
                    color: '#2c3e50',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {searchQuery ? highlightSearchTerm(product.category, searchQuery) : product.category}
                  </span>
                </div>
              )}

              {canEditProduct(product) && (
                <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                  <Link 
                    to={`/products/edit/${product.id || product._id}`}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.9rem' }}
                  >
                    Edit Product
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MerchantProducts;
