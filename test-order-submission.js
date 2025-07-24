// Test script to verify order submission fix
const testOrderSubmission = async () => {
  const orderData = {
    items: [
      {
        id: 2,
        name: "Classic Series",
        price: 45,
        quantity: 7,
        giftSize: "7g"
      }
    ],
    deliveryDetails: {
      name: "John Doe",
      phone: "(202) 555-0123",
      address: "123 Main Street",
      city: "Washington",
      zipCode: "20001",
      preferredTime: "Afternoon (12 PM - 5 PM)",
      specialInstructions: "Test order submission fix"
    },
    total: 315,
    hasDelivery: true,
    status: 'pending'
  };

  try {
    console.log('🧪 Testing order submission with customer_id fix...');
    console.log('📦 Order data:', JSON.stringify(orderData, null, 2));
    
    const response = await fetch('http://localhost:4000/api/place-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📋 Response data:', JSON.stringify(result, null, 2));
    
    if (response.ok && result.success) {
      console.log('✅ ORDER SUBMISSION SUCCESSFUL!');
      console.log(`🎉 Order ID: ${result.orderId}`);
      console.log('💡 Customer ID fix is working correctly!');
    } else {
      console.log('❌ ORDER SUBMISSION FAILED!');
      console.log(`🚨 Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('💥 Network error:', error.message);
  }
};

// Run the test
testOrderSubmission();
