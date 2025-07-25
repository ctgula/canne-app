// Test script to verify Discord notifications are working
// This will create a complete test order and check Discord webhook delivery

async function testOrderWithDiscord() {
  console.log('🧪 Testing complete order flow with Discord notifications...');
  
  // Create a realistic test order
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
      name: "Discord Test User",
      email: "discord-test@canneart.com",
      phone: "2025551234",
      address: "1600 Pennsylvania Ave NW",
      apartment: "Suite 100",
      city: "Washington",
      zipCode: "20001",
      preferredTime: "evening",
      specialInstructions: "Test order for Discord webhook verification - please ignore",
      ageVerification: true,
      termsAccepted: true
    },
    total: 45,
    hasDelivery: true,
    status: 'pending'
  };

  try {
    console.log('📤 Sending test order to API...');
    
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
      console.log('✅ Test order created successfully!');
      console.log(`🎯 Order ID: ${responseData.orderId}`);
      console.log('🔔 Check your Discord channel for the notification!');
      console.log('📊 Check the server console for Discord webhook debug logs');
    } else {
      console.error('❌ Test order failed:', responseData.error || 'Unknown error');
    }

  } catch (error) {
    console.error('💥 Test order error:', error.message);
  }
}

// Run the test
testOrderWithDiscord();
