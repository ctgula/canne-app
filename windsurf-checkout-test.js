// Test script to fill out and submit the checkout form in Windsurf browser
// This script fills all required fields and submits a test order

console.log('🧪 Starting Windsurf Browser Checkout Test...');

// Helper function to fill input fields
function fillInput(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    console.log(`✅ Filled ${selector}: ${value}`);
    return true;
  } else {
    console.log(`❌ Could not find element: ${selector}`);
    return false;
  }
}

// Helper function to check checkboxes
function checkCheckbox(selector) {
  const element = document.querySelector(selector);
  if (element) {
    element.checked = true;
    element.dispatchEvent(new Event('change', { bubbles: true }));
    console.log(`✅ Checked checkbox: ${selector}`);
    return true;
  } else {
    console.log(`❌ Could not find checkbox: ${selector}`);
    return false;
  }
}

// Helper function to select dropdown option
function selectOption(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
    console.log(`✅ Selected ${selector}: ${value}`);
    return true;
  } else {
    console.log(`❌ Could not find select: ${selector}`);
    return false;
  }
}

// Fill out the form step by step
async function fillCheckoutForm() {
  console.log('📝 Filling out checkout form...');
  
  // Contact Information
  fillInput('input[placeholder="John Doe"]', 'Test Customer');
  fillInput('input[placeholder="john@example.com"]', 'test@example.com');
  fillInput('input[placeholder="(202) 555-0123"]', '(202) 555-0123');
  
  // Age verification checkbox
  checkCheckbox('#ageVerification');
  
  // Delivery Address
  fillInput('input[placeholder="Start typing your address..."]', '1600 Pennsylvania Avenue NW');
  fillInput('input[placeholder="Washington"]', 'Washington');
  fillInput('input[placeholder="20001"]', '20001');
  fillInput('input[placeholder="Apt 4B, Suite 200, etc."]', 'Apt 1A');
  
  // Delivery Preferences
  selectOption('select', 'Afternoon (12 PM - 5 PM)');
  fillInput('textarea[placeholder="Any special delivery instructions..."]', 'Please ring doorbell twice');
  
  // Payment Method (Cash on Delivery should already be selected)
  checkCheckbox('#cashOnDelivery');
  
  // Legal checkboxes
  checkCheckbox('#termsAccepted');
  checkCheckbox('#emailUpdates');
  
  console.log('✅ Form filled successfully!');
  
  // Wait a moment for React state to update
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return true;
}

// Submit the form
function submitForm() {
  console.log('🚀 Attempting to submit form...');
  
  const submitButton = document.querySelector('button.btn-primary');
  if (submitButton) {
    console.log('📤 Found submit button, clicking...');
    submitButton.click();
    console.log('✅ Form submitted!');
    return true;
  } else {
    console.log('❌ Could not find submit button');
    return false;
  }
}

// Main test function
async function runCheckoutTest() {
  try {
    console.log('🎯 Starting checkout test for Ultra Premium ($140)...');
    
    // Fill the form
    const formFilled = await fillCheckoutForm();
    
    if (formFilled) {
      console.log('⏳ Waiting 2 seconds before submission...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Submit the form
      const submitted = submitForm();
      
      if (submitted) {
        console.log('🎉 Test order submitted successfully!');
        console.log('📊 Check Discord for notification and Supabase for order record');
      } else {
        console.log('❌ Failed to submit form');
      }
    } else {
      console.log('❌ Failed to fill form completely');
    }
    
  } catch (error) {
    console.error('💥 Error during checkout test:', error);
  }
}

// Run the test
runCheckoutTest();
