// Test script to fill out the checkout form like a real user would
// This tests the fixed checkbox handling and form validation

console.log('🧪 Testing Real User Checkout Flow...');

// Fill out contact information
document.querySelector('input[name="name"]').value = 'John Smith';
document.querySelector('input[name="name"]').dispatchEvent(new Event('change', { bubbles: true }));

document.querySelector('input[name="email"]').value = 'john.smith@example.com';
document.querySelector('input[name="email"]').dispatchEvent(new Event('change', { bubbles: true }));

document.querySelector('input[name="phone"]').value = '(202) 555-0123';
document.querySelector('input[name="phone"]').dispatchEvent(new Event('change', { bubbles: true }));

// Fill out delivery address
document.querySelector('input[name="address"]').value = '1234 Main St NW';
document.querySelector('input[name="address"]').dispatchEvent(new Event('change', { bubbles: true }));

document.querySelector('input[name="city"]').value = 'Washington';
document.querySelector('input[name="city"]').dispatchEvent(new Event('change', { bubbles: true }));

document.querySelector('input[name="zipCode"]').value = '20001';
document.querySelector('input[name="zipCode"]').dispatchEvent(new Event('change', { bubbles: true }));

// Add apartment (optional)
document.querySelector('input[name="apartment"]').value = 'Apt 2B';
document.querySelector('input[name="apartment"]').dispatchEvent(new Event('change', { bubbles: true }));

// Add special instructions
document.querySelector('textarea[name="specialInstructions"]').value = 'Please ring doorbell twice';
document.querySelector('textarea[name="specialInstructions"]').dispatchEvent(new Event('change', { bubbles: true }));

console.log('✅ Basic form fields filled out');

// Test the FIXED checkbox handling - this was the critical bug!
console.log('🔧 Testing FIXED checkbox handling...');

// Check age verification (REQUIRED)
const ageCheckbox = document.querySelector('input[name="ageVerification"]');
if (ageCheckbox) {
    ageCheckbox.checked = true;
    ageCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
    console.log('✅ Age verification checkbox checked');
} else {
    console.error('❌ Age verification checkbox not found');
}

// Check terms acceptance (REQUIRED)
const termsCheckbox = document.querySelector('input[name="termsAccepted"]');
if (termsCheckbox) {
    termsCheckbox.checked = true;
    termsCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
    console.log('✅ Terms acceptance checkbox checked');
} else {
    console.error('❌ Terms acceptance checkbox not found');
}

// Optional email updates checkbox
const emailUpdatesCheckbox = document.querySelector('input[name="emailUpdates"]');
if (emailUpdatesCheckbox) {
    emailUpdatesCheckbox.checked = true;
    emailUpdatesCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
    console.log('✅ Email updates checkbox checked (optional)');
}

console.log('🎯 All form fields filled out - ready to test submission!');
console.log('📝 Form should now submit successfully with the fixed checkbox handling');

// Wait a moment for React state to update, then try submission
setTimeout(() => {
    console.log('🚀 Attempting form submission...');
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton && !submitButton.disabled) {
        console.log('✅ Submit button is enabled - clicking now...');
        submitButton.click();
    } else {
        console.error('❌ Submit button is disabled or not found');
        console.log('Button state:', submitButton ? 'found but disabled' : 'not found');
    }
}, 1000);
