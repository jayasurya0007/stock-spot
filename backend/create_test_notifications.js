import pool from './config/database.js';
import NotificationService from './services/notificationService.js';
import Notification from './models/Notification.js';

async function createTestNotificationForUser() {
  try {
    console.log('🧪 Creating test notifications for merchants with user accounts...\n');
    
    // Get merchants with user accounts
    const [merchantsWithUsers] = await pool.execute(`
      SELECT 
        m.id, 
        m.shop_name, 
        u.email, 
        u.role 
      FROM merchants m 
      INNER JOIN users u ON m.user_id = u.id 
      LIMIT 3
    `);
    
    console.log(`Found ${merchantsWithUsers.length} merchants with user accounts\n`);
    
    for (const merchant of merchantsWithUsers) {
      console.log(`🏪 Processing ${merchant.shop_name} (ID: ${merchant.id}) - ${merchant.email}`);
      
      // Check if they have low stock products
      const [products] = await pool.execute(
        'SELECT * FROM products WHERE merchant_id = ? AND quantity <= 5 LIMIT 3',
        [merchant.id]
      );
      
      console.log(`   📦 Found ${products.length} low stock products`);
      
      if (products.length > 0) {
        // Force create notification
        try {
          const notificationData = {
            merchant_id: merchant.id,
            title: `🚨 Low Stock Alert`,
            message: `You have ${products.length} products with low stock: ${products.map(p => p.name).join(', ')}`,
            type: 'low_stock',
            is_read: false,
            metadata: JSON.stringify({
              products: products.map(p => ({
                id: p.id,
                name: p.name,
                quantity: p.quantity
              }))
            })
          };
          
          const notification = await Notification.create(notificationData);
          console.log(`   ✅ Created notification: "${notification.title}"`);
          
        } catch (error) {
          console.log(`   ❌ Error creating notification: ${error.message}`);
        }
      } else {
        // Create some low stock products for testing
        console.log(`   🛠️  Creating test low stock products...`);
        
        const testProducts = [
          { name: 'Test Product A', quantity: 2, price: 100 },
          { name: 'Test Product B', quantity: 1, price: 150 }
        ];
        
        for (const product of testProducts) {
          try {
            await pool.execute(
              'INSERT INTO products (merchant_id, name, description, price, quantity, category) VALUES (?, ?, ?, ?, ?, ?)',
              [merchant.id, product.name, 'Test product for notifications', product.price, product.quantity, 'test']
            );
            console.log(`   📦 Created test product: ${product.name} (qty: ${product.quantity})`);
          } catch (error) {
            if (!error.message.includes('Duplicate entry')) {
              console.log(`   ⚠️  Product creation error: ${error.message}`);
            }
          }
        }
        
        // Now create notification
        const notificationData = {
          merchant_id: merchant.id,
          title: `🚨 Low Stock Alert - Test`,
          message: `Test notification: You have products with very low stock that need immediate attention.`,
          type: 'low_stock',
          is_read: false,
          metadata: JSON.stringify({
            test: true,
            products: testProducts
          })
        };
        
        try {
          const notification = await Notification.create(notificationData);
          console.log(`   ✅ Created test notification: "${notification.title}"`);
        } catch (error) {
          console.log(`   ❌ Error creating test notification: ${error.message}`);
        }
      }
      
      // Check current notifications for this merchant
      const notifications = await Notification.findByMerchantId(merchant.id, { limit: 3 });
      const unreadCount = await Notification.getUnreadCount(merchant.id);
      
      console.log(`   🔔 Current notifications: ${notifications.length} total, ${unreadCount} unread`);
      console.log('');
    }
    
    console.log('🎯 TESTING INSTRUCTIONS:');
    console.log('========================');
    console.log('1. 🌐 Open http://localhost:3002');
    console.log('2. 🔐 Login with one of these accounts:');
    
    for (const merchant of merchantsWithUsers) {
      const unreadCount = await Notification.getUnreadCount(merchant.id);
      console.log(`   📧 ${merchant.email} → ${merchant.shop_name} (${unreadCount} unread notifications)`);
    }
    
    console.log('3. 🔔 Look for red badge on notification bell');
    console.log('4. 🖱️  Click notification bell to see dropdown');
    console.log('5. ✅ Notifications should now appear!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

createTestNotificationForUser();