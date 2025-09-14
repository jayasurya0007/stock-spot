//controllers/searchController.js

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
    console.log('🔍 Search Debug Info:');
    console.log('Original query:', query);
    console.log('Perplexity refined query:', refinedQuery);
    
    const embedding = getEmbedding(refinedQuery);

    const conn = await pool.getConnection();
    
    // First search: Exact name matches using both original and refined queries
    // Also break down refined query into individual words for better matching
    const searchTerms = [query, refinedQuery].filter(term => term && term.trim());
    const refinedWords = refinedQuery ? refinedQuery.toLowerCase().split(/\s+/).filter(word => word.length > 2) : [];
    const allSearchTerms = [...searchTerms, ...refinedWords].filter((term, index, arr) => arr.indexOf(term) === index);
    
    console.log('Search terms:', searchTerms);
    console.log('Refined words:', refinedWords);
    console.log('All search terms:', allSearchTerms);
    
    const searchConditions = allSearchTerms.map(() => 'LOWER(p.name) LIKE LOWER(?) OR LOWER(p.description) LIKE LOWER(?) OR LOWER(p.category) LIKE LOWER(?)').join(' OR ');
    const searchParams = allSearchTerms.flatMap(term => [`%${term}%`, `%${term}%`, `%${term}%`]);
    console.log('Search parameters:', searchParams);
    
    const [exactMatches] = await conn.execute(
      `SELECT
         p.id,
         p.name,
         p.price,
         p.quantity,
         p.description,
         p.category,
         m.id as merchant_id,
         m.shop_name,
         m.latitude,
         m.longitude,
         0 AS similarity,
         (6371000 * ACOS(
           COS(RADIANS(?)) * COS(RADIANS(m.latitude)) *
           COS(RADIANS(?) - RADIANS(m.longitude)) +
           SIN(RADIANS(?)) * SIN(RADIANS(m.latitude))
         )) AS distance,
         'exact' AS match_type
       FROM products p
       JOIN merchants m ON p.merchant_id = m.id
       WHERE p.quantity > 0
         AND (${searchConditions})
         AND (6371000 * ACOS(
           COS(RADIANS(?)) * COS(RADIANS(m.latitude)) *
           COS(RADIANS(?) - RADIANS(m.longitude)) +
           SIN(RADIANS(?)) * SIN(RADIANS(m.latitude))
         )) <= ?
       ORDER BY distance ASC
       LIMIT 10;`,
      [
        lat, lng, lat,
        ...searchParams,
        lat, lng, lat,
        distance
      ]
    );

    // Second search: Vector similarity for related products (excluding exact matches)
    const exactMatchIds = exactMatches.map(row => row.id);
    const excludeClause = exactMatchIds.length > 0 ? `AND p.id NOT IN (${exactMatchIds.map(() => '?').join(',')})` : '';
    
    const [similarProducts] = await conn.execute(
      `SELECT
         p.id,
         p.name,
         p.price,
         p.quantity,
         p.description,
         p.category,
         m.id as merchant_id,
         m.shop_name,
         m.latitude,
         m.longitude,
         VEC_COSINE_DISTANCE(p.embedding, ?) AS similarity,
         (6371000 * ACOS(
           COS(RADIANS(?)) * COS(RADIANS(m.latitude)) *
           COS(RADIANS(?) - RADIANS(m.longitude)) +
           SIN(RADIANS(?)) * SIN(RADIANS(m.latitude))
         )) AS distance,
         'related' AS match_type
       FROM products p
       JOIN merchants m ON p.merchant_id = m.id
       WHERE p.quantity > 0
         AND (6371000 * ACOS(
           COS(RADIANS(?)) * COS(RADIANS(m.latitude)) *
           COS(RADIANS(?) - RADIANS(m.longitude)) +
           SIN(RADIANS(?)) * SIN(RADIANS(m.latitude))
         )) <= ?
         ${excludeClause}
       ORDER BY similarity ASC
       LIMIT 15;`,
      [
        JSON.stringify(embedding),
        lat, lng, lat,
        lat, lng, lat,
        distance,
        ...exactMatchIds
      ]
    );

    conn.release();

    console.log('📊 Database Results:');
    console.log('Exact matches found:', exactMatches.length);
    console.log('Related products found:', similarProducts.length);
    
    if (exactMatches.length > 0) {
      console.log('Exact match products:', exactMatches.map(p => ({ name: p.name, category: p.category, description: p.description })));
    }

    // Combine results with exact matches first
    const exactResults = exactMatches.map(row => ({
      ...row,
      similarity: parseFloat(row.similarity),
      distance: parseFloat(row.distance)
    }));

    const relatedResults = similarProducts.map(row => ({
      ...row,
      similarity: parseFloat(row.similarity),
      distance: parseFloat(row.distance)
    }));

    res.json({ 
      refinedQuery,
      exactMatches: exactResults,
      relatedProducts: relatedResults,
      results: [...exactResults, ...relatedResults], // Combined for backward compatibility
      searchType: exactResults.length > 0 ? 'exact_and_related' : 'related_only'
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

export const searchMerchantsByCity = async (req, res) => {
  const { cityName } = req.body;

  if (!cityName) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    const conn = await pool.getConnection();
    
    // Search for merchants by city name in address field
    const [merchants] = await conn.execute(`
      SELECT 
        m.id, 
        m.shop_name, 
        m.address,
        m.latitude, 
        m.longitude,
        m.owner_name,
        m.phone,
        COUNT(p.id) as product_count
      FROM merchants m
      LEFT JOIN products p ON m.id = p.merchant_id AND p.quantity > 0
      WHERE m.address LIKE ? OR m.address LIKE ?
      GROUP BY m.id
      ORDER BY m.shop_name
    `, [`%${cityName}%`, `%${cityName.toLowerCase()}%`]);
    
    conn.release();
    res.json({ merchants });
  } catch (err) {
    console.error('City search failed:', err);
    res.status(500).json({ error: 'City search failed', details: err.message });
  }
};

export const searchMerchantsByLocation = async (req, res) => {
  const { lat, lng, distance = 10000 } = req.body; // Default 10km radius

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    const conn = await pool.getConnection();
    
    // Search for merchants within specified distance from location
    const [merchants] = await conn.execute(`
      SELECT 
        m.id, 
        m.shop_name, 
        m.address,
        m.latitude, 
        m.longitude,
        m.owner_name,
        m.phone,
        COUNT(p.id) as product_count,
        (6371000 * ACOS(
          COS(RADIANS(?)) * COS(RADIANS(m.latitude)) *
          COS(RADIANS(?) - RADIANS(m.longitude)) +
          SIN(RADIANS(?)) * SIN(RADIANS(m.latitude))
        )) AS distance
      FROM merchants m
      LEFT JOIN products p ON m.id = p.merchant_id AND p.quantity > 0
      WHERE (6371000 * ACOS(
        COS(RADIANS(?)) * COS(RADIANS(m.latitude)) *
        COS(RADIANS(?) - RADIANS(m.longitude)) +
        SIN(RADIANS(?)) * SIN(RADIANS(m.latitude))
      )) <= ?
      GROUP BY m.id
      ORDER BY distance ASC
    `, [lat, lng, lat, lat, lng, lat, distance]);
    
    conn.release();
    res.json({ 
      merchants: merchants.map(merchant => ({
        ...merchant,
        distance: parseFloat(merchant.distance)
      }))
    });
  } catch (err) {
    console.error('Location search failed:', err);
    res.status(500).json({ error: 'Location search failed', details: err.message });
  }
};

export const getMerchantProducts = async (req, res) => {
  const { merchantId } = req.params;

  if (!merchantId) {
    return res.status(400).json({ error: 'Merchant ID is required' });
  }

  try {
    const conn = await pool.getConnection();
    
    const [products] = await conn.execute(
      'SELECT id, name, description, price, quantity, category FROM products WHERE merchant_id = ? AND quantity > 0 ORDER BY name',
      [merchantId]
    );
    
    conn.release();
    res.json({ products });
  } catch (err) {
    console.error('Failed to fetch merchant products:', err);
    res.status(500).json({ error: 'Failed to fetch merchant products', details: err.message });
  }
};