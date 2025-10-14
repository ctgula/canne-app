# 🚀 Discord Notifications - Quick Reference

## ⚡ Fastest Setup (2 minutes)

### 1. Open Vercel Dashboard
👉 **https://vercel.com/dashboard**

### 2. Go to: Your Project → Settings → Environment Variables

### 3. Add This Variable:
```
Name:  DISCORD_WEBHOOK
Value: https://canary.discord.com/api/webhooks/1427448787596742698/LGa107la7ZAvY6kI-sXU4YyF-LUnxZB_eudCmJaLtEbsAQpaT68VqldWsohVG8cuq4tF

Environments: ✅ Production ✅ Preview ✅ Development
```

### 4. Redeploy
Go to **Deployments** → Click **⋮** on latest → **Redeploy**

### 5. Test
**Quick Test (no order needed):**
```
Visit: https://your-app.vercel.app/api/test-discord
```
This will send a test notification to Discord!

**OR Place a real order:** Add items → Checkout → Submit 🎉

---

## ✅ What's Already Done

- ✅ Discord webhook URL provided
- ✅ Code implementation correct (uses `process.env.DISCORD_WEBHOOK`)
- ✅ Notification format includes all order details
- ✅ Error handling and logging in place
- ✅ Setup scripts created

## 🎯 All You Need to Do

1. Add the environment variable in Vercel (see above)
2. Redeploy
3. Test with an order

---

## 📝 Files Created for You

1. **VERCEL_DISCORD_SETUP_GUIDE.md** - Complete detailed guide
2. **DISCORD_WEBHOOK_SETUP.md** - Updated setup instructions
3. **setup-discord-webhook.sh** - Automated CLI setup script
4. **This file** - Quick reference

---

## 🔍 How to Verify It's Working

### In Vercel Logs (after placing order):
```
🔍 Discord webhook check: CONFIGURED ✅
📢 Sending Discord notification... ✅
✅ Discord notification sent successfully ✅
```

### In Discord:
You'll see a rich embed notification with:
- 🎉 Order number
- 👤 Customer details
- 📦 Items with strain info
- 💰 Pricing breakdown
- 📍 Delivery address
- ⏰ Preferred time

---

## 🐛 Quick Troubleshooting

**"NOT CONFIGURED" in logs?**
→ Environment variable not set or not deployed yet

**"404" or "401" error?**
→ Webhook URL might be wrong, double-check it

**Variable added but not working?**
→ Must redeploy after adding environment variables!

---

## 📞 Need More Details?

See **VERCEL_DISCORD_SETUP_GUIDE.md** for:
- Multiple setup methods
- Detailed troubleshooting
- Testing procedures
- Pro tips

---

**Ready to go live!** 🚀
