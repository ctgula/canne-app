#!/bin/bash

# Discord Webhook Setup Script for Vercel
# This script adds the DISCORD_WEBHOOK environment variable to your Vercel project

echo "🔧 Setting up Discord webhook for Vercel..."
echo ""

# The webhook URL
WEBHOOK_URL="https://canary.discord.com/api/webhooks/1427448787596742698/LGa107la7ZAvY6kI-sXU4YyF-LUnxZB_eudCmJaLtEbsAQpaT68VqldWsohVG8cuq4tF"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo "Install it with: npm i -g vercel"
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""

# Add environment variable for all environments
echo "📝 Adding DISCORD_WEBHOOK to all environments (production, preview, development)..."
echo ""

# Add to production
vercel env add DISCORD_WEBHOOK production <<EOF
${WEBHOOK_URL}
EOF

# Add to preview
vercel env add DISCORD_WEBHOOK preview <<EOF
${WEBHOOK_URL}
EOF

# Add to development
vercel env add DISCORD_WEBHOOK development <<EOF
${WEBHOOK_URL}
EOF

echo ""
echo "✅ Environment variable added successfully!"
echo ""
echo "Next steps:"
echo "1. Redeploy your application: vercel --prod"
echo "2. Or push a new commit to trigger automatic deployment"
echo "3. Test by placing an order and checking Discord"
echo ""
echo "To verify the variable is set:"
echo "  vercel env ls"
echo ""
