# Discord Notifications Troubleshooting Guide

## 🚨 Not Receiving Discord Notifications? Follow These Steps

---

## 1️⃣ **Test Your Webhook URL**

### Option A: Use the Built-in Test Endpoint
1. Make sure your dev server is running: `npm run dev`
2. Open this URL in your browser: http://localhost:4000/api/test-discord
3. You should see a test message in your Discord channel

### Option B: Test with curl
```bash
curl http://localhost:4000/api/test-discord
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Discord webhook test successful!",
  "status": 204
}
```

---

## 2️⃣ **Check Environment Variables**

### Verify DISCORD_WEBHOOK is Set
```bash
# Check if webhook URL exists in .env.local
cat .env.local | grep DISCORD_WEBHOOK
```

**Should see something like:**
```
DISCORD_WEBHOOK=https://discord.com/api/webhooks/1234567890/AbCdEfGhIjKlMnOpQrStUvWxYz
```

### If Missing or Wrong:
1. Go to Discord → Server Settings → Integrations → Webhooks
2. Click "New Webhook" or copy existing webhook URL
3. Add to `.env.local`:
```bash
DISCORD_WEBHOOK=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL_HERE
```
4. **IMPORTANT**: Restart your dev server after changing `.env.local`

---

## 3️⃣ **Check Discord Mobile App Settings**

### On iOS/Android:
1. Open Discord app
2. Go to **User Settings** (gear icon)
3. Navigate to **Notifications**
4. Ensure these are enabled:
   - ✅ Enable All Notifications
   - ✅ Enable Push Notifications
   - ✅ Server notifications

### Check Specific Server Settings:
1. Long-press (mobile) or right-click (desktop) your server icon
2. Select **Notification Settings**
3. Ensure it's set to:
   - **All Messages** (not "Only @mentions")
   - ✅ Mobile Push Notifications enabled

### Check Channel-Specific Settings:
1. Long-press/right-click the channel where webhook posts
2. Select **Notification Settings**
3. Ensure it's not muted
4. Set to **All Messages**

---

## 4️⃣ **Verify Discord Webhook is Active**

### Check Webhook Status:
1. Go to Discord Server Settings → Integrations → Webhooks
2. Find your webhook
3. Verify:
   - ✅ Not deleted
   - ✅ Has correct channel
   - ✅ URL hasn't changed

### Test Webhook Directly (without code):
```bash
# Replace with your actual webhook URL
curl -X POST "https://discord.com/api/webhooks/YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test message from terminal"
  }'
```

**If this fails**: Your webhook URL is invalid or expired. Create a new one.

---

## 5️⃣ **Check Server Logs**

### Look for Discord Notification Logs:
When you place an order, check terminal for:

**✅ Success:**
```
🔍 Discord webhook check: CONFIGURED
📢 Sending Discord notification...
✅ Discord notification sent successfully
```

**❌ Failure:**
```
⚠️ Discord webhook URL not configured - set DISCORD_WEBHOOK environment variable
```
or
```
❌ Discord notification failed with error: [error details]
```

---

## 6️⃣ **Common Issues & Solutions**

### Issue: "DISCORD_WEBHOOK not configured"
**Solution:** Add webhook URL to `.env.local` and restart server

### Issue: "404 Not Found"
**Solution:** Webhook URL is invalid. Create new webhook in Discord

### Issue: "401 Unauthorized"
**Solution:** Webhook URL format is wrong. Should be:
```
https://discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN
```

### Issue: "429 Too Many Requests"
**Solution:** Discord rate limit hit. Wait a few minutes and try again

### Issue: Messages sent but no phone notification
**Solution:** 
1. Check Discord app notification settings (see step 3)
2. Check phone system settings → Discord → Allow Notifications
3. Make sure "Do Not Disturb" is off
4. Try logging out and back into Discord app

### Issue: Works on desktop but not mobile
**Solution:**
1. Force quit Discord app and reopen
2. Check if app needs update
3. Reinstall Discord app
4. Check phone battery saver mode (can block notifications)

---

## 7️⃣ **Test with a Simple Order**

### Place a Test Order:
1. Go to http://localhost:4000/shop
2. Add an item to cart
3. Go to checkout
4. Fill in test details
5. Submit order

### Check Logs:
Watch your terminal for Discord notification logs

### Expected Discord Message:
```
🎉 New Order Received!
Order CN-20250113-1234 has been placed

👤 Customer
[Name]
📱 [Phone]
📧 [Email]

📦 Items
[Product details]

💰 Order Total
[Price breakdown]
```

---

## 8️⃣ **Verify Webhook in Production (Vercel)**

### If deployed to Vercel:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check if `DISCORD_WEBHOOK` is set
3. If not, add it with your webhook URL
4. Redeploy your application

### Test Production Webhook:
```bash
curl https://your-domain.vercel.app/api/test-discord
```

---

## 🔧 **Quick Fixes Checklist**

- [ ] Discord webhook URL is in `.env.local`
- [ ] Dev server restarted after adding webhook URL
- [ ] `/api/test-discord` endpoint returns success
- [ ] Discord app notifications enabled on phone
- [ ] Server notifications set to "All Messages"
- [ ] Channel is not muted
- [ ] Webhook exists in Discord server settings
- [ ] Phone system notifications enabled for Discord
- [ ] Not in Do Not Disturb mode
- [ ] Discord app is updated

---

## 📱 **Phone-Specific Troubleshooting**

### iOS:
1. Settings → Notifications → Discord
2. Ensure these are ON:
   - Allow Notifications
   - Sounds
   - Badges
   - Show in Notification Center
   - Show on Lock Screen
3. Check Focus modes (Do Not Disturb, Sleep, etc.)

### Android:
1. Settings → Apps → Discord → Notifications
2. Enable all notification categories
3. Check battery optimization (should NOT optimize Discord)
4. Check Data Saver mode (can block background notifications)

---

## 🆘 **Still Not Working?**

### Create a Fresh Webhook:
1. Discord Server Settings → Integrations → Webhooks
2. Delete old webhook
3. Create new webhook
4. Copy new URL
5. Update `.env.local` with new URL
6. Restart dev server
7. Test with `/api/test-discord`

### Enable Debug Logging:
Add this to check what's happening:
```bash
# In terminal while server is running
tail -f .next/server/app/api/place-order/route.js
```

---

## ✅ **Verification Steps**

After fixing, verify:
1. [ ] Test endpoint works: http://localhost:4000/api/test-discord
2. [ ] Receive test message in Discord channel
3. [ ] Receive message on phone (push notification)
4. [ ] Place test order and see notification
5. [ ] Check logs show "Discord notification sent successfully"

---

## 📞 **Need More Help?**

If none of these steps work:
1. Share the error message from `/api/test-discord`
2. Share the terminal logs when placing an order
3. Confirm Discord webhook URL format is correct
4. Try creating a completely new webhook in Discord

---

## 🎯 **Most Common Fix (90% of cases)**

```bash
# 1. Get your Discord webhook URL from Discord server settings
# 2. Add to .env.local
echo "DISCORD_WEBHOOK=https://discord.com/api/webhooks/YOUR_URL" >> .env.local

# 3. Restart server
npm run dev

# 4. Test
curl http://localhost:4000/api/test-discord
```

**This should fix most issues!** 🎉
