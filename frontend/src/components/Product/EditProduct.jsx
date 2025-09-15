import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../../services/products';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner, SkeletonLoader } from '../Loading';
import { Sparkles, ArrowLeft } from 'lucide-react';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    description: '',
    category: '',
    enhanceDescription: false
  });
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [enhancedDescription, setEnhancedDescription] = useState('');
  const [suggestedCategory, setSuggestedCategory] = useState('');
  const [categoryGenerated, setCategoryGenerated] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [descriptionSource, setDescriptionSource] = useState('original');
  const [categorySource, setCategorySource] = useState('original');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProduct(id);
        const product = data.product;
        setFormData({
          name: product.name || '',
          price: product.price || '',
          quantity: product.quantity || '',
          description: product.description || '',
          category: product.category || '',
          enhanceDescription: false
        });
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'merchant') {
      fetchProduct();
    } else {
      setError('Access denied. Only merchants can edit products.');
      setLoading(false);
    }
  }, [id, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    if (['name', 'price', 'category'].includes(name)) {
      setShowPreview(false);
      setEnhancedDescription('');
    }
  };

  const handlePreviewDescription = async () => {
    if (!formData.name || !formData.price) {
      setError('Please fill in name and price before previewing enhancement');
      return;
    }

    try {
      setPreviewLoading(true);
      setError('');
      
      const preview = await productService.previewEnhancedDescriptionForUpdate({
        name: formData.name,
        price: formData.price,
        quantity: formData.quantity || 1,
        description: formData.description,
        category: formData.category
      });

      setEnhancedDescription(preview.enhancedDescription);
      setSuggestedCategory(preview.suggestedCategory);
      setCategoryGenerated(preview.categoryGenerated);
      setShowPreview(true);
      setDescriptionSource('enhanced');
      
      if (preview.categoryGenerated && preview.suggestedCategory) {
        setCategorySource('suggested');
      }
      
      if (!preview.success) {
        setError(`Enhancement warning: ${preview.error}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to preview enhancement');
      setEnhancedDescription('');
      setSuggestedCategory('');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDescriptionSourceChange = (source) => {
    setDescriptionSource(source);
  };

  const handleCategorySourceChange = (source) => {
    setCategorySource(source);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.quantity) {
      return setError('Please fill in all required fields');
    }
    
    try {
      setError('');
      setSubmitLoading(true);
      
      const finalDescription = descriptionSource === 'enhanced' && enhancedDescription 
        ? enhancedDescription 
        : formData.description;
      
      const finalCategory = categorySource === 'suggested' && suggestedCategory
        ? suggestedCategory
        : formData.category;
      
      const productData = {
        ...formData,
        description: finalDescription,
        category: finalCategory,
        enhanceDescription: formData.enhanceDescription && (descriptionSource === 'original' || categorySource === 'original')
      };
      
      const result = await productService.updateProduct(id, productData);
      //console.log('Product updated successfully:', result);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update product');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 sm:p-8">
          <SkeletonLoader type="text" lines={1} height="32px" width="200px" />
          <div className="mt-8 space-y-4">
            <SkeletonLoader type="card" />
            <SkeletonLoader type="card" />
            <SkeletonLoader type="card" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 sm:p-8">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            {error}
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={16} />
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 sm:p-8">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mr-4"
          >
            <ArrowLeft size={16} />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
              />
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                value={formData.category}
                onChange={handleChange}
              />
            </div>
            
            <div className="sm:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <button
                  type="button"
                  onClick={handlePreviewDescription}
                  disabled={previewLoading || !formData.name || !formData.price}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {previewLoading ? (
                    <>
                      <LoadingSpinner size="small" color="blue" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Enhance with AI</span>
                    </>
                  )}
                </button>
              </div>
              
              <textarea
                id="description"
                name="description"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Enter description (optional) - AI can create a concise version"
              />
              
              {showPreview && enhancedDescription && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-blue-800 font-medium mb-3 flex items-center gap-1">
                    <Sparkles size={16} />
                    AI-Generated Enhancement Preview
                  </h4>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enhanced Description:
                    </label>
                    <div className="p-3 bg-white border border-gray-200 rounded-md text-sm">
                      {enhancedDescription}
                    </div>
                  </div>

                  {categoryGenerated && suggestedCategory && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Suggested Category:
                      </label>
                      <div className="p-3 bg-blue-100 border border-blue-200 rounded-md text-sm font-medium text-blue-700">
                        {suggestedCategory}
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose description to use:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="descriptionSource"
                          value="original"
                          checked={descriptionSource === 'original'}
                          onChange={() => handleDescriptionSourceChange('original')}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        Use Current Description
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="descriptionSource"
                          value="enhanced"
                          checked={descriptionSource === 'enhanced'}
                          onChange={() => handleDescriptionSourceChange('enhanced')}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        Use AI-Generated Description
                      </label>
                    </div>
                  </div>

                  {categoryGenerated && suggestedCategory && (
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Choose category to use:
                      </label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="categorySource"
                            value="original"
                            checked={categorySource === 'original'}
                            onChange={() => handleCategorySourceChange('original')}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          Use Current Category {formData.category && `(${formData.category})`}
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="categorySource"
                            value="suggested"
                            checked={categorySource === 'suggested'}
                            onChange={() => handleCategorySourceChange('suggested')}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          Use AI-Suggested Category ({suggestedCategory})
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="enhanceDescription"
                  checked={formData.enhanceDescription}
                  onChange={handleChange}
                  className="text-blue-600 focus:ring-blue-500"
                />
                Automatically generate description and category with AI when updating product
              </label>
            </div>
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={submitLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 shadow-md flex items-center justify-center disabled:opacity-50"
              disabled={submitLoading}
            >
              {submitLoading ? (
                <>
                  <LoadingSpinner size="small" color="white" />
                  <span className="ml-2">Updating Product...</span>
                </>
              ) : (
                'Update Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;