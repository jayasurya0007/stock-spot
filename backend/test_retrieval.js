/**
 * Test retrieving notifications to verify they were created and can be fetched
 */

import Notification from './models/Notification.js';

async function testNotificationRetrieval() {
  console.log('📬 Testing Notification Retrieval...\n');

  try {
    // Test with merchants that had notifications created
    const merchantsToTest = [4, 9]; // Happy Kids (ID: 4) and My Shop (ID: 9) based on debug output
    
    for (const merchantId of merchantsToTest) {
      console.log(`🏪 Testing Merchant ID: ${merchantId}`);
      
      try {
        const notifications = await Notification.findByMerchantId(merchantId, { limit: 10, offset: 0 });
        console.log(`   ✅ Successfully retrieved ${notifications.length} notifications`);
        
        if (notifications.length > 0) {
          notifications.forEach((notif, index) => {
            console.log(`   📨 Notification ${index + 1}:`);
            console.log(`      Title: ${notif.title}`);
            console.log(`      Message: ${notif.message.substring(0, 80)}...`);
            console.log(`      Created: ${notif.created_at}`);
            console.log(`      Read: ${notif.is_read}`);
            console.log(`      AI Enhanced: ${notif.is_ai_enhanced}`);
            console.log('');
          });
        }
        
        // Test unread count
        const unreadCount = await Notification.getUnreadCount(merchantId);
        console.log(`   🔔 Unread count: ${unreadCount}\n`);
        
      } catch (error) {
        console.log(`   ❌ Error retrieving notifications: ${error.message}\n`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testNotificationRetrieval()
  .then(() => {
    console.log('✨ Notification retrieval test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });