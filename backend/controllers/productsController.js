import { getEmbedding } from '../utils/embeddings.js';
import { enhanceProductDescription } from '../utils/productDescriptionEnhancer.js';
import pool from '../config/database.js';
//console.log("Loaded productController.js from:", import.meta.url);

const addProduct = async (req, res) => {
  const { name, price, quantity, description, category, enhanceDescription = true } = req.body;

  if (!name || !price || quantity === undefined) {
    return res.status(400).json({ error: 'Name, price, and quantity are required' });
  }

  try {
    const conn = await pool.getConnection();
    
    // Get merchant for this user - merchants can only add products to their own shop
    const [merchants] = await conn.execute('SELECT id FROM merchants WHERE user_id = ?', [req.user.id]);
    if (!merchants.length) {
      conn.release();
      return res.status(404).json({ error: 'Merchant not found for this user' });
    }
    
    const merchantId = merchants[0].id;
    
    // Enhance product description and generate category if requested
    let finalDescription = description || null;
    let finalCategory = category || null;
    let descriptionEnhancementInfo = null;
    
    if (enhanceDescription) {
      //console.log('🚀 Enhancing product description and generating category for:', name);
      const enhancementResult = await enhanceProductDescription({
        name, price, quantity, description, category
      });
      
      finalDescription = enhancementResult.enhancedDescription;
      finalCategory = enhancementResult.suggestedCategory || category || null;
      descriptionEnhancementInfo = {
        originalDescription: enhancementResult.originalDescription,
        originalCategory: enhancementResult.originalCategory,
        enhancedDescription: enhancementResult.enhancedDescription,
        suggestedCategory: enhancementResult.suggestedCategory,
        categoryGenerated: enhancementResult.categoryGenerated,
        success: enhancementResult.success,
        error: enhancementResult.error
      };
      
      //console.log('📝 Enhancement result:', descriptionEnhancementInfo);
    }
    
    const embedding = await getEmbedding(name + " " + (finalDescription || ""));
    
    const [result] = await conn.execute(
      'INSERT INTO products (merchant_id, name, price, quantity, description, category, embedding) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [merchantId, name, price, quantity, finalDescription, finalCategory, JSON.stringify(embedding)]
    );
    conn.release();

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Product added successfully',
      product: { 
        id: result.insertId, 
        name, 
        price, 
        quantity, 
        description: finalDescription, 
        category: finalCategory 
      },
      enhancement: descriptionEnhancementInfo
    });
  } catch (err) {
    console.error('Product add failed:', err);
    res.status(500).json({ error: 'Failed to add product', details: err.message });
  }
};

