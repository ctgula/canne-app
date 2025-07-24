// Quick test to verify order creation works
const testOrder = {
  items: [
    {
      id: 'ddc696a0-a537-4d10-b820-584c6c512bff', // Starter Collection
      name: 'Starter Collection',
      price: 25,
      quantity: 2,
      giftSize: '3.5g'
    },
    {
      id: '4e08d8c4-bc92-451c-b1fb-d2898070462f', // Classic Series
      name: 'Classic Series',
      price: 45,
      quantity: 1,
      giftSize: '7g'
    }
  ],
  deliveryDetails: {
    name: "Test Customer",
    phone: "(202) 555-0123",
    address: "1234 Test Street NW",
    city: "Washington",
    zipCode: "20001",
    preferredTime: "Evening (5 PM - 8 PM)",
    specialInstructions: "Test order for debugging Discord notifications"
  },
  total: 45,
  hasDelivery: true
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
