import React, { useState, useEffect } from 'react';
import { productService } from '../../services/products';
import { LoadingSpinner } from '../Loading';
import { ExternalLink, RotateCw } from 'lucide-react';

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
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (percentage >= 60) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (percentage >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (percentage >= 20) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
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
      <div className="p-6 text-center">
        <LoadingSpinner size="medium" text="Finding related products..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-800">
        <h4 className="font-medium mb-2">Error loading related products</h4>
        <p className="mb-4">{error}</p>
        <button 
          onClick={fetchRelatedProducts}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors mx-auto"
        >
          <RotateCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return (
      <div className="p-6 bg-gray-100 border border-gray-200 rounded-xl text-center">
        <h4 className="font-medium mb-2">No related products found</h4>
        <p>We couldn't find any products similar to "{productName || 'this product'}".</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 border-b-2 border-blue-500 pb-2 flex items-center gap-2">
          <span>🔗</span>
          Products Related to "{targetProduct?.name || productName}"
        </h3>
        <p className="text-gray-600 text-sm mt-2">
          Found {relatedProducts.length} similar products, sorted by match percentage (highest first)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {relatedProducts.map((product, index) => {
          const matchPercentage = product.similarity_metrics?.match_percentage || 0;
          const matchLevel = product.similarity_metrics?.match_level || 'low';
          const matchColorClass = getMatchColor(matchPercentage);
          
          return (
            <div 
              key={product.id} 
              className={`border-2 rounded-xl p-4 bg-white shadow-sm transition-all duration-200 hover:shadow-md ${
                onProductSelect ? 'cursor-pointer' : 'cursor-default'
              }`}
              onClick={() => onProductSelect && onProductSelect(product)}
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${matchColorClass}`}>
                  {getMatchIcon(matchLevel)} {matchPercentage.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  #{index + 1}
                </span>
              </div>

              <h4 className="font-bold text-gray-900 mb-2 text-lg">
                {product.name}
              </h4>
              
              <div className="mb-3 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Price:</span> ${product.price}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Quantity:</span> {product.quantity} available
                </p>
                {product.category && (
                  <p className="text-sm">
                    <span className="font-medium">Category:</span>
                    <span className="ml-1 bg-gray-100 px-2 py-1 rounded-md text-xs">
                      {product.category}
                    </span>
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-3 mt-3">
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">🏪 Shop:</span> {product.merchant?.shop_name}
                </p>
                {product.merchant?.address && (
                  <p className="text-xs text-gray-500">
                    📍 {product.merchant.address}
                  </p>
                )}
              </div>

              {product.description && (
                <div className="mt-3 p-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                  {product.description.length > 100 
                    ? `${product.description.substring(0, 100)}...`
                    : product.description
                  }
                </div>
              )}

              <div className="mt-3 text-xs text-gray-500 text-center italic">
                {matchLevel.replace('_', ' ').toUpperCase()} similarity match
              </div>

              {onProductSelect && (
                <div className="mt-3 flex justify-end">
                  <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
                    View details
                    <ExternalLink size={12} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {relatedProducts.length >= 10 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center text-gray-600 text-sm">
          Showing top 10 related products. The results are sorted by similarity percentage.
        </div>
      )}
    </div>
  );
};

export default RelatedProducts;