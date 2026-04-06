// Registration Debugging Script
const axios = require('axios');

async function testRegistration() {
  console.log('🧪 Testing Registration Endpoint...\n');
  
  const testUser = {
    name: 'Debug Test User',
    phone: '9999999999',  // Use a unique phone number
    password: 'test123',
    district: 'Test District',
    state: 'Test State',
    village: 'Test Village',
    language: 'en'
  };

  try {
    console.log('📡 Sending POST request to http://localhost:5000/api/auth/register');
    console.log('📝 Payload:', JSON.stringify(testUser, null, 2));
    
    const response = await axios.post('http://localhost:5000/api/auth/register', testUser, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Registration successful!');
    console.log('📦 Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Registration failed!');
    
    if (error.response) {
      console.log('📤 Status:', error.response.status);
      console.log('📤 Headers:', error.response.headers);
      console.log('📤 Error Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('🚫 No response received. Server might be down.');
      console.log('🔍 Check if backend is running at http://localhost:5000');
    } else {
      console.log('⚠️  Request setup error:', error.message);
    }
    
    console.log('\n🔍 Full error object:', error.code || error.message);
  }
}

// Quick server check
async function checkServer() {
  try {
    console.log('🔍 Checking if backend server is running...');
    const response = await axios.get('http://localhost:5000/api/health', { timeout: 5000 });
    console.log('✅ Backend is running!');
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running at http://localhost:5000');
      console.log('💡 Start it with: npm start (in backend folder)');
    } else {
      console.log('⚠️  Server check failed:', error.message);
    }
    return false;
  }
}

async function main() {
  console.log('🚀 AgriTech Registration Debugging\n');
  
  const serverRunning = await checkServer();
  console.log();
  
  if (serverRunning) {
    await testRegistration();
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. If server not running: cd backend && npm start');
  console.log('2. If registration fails with error, check backend logs');
  console.log('3. Verify .env file has LOCAL_DB=true and JWT_SECRET');
}

main();