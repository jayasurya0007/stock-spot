import bcrypt from 'bcryptjs';
import pool from './config/database.js';

async function createTestUser() {
  try {
    console.log('🔧 Creating test user for notification testing...\n');
    
    const email = 'test@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user already exists
    const [existingUsers] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      console.log('✅ Test user already exists');
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Password: ${password}`);
      
      // Update password to ensure we know it
      await pool.execute('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, email]);
      console.log('🔄 Password updated to ensure consistency');
    } else {
      // Create new user
      await pool.execute(
        'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
        [email, hashedPassword, 'merchant']
      );
      console.log('✅ New test user created');
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Password: ${password}`);
    }
    
    // Also create test users for the other merchants
    const testUsers = [
      { email: 'joeanidas.26it@licet.ac.in', password: 'password123' },
      { email: 'msj2508@gmail.com', password: 'password123' },
      { email: 'gino@gmail.com', password: 'password123' }
    ];
    
    console.log('\n🧪 Ensuring all test users have known passwords...');
    
    for (const user of testUsers) {
      const hashedPwd = await bcrypt.hash(user.password, 10);
      
      const [existing] = await pool.execute('SELECT * FROM users WHERE email = ?', [user.email]);
      
      if (existing.length > 0) {
        await pool.execute('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPwd, user.email]);
        console.log(`✅ Updated password for ${user.email}`);
      } else {
        await pool.execute(
          'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
          [user.email, hashedPwd, 'merchant']
        );
        console.log(`✅ Created user ${user.email}`);
      }
    }
    
    console.log('\n🎯 LOGIN CREDENTIALS FOR TESTING:');
    console.log('================================');
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: password123');
    console.log('🏪 Shop: TestShop (has 1 notification)');
    console.log('');
    console.log('📧 Email: joeanidas.26it@licet.ac.in');
    console.log('🔑 Password: password123');
    console.log('🏪 Shop: My Shop (has 3 notifications)');
    console.log('');
    console.log('📧 Email: msj2508@gmail.com');
    console.log('🔑 Password: password123');
    console.log('🏪 Shop: Shoppfiy (has 1 notification)');
    
    console.log('\n🌐 Frontend URL: http://localhost:3002');
    console.log('⚙️  Backend URL: http://localhost:5000');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  }
  
  process.exit(0);
}

createTestUser();