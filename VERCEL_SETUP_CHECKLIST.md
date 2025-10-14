# Vercel Environment Variables Setup ✅

## 🚨 CRITICAL - Required for Production

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

---

## ✅ **REQUIRED Variables (Must Have)**

### 1️⃣ **DISCORD_WEBHOOK**
```
https://canary.discord.com/api/webhooks/1427407845153832970/1bsNDxbAcCZe0WGe3QkRPhpLNYYSzJJKvCZtoZI6ltmu0CZCyxjsoDAv9yjCh30qsubY
```
- **Environments:** Production, Preview, Development
- **Used for:** Order notifications to Discord channel

### 2️⃣ **NEXT_PUBLIC_SUPABASE_URL**
```
https://radtljksnoznrsyntazx.supabase.co
```
- **Environments:** Production, Preview, Development
- **Used for:** Database connection (client-side)

### 3️⃣ **NEXT_PUBLIC_SUPABASE_ANON_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZHRsamtzbm96bnJzeW50YXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTMzNjIsImV4cCI6MjA2ODI4OTM2Mn0.6-vJou7LmXIwHv4l9qJp-ZKdf9gH4iWkouseg8E1TW0
```
- **Environments:** Production, Preview, Development
- **Used for:** Database connection (public/anon access)

### 4️⃣ **SUPABASE_SERVICE_ROLE_KEY**
```
[Copy from your .env.local file]
```
- **Environments:** Production, Preview, Development
- **Used for:** Server-side database operations (admin access)
- ⚠️ **NEVER expose this in client-side code**

---

## 📧 **OPTIONAL - For Email/SMS Notifications**

### 5️⃣ **SENDGRID_API_KEY** (Optional)
```
SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
- Get from: https://app.sendgrid.com/settings/api_keys
- Used for: Email notifications to customers

### 6️⃣ **EMAIL_FROM** (Optional)
```
hello@canne.app
```
- Must be verified in SendGrid
- Used for: Sender email address

### 7️⃣ **TWILIO_SID** (Optional)
```
ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
- Get from: https://console.twilio.com/
- Used for: SMS notifications

### 8️⃣ **TWILIO_TOKEN** (Optional)
```
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
- Get from: https://console.twilio.com/
- Used for: SMS authentication

### 9️⃣ **TWILIO_FROM** (Optional)
```
+12025551234
```
- Your Twilio phone number in E.164 format
- Used for: SMS sender number

---

## 🎯 **Current Status Check**

### ✅ **You Have (From .env.local):**
- ✅ DISCORD_WEBHOOK (NEW - just updated!)
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY

### ⚠️ **You Don't Have (Optional):**
- ❌ SENDGRID_API_KEY (Email notifications won't work)
- ❌ EMAIL_FROM (Email notifications won't work)
- ❌ TWILIO_SID (SMS notifications won't work)
- ❌ TWILIO_TOKEN (SMS notifications won't work)
- ❌ TWILIO_FROM (SMS notifications won't work)

---

## 📝 **How to Add Variables in Vercel**

### Step-by-Step:

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Select Your Project**
   - Find "canne-app" (or your project name)

3. **Go to Settings**
   - Click "Settings" in the top navigation

4. **Click "Environment Variables"**
   - In the left sidebar

5. **Add Each Variable**
   - Click "Add New"
   - Enter **Name** (e.g., `DISCORD_WEBHOOK`)
   - Enter **Value** (the actual URL/key)
   - Select **Environments**: Check all three boxes
     - ☑️ Production
     - ☑️ Preview
     - ☑️ Development
   - Click "Save"

6. **Repeat for All Variables**

7. **Redeploy**
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - OR just push a new commit

---

## 🔐 **Security Notes**

### ⚠️ Variables Starting with `NEXT_PUBLIC_`
- These are **exposed to the browser**
- Only use for non-sensitive data
- Examples: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

### 🔒 Variables WITHOUT `NEXT_PUBLIC_`
- These are **server-side only**
- Never exposed to browser
- Examples: SUPABASE_SERVICE_ROLE_KEY, DISCORD_WEBHOOK

### 🚨 NEVER Commit to Git:
- ❌ API keys
- ❌ Service role keys
- ❌ Webhook URLs
- ❌ Passwords/tokens

---

## ✅ **Verification**

### After Adding Variables to Vercel:

1. **Check Environment Variables Page**
   - All required variables should be listed
   - Each should have green checkmarks for all environments

2. **Test on Production**
   - Place a test order on your live site
   - Check Discord for notification
   - Should receive message in your channel

3. **If Not Working**
   - Check Vercel logs: Deployments → Click deployment → Logs
   - Look for "DISCORD_WEBHOOK" in logs
   - Should see "CONFIGURED" not "NOT CONFIGURED"

---

## 🐛 **Troubleshooting**

### Discord Notifications Not Working on Vercel:

1. ✅ Check variable name is exactly: `DISCORD_WEBHOOK`
2. ✅ Value starts with: `https://canary.discord.com/api/webhooks/`
3. ✅ All environments checked (Production, Preview, Development)
4. ✅ Redeployed after adding variables
5. ✅ Check Vercel deployment logs for errors

### How to Check Logs:
- Vercel Dashboard → Deployments
- Click on latest deployment
- Click "Functions" tab
- Look for your API route logs

---

## 📞 **Quick Reference**

**Variable Name:** `DISCORD_WEBHOOK`  
**Value:** `https://canary.discord.com/api/webhooks/1427407845153832970/1bsNDxbAcCZe0WGe3QkRPhpLNYYSzJJKvCZtoZI6ltmu0CZCyxjsoDAv9yjCh30qsubY`  
**Environments:** All (Production + Preview + Development)  

---

## ✅ **What Happens After Setup**

Once you add `DISCORD_WEBHOOK` to Vercel and redeploy:

1. Customer places order on live site
2. Order saved to database
3. Discord webhook fires
4. You get notification on your phone (if Discord app installed)
5. Notification shows:
   - 🎉 New Order Received!
   - Order number
   - Customer details
   - Items ordered
   - Delivery info
   - Total amount

**That's it! Your production Discord notifications will work! 🚀**
