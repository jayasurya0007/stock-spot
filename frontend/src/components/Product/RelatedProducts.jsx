import React, { useState, useEffect } from 'react';
import { productService } from '../../services/products';
import { LoadingSpinner } from '../Loading';

const RelatedProducts = ({ productId, productName, onProductSelect }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [targetProduct, setTargetProduct] = useState(null);

  useEffect(() => {
    if (productId) {
      fetchRelatedProducts();
    }
  }, [productId]);

  const fetchRelatedProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await productService.getRelatedProducts(productId, 10);
      setRelatedProducts(data.related_products || []);
      setTargetProduct(data.target_product || null);
    } catch (err) {
      console.error('Error fetching related products:', err);
      setError(err.response?.data?.error || 'Failed to fetch related products');
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return '#28a745'; // Green for very high
    if (percentage >= 60) return '#17a2b8'; // Blue for high  
    if (percentage >= 40) return '#ffc107'; // Yellow for medium
    if (percentage >= 20) return '#fd7e14'; // Orange for low
    return '#dc3545'; // Red for very low
  };

  const getMatchIcon = (matchLevel) => {
    switch (matchLevel) {
      case 'very_high': return '🎯';
      case 'high': return '🔥';
      case 'medium': return '💫';
      case 'low': return '💡';
      default: return '🔍';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <LoadingSpinner size="medium" text="Finding related products..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f8d7da', 
        color: '#721c24', 
        borderRadius: '8px',
        border: '1px solid #f5c6cb'
      }}>
        <h4>Error loading related products</h4>
        <p>{error}</p>
        <button 
          onClick={fetchRelatedProducts}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#e2e3e5', 
        color: '#495057', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h4>No related products found</h4>
        <p>We couldn't find any products similar to "{productName || 'this product'}".</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          color: '#2c3e50', 
          borderBottom: '2px solid #3498db', 
          paddingBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🔗 Products Related to "{targetProduct?.name || productName}"
        </h3>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
          Found {relatedProducts.length} similar products, sorted by match percentage (highest first)
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gap: '16px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))'
      }}>
        {relatedProducts.map((product, index) => {
          const matchPercentage = product.similarity_metrics?.match_percentage || 0;
          const matchLevel = product.similarity_metrics?.match_level || 'low';
          
          return (
            <div 
              key={product.id} 
              style={{
                border: `2px solid ${getMatchColor(matchPercentage)}`,
                borderRadius: '12px',
                padding: '16px',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: onProductSelect ? 'pointer' : 'default'
              }}
              onClick={() => onProductSelect && onProductSelect(product)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              {/* Match percentage badge */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <span style={{
                  backgroundColor: getMatchColor(matchPercentage),
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {getMatchIcon(matchLevel)} {matchPercentage.toFixed(1)}%
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#666',
                  backgroundColor: '#f8f9fa',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  textTransform: 'capitalize'
                }}>
                  #{index + 1}
                </span>
              </div>

              {/* Product details */}
              <h4 style={{ 
                color: '#2c3e50', 
                marginBottom: '8px',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                {product.name}
              </h4>
              
              <div style={{ marginBottom: '12px' }}>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  <strong>Price:</strong> ${product.price}
                </p>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  <strong>Quantity:</strong> {product.quantity} available
                </p>
                {product.category && (
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    <strong>Category:</strong> 
                    <span style={{
                      backgroundColor: '#e9ecef',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      marginLeft: '4px'
                    }}>
                      {product.category}
                    </span>
                  </p>
                )}
              </div>

              {/* Merchant info */}
              <div style={{ 
                borderTop: '1px solid #e9ecef',
                paddingTop: '12px',
                marginTop: '12px'
              }}>
                <p style={{ margin: '4px 0', fontSize: '14px', color: '#495057' }}>
                  <strong>🏪 Shop:</strong> {product.merchant?.shop_name}
                </p>
                {product.merchant?.address && (
                  <p style={{ margin: '4px 0', fontSize: '12px', color: '#6c757d' }}>
                    📍 {product.merchant.address}
                  </p>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div style={{ 
                  marginTop: '12px',
                  padding: '8px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#495057',
                  lineHeight: '1.4'
                }}>
                  {product.description.length > 100 
                    ? `${product.description.substring(0, 100)}...`
                    : product.description
                  }
                </div>
              )}

              {/* Match level indicator */}
              <div style={{ 
                marginTop: '12px',
                fontSize: '12px',
                color: '#666',
                textAlign: 'center',
                fontStyle: 'italic'
              }}>
                {matchLevel.replace('_', ' ').toUpperCase()} similarity match
              </div>
            </div>
          );
        })}
      </div>

      {relatedProducts.length >= 10 && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          color: '#6c757d',
          fontSize: '14px'
        }}>
          Showing top 10 related products. The results are sorted by similarity percentage.
        </div>
      )}
    </div>
  );
};

export default RelatedProducts;