import pool from './config/database.js';

async function checkMerchantsTable() {
  try {
    console.log('🔍 Checking merchants table structure...\n');
    
    const [rows] = await pool.execute('DESCRIBE merchants');
    console.log('📋 Merchants table structure:');
    rows.forEach(row => {
      console.log(`   ${row.Field}: ${row.Type} ${row.Null === 'NO' ? '(NOT NULL)' : '(NULLABLE)'} ${row.Key ? `[${row.Key}]` : ''}`);
    });
    
    console.log('\n🧪 Testing a sample merchant insert...');
    
    try {
      // Try to insert a test record to see what fails
      const testData = {
        user_id: 999999, // Non-existent user ID for testing
        shop_name: 'Test Shop',
        address: 'Test Address',
        latitude: 12.9716,
        longitude: 77.5946,
        owner_name: 'Test Owner',
        phone: '1234567890'
      };
      
      await pool.execute(
        'INSERT INTO merchants (user_id, shop_name, address, latitude, longitude, owner_name, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [testData.user_id, testData.shop_name, testData.address, testData.latitude, testData.longitude, testData.owner_name, testData.phone]
      );
      
      console.log('✅ Test insert worked (cleaning up...)');
      
      // Clean up test record
      await pool.execute('DELETE FROM merchants WHERE user_id = ?', [testData.user_id]);
      
    } catch (insertError) {
      console.log(`❌ Test insert failed: ${insertError.message}`);
      console.log('   This might reveal the registration issue.');
    }
    
  } catch (error) {
    console.error('❌ Error checking table:', error);
  }
  
  process.exit(0);
}

checkMerchantsTable();