import { getEmbedding } from '../utils/embeddings.js';
import { enhanceProductDescription } from '../utils/productDescriptionEnhancer.js';
import pool from '../config/database.js';
console.log("Loaded productController.js from:", import.meta.url);

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
      console.log('🚀 Enhancing product description and generating category for:', name);
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
      
      console.log('📝 Enhancement result:', descriptionEnhancementInfo);
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
  const { name, price, quantity, description, category } = req.body;

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
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    
    // Update embedding if name or description changed
    if (name !== undefined || description !== undefined) {
      const newName = name !== undefined ? name : (await conn.execute('SELECT name FROM products WHERE id = ?', [product_id]))[0][0].name;
      const newDescription = description !== undefined ? description : (await conn.execute('SELECT description FROM products WHERE id = ?', [product_id]))[0][0].description;
      
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
    
    res.json({ message: 'Product updated successfully' });
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
    console.log('🔍 Previewing enhanced description and category for:', name);
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

export { addProduct, updateProduct, getMyProducts, deleteProduct, getProduct, previewEnhancedDescription };
console.log("Exports in productController.js:", { addProduct, updateProduct, getMyProducts, deleteProduct, getProduct, previewEnhancedDescription });
