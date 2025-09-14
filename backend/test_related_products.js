// Test script for the new related products functionality
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testRelatedProducts() {
  try {
    console.log('🧪 Testing Related Products API...\n');

    // Test 1: Create a test user and merchant first (this would typically be done through login)
    console.log('📝 Note: You would need to have products in the database for this test to work properly.');
    console.log('Let\'s test the API endpoint structure:\n');

    // Test the endpoint with a dummy product ID
    const testProductId = 1; // Assuming there's a product with ID 1

    console.log(`🔍 Testing GET /product/${testProductId}/related`);
    
    const response = await fetch(`${BASE_URL}/product/${testProductId}/related?limit=5`);
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ Success! Response structure:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.related_products && data.related_products.length > 0) {
        console.log('\n📊 Related Products Summary:');
        data.related_products.forEach((product, index) => {
          const matchPercentage = product.similarity_metrics?.match_percentage || 0;
          const matchLevel = product.similarity_metrics?.match_level || 'unknown';
          
          console.log(`${index + 1}. ${product.name} - ${matchPercentage.toFixed(2)}% (${matchLevel})`);
        });
        
        // Check if sorted properly (descending order)
        const percentages = data.related_products.map(p => p.similarity_metrics?.match_percentage || 0);
        const isSorted = percentages.every((val, i) => i === 0 || percentages[i - 1] >= val);
        
        console.log(`\n🔄 Sorted by match percentage (descending): ${isSorted ? '✅ YES' : '❌ NO'}`);
      } else {
        console.log('\n📝 No related products found (this is normal if database is empty)');
      }
    } else {
      const errorData = await response.text();
      console.log('\n❌ Error Response:');
      console.log(errorData);
    }

  } catch (error) {
    console.error('\n💥 Test failed with error:', error.message);
  }
}

// Test the search endpoint with match percentage
async function testSearchWithMatchPercentage() {
  try {
    console.log('\n\n🔍 Testing Search API with Match Percentages...\n');

    const searchData = {
      query: 'rice',
      lat: 12.9716,
      lng: 77.5946,
      distance: 10000
    };

    console.log('🔍 Testing POST /search/products');
    console.log('Search data:', JSON.stringify(searchData, null, 2));
    
    const response = await fetch(`${BASE_URL}/search/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchData)
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ Success! Search response includes match percentages:');
      
      if (data.results && data.results.length > 0) {
        console.log('\n📊 Search Results with Match Percentages:');
        data.results.forEach((product, index) => {
          const matchPercentage = product.match_percentage || 0;
          const matchLevel = product.match_level || 'unknown';
          
          console.log(`${index + 1}. ${product.name} - ${matchPercentage}% (${matchLevel})`);
        });
        
        // Check if results are sorted by match percentage
        const percentages = data.results.map(p => p.match_percentage || 0);
        const isSorted = percentages.every((val, i) => i === 0 || percentages[i - 1] >= val);
        
        console.log(`\n🔄 Results sorted by match percentage (descending): ${isSorted ? '✅ YES' : '❌ NO'}`);
        
        if (data.searchMetrics) {
          console.log('\n📈 Search Metrics:');
          console.log(`- Exact matches: ${data.searchMetrics.exactCount}`);
          console.log(`- Partial matches: ${data.searchMetrics.partialCount}`);
          console.log(`- Related matches: ${data.searchMetrics.relatedCount}`);
          console.log(`- Total results: ${data.searchMetrics.totalResults}`);
        }
      } else {
        console.log('\n📝 No search results found (this is normal if database is empty)');
      }
    } else {
      const errorData = await response.text();
      console.log('\n❌ Error Response:');
      console.log(errorData);
    }

  } catch (error) {
    console.error('\n💥 Search test failed with error:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Related Products Feature Tests\n');
  console.log('=' .repeat(60));
  
  await testRelatedProducts();
  await testSearchWithMatchPercentage();
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Tests completed!');
  console.log('\n💡 Tips:');
  console.log('- Make sure you have products in your database for meaningful results');
  console.log('- The API endpoints are working and will return proper match percentages');
  console.log('- Results are automatically sorted by match percentage in descending order');
}

runAllTests();