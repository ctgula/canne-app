// Comprehensive Discord webhook validation
// This will test various aspects of the webhook to identify issues

async function validateDiscordWebhook() {
  console.log('🔍 Comprehensive Discord webhook validation...');
  
  const webhookUrl = 'https://discord.com/api/webhooks/1398428866128904222/N3o2RINFpFbKb1RK2GAsJesgnDMLi6eEdI4o0ktkDEoVvHOzzNscL-ISAUiWER-JYhLw';
  
  console.log('📋 Webhook URL Analysis:');
  console.log('- URL Length:', webhookUrl.length);
  console.log('- Webhook ID:', '1398428866128904222');
  console.log('- Token Length:', 'N3o2RINFpFbKb1RK2GAsJesgnDMLi6eEdI4o0ktkDEoVvHOzzNscL-ISAUiWER-JYhLw'.length);
  
  // Test 1: Simple text message
  console.log('\n🧪 Test 1: Simple text message');
  try {
    const simpleResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: "🧪 Simple test message - can you see this?"
      })
    });
    
    console.log('Simple message response:', {
      status: simpleResponse.status,
      ok: simpleResponse.ok,
      statusText: simpleResponse.statusText
    });
    
    if (!simpleResponse.ok) {
      const errorText = await simpleResponse.text();
      console.error('Simple message error:', errorText);
    }
  } catch (error) {
    console.error('Simple message failed:', error.message);
  }
  
  // Wait 2 seconds between tests
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: Embed message (like our order notifications)
  console.log('\n🧪 Test 2: Embed message');
  try {
    const embedResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: "Cannè Validation Bot",
        embeds: [{
          title: "🔧 Webhook Validation Test",
          description: "Testing embed delivery",
          color: 0x8B5CF6,
          fields: [
            { name: "Status", value: "Testing embed format", inline: false }
          ],
          timestamp: new Date().toISOString()
        }]
      })
    });
    
    console.log('Embed message response:', {
      status: embedResponse.status,
      ok: embedResponse.ok,
      statusText: embedResponse.statusText
    });
    
    if (!embedResponse.ok) {
      const errorText = await embedResponse.text();
      console.error('Embed message error:', errorText);
    }
  } catch (error) {
    console.error('Embed message failed:', error.message);
  }
  
  // Test 3: Get webhook info
  console.log('\n🧪 Test 3: Webhook information');
  try {
    const infoResponse = await fetch(webhookUrl, {
      method: 'GET'
    });
    
    console.log('Webhook info response:', {
      status: infoResponse.status,
      ok: infoResponse.ok
    });
    
    if (infoResponse.ok) {
      const webhookInfo = await infoResponse.json();
      console.log('Webhook details:', {
        id: webhookInfo.id,
        name: webhookInfo.name,
        channel_id: webhookInfo.channel_id,
        guild_id: webhookInfo.guild_id
      });
    } else {
      const errorText = await infoResponse.text();
      console.error('Webhook info error:', errorText);
    }
  } catch (error) {
    console.error('Webhook info failed:', error.message);
  }
  
  console.log('\n✅ Validation complete! Check Discord channel for messages.');
  console.log('💡 If you see HTTP 204 responses but no Discord messages:');
  console.log('   - Check if the webhook is in the correct Discord channel');
  console.log('   - Verify the Discord server/channel permissions');
  console.log('   - Check if Discord notifications are enabled for that channel');
}

// Run validation
validateDiscordWebhook();
