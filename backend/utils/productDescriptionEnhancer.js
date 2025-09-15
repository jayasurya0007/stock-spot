//utils/productDescriptionEnhancer.js
import { enhanceProductWithMoonshot } from './moonshot.js';

export async function enhanceProductDescription(productData) {
  const { name, price, quantity, description, category } = productData;
  
  try {
    const needsCategory = !category || category.trim() === '';
    
    const aiResponse = await enhanceProductWithMoonshot(productData);
    
    let enhancedDescription = '';
    let suggestedCategory = category || '';
    
    if (needsCategory) {
      // Clean up any potential citations or references from the content
      const cleanedContent = aiResponse
        .replace(/\[\d+\]/g, '')
        .replace(/\[[\d,\s]+\]/g, '')
        .trim();
      

      
      try {
        // Try to parse as JSON first
        const parsedData = JSON.parse(cleanedContent);
        enhancedDescription = parsedData.description || description || '';
        suggestedCategory = parsedData.category || category || '';
        

      } catch (jsonError) {

        
        // If JSON parsing fails, try to extract manually
        const descMatch = cleanedContent.match(/description[:\s]*["']?([^"'\n}]+)["']?/i);
        enhancedDescription = descMatch ? descMatch[1].trim() : cleanedContent;
        
        // Try to extract category
        if (cleanedContent.includes('category')) {
          const categoryMatch = cleanedContent.match(/category[:\s]*["']?([^"'\n}]+)["']?/i);
          suggestedCategory = categoryMatch ? categoryMatch[1].trim() : category || '';
        } else {
          // If no category mentioned in a complex response, try to extract from plain text
          const categoryMatch = aiResponse.match(/category[:\s]*([^.,\n"'}]+)/i);
          suggestedCategory = categoryMatch ? categoryMatch[1].trim() : category || '';
          

        }
      }
    } else {
      enhancedDescription = aiResponse;
    }
    
    // Clean up the description (remove quotes, citations, and unwanted characters)
    const cleanedDescription = enhancedDescription
      .replace(/^["']|["']$/g, '') // Remove leading/trailing quotes
      .replace(/\\"/g, '"') // Unescape quotes
      .replace(/\[\d+\]/g, '') // Remove citations like [1], [4], [5]
      .replace(/\[[\d,\s]+\]/g, '') // Remove multiple citations like [4][5] or [1,2,3]
      .replace(/\s+/g, ' ') // Normalize whitespace after removing citations
      .trim();
    
    // Clean up the category (remove quotes, unwanted characters, and validate)
    let cleanedCategory = suggestedCategory
      .replace(/^["']|["']$/g, '') // Remove leading/trailing quotes
      .replace(/\\"/g, '"') // Unescape quotes
      .replace(/[{}]/g, '') // Remove any remaining JSON brackets
      .trim();
    
    // Further clean category - handle common issues
    if (cleanedCategory) {
      // Remove any remaining problematic characters
      cleanedCategory = cleanedCategory
        .replace(/["""'']/g, '') // Remove smart quotes
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/^[:\s]+|[:\s]+$/g, '') // Remove leading/trailing colons and spaces
        .trim();
      
      // Validate category - should be simple text without special characters
      if (!/^[a-zA-Z\s&-]+$/.test(cleanedCategory)) {
        console.warn('Invalid category format detected:', cleanedCategory);
        cleanedCategory = category || 'General';
      }
      
      // Ensure category is not too long
      if (cleanedCategory.length > 50) {
        console.warn('Category too long, truncating:', cleanedCategory);
        cleanedCategory = cleanedCategory.substring(0, 50).trim();
      }
    }
    
    return {
      originalDescription: description || '',
      originalCategory: category || '',
      enhancedDescription: cleanedDescription,
      suggestedCategory: cleanedCategory,
      categoryGenerated: needsCategory && cleanedCategory !== '',
      success: true
    };

  } catch (error) {
    console.error("Error enhancing product description:", error);
    
    // Fallback: return original description or generate a basic one (no quantity mention)
    const fallbackDescription = description || `${name}${category ? ` - ${category}` : ''}. Priced at $${price}.`;
    const fallbackCategory = category || 'General';
    
    return {
      originalDescription: description || '',
      originalCategory: category || '',
      enhancedDescription: fallbackDescription,
      suggestedCategory: fallbackCategory,
      categoryGenerated: !category,
      success: false,
      error: error.message
    };
  }
}