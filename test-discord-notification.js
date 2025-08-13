// Test Discord notification with the new webhook URL
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1405178342189170798/tL6POATy9-KGCkLlb7ISXNv047ygqxgmyqR73FG89E6N5o3LA7Q6X1BDm4xWT-mGOtip';

async function testDiscordNotification() {
  console.log('🧪 Testing Discord notification...');
  
  const embed = {
    title: "🧪 Cannè Discord Test",
    description: "Testing Discord webhook integration for order notifications",
    fields: [
      { 
        name: "👤 Test Customer", 
        value: "**Name:** John Doe\n**Phone:** (202) 555-0123\n**Email:** test@example.com",
        inline: false 
      },
      { 
        name: "📍 Test Delivery", 
        value: "**Address:** 123 Test Street\nWashington, DC 20001\n**Preferred Time:** ASAP (60–90 min)",
        inline: false 
      },
      { 
        name: "📦 Test Order", 
        value: "• **1x Classic Series** (7g complimentary)\n   $45.00 each = $45.00 total",
        inline: false 
      },
      { name: "Subtotal", value: "$45.00", inline: true },
      { name: "Delivery", value: "FREE", inline: true },
      { name: "**Total**", value: "**$45.00**", inline: true }
    ],
    timestamp: new Date().toISOString(),
    color: 0x8B5CF6,
    footer: { 
      text: "Cannè Art Collective • I-71 Compliant • Washington, DC",
      icon_url: "https://raw.githubusercontent.com/twemoji/twemoji/master/assets/72x72/1f33f.png"
    },
    thumbnail: {
      url: "https://raw.githubusercontent.com/twemoji/twemoji/master/assets/72x72/1f4e6.png"
    }
  };

  const payload = {
    username: "Cannè Order System (TEST)",
    avatar_url: "https://raw.githubusercontent.com/twemoji/twemoji/master/assets/72x72/1f33f.png",
    embeds: [embed]
  };

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('✅ Discord test notification sent successfully!');
      console.log('Check your Discord channel for the test message.');
    } else {
      const errorText = await response.text();
      console.error('❌ Discord test failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
    }
  } catch (error) {
    console.error('❌ Discord test error:', error.message);
  }
}

testDiscordNotification();
