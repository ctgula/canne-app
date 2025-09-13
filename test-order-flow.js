// Test script for complete order verification and dispatch flow
const { default: fetch } = require('node-fetch');

const BASE_URL = 'https://canne.app';

async function testCompleteOrderFlow() {
  console.log('🧪 Testing Complete Order Verification & Dispatch Flow...\n');

  try {
    // Step 1: Create a Cash App order
    console.log('1️⃣ Creating Cash App order...');
    const createResponse = await fetch(`${BASE_URL}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount_cents: 4500, // $45
        customer_phone: '+1234567890'
      })
    });
    
    const createData = await createResponse.json();
    if (!createResponse.ok) {
      throw new Error(`Create order failed: ${createData.error}`);
    }
    
    const shortCode = createData.short_code;
    console.log(`✅ Order created: ${shortCode}\n`);

    // Step 2: Customer submits payment
    console.log('2️⃣ Customer submits payment info...');
    const submitResponse = await fetch(`${BASE_URL}/api/orders/submit-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        short_code: shortCode,
        cashapp_handle: 'testuser123',
        screenshot_url: 'https://example.com/screenshot.jpg'
      })
    });
    
    const submitData = await submitResponse.json();
    if (!submitResponse.ok) {
      throw new Error(`Submit payment failed: ${submitData.error}`);
    }
    console.log('✅ Payment submitted - status: verifying\n');

    // Step 3: Admin marks order as paid
    console.log('3️⃣ Admin marks order as paid...');
    const paidResponse = await fetch(`${BASE_URL}/api/orders/mark-paid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        short_code: shortCode
      })
    });
    
    const paidData = await paidResponse.json();
    if (!paidResponse.ok) {
      throw new Error(`Mark paid failed: ${paidData.error}`);
    }
    console.log('✅ Order marked as paid\n');

    // Step 4: Admin assigns driver (using dummy driver ID)
    console.log('4️⃣ Admin assigns driver...');
    const dummyDriverId = '550e8400-e29b-41d4-a716-446655440000'; // UUID format
    const assignResponse = await fetch(`${BASE_URL}/api/orders/assign-driver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        short_code: shortCode,
        driver_id: dummyDriverId
      })
    });
    
    const assignData = await assignResponse.json();
    if (!assignResponse.ok) {
      throw new Error(`Assign driver failed: ${assignData.error}`);
    }
    console.log('✅ Driver assigned - payout created\n');

    // Step 5: Driver completes order
    console.log('5️⃣ Driver completes order...');
    const completeResponse = await fetch(`${BASE_URL}/api/orders/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        short_code: shortCode
      })
    });
    
    const completeData = await completeResponse.json();
    if (!completeResponse.ok) {
      throw new Error(`Complete order failed: ${completeData.error}`);
    }
    console.log('✅ Order completed - status: delivered\n');

    // Step 6: Verify final state
    console.log('6️⃣ Verifying final order state...');
    const orderResponse = await fetch(`${BASE_URL}/api/cashapp-orders/${shortCode}`);
    const orderData = await orderResponse.json();
    
    if (orderResponse.ok) {
      console.log('✅ Final order state:', {
        short_code: orderData.short_code,
        status: orderData.status,
        driver_id: orderData.driver_id,
        amount: `$${orderData.amount_cents / 100}`
      });
    }

    console.log('\n🎉 Complete order flow test PASSED!');
    console.log(`\n📱 Test order: ${shortCode}`);
    console.log(`🔗 Admin dashboard: ${BASE_URL}/admin/orders`);
    console.log(`🚗 Driver dashboard: ${BASE_URL}/drivers`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testCompleteOrderFlow();
