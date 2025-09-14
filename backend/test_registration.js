/**
 * Test script to verify merchant registration works correctly
 */

import fetch from 'node-fetch';

async function testMerchantRegistration() {
  try {
    console.log('🧪 Testing Merchant Registration Fix\n');
    
    const testData = {
      email: `test-merchant-${Date.now()}@example.com`,
      password: 'password123',
      role: 'merchant',
      latitude: 12.9716,
      longitude: 77.5946,
      shop_name: 'Test Registration Shop',
      address: 'Test Address, Test City',
      owner_name: 'Test Owner',
      phone: '1234567890'
    };
    
    console.log('📝 Registration Data:');
    console.log(`   Email: ${testData.email}`);
    console.log(`   Role: ${testData.role}`);
    console.log(`   Shop: ${testData.shop_name}`);
    console.log(`   Location: ${testData.latitude}, ${testData.longitude}`);
    
    console.log('\n📡 Sending registration request...');
    
    const response = await fetch('http://localhost:5000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log(`   User ID: ${result.user.id}`);
      console.log(`   Email: ${result.user.email}`);
      console.log(`   Role: ${result.user.role}`);
      console.log(`   Token received: ${result.token ? 'Yes' : 'No'}`);
      
      console.log('\n🎯 REGISTRATION IS NOW WORKING!');
      console.log('📋 You can now:');
      console.log('1. 🌐 Go to http://localhost:3002/register');
      console.log('2. 👤 Select "Merchant" role');
      console.log('3. 📍 Allow location access');
      console.log('4. 🏪 Fill in shop details');
      console.log('5. ✅ Complete registration successfully');
      
    } else {
      console.log('❌ Registration failed!');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${result.error || result.message || 'Unknown error'}`);
      
      console.log('\n🔧 This indicates there may still be issues to fix.');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testMerchantRegistration();