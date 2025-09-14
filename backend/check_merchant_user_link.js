import pool from './config/database.js';

async function checkMerchantUserLink() {
  try {
    console.log('🔍 Checking merchant-user relationship...\n');
    
    // Check merchants table structure
    console.log('📋 Merchants table structure:');
    const [merchantCols] = await pool.execute('DESCRIBE merchants');
    merchantCols.forEach(col => console.log(`   ${col.Field}: ${col.Type}`));
    
    // Find the merchant with notification and their user
    console.log('\n🎯 Merchant ID 4 (Happy Kids) with user info:');
    const [merchantUser] = await pool.execute(`
      SELECT 
        m.*, 
        u.email, 
        u.role 
      FROM merchants m 
      LEFT JOIN users u ON m.user_id = u.id 
      WHERE m.id = ?
    `, [4]);
    
    if (merchantUser.length > 0) {
      const merchant = merchantUser[0];
      console.log(`   🏪 Shop: ${merchant.shop_name}`);
      console.log(`   👤 Owner: ${merchant.owner_name}`);
      console.log(`   📧 Email: ${merchant.email || 'No email linked'}`);
      console.log(`   🔐 User ID: ${merchant.user_id || 'No user linked'}`);
      console.log(`   👥 Role: ${merchant.role || 'No role'}`);
      
      if (merchant.email) {
        console.log(`\n✅ Login credentials found!`);
        console.log(`   📧 Email: ${merchant.email}`);
        console.log(`   🔑 Password: Use the password for this email`);
      } else {
        console.log(`\n❌ No user account linked to this merchant`);
      }
    }
    
    // Find any merchants with users for testing
    console.log('\n🧪 Merchants with user accounts (for testing):');
    const [merchantsWithUsers] = await pool.execute(`
      SELECT 
        m.id, 
        m.shop_name, 
        u.email, 
        u.role 
      FROM merchants m 
      INNER JOIN users u ON m.user_id = u.id 
      LIMIT 5
    `);
    
    if (merchantsWithUsers.length > 0) {
      merchantsWithUsers.forEach(merchant => {
        console.log(`   🏪 ${merchant.shop_name} (ID: ${merchant.id}) → 📧 ${merchant.email}`);
      });
    } else {
      console.log('   ❌ No merchants with user accounts found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

checkMerchantUserLink();