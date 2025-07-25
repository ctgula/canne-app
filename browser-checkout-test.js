// Direct browser checkout form interaction script
// This script fills out and submits the checkout form directly in the browser

console.log('🚀 Starting Browser Checkout Test...');

// Fill out the contact information
const fullNameInput = document.querySelector('input[placeholder="John Doe"]');
if (fullNameInput) {
  fullNameInput.value = 'Michael Thompson';
  fullNameInput.dispatchEvent(new Event('input', { bubbles: true }));
  console.log('✅ Full name filled');
}

const emailInput = document.querySelector('input[placeholder="john@example.com"]');
if (emailInput) {
  emailInput.value = 'michael.thompson@example.com';
  emailInput.dispatchEvent(new Event('input', { bubbles: true }));
  console.log('✅ Email filled');
}

const phoneInput = document.querySelector('input[placeholder="(202) 555-0123"]');
if (phoneInput) {
  phoneInput.value = '(202) 555-0187';
  phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
  console.log('✅ Phone filled');
}

// Check age verification
const ageVerificationCheckbox = document.querySelector('#ageVerification');
if (ageVerificationCheckbox) {
  ageVerificationCheckbox.checked = true;
  ageVerificationCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
  console.log('✅ Age verification checked');
}

// Fill out delivery address
const addressInput = document.querySelector('input[placeholder="Start typing your address..."]');
if (addressInput) {
  addressInput.value = '1234 K Street NW';
  addressInput.dispatchEvent(new Event('input', { bubbles: true }));
  console.log('✅ Address filled');
}

const cityInput = document.querySelector('input[placeholder="Washington"]');
if (cityInput) {
  cityInput.value = 'Washington';
  cityInput.dispatchEvent(new Event('input', { bubbles: true }));
  console.log('✅ City filled');
}

const zipInput = document.querySelector('input[placeholder="20001"]');
if (zipInput) {
  zipInput.value = '20005';
  zipInput.dispatchEvent(new Event('input', { bubbles: true }));
  console.log('✅ ZIP code filled');
}

const apartmentInput = document.querySelector('input[placeholder="Apt 4B, Suite 200, etc."]');
if (apartmentInput) {
  apartmentInput.value = 'Unit 302';
  apartmentInput.dispatchEvent(new Event('input', { bubbles: true }));
  console.log('✅ Apartment filled');
}

// Set delivery preferences
const deliveryTimeSelect = document.querySelector('select');
if (deliveryTimeSelect) {
  deliveryTimeSelect.value = 'Afternoon (12 PM - 5 PM)';
  deliveryTimeSelect.dispatchEvent(new Event('change', { bubbles: true }));
  console.log('✅ Delivery time selected');
}

const instructionsTextarea = document.querySelector('textarea[placeholder="Any special delivery instructions..."]');
if (instructionsTextarea) {
  instructionsTextarea.value = 'Please call when you arrive. Test order from Windsurf browser direct interaction.';
  instructionsTextarea.dispatchEvent(new Event('input', { bubbles: true }));
  console.log('✅ Special instructions filled');
}

// Check payment method
const cashOnDeliveryCheckbox = document.querySelector('#cashOnDelivery');
if (cashOnDeliveryCheckbox) {
  cashOnDeliveryCheckbox.checked = true;
  cashOnDeliveryCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
  console.log('✅ Cash on delivery selected');
}

// Accept terms and conditions
const termsCheckbox = document.querySelector('#termsAccepted');
if (termsCheckbox) {
  termsCheckbox.checked = true;
  termsCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
  console.log('✅ Terms accepted');
}

// Optional: Check email updates
const emailUpdatesCheckbox = document.querySelector('#emailUpdates');
if (emailUpdatesCheckbox) {
  emailUpdatesCheckbox.checked = true;
  emailUpdatesCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
  console.log('✅ Email updates opted in');
}

console.log('🎯 Form filled out successfully!');
console.log('📝 Order Details:');
console.log('- Customer: Michael Thompson');
console.log('- Email: michael.thompson@example.com');
console.log('- Phone: (202) 555-0187');
console.log('- Address: 1234 K Street NW, Unit 302, Washington, DC 20005');
console.log('- Delivery: Afternoon (12 PM - 5 PM)');
console.log('- Payment: Cash on Delivery');
console.log('- Total: $140 (Ultra Premium)');

// Wait a moment for all events to process, then submit
setTimeout(() => {
  console.log('🚀 Attempting to submit order...');
  
  // Find and click the submit button
  const submitButton = document.querySelector('button.btn-primary, button[type="submit"]');
  if (submitButton) {
    console.log('📤 Clicking submit button...');
    submitButton.click();
    console.log('✅ Order submission initiated!');
  } else {
    console.log('❌ Submit button not found');
    console.log('Available buttons:', document.querySelectorAll('button'));
  }
}, 1000);

console.log('🎉 Browser checkout test completed!');
