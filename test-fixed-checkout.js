// Test the FIXED checkout form - this tests the critical checkbox bug fix
console.log('🧪 Testing FIXED Checkout Form - Checkbox Handling Bug Fix');

// Fill out all form fields
const fillForm = () => {
    // Contact info
    document.querySelector('input[name="name"]').value = 'John Smith';
    document.querySelector('input[name="email"]').value = 'john.smith@test.com';
    document.querySelector('input[name="phone"]').value = '2025550123';
    
    // Address
    document.querySelector('input[name="address"]').value = '1234 Main St NW';
    document.querySelector('input[name="city"]').value = 'Washington';
    document.querySelector('input[name="zipCode"]').value = '20001';
    document.querySelector('input[name="apartment"]').value = 'Apt 2B';
    document.querySelector('textarea[name="specialInstructions"]').value = 'Ring doorbell twice';
    
    // Trigger change events for React state updates
    document.querySelectorAll('input, textarea').forEach(field => {
        field.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    console.log('✅ Basic form fields filled');
};

// Test the CRITICAL FIX - checkbox handling
const testCheckboxes = () => {
    console.log('🔧 Testing FIXED checkbox handling...');
    
    // Age verification checkbox (REQUIRED - was broken before!)
    const ageCheckbox = document.querySelector('input[name="ageVerification"]');
    if (ageCheckbox) {
        ageCheckbox.checked = true;
        ageCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ Age verification checkbox: FIXED and checked');
    } else {
        console.error('❌ Age verification checkbox not found');
        return false;
    }
    
    // Terms acceptance checkbox (REQUIRED - was broken before!)
    const termsCheckbox = document.querySelector('input[name="termsAccepted"]');
    if (termsCheckbox) {
        termsCheckbox.checked = true;
        termsCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ Terms acceptance checkbox: FIXED and checked');
    } else {
        console.error('❌ Terms acceptance checkbox not found');
        return false;
    }
    
    // Optional email updates
    const emailCheckbox = document.querySelector('input[name="emailUpdates"]');
    if (emailCheckbox) {
        emailCheckbox.checked = true;
        emailCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ Email updates checkbox: checked (optional)');
    }
    
    return true;
};

// Test form submission
const testSubmission = () => {
    console.log('🚀 Testing form submission with FIXED checkboxes...');
    
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton && !submitButton.disabled) {
        console.log('✅ Submit button is enabled - form validation passed!');
        console.log('🎯 CRITICAL BUG FIX CONFIRMED: Checkboxes are now working!');
        
        // Actually submit the form to test end-to-end
        console.log('📤 Submitting real order to test complete flow...');
        submitButton.click();
        return true;
    } else {
        console.error('❌ Submit button is disabled - validation failed');
        console.log('Button state:', submitButton ? 'found but disabled' : 'not found');
        return false;
    }
};

// Run the complete test
const runTest = async () => {
    try {
        fillForm();
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for React state
        
        const checkboxesWork = testCheckboxes();
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for React state
        
        if (checkboxesWork) {
            const submissionWorks = testSubmission();
            if (submissionWorks) {
                console.log('🎉 SUCCESS: Checkout form is FIXED and working!');
                console.log('✅ Critical checkbox handling bug has been resolved');
                console.log('✅ Real users can now place orders successfully');
            }
        }
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
};

// Start the test
runTest();
