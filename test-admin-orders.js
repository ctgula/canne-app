// Test admin orders API endpoint
fetch('http://localhost:4000/api/admin/orders')
  .then(response => {
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    return response.json();
  })
  .then(data => {
    console.log('Orders API Response:', JSON.stringify(data, null, 2));
    if (data.orders) {
      console.log(`Found ${data.orders.length} orders`);
      data.orders.forEach((order, index) => {
        console.log(`Order ${index + 1}:`, {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          total: order.total,
          customer: order.customers?.first_name + ' ' + order.customers?.last_name,
          created_at: order.created_at
        });
      });
    } else {
      console.log('No orders array in response');
    }
  })
  .catch(error => {
    console.error('Error testing admin orders API:', error);
  });
