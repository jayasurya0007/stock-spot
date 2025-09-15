//utils/notificationEnhancer.js

import { queryMoonshot } from './moonshot.js';

/**
 * Enhances notification messages using AI to make them more informative and actionable
 * @param {Object} notificationData - The notification data to enhance
 * @returns {Promise<Object>} Enhanced notification with AI-generated content
 */
export async function enhanceNotificationMessage(notificationData) {
  const { 
    type, 
    products, 
    merchantName, 
    originalMessage,
    threshold 
  } = notificationData;

  try {
    let enhancedMessage;
    let title;

    switch (type) {
      case 'low_stock':
        const result = await enhanceLowStockNotification(products, merchantName, threshold);
        enhancedMessage = result.message;
        title = result.title;
        break;
        
      default:
        // For other notification types, return original
        return {
          title: 'Notification',
          message: originalMessage || 'You have a new notification.',
          isEnhanced: false
        };
    }

    return {
      title,
      message: enhancedMessage,
      isEnhanced: true,
      originalMessage
    };

  } catch (error) {
    console.error('Error enhancing notification:', error);
    
    // Fallback to basic notification
    return {
      title: 'Low Stock Alert',
      message: originalMessage || 'Some of your products are running low on stock.',
      isEnhanced: false,
      originalMessage
    };
  }
}

/**
 * Enhances low stock notifications with AI-generated actionable advice
 * @param {Array} products - Array of low stock products
 * @param {string} merchantName - Name of the merchant's shop
 * @param {number} threshold - Stock threshold that triggered the alert
 * @returns {Promise<Object>} Enhanced notification with title and message
 */
async function enhanceLowStockNotification(products, merchantName, threshold) {
  const productList = products.map(p => `${p.name} (${p.quantity} left, Price: ₹${p.price})`).join(', ');
  const productCount = products.length;
  const criticalProducts = products.filter(p => p.quantity <= 2);
  
  const prompt = `As a business advisor, create a concise and actionable low stock notification for ${merchantName}. 

Products running low: ${productList}
Stock threshold: ${threshold}
Critical items (≤2 units): ${criticalProducts.length}

Requirements:
- Create a brief, professional title (max 8 words)
- Write a clear, actionable message (2-3 sentences max)
- Focus on business impact and urgency
- Include practical next steps
- Use encouraging, professional tone
- NO citations, references, or bracketed numbers
- Plain text only

Format your response as JSON:
{
  "title": "Brief alert title",
  "message": "Actionable message with next steps"
}`;

  try {
    const aiResponse = await queryMoonshot(prompt);
    
    // Clean up any potential citations or references
    const cleanedResponse = aiResponse
      .replace(/\[\d+\]/g, '')
      .replace(/\[[\d,\s]+\]/g, '')
      .trim();

    // Try to parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      // If JSON parsing fails, extract title and message manually
      const titleMatch = cleanedResponse.match(/"title":\s*"([^"]+)"/);
      const messageMatch = cleanedResponse.match(/"message":\s*"([^"]+)"/);
      
      parsedResponse = {
        title: titleMatch ? titleMatch[1] : 'Low Stock Alert',
        message: messageMatch ? messageMatch[1] : cleanedResponse
      };
    }

    // Validate and clean the response
    const title = parsedResponse.title || 'Low Stock Alert';
    const message = parsedResponse.message || cleanedResponse;

    // Further clean up the message
    const cleanTitle = title.replace(/\[\d+\]/g, '').replace(/\[[\d,\s]+\]/g, '').trim();
    const cleanMessage = message.replace(/\[\d+\]/g, '').replace(/\[[\d,\s]+\]/g, '').trim();

    return {
      title: cleanTitle,
      message: cleanMessage
    };

  } catch (error) {
    console.error('Error getting AI response for notification:', error);
    
    // Fallback to template-based notification
    return generateFallbackNotification(products, merchantName, threshold);
  }
}

/**
 * Generates a fallback notification when AI enhancement fails
 * @param {Array} products - Array of low stock products
 * @param {string} merchantName - Name of the merchant's shop
 * @param {number} threshold - Stock threshold
 * @returns {Object} Fallback notification
 */
function generateFallbackNotification(products, merchantName, threshold) {
  const productCount = products.length;
  const criticalCount = products.filter(p => p.quantity <= 2).length;
  
  let title = `${productCount} Product${productCount > 1 ? 's' : ''} Low Stock`;
  
  if (criticalCount > 0) {
    title = `⚠️ ${criticalCount} Critical Stock Alert`;
  }

  const productNames = products.slice(0, 3).map(p => p.name).join(', ');
  const remaining = productCount > 3 ? ` and ${productCount - 3} more` : '';
  
  const message = `${productNames}${remaining} ${productCount > 1 ? 'are' : 'is'} running low. ` +
    `${criticalCount > 0 ? `${criticalCount} item${criticalCount > 1 ? 's' : ''} critically low. ` : ''}` +
    `Consider restocking soon to avoid stockouts and lost sales.`;

  return { title, message };
}

/**
 * Generate a summary notification for multiple low stock alerts
 * @param {Array} merchantAlerts - Array of merchant alert data
 * @returns {Object} Summary notification
 */
export function generateSummaryNotification(merchantAlerts) {
  const totalProducts = merchantAlerts.reduce((sum, alert) => sum + alert.products.length, 0);
  const totalMerchants = merchantAlerts.length;
  
  return {
    title: `${totalProducts} Products Need Attention`,
    message: `${totalProducts} products across ${totalMerchants} shop${totalMerchants > 1 ? 's' : ''} are running low on stock. Check your inventory to prevent stockouts.`,
    isEnhanced: false
  };
}

export default { enhanceNotificationMessage, generateSummaryNotification };