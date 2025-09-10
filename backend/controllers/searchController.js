import { rewriteQueryWithPerplexity } from '../utils/perplexity.js';
import { getEmbedding } from '../utils/embeddings.js';
import pool from '../config/database.js';

export const searchProducts = async (req, res) => {
  const { query, lat, lng, distance = 5000 } = req.body;

  if (!query || !lat || !lng) {
    return res.status(400).json({ error: 'Query, lat, and lng are required' });
  }

  try {
    const refinedQuery = await rewriteQueryWithPerplexity(query);
    const embedding = getEmbedding(refinedQuery);

    const conn = await pool.getConnection();
    const [rows] = await conn.execute(
      `SELECT
         p.id,
         p.name,
         p.price,
         p.quantity,
         p.description,
         m.id as merchant_id,
         m.shop_name,
         m.latitude,
         m.longitude,
         VEC_COSINE_DISTANCE(p.embedding, ?) AS similarity,
         (6371000 * ACOS(
           COS(RADIANS(?)) * COS(RADIANS(m.latitude)) *
           COS(RADIANS(?) - RADIANS(m.longitude)) +
           SIN(RADIANS(?)) * SIN(RADIANS(m.latitude))
         )) AS distance
       FROM products p
       JOIN merchants m ON p.merchant_id = m.id
       WHERE p.quantity > 0
         AND (6371000 * ACOS(
           COS(RADIANS(?)) * COS(RADIANS(m.latitude)) *
           COS(RADIANS(?) - RADIANS(m.longitude)) +
           SIN(RADIANS(?)) * SIN(RADIANS(m.latitude))
         )) <= ?
       ORDER BY similarity ASC
       LIMIT 20;`,
      [
        JSON.stringify(embedding),
        lat, lng, lat,
        lat, lng, lat,
        distance
      ]
    );
    conn.release();

    res.json({ 
      refinedQuery, 
      results: rows.map(row => ({
        ...row,
        similarity: parseFloat(row.similarity),
        distance: parseFloat(row.distance)
      }))
    });
  } catch (err) {
    console.error('Search failed:', err);
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
};

export const getMapData = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [merchants] = await conn.execute(`
      SELECT 
        m.id, 
        m.shop_name, 
        m.latitude, 
        m.longitude,
        COUNT(p.id) as product_count
      FROM merchants m
      LEFT JOIN products p ON m.id = p.merchant_id AND p.quantity > 0
      GROUP BY m.id
    `);
    
    const merchantDetails = [];
    
    for (const merchant of merchants) {
      const [products] = await conn.execute(
        'SELECT name, quantity FROM products WHERE merchant_id = ? AND quantity > 0 LIMIT 5',
        [merchant.id]
      );
      
      merchantDetails.push({
        id: merchant.id,
        shop_name: merchant.shop_name,
        latitude: merchant.latitude,
        longitude: merchant.longitude,
        product_count: merchant.product_count,
        products: products
      });
    }
    
    conn.release();
    res.json(merchantDetails);
  } catch (err) {
    console.error('Map data fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch map data', details: err.message });
  }
};