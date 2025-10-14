# Discord Webhook Setup for Cannè Order Notifications

## ✅ Webhook URL Configured
```
https://canary.discord.com/api/webhooks/1427448787596742698/LGa107la7ZAvY6kI-sXU4YyF-LUnxZB_eudCmJaLtEbsAQpaT68VqldWsohVG8cuq4tF
```

## 🚀 Setup for Vercel (Production)

### Step 1: Add Environment Variable in Vercel Dashboard
1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your `canne-app` project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name:** `DISCORD_WEBHOOK`
   - **Value:** `https://canary.discord.com/api/webhooks/1427448787596742698/LGa107la7ZAvY6kI-sXU4YyF-LUnxZB_eudCmJaLtEbsAQpaT68VqldWsohVG8cuq4tF`
   - **Environments:** Check all (Production, Preview, Development)
5. Click **Save**

### Step 2: Redeploy Your Application
After adding the environment variable, you need to redeploy:
- Option A: Go to **Deployments** tab → Click "..." on latest deployment → **Redeploy**
- Option B: Push a new commit to trigger automatic deployment
- Option C: Use Vercel CLI: `vercel --prod`

### Step 3: Verify Environment Variable
After deployment, you can verify the variable is set:
```bash
vercel env ls
```

---

## 💻 Local Development Setup

### Add to `.env.local` file:
```bash
# Discord webhook for order notifications
DISCORD_WEBHOOK=https://canary.discord.com/api/webhooks/1427448787596742698/LGa107la7ZAvY6kI-sXU4YyF-LUnxZB_eudCmJaLtEbsAQpaT68VqldWsohVG8cuq4tF
```

### Complete `.env.local` should contain:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://radtljksnoznrsyntazx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZHRsamtzbm96bnJzeW50YXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTMzNjIsImV4cCI6MjA2ODI4OTM2Mn0.6-vJou7LmXIwHv4l9qJp-ZKdf9gH4iWkouseg8E1TW0
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Discord webhook for order notifications  
DISCORD_WEBHOOK=https://canary.discord.com/api/webhooks/1427448787596742698/LGa107la7ZAvY6kI-sXU4YyF-LUnxZB_eudCmJaLtEbsAQpaT68VqldWsohVG8cuq4tF
```

### Restart Development Server
```bash
npm run dev
```

## Testing
1. Place a test order through the app
2. Check the server console for Discord webhook debug logs
3. Verify the notification appears in your Discord channel

## Debug Information Added
The API now includes comprehensive logging to help identify webhook issues:
- ✅ Webhook existence check
- 📤 Notification sending status  
- 📬 Response status and error details
- ❌ Detailed error logging if webhook fails

## Expected Discord Notification Format
```
🌿 New Cannè Order Received!
Order CN-XXXXXXXX-XXXX has been placed and is ready for processing.

👤 Customer Information
Name: Customer Name
Phone: (555) 123-4567
Email: customer@email.com

📍 Delivery Details
Address: 123 Main St
Washington, DC 20001
Preferred Time: Evening

📦 Order Details
• 1x Classic Series (7g complimentary)
  $45.00 each = $45.00 total

Subtotal: $45.00
Delivery: FREE
Total: $45.00
```
