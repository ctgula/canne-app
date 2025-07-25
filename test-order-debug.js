// Test script to debug the order creation issue
// This will simulate the exact cart structure sent by the frontend

async function testOrderCreation() {
  console.log('🧪 Testing order creation with debug logging...');
  
  // Simulate the exact cart structure from the frontend
  const testOrder = {
    items: [
      {
        product: {
          id: "4e08d8c4-bc92-451c-b1fb-d2898070462f", // Classic Series
          name: "Classic Series",
          description: "classic",
          price: 45,
          artworkUrl: "/images/classic-series.jpg",
          giftSize: "classic tier",
          hasDelivery: true
        },
        quantity: 1
      }
    ],
    deliveryDetails: {
      name: "Debug Test User",
      email: "debug@test.com",
      phone: "5551234567",
      address: "1234 Test Street NW",
      city: "Washington",
      zipCode: "20001",
      timePreference: "afternoon",
      specialInstructions: "Test order for debugging",
      ageVerification: true,
      termsAccepted: true,
      preferredTime: "Afternoon (12 PM - 5 PM)"
    },
    total: 45,
    hasDelivery: true,
    status: "pending"
  };

  try {
    console.log('📤 Sending test order:', JSON.stringify(testOrder, null, 2));
    
    const response = await fetch('http://localhost:3000/api/place-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder),
    });

    const responseData = await response.json();
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', JSON.stringify(responseData, null, 2));
    
    if (response.ok && responseData.success) {
      console.log('✅ Order created successfully!');
      console.log('🆔 Order ID:', responseData.orderId);
    } else {
      console.log('❌ Order creation failed:');
      console.log('Error:', responseData.error);
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
  }
}

// Run the test
testOrderCreation();
