import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { merchantService } from '../../services/merchants';
import { productService } from '../../services/products';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../Loading';
import { Search, Package, Edit } from 'lucide-react';

const MerchantProducts = () => {
  const { id } = useParams();
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
          data = await merchantService.getMerchantProducts(id);
        } else {
          if (user?.role === 'merchant') {
            data = await productService.getMyProducts();
          } else {
            setError('Access denied. Only merchants can view their products.');
            return;
          }
        }
        const productsArray = data.products || data;
        setProducts(productsArray);
        setFilteredProducts(productsArray);
      } catch (err) {
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [id, user]);

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

  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === searchTerm.toLowerCase()) {
        return (
          <span 
            key={index} 
            className="bg-yellow-100 text-yellow-800 font-bold px-1 rounded"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const canEditProduct = (product) => {
    if (!id && user?.role === 'merchant') return true;
    if (id && user?.role === 'merchant') {
      return user.id === product.merchant_id || user.id === parseInt(id);
    }
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6 animate-pulse"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6 h-48 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
        {error}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {id ? 'Products for Merchant' : 'My Products'}
          </h1>
          
          {products.length > 0 && (
            <div className="text-sm text-gray-600">
              {filteredProducts.length} of {products.length} products
            </div>
          )}
        </div>

        {products.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products by name, description, or category..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
            </div>
            
            {searchQuery && (
              <div className="mt-2 text-sm text-gray-600">
                {filteredProducts.length > 0 
                  ? `Found ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} matching "${searchQuery}"`
                  : `No products found matching "${searchQuery}"`
                }
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-blue-600 hover:text-blue-700 underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h2>
            <p className="text-gray-600">No products found for this merchant.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">No products match your search criteria.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map(product => (
              <div 
                key={product.id || product._id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                      {searchQuery ? highlightSearchTerm(product.name, searchQuery) : product.name}
                    </h3>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">${product.price}</div>
                      <div className={`text-sm font-medium ${
                        product.quantity === 0 ? 'text-red-600' : product.quantity < 10 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        Stock: {product.quantity}
                      </div>
                    </div>
                  </div>
                  
                  {product.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {searchQuery ? highlightSearchTerm(product.description, searchQuery) : product.description}
                    </p>
                  )}
                  
                  {product.category && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {searchQuery ? highlightSearchTerm(product.category, searchQuery) : product.category}
                      </span>
                    </div>
                  )}

                  {canEditProduct(product) && (
                    <div className="pt-4 border-t border-gray-200">
                      <Link 
                        to={`/products/edit/${product.id || product._id}`}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors w-full flex items-center justify-center gap-2"
                      >
                        <Edit size={16} />
                        Edit Product
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantProducts;