// Quick test to verify order creation works
const testOrder = {
  items: [
    {
      product: {
        id: 'ddc696a0-a537-4d10-b820-584c6c512bff', // Starter Collection
        name: 'Starter Collection',
        description: 'Single digital print + complimentary top-shelf gift',
        price: 25,
        artworkUrl: '',
        giftSize: '3.5g',
        hasDelivery: true
      },
      quantity: 1,
      strain: {
        name: 'Moroccan Peach',
        type: 'sativa',
        thcLow: 18,
        thcHigh: 22
      }
    }
  ],
  deliveryDetails: {
    name: "Test Customer",
    email: "test@example.com",
    phone: "2025550123",
    address: "1234 Test Street NW",
    city: "Washington",
    zipCode: "20001",
    timePreference: "ASAP (60–90 min)",
    specialInstructions: "Test order for debugging",
    ageVerification: true,
    termsAccepted: true
  },
  total: 35,
  hasDelivery: false,
  status: 'pending'
};

// Test the API endpoint
fetch('http://localhost:4000/api/place-order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testOrder)
})
.then(response => response.json())
.then(data => {
  console.log('Order test result:', data);
  if (data.success) {
    console.log('✅ Order creation successful! Order ID:', data.orderId);
  } else {
    console.log('❌ Order creation failed:', data.error);
  }
})
.catch(error => {
  console.error('❌ Test failed:', error);
});
