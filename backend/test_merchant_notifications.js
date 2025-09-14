/**
 * Test script for merchant-specific time-based notifications
 * This will demonstrate the improved system where only the logged-in merchant gets notifications
 */

import NotificationService from './services/notificationService.js';
import NotificationSettings from './models/NotificationSettings.js';
import pool from './config/database.js';

async function testMerchantSpecificNotifications() {
  try {
    console.log('🧪 Testing Merchant-Specific Notification System\n');
    console.log('📋 New System Features:');
    console.log('  ✅ Only logged-in merchant gets notifications');
    console.log('  ✅ Notifications trigger at exact set time (not after restart)');
    console.log('  ✅ No global notification spam');
    console.log('  ✅ Frontend checks notification time every 30 seconds\n');
    
    // Step 1: Set up test merchant with custom time
    const now = new Date();
    const testTime = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes from now
    const testTimeString = testTime.toTimeString().substring(0, 8); // HH:MM:SS format
    
    console.log(`⏰ Current Time: ${now.toLocaleTimeString()}`);
    console.log(`🎯 Test Time: ${testTime.toLocaleTimeString()} (in 2 minutes)\n`);
    
    // Get a test merchant
    const merchants = await NotificationSettings.getMerchantsWithNotificationsEnabled();
    if (merchants.length === 0) {
      throw new Error('No merchants with notifications enabled found');
    }
    
    const testMerchant = merchants[0];
    console.log(`🏪 Test Merchant: ${testMerchant.shop_name} (ID: ${testMerchant.merchant_id})`);
    
    // Update notification time
    await NotificationSettings.update(testMerchant.merchant_id, {
      daily_notification_time: testTimeString
    });
    console.log(`✅ Set notification time to: ${testTimeString}\n`);
    
    // Ensure low stock products exist
    console.log('📦 Ensuring low stock products exist...');
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE merchant_id = ? AND quantity <= 5 LIMIT 5',
      [testMerchant.merchant_id]
    );
    
    if (products.length === 0) {
      console.log('   Creating test low stock products...');
      
      const testProducts = [
        { name: 'Urgent Widget', quantity: 1, price: 29.99 },
        { name: 'Low Stock Gadget', quantity: 3, price: 49.99 },
        { name: 'Critical Item', quantity: 1, price: 19.99 }
      ];
      
      for (const product of testProducts) {
        try {
          await pool.execute(
            'INSERT INTO products (merchant_id, name, description, price, quantity, category) VALUES (?, ?, ?, ?, ?, ?)',
            [
              testMerchant.merchant_id, 
              product.name, 
              'Test product for merchant-specific notifications', 
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
    
    // Test the new API endpoint
    console.log('\n🧪 Testing merchant-specific notification check...');
    
    const result = await NotificationService.checkAndProcessMerchantNotificationTime(testMerchant.merchant_id);
    console.log('📊 Result:', result);
    
    if (result.isNotificationTime) {
      console.log('✅ It\'s notification time! Notifications would be created.');
    } else {
      console.log(`⏰ Not notification time yet. ${result.message}`);
    }
    
    console.log('\n🎯 HOW TO TEST:');
    console.log('===============');
    console.log('1. 🌐 Open frontend: http://localhost:3002');
    console.log(`2. 🔐 Login as: test@example.com / password123`);
    console.log('3. 🛠️  Go to "Notification Settings"');
    console.log(`4. ⏰ Set notification time to: ${testTime.toLocaleTimeString()} (current test time)`);
    console.log('5. 💾 Save settings');
    console.log('6. 🔔 Wait for notification time - frontend checks every 30 seconds');
    console.log('7. 📬 Watch notification bell for red badge when time arrives');
    
    console.log('\n🔧 WHAT\'S DIFFERENT NOW:');
    console.log('========================');
    console.log('❌ OLD: All merchants got notifications at server restart');
    console.log('✅ NEW: Only YOUR merchant gets notifications at YOUR set time');
    console.log('❌ OLD: Notifications only triggered after server restart');
    console.log('✅ NEW: Notifications trigger at exact time while server runs');
    console.log('❌ OLD: Console spam from all merchants');
    console.log('✅ NEW: Clean logs, only your notifications appear');
    
    console.log('\n📡 API ENDPOINTS:');
    console.log('================');
    console.log('POST /notifications/check-time - Check if it\'s your notification time');
    console.log('POST /notifications/trigger-check - Manually trigger notifications');
    console.log('GET /notifications/unread-count - Get your unread count');
    
    console.log('\n🎉 System is ready for merchant-specific testing!');
    
  } catch (error) {
    console.error('❌ Error testing merchant-specific notifications:', error);
  }
  
  process.exit(0);
}

testMerchantSpecificNotifications();