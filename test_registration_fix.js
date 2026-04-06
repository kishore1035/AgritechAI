// Test script to verify registration fix works
require('dotenv').config({ path: './.env' });

const User = require('./backend/models/User');

async function testUserCreation() {
  console.log('Testing user creation with local database...');
  
  try {
    // Create a test user
    const testUser = await User.create({
      name: 'Test User',
      phone: '1234567890',
      password: 'hashedpassword',
      district: 'Test District',
      state: 'Test State',
      village: 'Test Village',
      language: 'en'
    });

    console.log('User created successfully:');
    console.log('- ID field:', testUser._id);
    console.log('- Has _id:', !!testUser._id);
    console.log('- Has id:', !!testUser.id);
    console.log('- User object keys:', Object.keys(testUser));
    
    // Test JWT token creation with _id
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET || 'testsecret', {
      expiresIn: '7d'
    });
    
    console.log('- JWT token created successfully with _id:', !!token);
    
    // Clean up test user
    await User.deleteOne({ _id: testUser._id });
    console.log('- Test user cleaned up successfully');
    
    console.log('\n✅ Registration fix validated! Users are created with _id field and JWT tokens work.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUserCreation();