/**
 * Script to create test low stock products for notification testing
 * This helps merchants test the notification system
 */

import Product from './models/Product.js';

async function createTestLowStockProducts() {
  console.log('📦 Creating Test Low Stock Products...\n');

  // Test products with low stock for different merchants
  const testProducts = [
    {
      merchant_id: 1,
      name: 'Test Low Stock Toy',
      description: 'Test product with low stock for notification testing',
      price: 299,
      quantity: 3, // Low stock
      category: 'Toys',
      embedding: [0.1, 0.2, 0.3] // Dummy embedding
    },
    {
      merchant_id: 1,
      name: 'Test Critical Stock Item',
      description: 'Test product with critical stock for notification testing',
      price: 199,
      quantity: 1, // Critical stock
      category: 'Test',
      embedding: [0.4, 0.5, 0.6] // Dummy embedding
    },
    {
      merchant_id: 2,
      name: 'Sample Low Stock Product',
      description: 'Another test product with low stock',
      price: 499,
      quantity: 4, // Low stock
      category: 'Samples',
      embedding: [0.7, 0.8, 0.9] // Dummy embedding
    }
  ];

  try {
    for (const productData of testProducts) {
      try {
        const product = await Product.create(productData);
        console.log(`✅ Created: ${product.name} (Quantity: ${product.quantity}) for Merchant ${product.merchant_id}`);
      } catch (error) {
        console.log(`❌ Failed to create ${productData.name}: ${error.message}`);
      }
    }

    console.log('\n🎯 Test Products Created Successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. 🌐 Login to the frontend as a merchant');
    console.log('2. ⚙️  Go to "Notification Settings"');
    console.log('3. 🧪 Click "Test Notifications" to trigger alerts');
    console.log('4. 🔔 Check the notification bell for new alerts');
    console.log('\n💡 The products created have quantities of 1, 3, and 4 units');
    console.log('   - Quantity 1: Critical stock (≤ 2)');
    console.log('   - Quantity 3-4: Low stock (≤ 5)');

  } catch (error) {
    console.error('❌ Failed to create test products:', error);
  }
}

createTestLowStockProducts()
  .then(() => {
    console.log('\n✨ Test product creation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test product creation failed:', error);
    process.exit(1);
  });