// Test order specifically for orders channel verification
// This will create a test order and verify Discord notification goes to orders channel

async function testOrdersChannelNotification() {
  console.log('🧪 Testing order notification in ORDERS channel...');
  
  // Create a Black Edition test order
  const testOrder = {
    items: [
      {
        product: {
          id: "9643176b-8940-4635-988f-d14274aad826", // Black Edition ID
          name: "Black Edition",
          description: "black",
          price: 75,
          artworkUrl: "/images/black-edition.jpg",
          giftSize: "14g premium",
          hasDelivery: true
        },
        quantity: 1
      }
    ],
    deliveryDetails: {
      name: "Orders Channel Test",
      email: "orders-test@canneart.com",
      phone: "2025554321",
      address: "1234 K Street NW",
      apartment: "Unit 5A",
      city: "Washington",
      zipCode: "20005",
      preferredTime: "morning",
      specialInstructions: "🎯 ORDERS CHANNEL TEST - Verify this notification appears in the #orders channel",
      ageVerification: true,
      termsAccepted: true
    },
    total: 75,
    hasDelivery: true,
    status: 'pending'
  };

  try {
    console.log('📤 Sending test order for orders channel verification...');
    
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
      console.log('✅ Orders channel test order created successfully!');
      console.log(`🎯 Order ID: ${responseData.orderId}`);
      console.log('🔔 CHECK YOUR #ORDERS CHANNEL FOR THE NOTIFICATION!');
      console.log('📱 Look for a message from "Cannè Order System"');
      console.log('🖤 This should show Black Edition ($75) order details');
    } else {
      console.error('❌ Orders channel test failed:', responseData.error || 'Unknown error');
    }

  } catch (error) {
    console.error('💥 Orders channel test error:', error.message);
  }
}

// Run the orders channel test
testOrdersChannelNotification();
