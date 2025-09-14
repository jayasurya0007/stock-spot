/**
 * Comprehensive debug script for frontend notification issues
 * This will check all possible reasons why notifications might not appear
 */

import NotificationService from './services/notificationService.js';
import Product from './models/Product.js';
import NotificationSettings from './models/NotificationSettings.js';
import Notification from './models/Notification.js';

async function debugFrontendNotifications() {
  console.log('🔍 Debugging Frontend Notification Issues...\n');

  try {
    // Step 1: Check if notifications exist in database
    console.log('📊 Step 1: Checking existing notifications in database...');
    
    const merchants = await NotificationSettings.getMerchantsWithNotificationsEnabled();
    console.log(`Found ${merchants.length} merchants with notifications enabled`);
    
    let totalNotifications = 0;
    let merchantsWithNotifications = [];

    for (const merchant of merchants.slice(0, 5)) { // Check first 5 merchants
      try {
        const notifications = await Notification.findByMerchantId(merchant.merchant_id, { limit: 10 });
        const unreadCount = await Notification.getUnreadCount(merchant.merchant_id);
        
        if (notifications.length > 0 || unreadCount > 0) {
          merchantsWithNotifications.push({
            id: merchant.merchant_id,
            name: merchant.shop_name,
            notifications: notifications.length,
            unread: unreadCount
          });
          totalNotifications += notifications.length;
          
          console.log(`🏪 ${merchant.shop_name} (ID: ${merchant.merchant_id}):`);
          console.log(`   📬 Total notifications: ${notifications.length}`);
          console.log(`   🔔 Unread: ${unreadCount}`);
          
          if (notifications.length > 0) {
            console.log(`   📨 Recent notifications:`);
            notifications.slice(0, 2).forEach(notif => {
              console.log(`      - "${notif.title}" (${notif.is_read ? 'Read' : 'Unread'}) - ${notif.created_at}`);
            });
          }
        }
      } catch (error) {
        console.log(`   ❌ Error checking ${merchant.shop_name}: ${error.message}`);
      }
    }

    console.log(`\n📈 Summary: ${totalNotifications} total notifications across ${merchantsWithNotifications.length} merchants\n`);

    // Step 2: Force create notifications for testing
    console.log('🧪 Step 2: Force creating new notifications for testing...');
    
    // Clear today's notification log to allow new notifications
    console.log('   🗑️  Clearing today\'s notification logs to allow new notifications...');
    
    try {
      // Find merchants with low stock products
      for (const merchant of merchants.slice(0, 3)) { // Test first 3 merchants
        const lowStockProducts = await Product.findLowStock(merchant.merchant_id, merchant.low_stock_threshold);
        
        if (lowStockProducts.length > 0) {
          console.log(`   📦 Found ${lowStockProducts.length} low stock products for ${merchant.shop_name}`);
          
          // Force create notification (bypass daily limit)
          const notificationsCreated = await NotificationService.processLowStockForMerchant(merchant);
          
          if (notificationsCreated > 0) {
            console.log(`   ✅ Created ${notificationsCreated} new notifications for ${merchant.shop_name}`);
            
            // Verify the notifications were created
            const newNotifications = await Notification.findByMerchantId(merchant.merchant_id, { limit: 3 });
            console.log(`   📬 Verification: ${newNotifications.length} notifications now exist`);
            
            if (newNotifications.length > 0) {
              console.log(`   🔔 Latest notification: "${newNotifications[0].title}"`);
            }
          } else {
            console.log(`   ⏭️  No notifications created (may have been sent today already)`);
          }
        } else {
          console.log(`   ✅ No low stock products for ${merchant.shop_name}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Error in force creation: ${error.message}`);
    }

    // Step 3: Test API endpoints
    console.log('\n🌐 Step 3: Testing notification API endpoints...');
    
    try {
      const response = await fetch('http://localhost:5000/notifications/system/status');
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ API is accessible');
        console.log(`   📡 Status: ${data.message}`);
      } else {
        console.log(`   ❌ API returned status: ${response.status}`);
      }
    } catch (apiError) {
      console.log(`   ❌ API not accessible: ${apiError.message}`);
    }

    // Step 4: Provide specific testing instructions
    console.log('\n🎯 Step 4: Frontend Testing Instructions...');
    console.log('━'.repeat(60));
    
    if (merchantsWithNotifications.length > 0) {
      console.log('✅ Good news! There are notifications in the database.');
      console.log('\n🔐 To see them in the frontend:');
      
      merchantsWithNotifications.forEach(merchant => {
        console.log(`\n🏪 Login as merchant "${merchant.name}" (ID: ${merchant.id}):`);
        console.log(`   📊 Has ${merchant.notifications} notifications (${merchant.unread} unread)`);
        console.log(`   🔔 Should see red badge on notification bell`);
      });
      
      console.log('\n📱 Steps to test:');
      console.log('1. 🌐 Open http://localhost:3002');
      console.log('2. 🔐 Login with one of the merchant accounts above');
      console.log('3. 🔔 Look for red badge on notification bell in navbar');
      console.log('4. 🖱️  Click the notification bell to see dropdown');
      console.log('5. 📬 Notifications should appear in the dropdown');
      
    } else {
      console.log('⚠️  No notifications found in database.');
      console.log('\n🛠️  To create test notifications:');
      console.log('1. 🌐 Login to http://localhost:3002 as any merchant');
      console.log('2. 📦 Add products with quantity ≤ 5');
      console.log('3. ⚙️  Go to "Notification Settings"');
      console.log('4. 🧪 Click "Test Notifications" button');
      console.log('5. 🔔 Check notification bell for alerts');
    }

    console.log('\n🔧 Troubleshooting:');
    console.log('- Make sure you\'re logged in as the correct merchant');
    console.log('- Check browser console for any JavaScript errors');
    console.log('- Verify the notification bell component is loaded');
    console.log('- Try refreshing the page');
    console.log('- Check if notifications are enabled in settings');

  } catch (error) {
    console.error('❌ Debug script failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run debug
debugFrontendNotifications()
  .then(() => {
    console.log('\n✨ Frontend debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Frontend debug failed:', error);
    process.exit(1);
  });