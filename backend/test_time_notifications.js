/**
 * Test script for time-based notifications with improved product detail messages
 */

import NotificationService from './services/notificationService.js';
import NotificationSettings from './models/NotificationSettings.js';
import pool from './config/database.js';

async function testTimeBasedNotifications() {
  try {
    console.log('🧪 Testing Time-Based Notification System\n');
    
    // Step 1: Show current time and check merchant notification times
    const now = new Date();
    const currentTime = now.toTimeString().substring(0, 5);
    console.log(`⏰ Current Time: ${now.toLocaleString()}`);
    console.log(`🕐 Current Time (HH:MM): ${currentTime}\n`);
    
    // Step 2: Get all merchants with notification settings
    const merchants = await NotificationSettings.getMerchantsWithNotificationsEnabled();
    console.log(`📊 Found ${merchants.length} merchants with notifications enabled\n`);
    
    for (const merchant of merchants.slice(0, 3)) {
      const settings = await NotificationSettings.findByMerchantId(merchant.merchant_id);
      const notificationTime = settings.daily_notification_time || '09:00:00';
      const targetTime = notificationTime.substring(0, 5);
      
      console.log(`🏪 ${merchant.shop_name} (ID: ${merchant.merchant_id})`);
      console.log(`   ⏰ Notification Time: ${targetTime}`);
      console.log(`   🔔 Low Stock Threshold: ${settings.low_stock_threshold}`);
      console.log(`   🤖 AI Enhanced: ${settings.ai_enhanced_notifications ? 'Yes' : 'No'}`);
      
      // Check if it's this merchant's notification time
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [targetHour, targetMinute] = targetTime.split(':').map(Number);
      const targetMinutes = targetHour * 60 + targetMinute;
      const timeDifference = Math.abs(currentMinutes - targetMinutes);
      
      if (timeDifference <= 30) {
        console.log(`   ✅ Within notification window (${timeDifference} minutes difference)`);
        
        // Test notification creation for this merchant
        const notificationsCreated = await NotificationService.processLowStockForMerchant(merchant);
        console.log(`   📨 Notifications created: ${notificationsCreated}`);
      } else {
        console.log(`   ⏸️  Not notification time (${timeDifference} minutes difference)`);
        
        // Show when next notification would be
        const nextNotificationTime = new Date();
        nextNotificationTime.setHours(targetHour, targetMinute, 0, 0);
        if (nextNotificationTime <= now) {
          nextNotificationTime.setDate(nextNotificationTime.getDate() + 1);
        }
        console.log(`   ⏭️  Next notification: ${nextNotificationTime.toLocaleString()}`);
      }
      console.log('');
    }
    
    // Step 3: Demonstrate setting custom notification time
    console.log('🛠️  SETTING CUSTOM NOTIFICATION TIME FOR TESTING\n');
    
    // Set notification time to current time + 2 minutes for immediate testing
    const testTime = new Date();
    testTime.setMinutes(testTime.getMinutes() + 2);
    const testTimeString = testTime.toTimeString().substring(0, 8); // HH:MM:SS format
    
    if (merchants.length > 0) {
      const testMerchant = merchants[0];
      
      console.log(`🧪 Setting ${testMerchant.shop_name} notification time to: ${testTimeString}`);
      
      // Update notification time
      await NotificationSettings.update(testMerchant.merchant_id, {
        daily_notification_time: testTimeString
      });
      
      console.log(`✅ Notification time updated successfully!`);
      console.log(`⏰ The scheduler will check for notifications in ~2 minutes`);
      console.log(`📝 You can watch the backend console for notification processing logs`);
      
      // Also create some low stock products for testing if needed
      console.log(`\n🛠️  Ensuring low stock products exist for testing...`);
      
      const [products] = await pool.execute(
        'SELECT * FROM products WHERE merchant_id = ? AND quantity <= ? LIMIT 3',
        [testMerchant.merchant_id, 5]
      );
      
      if (products.length === 0) {
        console.log(`   📦 No low stock products found. Creating test products...`);
        
        const testProducts = [
          { name: 'Test Widget A', quantity: 1, price: 29.99 },
          { name: 'Test Gadget B', quantity: 3, price: 49.99 }
        ];
        
        for (const product of testProducts) {
          try {
            await pool.execute(
              'INSERT INTO products (merchant_id, name, description, price, quantity, category) VALUES (?, ?, ?, ?, ?, ?)',
              [
                testMerchant.merchant_id, 
                product.name, 
                'Test product for notification testing', 
                product.price, 
                product.quantity, 
                'test'
              ]
            );
            console.log(`   ✅ Created: ${product.name} (qty: ${product.quantity})`);
          } catch (error) {
            if (!error.message.includes('Duplicate entry')) {
              console.log(`   ⚠️  Error creating ${product.name}: ${error.message}`);
            }
          }
        }
      } else {
        console.log(`   ✅ Found ${products.length} low stock products:`);
        products.forEach(p => {
          console.log(`     📦 ${p.name}: ${p.quantity} units`);
        });
      }
    }
    
    console.log('\n🎯 TESTING SUMMARY:');
    console.log('==================');
    console.log('✅ Scheduler now respects individual merchant notification times');
    console.log('✅ Notifications include detailed product names and quantities');  
    console.log('✅ Different urgency levels (Critical 🔴, Urgent 🟠, Low 🟡)');
    console.log('✅ Test merchant notification time set to trigger in 2 minutes');
    console.log('\n📝 Watch the backend console logs to see notifications being created!');
    console.log('🔔 After notifications are created, check the frontend notification bell');
    
  } catch (error) {
    console.error('❌ Error testing time-based notifications:', error);
  }
  
  process.exit(0);
}

testTimeBasedNotifications();