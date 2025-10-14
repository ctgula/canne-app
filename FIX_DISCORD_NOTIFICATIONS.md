# Discord Notifications Fix - Database Relationship Error

## Problem
The `/api/orders/submit-payment` endpoint was failing with:
```
Error fetching order: {
  code: "PGRST200",
  details: "Searched for a foreign key relationship between 'cashapp_payments' and 'orders' in the schema 'public', but no matches were found.",
  hint: "Perhaps you meant 'drivers' instead of 'orders'.",
  message: "Could not find a relationship between 'cashapp_payments' and 'orders' in the schema cache"
}
```

## Root Cause
The Supabase PostgREST API was unable to recognize the foreign key relationship between `cashapp_payments.order_id` and `orders.id` when using nested select syntax:
```typescript
// This syntax was failing:
.select(`
  *,
  orders (
    order_number,
    total,
    customer_name
  )
`)
```

## Solution

### 1. Database Migration
Apply the migration file: `/database/fix-cashapp-orders-relationship.sql`

This migration:
- ✅ Ensures all necessary columns exist on the `orders` table
- ✅ Creates proper indexes for performance
- ✅ Explicitly recreates the foreign key constraint
- ✅ Creates a view `cashapp_payment_details` for easier querying

**To apply the migration:**

#### Option A: Using Supabase Dashboard
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy the contents of `/database/fix-cashapp-orders-relationship.sql`
4. Paste and run the migration

#### Option B: Using Supabase CLI (if configured)
```bash
supabase db push
```

### 2. API Code Fix
The API route has been updated to use two separate queries instead of nested select:

**Before (broken):**
```typescript
const { data: orderData, error } = await supabase
  .from("cashapp_payments")
  .select(`
    *,
    orders (...)
  `)
  .eq("short_code", short_code)
  .single();
```

**After (fixed):**
```typescript
// First get payment record
const { data: paymentData, error } = await supabase
  .from("cashapp_payments")
  .select("*")
  .eq("short_code", short_code)
  .single();

// Then get order details if order_id exists
let orderDetails = null;
if (paymentData.order_id) {
  const { data: orderData, error } = await supabase
    .from("orders")
    .select("order_number, total, customer_name, customer_phone, delivery_address_line1, delivery_city")
    .eq("id", paymentData.order_id)
    .single();
  
  if (!error && orderData) {
    orderDetails = orderData;
  }
}
```

### 3. Discord Embed Updates
Updated to use the new data structure:
- `paymentData` - contains cashapp_payments record
- `orderDetails` - contains orders record (if exists)

## Files Changed
1. ✅ `/database/fix-cashapp-orders-relationship.sql` - NEW migration file
2. ✅ `/src/app/api/orders/submit-payment/route.ts` - Updated query logic

## Testing Checklist
After applying the migration and deploying the code:

- [ ] Test payment submission with valid short_code
- [ ] Verify Discord webhook receives notification
- [ ] Check that customer name and phone display correctly
- [ ] Verify order number shows in Discord embed
- [ ] Test with payment that doesn't have order_id yet (should still work)

## Expected Discord Notification Format
```
💳 Payment Submitted for Verification

Order Number: CN-20231013-1234
Amount: $45.00
Short Code: ABC123
Customer: John Doe
Phone: (202) 555-0100
Status: 🔍 VERIFYING
Cash App Handle: $johndoe
Screenshot: [View Screenshot](https://...)

Cannè Payment System • Verify payment in Cash App and update status
```

## Next Steps
1. Apply the database migration
2. Deploy the updated API code
3. Test payment submission flow
4. Monitor Discord notifications

## Notes
- The fix maintains backward compatibility
- Payment submissions without linked orders will still work
- Discord notifications will show available data and gracefully handle missing fields
- The new view `cashapp_payment_details` can be used in future queries for simplified joins
