//utils/productDescriptionEnhancer.js

export async function enhanceProductDescription(productData) {
  const { name, price, quantity, description, category } = productData;
  
  try {
    // Build context information for the AI (excluding quantity to avoid outdated info)
    const contextInfo = [
      `Product Name: ${name}`,
      category ? `Category: ${category}` : '',
      `Price: $${price}`,
      description ? `Basic Description: ${description}` : ''
    ].filter(Boolean).join('\n');

    const needsCategory = !category || category.trim() === '';
    const taskDescription = needsCategory 
      ? 'Create a SHORT, concise product description AND suggest an appropriate category'
      : 'Create a SHORT, concise product description';

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { 
            role: "system", 
            content: `You are a concise product description writer for an e-commerce platform. Create SHORT, essential-only product descriptions and suggest appropriate categories. Keep descriptions to 1-2 sentences maximum. Focus ONLY on what the customer needs to know - no fluff or marketing language. Be direct and informative. NEVER include citations, references, footnotes, or bracketed numbers like [1], [4][5], etc. Write in plain text only. ${needsCategory ? 'ALWAYS respond in JSON format with "description" and "category" fields.' : 'Return only the description text.'}`
          },
          { 
            role: "user", 
            content: `${taskDescription} based on this information:\n\n${contextInfo}\n\n${needsCategory ? 'IMPORTANT: Respond ONLY with valid JSON format:\n{"description": "your 1-2 sentence description", "category": "simple category name"}\n\nFor category, use simple categories like: Electronics, Clothing, Food, Books, Home & Garden, Sports, Toys, Beauty, Automotive, Office Supplies, Health, etc. \n\nIMPORTANT: Do NOT include citations, references, footnotes, or numbers in brackets like [1], [4][5], etc. Use plain text only. Do not include extra text, explanations, or formatting - just the JSON object.' : 'Include only essential details: what it is, key feature/benefit, and primary use. Maximum 1-2 sentences. No promotional language. Do NOT include citations or references.'}`
          }
        ],
        max_tokens: 60,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Perplexity API error: Status ${response.status}, Response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      const aiResponse = data.choices[0].message.content.trim();
      
      let enhancedDescription = '';
      let suggestedCategory = category || '';
      
      if (needsCategory) {
        try {
          // Clean the response first - remove any extra text before/after JSON
          let cleanResponse = aiResponse.trim();
          
          // Try to extract JSON if there's extra text
          const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            cleanResponse = jsonMatch[0];
          }
          
          // Try to parse JSON response
          const parsed = JSON.parse(cleanResponse);
          enhancedDescription = (parsed.description || aiResponse).trim();
          suggestedCategory = (parsed.category || category || '').trim();
          
          console.log('📝 Parsed JSON response:', { 
            raw: aiResponse,
            cleaned: cleanResponse,
            description: enhancedDescription, 
            category: suggestedCategory 
          });
        } catch (jsonError) {
          // If JSON parsing fails, treat as plain text description
          console.warn('Failed to parse JSON response, using as plain text:', jsonError.message);
          console.log('Raw AI response:', aiResponse);
          
          enhancedDescription = aiResponse;
          // Try to extract category from plain text if it contains common patterns
          const categoryMatch = aiResponse.match(/category[:\s]*([^.,\n"'}]+)/i);
          suggestedCategory = categoryMatch ? categoryMatch[1].trim() : category || '';
          
          console.log('📝 Extracted from plain text:', { 
            description: enhancedDescription, 
            category: suggestedCategory 
          });
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
      
      console.log('✅ Final cleaned values:', { 
        description: cleanedDescription, 
        category: cleanedCategory 
      });
      
      return {
        originalDescription: description || '',
        originalCategory: category || '',
        enhancedDescription: cleanedDescription,
        suggestedCategory: cleanedCategory,
        categoryGenerated: needsCategory && cleanedCategory !== '',
        success: true
      };
    } else {
      throw new Error("No enhanced description generated");
    }
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