# Discord Webhook Setup Guide 🔔

## Issue Identified
Discord notifications are not working because the `DISCORD_WEBHOOK` environment variable is likely not set in Vercel.

## Your Webhook URL
```
https://discord.com/api/webhooks/1423010929641128007/82gj403g7XT3Un-IRC0xr1Du4rfNSoceN2PNKhAta5G5gnCubWCwr4bA91ZqFfa5oKqv
```

✅ **Webhook URL is valid** - I tested it and it works!

## Step-by-Step Fix

### **1. Add Environment Variable in Vercel**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **canne-app** project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Name**: `DISCORD_WEBHOOK`
   - **Value**: `https://discord.com/api/webhooks/1423010929641128007/82gj403g7XT3Un-IRC0xr1Du4rfNSoceN2PNKhAta5G5gnCubWCwr4bA91ZqFfa5oKqv`
   - **Environments**: Check all (Production, Preview, Development)
6. Click **Save**

### **2. Redeploy Your Application**

After adding the environment variable:

**Option A - Automatic:**
1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**

**Option B - Git Push:**
```bash
git commit --allow-empty -m "chore: trigger redeploy for Discord webhook"
git push
```

### **3. Verify Setup**

After redeployment, place a test order and check:

1. **Vercel Logs**:
   - Go to your deployment
   - Click **View Function Logs**
   - Look for: `🔍 Discord webhook check: CONFIGURED`
   - Should see: `✅ Discord notification sent successfully`

2. **Discord Channel**:
   - Check your Discord channel
   - You should see a purple embed with order details

## Local Development Setup

For local testing, create a `.env.local` file:

```bash
# .env.local
DISCORD_WEBHOOK=https://discord.com/api/webhooks/1423010929641128007/82gj403g7XT3Un-IRC0xr1Du4rfNSoceN2PNKhAta5G5gnCubWCwr4bA91ZqFfa5oKqv
```

Then restart your dev server:
```bash
npm run dev
```

## Testing the Webhook

### **Direct Test (Verify Webhook Works)**
```bash
curl -X POST "https://discord.com/api/webhooks/1423010929641128007/82gj403g7XT3Un-IRC0xr1Du4rfNSoceN2PNKhAta5G5gnCubWCwr4bA91ZqFfa5oKqv" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "✅ Webhook test successful - Cannè notifications are working!"
  }'
```

### **Test Order (After Vercel Setup)**
```bash
curl -X POST https://canne.app/api/place-order \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{
      "product": {
        "id": "classic",
        "name": "Classic Tier Art",
        "price": 45,
        "tier": "Classic",
        "weight": "7g"
      },
      "strain": {
        "name": "Moroccan Peach",
        "type": "sativa",
        "thcLow": 18,
        "thcHigh": 22
      },
      "quantity": 1
    }],
    "deliveryDetails": {
      "name": "Test Customer",
      "phone": "2025551234",
      "email": "test@canne.app",
      "address": "1600 Pennsylvania Avenue NW",
      "city": "Washington",
      "zipCode": "20500",
      "timePreference": "ASAP (60-90 min)",
      "specialInstructions": "Discord webhook test"
    },
    "total": 45,
    "hasDelivery": true,
    "status": "pending"
  }'
```

## Expected Discord Message

You should see a rich embed like this:

```
🎉 New Order Received!
Order CN-20250101-1234 has been placed

👤 Customer
Test Customer
📱 2025551234
📧 test@canne.app

📦 Items
• Classic Tier Art x1 - $45.00
  Moroccan Peach • sativa • 18-22% THC
  7g

💰 Order Total          📍 Delivery Address
Subtotal: $45.00        1600 Pennsylvania Avenue NW
Delivery: FREE          Washington, DC 20500
Total: $45.00

⏰ Preferred Time
ASAP (60-90 min)

Cannè Order System
```

## Improved Error Logging

I've updated the code to provide better debugging:

**New logs you'll see:**
- `🔍 Discord webhook check: CONFIGURED` or `NOT CONFIGURED`
- `📢 Sending Discord notification...`
- `✅ Discord notification sent successfully`
- `❌ Discord webhook failed: [status] [error]`

## Troubleshooting

### **Issue: "NOT CONFIGURED" in logs**
**Solution**: Environment variable not set in Vercel
- Follow Step 1 above
- Redeploy the app

### **Issue: "Discord webhook failed: 404"**
**Solution**: Webhook URL is incorrect or deleted
- Verify webhook exists in Discord
- Check URL is exactly correct
- Regenerate webhook if needed

### **Issue: "Discord webhook failed: 401"**
**Solution**: Webhook token is invalid
- Regenerate webhook in Discord
- Update environment variable
- Redeploy

### **Issue: No error but no message**
**Solution**: Check Discord channel permissions
- Webhook needs permission to post
- Check channel settings

## Security Note

⚠️ **Never commit webhook URLs to Git!**
- Always use environment variables
- Add `.env.local` to `.gitignore`
- Rotate webhook if exposed

## Verification Checklist

- [ ] Environment variable added in Vercel
- [ ] All environments selected (Production, Preview, Development)
- [ ] Application redeployed
- [ ] Direct webhook test successful
- [ ] Test order placed
- [ ] Discord message received
- [ ] Vercel logs show "CONFIGURED"
- [ ] Vercel logs show "sent successfully"

## Next Steps

1. **Add to Vercel** ✅
2. **Redeploy** ✅
3. **Test order** ✅
4. **Verify Discord** ✅

**Once complete, every new order will automatically send a Discord notification!** 🎉
