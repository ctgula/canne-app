// Test production database connection
console.log('Testing production database connection...');

// Test the production API endpoints to see what's failing
async function testProductionAPIs() {
  const baseUrl = 'https://canne-app-git-main-ctgula123s-projects.vercel.app';
  
  console.log('1. Testing products API...');
  try {
    const productsResponse = await fetch(`${baseUrl}/api/admin/products`);
    console.log('Products API status:', productsResponse.status);
    const productsText = await productsResponse.text();
    console.log('Products response:', productsText.substring(0, 200) + '...');
  } catch (error) {
    console.error('Products API failed:', error.message);
  }
  
  console.log('\n2. Testing orders API...');
  try {
    const ordersResponse = await fetch(`${baseUrl}/api/admin/orders`);
    console.log('Orders API status:', ordersResponse.status);
    const ordersText = await ordersResponse.text();
    console.log('Orders response:', ordersText.substring(0, 200) + '...');
  } catch (error) {
    console.error('Orders API failed:', error.message);
  }
  
  console.log('\n3. Testing place-order API with minimal payload...');
  try {
    const testOrder = {
      items: [{
        product: {
          id: "ddc696a0-a537-4d10-b820-584c6c512bff",
          name: "Starter",
          price: 25,
          tier: "starter",
          weight: "3.5g",
          color_theme: "Pink"
        },
        strain: {
          name: "OG Kush",
          type: "Indica",
          thcLow: 18,
          thcHigh: 22
        },
        quantity: 1
      }],
      deliveryDetails: {
        name: "Test User",
        phone: "2025551234",
        email: "test@example.com",
        address: "123 Test St NW",
        city: "Washington",
        zipCode: "20001"
      },
      total: 35,
      hasDelivery: false,
      status: 'pending'
    };
    
    const placeOrderResponse = await fetch(`${baseUrl}/api/place-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder)
    });
    
    console.log('Place-order API status:', placeOrderResponse.status);
    const placeOrderText = await placeOrderResponse.text();
    console.log('Place-order response:', placeOrderText);
    
    if (placeOrderText.includes('Environment variables')) {
      console.log('🚨 ISSUE: Missing environment variables on Vercel');
    } else if (placeOrderText.includes('Failed to create')) {
      console.log('🚨 ISSUE: Database connection or schema problem');
    } else if (placeOrderText.includes('success')) {
      console.log('✅ API working - issue might be client-side');
    }
    
  } catch (error) {
    console.error('Place-order API failed:', error.message);
  }
}

testProductionAPIs();
