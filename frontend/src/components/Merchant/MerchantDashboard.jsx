import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/products';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner, SkeletonLoader } from '../Loading';

const MerchantDashboard = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState({});

  const { user } = useAuth();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getMyProducts();
      const productsArray = data.products || [];
      setProducts(productsArray);
      setFilteredProducts(productsArray); // Initially show all products
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

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      setDeleteLoading(prev => ({ ...prev, [productId]: true }));
      await productService.deleteProduct(productId);
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      // Filtered products will be updated automatically by the useEffect
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete product');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <SkeletonLoader type="text" lines={1} height="32px" width="200px" />
        </div>
        <SkeletonLoader type="table" lines={6} />
      </div>
    );
  }
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

  // Check if current user owns the product
  const canEditProduct = (product) => {
    // Since this is MerchantDashboard and uses getMyProducts(), 
    // all products should belong to the current merchant
    return user?.role === 'merchant' && (product.merchant_id === user.id || !product.merchant_id);
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0 }}>My Inventory</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {products.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>
                {filteredProducts.length} of {products.length} products
              </span>
            </div>
          )}
          
          <Link to="/products/add" className="btn btn-primary">
            Add New Product
          </Link>
        </div>
      </div>

      {products.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
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
        <div className="card">
          <p>You don't have any products yet. Start by adding your first product!</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
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
        <div className="card">
          <h2 className="card-title">
            Your Products ({filteredProducts.length}{filteredProducts.length !== products.length ? ` of ${products.length}` : ''})
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Product Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Price</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Stock</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>
                      {searchQuery ? highlightSearchTerm(product.name, searchQuery) : product.name}
                    </td>
                    <td style={{ padding: '12px', maxWidth: '200px' }}>
                      {product.description ? (
                        searchQuery ? 
                          highlightSearchTerm(
                            product.description.length > 50 
                              ? `${product.description.substring(0, 50)}...`
                              : product.description,
                            searchQuery
                          ) :
                          product.description.length > 50 
                            ? `${product.description.substring(0, 50)}...`
                            : product.description
                      ) : '-'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {product.category ? (
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#ecf0f1',
                          color: '#2c3e50',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          {searchQuery ? highlightSearchTerm(product.category, searchQuery) : product.category}
                        </span>
                      ) : (
                        <span style={{ color: '#999', fontSize: '0.8rem' }}>-</span>
                      )}
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
                      {canEditProduct(product) ? (
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
                            style={{ 
                              fontSize: '0.8rem', 
                              padding: '0.4rem 0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            {deleteLoading[product.id] && <LoadingSpinner size="small" color="white" />}
                            {deleteLoading[product.id] ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#666', fontSize: '0.8rem' }}>View Only</span>
                      )}
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