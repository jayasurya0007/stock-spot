import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../../services/products';
import { useAuth } from '../../context/AuthContext';

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
          category: product.category || ''
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
    
    // Reset preview when form data changes
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
      
      // Auto-select suggested category if one was generated
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
      
      // Use enhanced description and suggested category if selected
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
      console.log('Product updated successfully:', result);
      navigate('/'); // Navigate back to dashboard
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update product');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <div className="form-container">
        <h2 className="form-title">Edit Product</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Product Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="price" className="form-label">Price</label>
            <input
              type="number"
              id="price"
              name="price"
              className="form-input"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="quantity" className="form-label">Quantity</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              className="form-input"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="category" className="form-label">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              className="form-input"
              value={formData.category}
              onChange={handleChange}
            />
          </div>
          
          {/* Description Enhancement Section */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label htmlFor="description" className="form-label">Description</label>
              <button
                type="button"
                onClick={handlePreviewDescription}
                disabled={previewLoading || !formData.name || !formData.price}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  opacity: previewLoading || !formData.name || !formData.price ? 0.6 : 1
                }}
              >
                {previewLoading ? 'Generating...' : '✨ Enhance with AI'}
              </button>
            </div>
            
            <textarea
              id="description"
              name="description"
              className="form-input"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              placeholder="Enter description (optional) - AI can create a concise version"
            />
            
            {/* Enhanced Description Preview */}
            {showPreview && enhancedDescription && (
              <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#28a745', fontSize: '14px' }}>
                  ✨ AI-Generated Enhancement Preview
                </h4>
                
                {/* Enhanced Description */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057', marginBottom: '5px', display: 'block' }}>
                    Enhanced Description:
                  </label>
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: 'white', 
                    border: '1px solid #e9ecef', 
                    borderRadius: '6px',
                    lineHeight: '1.5',
                    fontSize: '14px'
                  }}>
                    {enhancedDescription}
                  </div>
                </div>

                {/* Suggested Category */}
                {categoryGenerated && suggestedCategory && (
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057', marginBottom: '5px', display: 'block' }}>
                      Suggested Category:
                    </label>
                    <div style={{ 
                      padding: '12px', 
                      backgroundColor: '#f8f9fa', 
                      border: '1px solid #dee2e6', 
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#007bff'
                    }}>
                      {suggestedCategory}
                    </div>
                  </div>
                )}
                
                {/* Description Choice */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#495057', marginBottom: '8px', display: 'block' }}>
                    Choose description to use:
                  </label>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="descriptionSource"
                        value="original"
                        checked={descriptionSource === 'original'}
                        onChange={() => handleDescriptionSourceChange('original')}
                        style={{ marginRight: '6px' }}
                      />
                      Use Current Description
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="descriptionSource"
                        value="enhanced"
                        checked={descriptionSource === 'enhanced'}
                        onChange={() => handleDescriptionSourceChange('enhanced')}
                        style={{ marginRight: '6px' }}
                      />
                      Use AI-Generated Description ✨
                    </label>
                  </div>
                </div>

                {/* Category Choice */}
                {categoryGenerated && suggestedCategory && (
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#495057', marginBottom: '8px', display: 'block' }}>
                      Choose category to use:
                    </label>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="categorySource"
                          value="original"
                          checked={categorySource === 'original'}
                          onChange={() => handleCategorySourceChange('original')}
                          style={{ marginRight: '6px' }}
                        />
                        Use Current Category {formData.category ? `(${formData.category})` : '(None)'}
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="categorySource"
                          value="suggested"
                          checked={categorySource === 'suggested'}
                          onChange={() => handleCategorySourceChange('suggested')}
                          style={{ marginRight: '6px' }}
                        />
                        Use AI-Suggested Category ({suggestedCategory}) ✨
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Auto-enhance option */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="enhanceDescription"
                checked={formData.enhanceDescription}
                onChange={handleChange}
                style={{ marginRight: '8px' }}
              />
              Automatically generate description and category with AI when updating product
            </label>
          </div>
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-secondary"
              disabled={submitLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitLoading}
            >
              {submitLoading ? 'Updating Product...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
