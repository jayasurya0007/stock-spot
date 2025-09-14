import pool from './config/database.js';

async function checkUsersAndMerchants() {
  try {
    console.log('🔍 Checking users and merchants...\n');
    
    // Check users table structure
    console.log('📋 Users table structure:');
    const [userCols] = await pool.execute('DESCRIBE users');
    userCols.forEach(col => console.log(`   ${col.Field}: ${col.Type}`));
    
    // Check all users
    console.log('\n👥 All users:');
    const [users] = await pool.execute('SELECT * FROM users LIMIT 10');
    users.forEach(user => {
      console.log(`   ID: ${user.id}, Email: ${user.email}, Merchant ID: ${user.merchant_id || 'None'}`);
    });
    
    // Check if there's a user for merchant ID 4
    console.log('\n🎯 Users for merchant ID 4 (Happy Kids):');
    const [merchantUsers] = await pool.execute('SELECT * FROM users WHERE merchant_id = ?', [4]);
    
    if (merchantUsers.length > 0) {
      merchantUsers.forEach(user => {
        console.log(`   ✅ Found user: ${user.email} (ID: ${user.id})`);
      });
    } else {
      console.log('   ❌ No users found for merchant ID 4');
      
      // Let's find any user we can use for testing
      console.log('\n🧪 Available test users:');
      const [testUsers] = await pool.execute('SELECT u.*, m.shop_name FROM users u LEFT JOIN merchants m ON u.merchant_id = m.id LIMIT 5');
      testUsers.forEach(user => {
        console.log(`   📧 ${user.email} → ${user.shop_name || 'No merchant linked'} (Merchant ID: ${user.merchant_id || 'None'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

checkUsersAndMerchants();