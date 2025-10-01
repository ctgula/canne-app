# Discord Webhook - Complete Setup Guide ✅

## Issue Found
The Discord webhook was **NOT being called** in the main order placement API (`/api/place-order`). It was only set up for status changes, not new orders.

## Fix Applied

### **Added Discord Notifications to Order Placement**

Updated `/src/app/api/place-order/route.ts` to send rich Discord notifications when orders are placed.

**What Gets Sent:**
```json
{
  "embeds": [{
    "title": "🎉 New Order Received!",
    "description": "Order **CN-20250101-1234** has been placed",
    "color": 0x8B5CF6,  // Purple (Cannè brand color)
    "fields": [
      {
        "name": "👤 Customer",
        "value": "Name\n📱 Phone\n📧 Email"
      },
      {
        "name": "📦 Items",
        "value": "• Product x Qty - $Price\n  Strain • Type • THC%\n  Weight"
      },
      {
        "name": "💰 Order Total",
        "value": "Subtotal: $XX.XX\nDelivery: FREE\n**Total: $XX.XX**"
      },
      {
        "name": "📍 Delivery Address",
        "value": "Street\nCity, DC ZIP"
      },
      {
        "name": "⏰ Preferred Time",
        "value": "ASAP (60-90 min)"
      }
    ],
    "footer": {
      "text": "Cannè Order System"
    },
    "timestamp": "2025-01-01T12:00:00.000Z"
  }]
}
```

### **Features**

✅ **Rich Embeds** - Beautiful formatted messages
✅ **Complete Order Details** - All customer and order info
✅ **Strain Information** - Shows strain, type, and THC levels
✅ **Price Breakdown** - Subtotal, delivery fee, and total
✅ **Delivery Info** - Address and preferred time
✅ **Error Handling** - Won't fail order if Discord fails
✅ **Logging** - Console logs for debugging

## Vercel Environment Variable Setup

### **Required Environment Variable**

**Variable Name:** `DISCORD_WEBHOOK`

**Value Format:**
```
https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

### **How to Get Your Webhook URL**

1. **Open Discord** and go to your server
2. **Server Settings** → **Integrations** → **Webhooks**
3. **Create Webhook** or select existing one
4. **Copy Webhook URL**
5. **Paste into Vercel**

### **Setting in Vercel**

1. Go to your Vercel project dashboard
2. **Settings** → **Environment Variables**
3. Add new variable:
   - **Name**: `DISCORD_WEBHOOK`
   - **Value**: Your webhook URL
   - **Environments**: Production, Preview, Development (select all)
4. **Save**
5. **Redeploy** your application

### **Testing the Webhook**

You can test if it's working by:

1. **Using the test endpoint:**
   ```bash
   curl https://your-domain.com/api/test-discord
   ```

2. **Placing a test order** through the checkout flow

3. **Check Discord** for the notification

## Where Discord Webhooks Are Used

### **1. New Orders** (`/api/place-order`)
- ✅ **NOW ADDED** - Sends notification when order is placed
- Shows complete order details
- Purple embed color (Cannè brand)

### **2. Status Changes** (`/api/admin/orders/[id]/status`)
- Already implemented
- Sends notification when order status changes
- Different colors for different statuses

### **3. Bulk Status Changes** (`/api/admin/orders/bulk-change-status`)
- Already implemented
- Sends notification for bulk updates

## Notification Examples

### **New Order Notification**
```
🎉 New Order Received!
Order CN-20250101-1234 has been placed

👤 Customer
John Doe
📱 (202) 555-0123
📧 john@example.com

📦 Items
• Classic Tier Art x1 - $45.00
  Moroccan Peach • sativa • 18-22% THC
  7g

💰 Order Total
Subtotal: $45.00
Delivery: FREE
Total: $45.00

📍 Delivery Address
123 Main St
Washington, DC 20001

⏰ Preferred Time
ASAP (60-90 min)

Cannè Order System
```

### **Status Change Notification**
```
📦 Order Status Updated
Order CN-20250101-1234

Status: pending → delivered
Reason: Order delivered successfully

Cannè Order System
```

## Troubleshooting

### **Webhook Not Sending**

1. **Check Vercel Environment Variable**
   - Make sure `DISCORD_WEBHOOK` is set
   - Verify the URL format is correct
   - Ensure it's enabled for all environments

2. **Check Vercel Logs**
   ```
   Look for:
   ✅ Discord notification sent
   OR
   ❌ Discord notification failed: [error]
   ```

3. **Test the Webhook Directly**
   ```bash
   curl -X POST "YOUR_WEBHOOK_URL" \
     -H "Content-Type: application/json" \
     -d '{"content": "Test message"}'
   ```

4. **Verify Discord Webhook is Active**
   - Go to Discord Server Settings
   - Check Integrations → Webhooks
   - Make sure webhook is not deleted

### **Common Issues**

**Issue**: "Discord webhook URL not configured"
**Solution**: Add `DISCORD_WEBHOOK` to Vercel environment variables

**Issue**: Webhook sends but no message appears
**Solution**: Check Discord webhook permissions and channel access

**Issue**: Old orders don't trigger webhook
**Solution**: Webhook only works for NEW orders placed after deployment

## Environment Variable Checklist

- [ ] `DISCORD_WEBHOOK` added to Vercel
- [ ] Value is correct Discord webhook URL
- [ ] Enabled for Production environment
- [ ] Enabled for Preview environment (optional)
- [ ] Enabled for Development environment (optional)
- [ ] Application redeployed after adding variable
- [ ] Test order placed to verify

## Result

Discord notifications now work for:
- ✅ **New orders** - Rich embed with all details
- ✅ **Status changes** - Updates when admin changes status
- ✅ **Bulk changes** - Notifications for bulk operations

**Your Vercel deployment will now send Discord notifications for every new order!** 🎉

## Files Modified
- `/src/app/api/place-order/route.ts` - Added Discord webhook integration
