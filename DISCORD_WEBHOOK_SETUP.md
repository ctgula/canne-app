# Discord Webhook Setup for Cannè Order Notifications

## Issue
Discord notifications are not being sent because the `DISCORD_WEBHOOK` environment variable is missing.

## Solution

### 1. Create Discord Webhook
1. Go to your Discord server
2. Right-click on the channel where you want order notifications
3. Select "Edit Channel" → "Integrations" → "Webhooks"
4. Click "New Webhook"
5. Name it "Cannè Order Bot"
6. Copy the webhook URL

### 2. Add to Environment Variables
Add this line to your `.env.local` file:

```bash
# Discord webhook for order notifications
DISCORD_WEBHOOK=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

### 3. Current Environment Variables Needed
Your `.env.local` should contain:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://radtljksnoznrsyntazx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZHRsamtzbm96bnJzeW50YXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTMzNjIsImV4cCI6MjA2ODI4OTM2Mn0.6-vJou7LmXIwHv4l9qJp-ZKdf9gH4iWkouseg8E1TW0
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Discord webhook for order notifications
DISCORD_WEBHOOK=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

### 4. Restart Development Server
After adding the webhook URL, restart your development server:
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
