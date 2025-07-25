// Direct Discord webhook test to verify the webhook URL is working
// This bypasses the order system and tests Discord directly

async function testDiscordWebhookDirect() {
  console.log('🔍 Testing Discord webhook directly...');
  
  const webhookUrl = 'https://discord.com/api/webhooks/1398428866128904222/N3o2RINFpFbKb1RK2GAsJesgnDMLi6eEdI4o0ktkDEoVvHOzzNscL-ISAUiWER-JYhLw';
  
  // Simple test message
  const testMessage = {
    username: "Cannè Test Bot",
    avatar_url: "https://raw.githubusercontent.com/twemoji/twemoji/master/assets/72x72/1f33f.png",
    content: "🧪 **Direct Discord Webhook Test**\n\nThis is a direct test of the Discord webhook to verify connectivity.",
    embeds: [{
      title: "🔧 Discord Webhook Test",
      description: "Testing direct webhook delivery outside of order system",
      color: 0x8B5CF6,
      fields: [
        { name: "Test Status", value: "Direct webhook test", inline: true },
        { name: "Timestamp", value: new Date().toISOString(), inline: true }
      ],
      footer: {
        text: "Cannè Webhook Test",
        icon_url: "https://raw.githubusercontent.com/twemoji/twemoji/master/assets/72x72/1f33f.png"
      }
    }]
  };

  try {
    console.log('📤 Sending direct Discord test message...');
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage),
    });

    console.log('📋 Discord Response Status:', response.status);
    console.log('📋 Discord Response Status Text:', response.statusText);
    console.log('📋 Discord Response OK:', response.ok);

    if (response.ok) {
      console.log('✅ Direct Discord webhook test successful!');
      console.log('🔔 Check your Discord channel for the test message');
    } else {
      const errorText = await response.text();
      console.error('❌ Direct Discord webhook failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
    }

  } catch (error) {
    console.error('💥 Direct Discord webhook error:', error.message);
  }
}

// Run the direct test
testDiscordWebhookDirect();
