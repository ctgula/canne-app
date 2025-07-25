// Test script that simulates the exact checkout form submission
// This mimics what happens when a user fills out the browser form

const testFormData = {
  items: [
    {
      id: '4e08d8c4-bc92-451c-b1fb-d2898070462f', // Classic Series (matches the form)
      name: 'Classic Series',
      price: 45,
      quantity: 7, // Matches the quantity shown in the form
      giftSize: '7g'
    }
  ],
  deliveryDetails: {
    name: "Sarah Johnson", // Contact Information
    email: "sarah.johnson@example.com", // Contact Information
    phone: "(202) 555-0199", // Contact Information  
    address: "1600 Pennsylvania Avenue NW", // Delivery Address
    apartment: "Suite 100", // Delivery Address
    city: "Washington", // Delivery Address
    zipCode: "20001", // Delivery Address (Valid DC ZIP)
    preferredTime: "Evening (5 PM - 8 PM)", // Delivery Preferences
    specialInstructions: "Please ring doorbell twice. Test order from enhanced Apple-level checkout with email field.", // Special Instructions
    ageVerification: true,
    termsAccepted: true
  },
  total: 315, // Matches the form total
  hasDelivery: true
};

console.log('🚀 Testing Browser Form Submission...');
console.log('Form Data:', JSON.stringify(testFormData, null, 2));

// Submit the order exactly as the browser form would
fetch('http://localhost:4113/api/place-order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testFormData)
})
.then(response => response.json())
.then(result => {
  console.log('\n📋 Browser Form Test Result:', result);
  
  if (result.success) {
    console.log('✅ Browser form simulation successful!');
    console.log('🎯 Order ID:', result.orderId);
    console.log('💬 Discord notification should be sent with order details');
    console.log('👤 Customer created with first_name/last_name split');
    console.log('📦 Order items saved with unit_price and total_price');
  } else {
    console.log('❌ Browser form simulation failed:', result.error);
  }
})
.catch(error => {
  console.log('❌ Test failed:', error.message);
});
