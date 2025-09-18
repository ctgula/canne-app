// Debug pricing calculation logic
console.log('=== PRICING DEBUG ===');

// Simulate cart with $25 item
const cartTotal = 25;
const hasDelivery = cartTotal >= 35;
const finalTotal = hasDelivery ? cartTotal : cartTotal + 10;

console.log('Cart Total:', cartTotal);
console.log('Has Free Delivery (>= $35):', hasDelivery);
console.log('Delivery Fee:', hasDelivery ? 0 : 10);
console.log('Final Total:', finalTotal);

// This should match backend calculation
const calculatedSubtotal = cartTotal;
const calculatedDeliveryFee = hasDelivery ? 0 : 10;
const calculatedTotal = calculatedSubtotal + calculatedDeliveryFee;

console.log('\nBackend calculation:');
console.log('Subtotal:', calculatedSubtotal);
console.log('Delivery Fee:', calculatedDeliveryFee);
console.log('Total:', calculatedTotal);

console.log('\nMatch?', finalTotal === calculatedTotal);
