//utils/moonshot.js
import axios from 'axios';

/**
 * General purpose function to query Moonshot AI API
 * @param {string} systemPrompt - The system prompt 
 * @param {string} userPrompt - The user prompt to send to the AI
 * @param {number} maxTokens - Maximum tokens for response (default: 512)
 * @param {number} temperature - Temperature for response generation (default: 0.7)
 * @returns {Promise<string>} AI response content
 */
async function askKimi(systemPrompt, userPrompt, maxTokens = 512, temperature = 0.7) {
  const apiKey = process.env.MOONSHOT_API_KEY;
  const url = 'https://api.moonshot.ai/v1/chat/completions';

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  const body = {
    model: 'moonshot-v1-8k',
    messages: messages,
    max_tokens: maxTokens,
    temperature: temperature,
    stream: false
  };

  try {
    const resp = await axios.post(url, body, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return resp.data.choices[0].message.content;
  } catch (error) {
    console.error("Error in Moonshot AI API:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Rewrites user queries into precise product search keywords
 * @param {string} query - Original search query
 * @returns {Promise<string>} Refined search query
 */
export async function rewriteQueryWithMoonshot(query) {
  try {
    const systemMessage = "You are a helpful assistant that rewrites user queries into precise product search keywords. Return only the refined search term without any additional text.";
    
    const response = await askKimi(systemMessage, query, 30, 0.7);
    return response.trim();
  } catch (error) {
    console.error("Error in Moonshot API for query rewriting:", error);
    return query; // fallback to original query
  }
}

/**
 * General purpose query function for notifications and other AI tasks
 * @param {string} prompt - The prompt to send to the AI
 * @returns {Promise<string>} AI response
 */
export async function queryMoonshot(prompt) {
  try {
    const systemMessage = "You are a helpful business assistant that provides concise, actionable responses. Always respond in plain text without citations, references, or bracketed numbers.";
    
    const response = await askKimi(systemMessage, prompt, 200, 0.7);
    return response.trim();
  } catch (error) {
    console.error("Error in Moonshot API:", error);
    throw error; // Re-throw for notification system to handle
  }
}

/**
 * Enhanced product description generation using Moonshot AI
 * @param {Object} productData - Product information
 * @returns {Promise<string>} Enhanced product description or JSON with description and category
 */
export async function enhanceProductWithMoonshot(productData) {
  const { name, price, quantity, description, category } = productData;
  
  try {
    // Build context information for the AI (excluding quantity to avoid outdated info)
    const contextInfo = [
      `Product Name: ${name}`,
      category ? `Category: ${category}` : '',
      `Price: $${price}`,
      description ? `Current Description: ${description}` : ''
    ].filter(Boolean).join('\n');

    const needsCategory = !category || category.trim() === '';
    
    let systemMessage, userMessage;
    
    if (needsCategory) {
      systemMessage = `You are an expert e-commerce product description writer. Create short, compelling product descriptions that help customers understand what they're buying. Keep descriptions concise - maximum 1-2 sentences. Always respond in valid JSON format with "description" and "category" fields only.`;
      
      userMessage = `Create an enhanced product description and suggest a suitable category for this product:

${contextInfo}

Requirements:
- Write a concise description (1-2 sentences MAXIMUM) that tells customers what the product is and its main benefit
- Keep it short and direct - avoid lengthy explanations
- Make it more engaging than basic descriptions like "Ball. Priced at $25"
- Example: For a candle write "A simple, affordable candle suitable for adding light and ambiance to any space."
- Choose an appropriate category from: Electronics, Clothing, Food & Beverage, Books, Home & Garden, Sports & Recreation, Toys & Games, Beauty & Personal Care, Automotive, Office Supplies, Health & Wellness, etc.

Respond ONLY with valid JSON:
{"description": "your enhanced description", "category": "chosen category"}`;
    } else {
      systemMessage = `You are an expert e-commerce product description writer. Create short, compelling product descriptions that help customers understand what they're buying. Keep descriptions concise - maximum 1-2 sentences.`;
      
      userMessage = `Create an enhanced product description for this product:

${contextInfo}

Requirements:
- Write a concise description (1-2 sentences MAXIMUM) that tells customers what the product is and its main benefit
- Keep it short and direct - avoid lengthy explanations
- Make it more engaging than basic descriptions like "Ball. Priced at $25"
- Example: For a candle write "A simple, affordable candle suitable for adding light and ambiance to any space."
- Return only the description text, no additional formatting`;
    }

    const response = await askKimi(systemMessage, userMessage, 80, 0.7);
    return response;
  } catch (error) {
    console.error("Error in Moonshot API for product enhancement:", error);
    throw error;
  }
}

export { askKimi };