// Test order for new Discord webhook verification
// This will test the updated webhook URL

async function testNewWebhook() {
  console.log('🧪 Testing NEW Discord webhook...');
  
  // Create a Classic Series test order for new webhook
  const testOrder = {
    items: [
      {
        product: {
          id: "4e08d8c4-bc92-451c-b1fb-d2898070462f", // Classic Series ID
          name: "Classic Series",
          description: "classic",
          price: 45,
          artworkUrl: "/images/classic-series.jpg",
          giftSize: "7g complimentary",
          hasDelivery: true
        },
        quantity: 1
      }
    ],
    deliveryDetails: {
      name: "New Webhook Test",
      email: "newwebhook@canneart.com",
      phone: "2025556789",
      address: "2100 Pennsylvania Ave NW",
      apartment: "Suite 200",
      city: "Washington",
      zipCode: "20037",
      preferredTime: "afternoon",
      specialInstructions: "🔗 NEW WEBHOOK TEST - Verifying updated Discord webhook URL is working correctly",
      ageVerification: true,
      termsAccepted: true,
      emailUpdates: true
    },
    total: 45,
    hasDelivery: true,
    status: 'pending'
  };

  try {
    console.log('📤 Sending test order with NEW webhook...');
    console.log('🔗 Testing webhook ID: 1398434897147990067');
    
    const response = await fetch('http://localhost:4000/api/place-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder),
    });

    const responseData = await response.json();
    
    console.log('📋 API Response Status:', response.status);
    console.log('📋 API Response Data:', JSON.stringify(responseData, null, 2));

    if (response.ok && responseData.success) {
      console.log('✅ NEW webhook test order created successfully!');
      console.log(`🎯 Order ID: ${responseData.orderId}`);
      console.log('🔔 Check Discord channel for notification with NEW webhook!');
      console.log('💜 Should show Classic Series ($45) with updated webhook delivery');
    } else {
      console.error('❌ NEW webhook test failed:', responseData.error || 'Unknown error');
    }

  } catch (error) {
    console.error('💥 NEW webhook test error:', error.message);
  }
}

// Run the new webhook test
testNewWebhook();
