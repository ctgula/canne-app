// Second test order - Ultra tier with multiple items
// Testing Discord notifications with different product tier

async function testUltraOrder() {
  console.log('🧪 Testing Ultra tier order with Discord notifications...');
  
  // Create an Ultra tier test order
  const testOrder = {
    items: [
      {
        product: {
          id: "2bedb33f-6587-4337-8b18-c943d4b48067", // Ultra Premium ID
          name: "Ultra Premium",
          description: "ultra",
          price: 140,
          artworkUrl: "/images/ultra-premium.jpg",
          giftSize: "28g premium collection",
          hasDelivery: true
        },
        quantity: 1
      }
    ],
    deliveryDetails: {
      name: "Sarah Johnson",
      email: "sarah.test@example.com",
      phone: "2025559876",
      address: "2000 M Street NW",
      apartment: "Apt 15B",
      city: "Washington",
      zipCode: "20036",
      preferredTime: "afternoon",
      specialInstructions: "Second Discord test - Ultra Premium tier verification",
      ageVerification: true,
      termsAccepted: true,
      emailUpdates: true
    },
    total: 140,
    hasDelivery: true,
    status: 'pending'
  };

  try {
    console.log('📤 Sending Ultra tier test order...');
    
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
      console.log('✅ Ultra tier test order created successfully!');
      console.log(`🎯 Order ID: ${responseData.orderId}`);
      console.log('🔔 Check Discord for Ultra Premium notification!');
      console.log('💜 This should show the premium purple branding');
    } else {
      console.error('❌ Ultra tier test failed:', responseData.error || 'Unknown error');
    }

  } catch (error) {
    console.error('💥 Ultra tier test error:', error.message);
  }
}

// Run the Ultra tier test
testUltraOrder();
