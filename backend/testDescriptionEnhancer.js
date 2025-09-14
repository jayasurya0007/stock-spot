// Test script for product description enhancement
// Run with: node testDescriptionEnhancer.js

import { enhanceProductDescription } from './utils/productDescriptionEnhancer.js';

async function testEnhancement() {
  console.log('🧪 Testing Product Description Enhancement...\n');

  const testProducts = [
    {
      name: 'Eraser',
      price: 5,
      quantity: 10,
      description: '',
      category: ''
    },
    {
      name: 'Bluetooth Headphones',
      price: 2500,
      quantity: 5,
      description: 'Wireless audio device',
      category: ''
    },
    {
      name: 'Organic Apples',
      price: 150,
      quantity: 50,
      description: '',
      category: 'Food'
    }
  ];

  for (const product of testProducts) {
    console.log(`\n📦 Testing: ${product.name}`);
    console.log('Input:', product);
    
    try {
      const result = await enhanceProductDescription(product);
      console.log('✅ Result:', {
        originalDescription: result.originalDescription,
        enhancedDescription: result.enhancedDescription,
        originalCategory: result.originalCategory,
        suggestedCategory: result.suggestedCategory,
        categoryGenerated: result.categoryGenerated,
        success: result.success
      });
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
    
    console.log('-'.repeat(50));
  }
}

// Run the test
testEnhancement().catch(console.error);