const updateProduct = async (req, res) => {
  const { product_id } = req.params;
  const { name, price, quantity, description, category, enhanceDescription = false } = req.body;

  if (!product_id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    const conn = await pool.getConnection();
    
    // Ownership check: only allow if product belongs to merchant
    if (req.user.role === 'merchant') {
      const [rows] = await conn.execute('SELECT merchant_id FROM products WHERE id = ?', [product_id]);
      if (!rows.length) {
        conn.release();
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // Get merchant for this user
      const [merchants] = await conn.execute('SELECT id FROM merchants WHERE user_id = ?', [req.user.id]);
      if (!merchants.length || rows[0].merchant_id !== merchants[0].id) {
        conn.release();
        return res.status(403).json({ error: 'You do not have permission to update this product' });
      }
    }
    
    // Get current product data for enhancement if needed
    let currentProduct = {};
    if (enhanceDescription || name !== undefined || description !== undefined || category !== undefined) {
      const [currentRows] = await conn.execute('SELECT name, price, description, category FROM products WHERE id = ?', [product_id]);
      if (currentRows.length > 0) {
        currentProduct = currentRows[0];
      }
    }

    // Enhance description and category if requested
    let finalDescription = description;
    let finalCategory = category;
    let descriptionEnhancementInfo = null;
    
    if (enhanceDescription) {
      //console.log('🚀 Enhancing product description during update for product ID:', product_id);
      
      // Use new values if provided, otherwise use current values
      const enhancementData = {
        name: name !== undefined ? name : currentProduct.name,
        price: price !== undefined ? price : currentProduct.price,
        quantity: quantity !== undefined ? quantity : 1, // Use 1 as default since we don't include quantity in description
        description: description !== undefined ? description : currentProduct.description,
        category: category !== undefined ? category : currentProduct.category
      };
      
      const enhancementResult = await enhanceProductDescription(enhancementData);
      
      finalDescription = enhancementResult.enhancedDescription;
      finalCategory = enhancementResult.suggestedCategory || finalCategory;
      descriptionEnhancementInfo = {
        originalDescription: enhancementResult.originalDescription,
        originalCategory: enhancementResult.originalCategory,
        enhancedDescription: enhancementResult.enhancedDescription,
        suggestedCategory: enhancementResult.suggestedCategory,
        categoryGenerated: enhancementResult.categoryGenerated,
        success: enhancementResult.success,
        error: enhancementResult.error
      };
      
      //console.log('📝 Update enhancement result:', descriptionEnhancementInfo);
    }

    // Build dynamic update query based on provided fields
    let query = 'UPDATE products SET ';
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      values.push(price);
    }
    if (quantity !== undefined) {
      updates.push('quantity = ?');
      values.push(quantity);
    }
    if (finalDescription !== undefined) {
      updates.push('description = ?');
      values.push(finalDescription);
    }
    if (finalCategory !== undefined) {
      updates.push('category = ?');
      values.push(finalCategory);
    }
    
    // Update embedding if name or description changed
    if (name !== undefined || finalDescription !== undefined) {
      const newName = name !== undefined ? name : currentProduct.name;
      const newDescription = finalDescription !== undefined ? finalDescription : currentProduct.description;
      
      const embedding = await getEmbedding(newName + " " + (newDescription || ""));
      updates.push('embedding = ?');
      values.push(JSON.stringify(embedding));
    }
    
    if (updates.length === 0) {
      conn.release();
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    query += updates.join(', ') + ' WHERE id = ?';
    values.push(product_id);
    
    await conn.execute(query, values);
    conn.release();
    
    res.json({ 
      message: 'Product updated successfully',
      enhancement: descriptionEnhancementInfo 
    });
  } catch (err) {
    console.error('Product update failed:', err);
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
};

const getMyProducts = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    
    // Get merchant for this user
    const [merchants] = await conn.execute('SELECT id FROM merchants WHERE user_id = ?', [req.user.id]);
    if (!merchants.length) {
      conn.release();
      return res.status(404).json({ error: 'Merchant not found for this user' });
    }
    
    const merchantId = merchants[0].id;
    
    // Get all products for this merchant
    const [products] = await conn.execute(
      'SELECT id, name, description, price, quantity, category, created_at FROM products WHERE merchant_id = ? ORDER BY created_at DESC',
      [merchantId]
    );
    
    conn.release();
    res.json({ products });
  } catch (err) {
    console.error('Failed to fetch products:', err);
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
};

  const deleteProduct = async (req, res) => {
  const { product_id } = req.params;



  try {
    const conn = await pool.getConnection();
    
    // Ownership check: only allow if product belongs to merchant
    if (req.user.role === 'merchant') {
      const [rows] = await conn.execute('SELECT merchant_id FROM products WHERE id = ?', [product_id]);
      if (!rows.length) {
        conn.release();
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // Get merchant for this user
      const [merchants] = await conn.execute('SELECT id FROM merchants WHERE user_id = ?', [req.user.id]);
      if (!merchants.length || rows[0].merchant_id !== merchants[0].id) {
        conn.release();
        return res.status(403).json({ error: 'You do not have permission to delete this product' });
      }
    }
    
    await conn.execute('DELETE FROM products WHERE id = ?', [product_id]);
    conn.release();
    
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Product deletion failed:', err);
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
};

const getProduct = async (req, res) => {
  const { product_id } = req.params;

  try {
    const conn = await pool.getConnection();
    
    // First check if product exists and get its merchant_id
    const [products] = await conn.execute(
      'SELECT p.*, m.shop_name as merchant_name FROM products p JOIN merchants m ON p.merchant_id = m.id WHERE p.id = ?',
      [product_id]
    );

    if (!products.length) {
      conn.release();
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[0];

    // For merchants, ensure they can only access their own products
    if (req.user.role === 'merchant') {
      const [merchants] = await conn.execute('SELECT id FROM merchants WHERE user_id = ?', [req.user.id]);
      if (!merchants.length || product.merchant_id !== merchants[0].id) {
        conn.release();
        return res.status(403).json({ error: 'You do not have permission to view this product' });
      }
    }

    conn.release();
    res.json({ product });
  } catch (err) {
    console.error('Failed to fetch product:', err);
    res.status(500).json({ error: 'Failed to fetch product', details: err.message });
  }
};


const previewEnhancedDescription = async (req, res) => {
  const { name, price, quantity, description, category } = req.body;

  if (!name || !price || quantity === undefined) {
    return res.status(400).json({ error: 'Name, price, and quantity are required for description enhancement' });
  }

  try {
    //console.log('🔍 Previewing enhanced description and category for:', name);
    const enhancementResult = await enhanceProductDescription({
      name, price, quantity, description, category
    });

    res.json({
      originalDescription: enhancementResult.originalDescription,
      originalCategory: enhancementResult.originalCategory,
      enhancedDescription: enhancementResult.enhancedDescription,
      suggestedCategory: enhancementResult.suggestedCategory,
      categoryGenerated: enhancementResult.categoryGenerated,
      success: enhancementResult.success,
      error: enhancementResult.error
    });
  } catch (err) {
    console.error('Description enhancement preview failed:', err);
    res.status(500).json({ error: 'Failed to preview enhanced description', details: err.message });
  }
};

const getRelatedProducts = async (req, res) => {
  const { product_id } = req.params;
  const { limit = 20 } = req.query;

  if (!product_id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    const conn = await pool.getConnection();
    
    // First get the target product to use for similarity calculation
    const [targetProducts] = await conn.execute(
      'SELECT name, description, category, embedding FROM products WHERE id = ?',
      [product_id]
    );

    if (!targetProducts.length) {
      conn.release();
      return res.status(404).json({ error: 'Product not found' });
    }

    const targetProduct = targetProducts[0];
    const targetEmbedding = targetProduct.embedding;

    // Find related products using vector similarity, excluding the target product
    // Convert cosine distance to similarity percentage (1 - distance) * 100
    const [relatedProducts] = await conn.execute(
      `SELECT
         p.id,
         p.name,
         p.price,
         p.quantity,
         p.description,
         p.category,
         p.created_at,
         m.id as merchant_id,
         m.shop_name,
         m.address,
         m.phone,
         VEC_COSINE_DISTANCE(p.embedding, ?) AS cosine_distance,
         ROUND((1 - VEC_COSINE_DISTANCE(p.embedding, ?)) * 100, 2) AS match_percentage
       FROM products p
       JOIN merchants m ON p.merchant_id = m.id
       WHERE p.quantity > 0
         AND p.id != ?
       ORDER BY cosine_distance ASC
       LIMIT ?;`,
      [targetEmbedding, targetEmbedding, product_id, parseInt(limit)]
    );

    conn.release();

    // Process results to ensure proper data types and add additional match info
    const processedResults = relatedProducts.map(row => ({
      id: row.id,
      name: row.name,
      price: parseFloat(row.price),
      quantity: row.quantity,
      description: row.description,
      category: row.category,
      created_at: row.created_at,
      merchant: {
        id: row.merchant_id,
        shop_name: row.shop_name,
        address: row.address,
        phone: row.phone
      },
      similarity_metrics: {
        cosine_distance: parseFloat(row.cosine_distance),
        match_percentage: parseFloat(row.match_percentage),
        match_level: getMatchLevel(parseFloat(row.match_percentage))
      }
    }));

    res.json({
      target_product: {
        id: product_id,
        name: targetProduct.name,
        category: targetProduct.category
      },
      related_products: processedResults,
      total_found: processedResults.length,
      search_params: {
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Failed to fetch related products:', err);
    res.status(500).json({ error: 'Failed to fetch related products', details: err.message });
  }
};

// Helper function to categorize match levels
const getMatchLevel = (matchPercentage) => {
  if (matchPercentage >= 80) return 'very_high';
  if (matchPercentage >= 60) return 'high';
  if (matchPercentage >= 40) return 'medium';
  if (matchPercentage >= 20) return 'low';
  return 'very_low';
};

export { addProduct, updateProduct, getMyProducts, deleteProduct, getProduct, previewEnhancedDescription, getRelatedProducts };
