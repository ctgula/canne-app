// Simple browser test for the fixed checkout form
console.log('Testing fixed checkout form...');

// Fill form fields
document.querySelector('input[name="name"]').value = 'John Smith';
document.querySelector('input[name="email"]').value = 'john.smith@test.com';
document.querySelector('input[name="phone"]').value = '2025550123';
document.querySelector('input[name="address"]').value = '1234 Main St NW';
document.querySelector('input[name="city"]').value = 'Washington';
document.querySelector('input[name="zipCode"]').value = '20001';

// Trigger change events
document.querySelectorAll('input').forEach(input => {
    input.dispatchEvent(new Event('change', { bubbles: true }));
});

// Fix the critical checkbox bug
document.querySelector('input[name="ageVerification"]').checked = true;
document.querySelector('input[name="termsAccepted"]').checked = true;

// Trigger checkbox change events
document.querySelector('input[name="ageVerification"]').dispatchEvent(new Event('change', { bubbles: true }));
document.querySelector('input[name="termsAccepted"]').dispatchEvent(new Event('change', { bubbles: true }));

console.log('Form filled, submitting...');

// Submit after delay
setTimeout(() => {
    document.querySelector('button[type="submit"]').click();
}, 1000);
