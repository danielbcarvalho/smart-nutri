const axios = require('axios');

const baseUrl = 'http://localhost:8000';
const testAuthToken = 'YOUR_JWT_TOKEN_HERE'; // You'll need to get this from a real login

// Test configuration
const testRequest = {
  patientId: 'test-patient-uuid', // Replace with real patient ID
  configuration: {
    objective: 'perda_peso',
    objectiveDetails: 'Perda de 3kg em 2 meses',
    restrictions: ['sem_lactose'],
    customRestrictions: 'Aversão a peixes',
    avoidedFoods: [],
    preferredFoods: [],
    mealsPerDay: 5,
    complexity: 'simples',
    budget: 'medio',
    exerciseRoutine: 'Academia 3x por semana',
    exerciseIntensity: 'moderada',
    kitchenEquipment: ['fogao', 'geladeira', 'microondas']
  }
};

async function testAiEndpoints() {
  const headers = {
    'Authorization': `Bearer ${testAuthToken}`,
    'Content-Type': 'application/json'
  };

  try {
    console.log('🧪 Testing AI Meal Plans Endpoints...\n');

    // Test 1: Check AI Service Status
    console.log('1️⃣ Testing AI Service Status...');
    try {
      const statusResponse = await axios.get(`${baseUrl}/ai-meal-plans/status`, { headers });
      console.log('✅ Status Response:', JSON.stringify(statusResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Status Error:', error.response?.data || error.message);
    }

    // Test 2: Food Matching Test
    console.log('\n2️⃣ Testing Food Matching...');
    try {
      const foodMatchResponse = await axios.post(`${baseUrl}/ai-meal-plans/food-matching`, {
        foods: ['Arroz branco cozido', 'Frango grelhado', 'Brócolis refogado']
      }, { headers });
      console.log('✅ Food Matching Response:', JSON.stringify(foodMatchResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Food Matching Error:', error.response?.data || error.message);
    }

    // Test 3: Patient Data Aggregation (replace with real patient ID)
    console.log('\n3️⃣ Testing Patient Data Aggregation...');
    try {
      const patientDataResponse = await axios.get(`${baseUrl}/ai-meal-plans/patient-data/${testRequest.patientId}`, { headers });
      console.log('✅ Patient Data Response:', JSON.stringify(patientDataResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Patient Data Error:', error.response?.data || error.message);
    }

    // Test 4: AI Meal Plan Generation (requires valid Claude API key and patient data)
    console.log('\n4️⃣ Testing AI Meal Plan Generation...');
    console.log('⚠️  Note: This requires a valid Claude API key and real patient data');
    console.log('Request:', JSON.stringify(testRequest, null, 2));
    
    // Uncomment to test actual generation (requires setup)
    /*
    try {
      const generationResponse = await axios.post(`${baseUrl}/ai-meal-plans/generate`, testRequest, { 
        headers,
        timeout: 60000 // 60 second timeout for AI generation
      });
      console.log('✅ Generation Response:', JSON.stringify(generationResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Generation Error:', error.response?.data || error.message);
    }
    */

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

async function testWithoutAuth() {
  console.log('\n🔓 Testing endpoints without authentication (should fail)...\n');
  
  try {
    const response = await axios.get(`${baseUrl}/ai-meal-plans/status`);
    console.log('❌ Should have failed without auth:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected unauthenticated request');
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
}

// Run tests
console.log('🚀 SmartNutri AI Endpoints Test Suite\n');
console.log('📝 Instructions:');
console.log('1. Make sure the backend server is running on port 8000');
console.log('2. Replace testAuthToken with a real JWT token from login');
console.log('3. Replace testRequest.patientId with a real patient UUID');
console.log('4. Set CLAUDE_API_KEY in your .env file for AI generation');
console.log('5. Uncomment the generation test when ready\n');

testWithoutAuth();
// testAiEndpoints(); // Uncomment when you have a valid token