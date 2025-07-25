// Test order for Starter Collection tier
// This will test the lowest price tier and verify Discord notifications

async function testStarterOrder() {
  console.log('🧪 Testing Starter Collection order...');
  
  // Create a Starter Collection test order
  const testOrder = {
    items: [
      {
        product: {
          id: "ddc696a0-a537-4d10-b820-584c6c512bff", // Starter Collection ID
          name: "Starter Collection",
          description: "starter",
          price: 25,
          artworkUrl: "/images/starter-collection.jpg",
          giftSize: "3.5g complimentary",
          hasDelivery: true
        },
        quantity: 2 // Testing multiple quantity
      }
    ],
    deliveryDetails: {
      name: "Maria Rodriguez",
      email: "maria.starter@example.com",
      phone: "2025557890",
      address: "1500 New Hampshire Ave NW",
      apartment: "Floor 3",
      city: "Washington",
      zipCode: "20036",
      preferredTime: "evening",
      specialInstructions: "🌸 Starter tier test with 2x quantity - testing multiple items notification",
      ageVerification: true,
      termsAccepted: true,
      emailUpdates: false
    },
    total: 50, // 2 x $25
    hasDelivery: true,
    status: 'pending'
  };

  try {
    console.log('📤 Sending Starter Collection test order...');
    console.log('🔢 Testing 2x quantity for total of $50');
    
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
      console.log('✅ Starter Collection test order created successfully!');
      console.log(`🎯 Order ID: ${responseData.orderId}`);
      console.log('🔔 Check #orders channel for Starter Collection notification!');
      console.log('🌸 Should show 2x Starter Collection ($25 each = $50 total)');
      console.log('📱 Look for pink/starter tier branding');
    } else {
      console.error('❌ Starter Collection test failed:', responseData.error || 'Unknown error');
    }

  } catch (error) {
    console.error('💥 Starter Collection test error:', error.message);
  }
}

// Run the starter tier test
testStarterOrder();
