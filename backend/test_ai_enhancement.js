/**
 * Test script for AI Product Description Enhancement
 * This script tests the complete AI enhancement functionality including citation cleanup
 */

const { enhanceProductDescription } = require('./utils/productDescriptionEnhancer');

async function testAIEnhancement() {
    console.log('🧪 Testing AI Product Description Enhancement...\n');

    // Test cases with different scenarios
    const testCases = [
        {
            name: "Basic Product without Category",
            input: {
                name: "Bluetooth Headphones",
                price: 2500,
                category: ""
            }
        },
        {
            name: "Product with Existing Category", 
            input: {
                name: "Organic Green Tea",
                price: 450,
                category: "Beverages"
            }
        },
        {
            name: "Simple Product",
            input: {
                name: "Notebook",
                price: 120,
                category: ""
            }
        }
    ];

    for (const testCase of testCases) {
        console.log(`📋 Test Case: ${testCase.name}`);
        console.log(`Input: ${JSON.stringify(testCase.input)}`);
        
        try {
            const result = await enhanceProductDescription(
                testCase.input.name,
                testCase.input.price,
                testCase.input.category
            );
            
            console.log(`✅ Success!`);
            console.log(`Enhanced Description: "${result.enhancedDescription}"`);
            console.log(`Generated Category: "${result.enhancedCategory}"`);
            
            // Check for citations
            const hasCitations = /\[\d+\]/.test(result.enhancedDescription) || 
                               /\[[\d,\s]+\]/.test(result.enhancedDescription);
            
            if (hasCitations) {
                console.log('⚠️  WARNING: Citations found in description!');
            } else {
                console.log('🎉 Clean description - no citations found!');
            }
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
        
        console.log('─'.repeat(50));
    }

    console.log('\n🔧 Testing Citation Cleanup Function...');
    
    // Test citation cleanup specifically
    const citationTests = [
        "Great product [1][2] with features[3].",
        "Excellent quality[4][5] for daily use.",
        "Product description without citations.",
        "Multiple [1] citations [2][3] in text[4]."
    ];

    citationTests.forEach(text => {
        const cleaned = text.replace(/\[\d+\]/g, '').replace(/\[[\d,\s]+\]/g, '').trim();
        console.log(`Original: "${text}"`);
        console.log(`Cleaned:  "${cleaned}"`);
        console.log('');
    });

    console.log('✨ All tests completed!');
}

// Only run tests if this file is executed directly
if (require.main === module) {
    testAIEnhancement().catch(console.error);
}

module.exports = { testAIEnhancement };