# 🚀 Vercel Discord Webhook Setup - Complete Guide

## ✅ Your Discord Webhook URL
```
https://canary.discord.com/api/webhooks/1427448787596742698/LGa107la7ZAvY6kI-sXU4YyF-LUnxZB_eudCmJaLtEbsAQpaT68VqldWsohVG8cuq4tF
```

---

## Method 1: Vercel Dashboard (Easiest)

### Step-by-Step:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Login if needed

2. **Select Your Project**
   - Find and click on `canne-app` (or your project name)

3. **Navigate to Settings**
   - Click **Settings** tab at the top
   - Click **Environment Variables** in the left sidebar

4. **Add New Variable**
   - Click **Add New** or **Add Another**
   - Fill in:
     ```
     Key: DISCORD_WEBHOOK
     Value: https://canary.discord.com/api/webhooks/1427448787596742698/LGa107la7ZAvY6kI-sXU4YyF-LUnxZB_eudCmJaLtEbsAQpaT68VqldWsohVG8cuq4tF
     ```
   - Select environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

5. **Redeploy**
   - Go to **Deployments** tab
   - Click the **⋮** (three dots) on your latest deployment
   - Select **Redeploy**
   - Wait for deployment to complete (~1-2 minutes)

6. **Test It**
   - Visit your live site
   - Place a test order
   - Check your Discord channel for the notification! 🎉

---

## Method 2: Vercel CLI (Advanced)

### Prerequisites:
- ✅ Vercel CLI installed (you have this already!)
- Project must be linked to Vercel

### Quick Setup Script:
Run the setup script we created:
```bash
cd /Users/ct/Documents/canne\ on\ cursor/canne-app
./setup-discord-webhook.sh
```

### Manual CLI Setup:
If you prefer to do it manually:

```bash
# Navigate to project directory
cd /Users/ct/Documents/canne\ on\ cursor/canne-app

# Link project if not already linked
vercel link

# Add environment variable for production
vercel env add DISCORD_WEBHOOK production
# When prompted, paste: https://canary.discord.com/api/webhooks/1427448787596742698/LGa107la7ZAvY6kI-sXU4YyF-LUnxZB_eudCmJaLtEbsAQpaT68VqldWsohVG8cuq4tF

# Add environment variable for preview
vercel env add DISCORD_WEBHOOK preview
# When prompted, paste the same URL

# Add environment variable for development  
vercel env add DISCORD_WEBHOOK development
# When prompted, paste the same URL

# Verify it was added
vercel env ls

# Deploy to production
vercel --prod
```

---

## Method 3: Quick One-Liner (CLI)

If your project is already linked:
```bash
echo "https://canary.discord.com/api/webhooks/1427448787596742698/LGa107la7ZAvY6kI-sXU4YyF-LUnxZB_eudCmJaLtEbsAQpaT68VqldWsohVG8cuq4tF" | vercel env add DISCORD_WEBHOOK production && \
echo "https://canary.discord.com/api/webhooks/1427448787596742698/LGa107la7ZAvY6kI-sXU4YyF-LUnxZB_eudCmJaLtEbsAQpaT68VqldWsohVG8cuq4tF" | vercel env add DISCORD_WEBHOOK preview && \
echo "https://canary.discord.com/api/webhooks/1427448787596742698/LGa107la7ZAvY6kI-sXU4YyF-LUnxZB_eudCmJaLtEbsAQpaT68VqldWsohVG8cuq4tF" | vercel env add DISCORD_WEBHOOK development && \
vercel --prod
```

---

## 🧪 Testing & Verification

### 1. Check Environment Variables
```bash
vercel env ls
```
You should see `DISCORD_WEBHOOK` listed for all environments.

### 2. Check Deployment Logs
After redeploying, check the build logs in Vercel dashboard:
- Look for any errors related to environment variables
- Verify the build completed successfully

### 3. Test Order Flow
1. Go to your live site (e.g., `canne-app.vercel.app`)
2. Add items to cart
3. Complete checkout with test information:
   - Name: Test User
   - Phone: 555-1234
   - Address: 123 Test St
   - City: Washington
   - ZIP: 20001 (must be valid DC ZIP)
4. Submit order
5. Check your Discord channel - you should see a notification! 🎉

### 4. Check Server Logs
If notification doesn't appear:
1. Go to Vercel Dashboard → Your Project → **Logs**
2. Filter by **Function Logs**
3. Look for order submission logs with Discord webhook status:
   - `🔍 Discord webhook check: CONFIGURED` ✅ Good!
   - `🔍 Discord webhook check: NOT CONFIGURED` ❌ Variable not set
   - `✅ Discord notification sent successfully` ✅ Working!
   - `❌ Discord webhook failed:` ❌ Check error message

---

## 📋 Expected Discord Notification Format

Once working, you'll see notifications like this in Discord:

```
🎉 New Order Received!
Order CN-20250116-1234 has been placed

👤 Customer
John Doe
📱 (555) 123-4567
📧 john@example.com

📦 Items
• Starter Collection x1 - $25.00
  Moroccan Peach • sativa • 18-22% THC
  3.5g

💰 Order Total
Subtotal: $25.00
Delivery: FREE
Total: $25.00

📍 Delivery Address
123 Main St
Washington, DC 20001

⏰ Preferred Time
ASAP (60-90 min)
```

---

## 🐛 Troubleshooting

### Problem: "Discord webhook check: NOT CONFIGURED"
**Solution:** The environment variable isn't set. Re-check Steps 4-5 in Method 1, or re-run the CLI commands.

### Problem: "Discord webhook failed: 401" or "403"
**Solution:** The webhook URL might be invalid or revoked. Create a new webhook in Discord and update the environment variable.

### Problem: "Discord webhook failed: 404"
**Solution:** The webhook URL format is wrong. Make sure you copied the entire URL including `/` characters.

### Problem: Notification not showing in Discord
**Solution:** 
1. Check that the Discord webhook is for the correct channel
2. Verify you have permission to view that channel
3. Check Discord server settings - webhooks might be disabled

### Problem: Variable shows in `vercel env ls` but not working
**Solution:** You need to redeploy after adding environment variables. They're only available in new deployments, not existing ones.

---

## 🎯 Recommended Approach

**For quickest setup:** Use Method 1 (Dashboard)
- Takes 2 minutes
- Visual interface
- No CLI knowledge needed
- Just remember to redeploy!

**For automation/scripting:** Use Method 2 or 3 (CLI)
- Can be scripted
- Useful for CI/CD
- Version controlled setup

---

## ✅ Checklist

- [ ] Discord webhook URL is correct and active
- [ ] Environment variable `DISCORD_WEBHOOK` added to Vercel
- [ ] Variable added to all environments (Production, Preview, Development)
- [ ] Application redeployed after adding variable
- [ ] Test order placed successfully
- [ ] Discord notification received
- [ ] Logs show "Discord notification sent successfully"

---

## 💡 Pro Tips

1. **Keep webhook URL secret** - Don't commit it to git or share publicly
2. **Test in Preview first** - Create a preview deployment to test before production
3. **Monitor logs** - Check Vercel function logs regularly for any errors
4. **Set up alerts** - Configure Discord to ping you when orders come in
5. **Create separate webhooks** - Consider different webhooks for production vs. staging

---

## 📚 Additional Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/environment-variables)
- [Discord Webhook Documentation](https://discord.com/developers/docs/resources/webhook)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)

---

**Need help?** Check the console logs in Vercel dashboard or run `vercel logs` in your terminal!
