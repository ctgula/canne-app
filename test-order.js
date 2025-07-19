// Quick test to verify order creation works
const testOrder = {
  items: [
    {
      product: {
        id: "ddc696a0-a537-4d10-b820-584c6c512bff", // Starter Collection ID from database
        name: "Starter Collection",
        description: "starter",
        price: 25,
        artworkUrl: "/images/starter-collection.jpg",
        giftSize: "3.5g",
        hasDelivery: true
      },
      quantity: 1
    }
  ],
  deliveryDetails: {
    name: "Test Customer",
    phone: "(555) 123-4567",
    address: "123 Test Street",
    city: "Washington",
    zipCode: "20001",
    timePreference: "afternoon",
    specialInstructions: "Test order for Sunday launch"
  },
  total: 25,
  hasDelivery: true
};

// Test the API endpoint
fetch('http://localhost:4001/api/orders', {
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
