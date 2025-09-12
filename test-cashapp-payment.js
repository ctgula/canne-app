// Simple test script for Cash App payment integration
// Run with: node test-cashapp-payment.js

const BASE_URL = 'http://localhost:4000';

async function testCashAppPayment() {
  console.log('🧪 Testing Cash App Payment Integration...\n');

  try {
    // Test 1: Create a Cash App order
    console.log('1️⃣ Creating Cash App order...');
    const createResponse = await fetch(`${BASE_URL}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount_cents: 2500, // $25.00
        customer_phone: '+12025550123'
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Create order failed: ${createResponse.status}`);
    }

    const createData = await createResponse.json();
    console.log('✅ Order created successfully:', createData);
    
    const shortCode = createData.short_code;
    if (!shortCode) {
      throw new Error('No short_code returned from create order');
    }

    // Test 2: Submit payment info
    console.log('\n2️⃣ Submitting payment information...');
    const submitResponse = await fetch(`${BASE_URL}/api/orders/submit-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        short_code: shortCode,
        cashapp_handle: '@testuser',
        screenshot_url: 'https://example.com/screenshot.jpg'
      })
    });

    if (!submitResponse.ok) {
      throw new Error(`Submit payment failed: ${submitResponse.status}`);
    }

    const submitData = await submitResponse.json();
    console.log('✅ Payment submitted successfully:', submitData);

    // Test 3: Mark as paid (admin action)
    console.log('\n3️⃣ Marking order as paid (admin action)...');
    const markPaidResponse = await fetch(`${BASE_URL}/api/orders/mark-paid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        short_code: shortCode
      })
    });

    if (!markPaidResponse.ok) {
      throw new Error(`Mark paid failed: ${markPaidResponse.status}`);
    }

    const markPaidData = await markPaidResponse.json();
    console.log('✅ Order marked as paid successfully:', markPaidData);

    console.log('\n🎉 All tests passed! Cash App integration is working correctly.');
    console.log(`\n📱 Test payment page: ${BASE_URL}/pay/${encodeURIComponent(shortCode)}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testCashAppPayment();
