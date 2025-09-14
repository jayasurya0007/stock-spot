/**
 * Test script to verify notification API endpoints work correctly
 * This simulates what the frontend NotificationBell component does
 */

import fetch from 'node-fetch';

async function testNotificationAPIs() {
  console.log('🧪 Testing Notification API Endpoints...\n');
  
  // Test merchants with notifications
  const testMerchants = [
    { id: 60001, email: 'test@example.com', shop: 'TestShop' },
    { id: 90001, email: 'joeanidas.26it@licet.ac.in', shop: 'My Shop' },
    { id: 120001, email: 'msj2508@gmail.com', shop: 'Shoppfiy' }
  ];
  
  const baseURL = 'http://localhost:5000';
  
  for (const merchant of testMerchants) {
    console.log(`🏪 Testing ${merchant.shop} (ID: ${merchant.id})...\n`);
    
    try {
      // Test 1: Get Unread Count
      console.log('   📊 Testing unread count endpoint...');
      const unreadResponse = await fetch(`${baseURL}/api/notifications/unread-count`, {
        headers: {
          'Content-Type': 'application/json',
          // Note: In real frontend, this would include JWT token
          'x-merchant-id': merchant.id.toString() // Simulate merchant context
        }
      });
      
      if (unreadResponse.ok) {
        const unreadData = await unreadResponse.json();
        console.log(`   ✅ Unread count: ${unreadData.count || 'API response: ' + JSON.stringify(unreadData)}`);
      } else {
        console.log(`   ❌ Unread count failed: ${unreadResponse.status} ${unreadResponse.statusText}`);
      }
      
      // Test 2: Get Notifications List
      console.log('   📋 Testing notifications list endpoint...');
      const listResponse = await fetch(`${baseURL}/api/notifications`, {
        headers: {
          'Content-Type': 'application/json',
          'x-merchant-id': merchant.id.toString()
        }
      });
      
      if (listResponse.ok) {
        const listData = await listResponse.json();
        console.log(`   ✅ Notifications list: ${listData.notifications?.length || 0} notifications found`);
        if (listData.notifications && listData.notifications.length > 0) {
          console.log(`   📬 First notification: "${listData.notifications[0].title}"`);
        }
      } else {
        console.log(`   ❌ Notifications list failed: ${listResponse.status} ${listResponse.statusText}`);
      }
      
      // Test 3: System Status
      console.log('   🔧 Testing system status...');
      const statusResponse = await fetch(`${baseURL}/api/notifications/system/status`);
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log(`   ✅ System status: ${statusData.message || JSON.stringify(statusData)}`);
      } else {
        console.log(`   ❌ System status failed: ${statusResponse.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ API test error: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('🔗 Frontend URLs to test:');
  console.log('========================');
  console.log('🌐 Frontend: http://localhost:3002');
  console.log('⚙️  Backend API: http://localhost:5000');
  console.log('');
  console.log('🔐 Login Credentials:');
  testMerchants.forEach(merchant => {
    console.log(`   📧 ${merchant.email} → ${merchant.shop}`);
  });
  console.log('   🔑 Password: Use the password you set for these accounts\n');
  
  console.log('🎯 Expected Frontend Behavior:');
  console.log('- Red badge should appear on notification bell 🔴');
  console.log('- Click bell to see notification dropdown');
  console.log('- Notifications should display with titles and timestamps');
  console.log('- Clicking notification should mark it as read');
  console.log('- Badge count should update when notifications are read');
}

testNotificationAPIs()
  .then(() => {
    console.log('\n✨ API testing completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 API testing failed:', error);
    process.exit(1);
  });