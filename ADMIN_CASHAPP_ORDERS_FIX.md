# Admin Orders Page - Cash App Orders Fix ✅

## Issue
Admin orders page wasn't showing Cash App payment orders (like PAY-MG85XUMV-TNM3) because it only queried the `orders` table, not the `cashapp_payments` table.

## Root Cause
The admin orders API (`/api/admin/orders/route.ts`) only fetched from the `orders` table, which contains completed orders. Cash App payments are stored in the separate `cashapp_payments` table until payment is verified.

## Solution Applied

### **Updated Admin Orders API**

The API now:
1. ✅ Fetches from **both** `orders` and `cashapp_payments` tables
2. ✅ Transforms Cash App payments to match the order format
3. ✅ Combines both types and sorts by creation date
4. ✅ Applies filters (status, search) to both queries

### **Code Changes**

**Before:**
```typescript
// Only queried orders table
let query = supabase.from('orders').select(...)
```

**After:**
```typescript
// Queries both tables in parallel
let ordersQuery = supabase.from('orders').select(...)
let cashappQuery = supabase.from('cashapp_payments').select(...)

const [{ data: orders }, { data: cashappPayments }] = await Promise.all([
  ordersQuery,
  cashappQuery
]);

// Transform Cash App payments to match order format
const transformedCashappOrders = (cashappPayments || []).map(payment => ({
  id: payment.id,
  order_number: payment.short_code,
  status: payment.status,
  total: payment.amount_cents / 100,
  order_type: 'cashapp',
  // ... other fields
}));

// Combine and sort
const allOrders = [...transformedOrders, ...transformedCashappOrders].sort(...)
```

### **Cash App Order Transformation**

Cash App payments are transformed to include:
- ✅ `order_number`: Uses `short_code` (e.g., PAY-MG85XUMV-TNM3)
- ✅ `status`: Maps directly from payment status
- ✅ `total`: Converts `amount_cents` to dollars
- ✅ `order_type`: Marked as 'cashapp' for identification
- ✅ `customers`: Default "Cash App Customer" info
- ✅ `phone`: From `customer_phone` field
- ✅ `created_at`: Timestamp for sorting

### **Status Filter Mapping**

Both tables now support status filtering:
- **Pending**: `awaiting_payment`, `verifying` (Cash App) + `paid` (regular orders)
- **Assigned**: `assigned` (both)
- **Delivered**: `delivered` (both)
- **Issues**: `refunded`, `expired` (Cash App) + `undelivered`, `canceled` (regular)
- **Paid**: `paid` (both)

### **Search Functionality**

Search now works across:
- Regular orders: `order_number`, `full_name`, `phone`
- Cash App: `short_code`, `customer_phone`

## Result

The admin orders page now displays:
- ✅ Regular completed orders from `orders` table
- ✅ Cash App payment orders from `cashapp_payments` table
- ✅ All orders sorted by creation date (newest first)
- ✅ Proper filtering and search across both types
- ✅ Clear identification with `order_type` field

## Testing

Your Cash App order **PAY-MG85XUMV-TNM3** should now appear in the admin dashboard under the "Pending" tab with:
- Order number: PAY-MG85XUMV-TNM3
- Status: awaiting_payment
- Total: $540.00
- Customer: Cash App Customer
- Type: cashapp

**Refresh the admin page to see the order!**

## Files Modified
- `/src/app/api/admin/orders/route.ts` - Updated to query both tables
