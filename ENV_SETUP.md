# Environment Variables Setup

## Required Environment Variables for Contact Capture + Notifications

Add these to your `.env.local` file (local development) and Vercel environment variables (production).

```bash
# =============================================================================
# Supabase Configuration (Already Configured)
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://radtljksnoznrsyntazx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# =============================================================================
# SendGrid Configuration (Email Notifications)
# =============================================================================
# Get your API key from: https://app.sendgrid.com/settings/api_keys
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# The "from" email address for all outgoing emails
# Must be verified in SendGrid: https://app.sendgrid.com/settings/sender_auth
EMAIL_FROM=hello@canne.app

# =============================================================================
# Twilio Configuration (SMS Notifications)
# =============================================================================
# Get these from: https://console.twilio.com/
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_TOKEN=your_auth_token_here

# Your Twilio phone number (must be purchased/verified)
# Format: E.164 format with + prefix
TWILIO_FROM=+1XXXXXXXXXX

# =============================================================================
# Discord Webhook (Already Configured)
# =============================================================================
DISCORD_WEBHOOK=https://discord.com/api/webhooks/...

```

## Setup Instructions

### 1. SendGrid Setup
1. Sign up at https://sendgrid.com/ (Free tier: 100 emails/day)
2. Navigate to Settings → API Keys
3. Create a new API key with "Full Access" permissions
4. Copy the key and add to `SENDGRID_API_KEY`
5. Verify sender email at Settings → Sender Authentication
6. Add verified email to `EMAIL_FROM`

### 2. Twilio Setup
1. Sign up at https://www.twilio.com/ (Free trial: $15 credit)
2. Get your Account SID and Auth Token from the console
3. Add to `TWILIO_SID` and `TWILIO_TOKEN`
4. Buy a phone number: Phone Numbers → Buy a Number
5. Add phone number to `TWILIO_FROM` in E.164 format (e.g., +12025551234)

### 3. Verify Setup
After adding environment variables:
1. Restart your development server
2. Place a test order with your real email and phone
3. Check that you receive both email and SMS
4. Verify entries appear in the `notification_logs` table

## Testing Without Live Credentials

If you want to test without setting up SendGrid/Twilio:
- The system will gracefully fail and log errors
- Orders will still be created successfully
- Discord notifications will still work
- Check console logs for notification attempt details

## Environment Variable Priorities

1. **Required for core functionality**:
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY

2. **Required for notifications**:
   - SENDGRID_API_KEY
   - EMAIL_FROM
   - TWILIO_SID
   - TWILIO_TOKEN
   - TWILIO_FROM

3. **Optional but recommended**:
   - DISCORD_WEBHOOK

## Security Notes

- ⚠️ Never commit `.env.local` to version control
- ⚠️ Use different API keys for development and production
- ⚠️ Rotate keys periodically for security
- ⚠️ Service role key should only be used in API routes (server-side)
