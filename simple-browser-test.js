// Simple test to fill checkout form in browser console
console.log('🧪 Testing checkout form...');

// Fill required fields
document.querySelector('input[placeholder="John Doe"]').value = 'Test Customer';
document.querySelector('input[placeholder="john@example.com"]').value = 'test@canneart.com';
document.querySelector('input[placeholder="(202) 555-0123"]').value = '(202) 555-0123';
document.querySelector('input[placeholder="Start typing your address..."]').value = '1600 Pennsylvania Ave NW';
document.querySelector('input[placeholder="Washington"]').value = 'Washington';
document.querySelector('input[placeholder="20001"]').value = '20001';

// Check required checkboxes
document.querySelector('#ageVerification').checked = true;
document.querySelector('#termsAccepted').checked = true;
document.querySelector('#cashOnDelivery').checked = true;

// Trigger change events
document.querySelectorAll('input').forEach(input => {
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
});

console.log('✅ Form filled! Ready to submit.');
console.log('Click the submit button to place test order.');
