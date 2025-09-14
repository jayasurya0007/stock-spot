/**
 * Debug script to test notification system with low stock products
 * This will help identify why notifications aren't being created
 */

import NotificationService from './services/notificationService.js';
import Product from './models/Product.js';
import NotificationSettings from './models/NotificationSettings.js';
import Notification from './models/Notification.js';

async function debugNotificationSystem() {
  console.log('🔍 Debugging Notification System...\n');

  try {
    // Step 1: Check if there are any merchants with notification settings
    console.log('📊 Step 1: Checking merchants with notifications enabled...');
    const merchants = await NotificationSettings.getMerchantsWithNotificationsEnabled();
    console.log(`Found ${merchants.length} merchants with notifications enabled`);
    
    if (merchants.length === 0) {
      console.log('❌ No merchants found with notifications enabled');
      console.log('💡 This might be because:');
      console.log('   - No merchants exist in the database');
      console.log('   - No notification_settings records exist');
      console.log('   - All merchants have low_stock_enabled = FALSE');
      return;
    }

    // Step 2: Check each merchant's products
    for (let i = 0; i < Math.min(merchants.length, 3); i++) {
      const merchant = merchants[i];
      console.log(`\n🏪 Merchant ${i + 1}: ${merchant.shop_name} (ID: ${merchant.merchant_id})`);
      console.log(`   Settings: Enabled=${merchant.low_stock_enabled}, Threshold=${merchant.low_stock_threshold}, Critical=${merchant.critical_stock_threshold}`);
      
      // Check if notification was already sent today
      const alreadySent = await NotificationSettings.wasNotificationSentToday(merchant.merchant_id);
      console.log(`   Already sent today: ${alreadySent}`);
      
      // Get low stock products
      const lowStockProducts = await Product.findLowStock(merchant.merchant_id, merchant.low_stock_threshold);
      console.log(`   Low stock products found: ${lowStockProducts.length}`);
      
      if (lowStockProducts.length > 0) {
        console.log('   📦 Low stock products:');
        lowStockProducts.forEach(product => {
          console.log(`      - ${product.name}: ${product.quantity} units (Price: ₹${product.price})`);
        });
        
        // Check critical products
        const criticalProducts = lowStockProducts.filter(p => p.quantity <= merchant.critical_stock_threshold);
        console.log(`   🚨 Critical products: ${criticalProducts.length}`);
        
        if (criticalProducts.length > 0) {
          criticalProducts.forEach(product => {
            console.log(`      - ${product.name}: ${product.quantity} units (CRITICAL)`);
          });
        }
      } else {
        console.log('   ✅ No low stock products found');
      }
      
      // Get existing notifications for this merchant
      try {
        const existingNotifications = await Notification.findByMerchantId(merchant.merchant_id, { limit: 5, offset: 0 });
        console.log(`   📬 Existing notifications: ${existingNotifications.length}`);
      } catch (notifError) {
        console.log(`   ⚠️  Error fetching notifications: ${notifError.message}`);
      }
    }

    // Step 3: Try to manually trigger notifications for first merchant
    if (merchants.length > 0) {
      console.log('\n🧪 Step 3: Manually triggering notification for first merchant...');
      const firstMerchant = merchants[0];
      
      try {
        const notificationsCreated = await NotificationService.processLowStockForMerchant(firstMerchant);
        console.log(`✅ Manual trigger completed. Created ${notificationsCreated} notifications.`);
        
        // Check if notifications were actually created
        if (notificationsCreated > 0) {
          const newNotifications = await Notification.findByMerchantId(firstMerchant.merchant_id, { limit: 3 });
          console.log('📨 Recent notifications:');
          newNotifications.forEach(notif => {
            console.log(`   - ${notif.title}: ${notif.message.substring(0, 100)}...`);
            console.log(`     Created: ${notif.created_at}, Read: ${notif.is_read}, AI Enhanced: ${notif.is_ai_enhanced}`);
          });
        }
        
      } catch (error) {
        console.log(`❌ Manual trigger failed: ${error.message}`);
        console.log(`   Error details:`, error);
      }
    }

    // Step 4: Test the global notification process
    console.log('\n🌐 Step 4: Testing global notification process...');
    try {
      const totalNotifications = await NotificationService.processLowStockNotifications();
      console.log(`✅ Global process completed. Total notifications created: ${totalNotifications}`);
    } catch (error) {
      console.log(`❌ Global process failed: ${error.message}`);
      console.log(`   Error details:`, error);
    }

  } catch (error) {
    console.error('❌ Debug script failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run debug
debugNotificationSystem()
  .then(() => {
    console.log('\n✨ Debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Debug failed:', error);
    process.exit(1);
  });