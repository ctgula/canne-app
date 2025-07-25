// Simple test to verify the fixed checkout form works
console.log('🧪 Testing Fixed Checkout Form...');

// Fill out the form fields
const fillField = (name, value) => {
    const field = document.querySelector(`input[name="${name}"], textarea[name="${name}"]`);
    if (field) {
        field.value = value;
        field.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`✅ ${name}: ${value}`);
    } else {
        console.log(`❌ Field not found: ${name}`);
    }
};

// Fill out contact info
fillField('name', 'John Smith');
fillField('email', 'john.smith@test.com');
fillField('phone', '2025550123');

// Fill out address
fillField('address', '1234 Main St NW');
fillField('city', 'Washington');
fillField('zipCode', '20001');
fillField('apartment', 'Apt 2B');
fillField('specialInstructions', 'Ring doorbell twice');

// Test the FIXED checkbox handling - this was the critical bug!
const checkBox = (name, label) => {
    const checkbox = document.querySelector(`input[name="${name}"]`);
    if (checkbox) {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`✅ ${label} checkbox checked`);
        return true;
    } else {
        console.log(`❌ ${label} checkbox not found`);
        return false;
    }
};

// Check required checkboxes (this was broken before!)
const ageVerified = checkBox('ageVerification', 'Age Verification');
const termsAccepted = checkBox('termsAccepted', 'Terms Accepted');

console.log('🎯 Form filled out - testing submission...');

// Wait for React state to update, then test submission
setTimeout(() => {
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        console.log('🚀 Submit button found - attempting submission...');
        submitButton.click();
    } else {
        console.log('❌ Submit button not found');
    }
}, 500);
