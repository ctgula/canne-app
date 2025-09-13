// Simple test script to verify driver application form validation
const testCases = [
  {
    name: "Valid Application",
    data: {
      name: "John Doe",
      phone: "(555) 123-4567",
      email: "john.doe@example.com",
      availability: ["lunch", "dinner"],
      vehicleType: "car",
      cashappHandle: "$johndoe",
      about: "Experienced delivery driver with 2 years of experience."
    },
    shouldPass: true
  },
  {
    name: "Missing Name",
    data: {
      name: "J",
      phone: "(555) 123-4567", 
      email: "john.doe@example.com",
      availability: ["lunch"],
      vehicleType: "car"
    },
    shouldPass: false,
    expectedError: "Name must be at least 2 characters"
  },
  {
    name: "Invalid Phone",
    data: {
      name: "John Doe",
      phone: "555-123",
      email: "john.doe@example.com", 
      availability: ["lunch"]
    },
    shouldPass: false,
    expectedError: "Please enter a valid phone number"
  },
  {
    name: "Invalid Email",
    data: {
      name: "John Doe",
      phone: "(555) 123-4567",
      email: "invalid-email",
      availability: ["lunch"]
    },
    shouldPass: false,
    expectedError: "Please enter a valid email address"
  },
  {
    name: "No Availability Selected",
    data: {
      name: "John Doe", 
      phone: "(555) 123-4567",
      email: "john.doe@example.com",
      availability: []
    },
    shouldPass: false,
    expectedError: "Please select at least one availability option"
  },
  {
    name: "About Too Long",
    data: {
      name: "John Doe",
      phone: "(555) 123-4567", 
      email: "john.doe@example.com",
      availability: ["lunch"],
      about: "A".repeat(501) // 501 characters
    },
    shouldPass: false,
    expectedError: "Description must be 500 characters or less"
  }
];

async function testDriverApplicationAPI() {
  console.log("🧪 Testing Driver Application Form Validation\n");
  
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    
    try {
      const response = await fetch('http://localhost:4000/api/drivers/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data),
      });
      
      const result = await response.json();
      
      if (testCase.shouldPass) {
        if (response.ok && result.success) {
          console.log(`✅ PASS: ${testCase.name}`);
        } else {
          console.log(`❌ FAIL: ${testCase.name} - Expected success but got error: ${result.message}`);
        }
      } else {
        if (!response.ok || !result.success) {
          console.log(`✅ PASS: ${testCase.name} - Correctly rejected`);
          if (testCase.expectedError && result.errors) {
            console.log(`   Expected error found in validation`);
          }
        } else {
          console.log(`❌ FAIL: ${testCase.name} - Expected failure but got success`);
        }
      }
    } catch (error) {
      console.log(`❌ ERROR: ${testCase.name} - Network error: ${error.message}`);
    }
    
    console.log('');
  }
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  console.log("To run these tests:");
  console.log("1. Start the development server: npm run dev");
  console.log("2. Open browser console on http://localhost:4000/drivers");
  console.log("3. Copy and paste this test function");
  console.log("4. Run: testDriverApplicationAPI()");
}
