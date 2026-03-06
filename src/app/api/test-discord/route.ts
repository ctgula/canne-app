import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';

export async function GET() {
  // Block in production — test routes must not be publicly accessible
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const discordWebhook = process.env.DISCORD_WEBHOOK;
    
    const debugInfo = {
      webhookExists: !!discordWebhook,
      webhookLength: discordWebhook?.length || 0,
      webhookStart: discordWebhook?.substring(0, 50) || 'undefined',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };
    
    if (!discordWebhook) {
      return NextResponse.json({
        success: false,
        error: 'DISCORD_WEBHOOK environment variable not found',
        debug: debugInfo
      }, { status: 400 });
    }
    
    // Test Discord webhook with a simple message
    const testEmbed = {
      title: "🧪 Discord Webhook Test",
      description: "This is a test message from the Cannè app to verify Discord webhook functionality.",
      color: 0x8B5CF6,
      timestamp: new Date().toISOString(),
      footer: {
        text: "Cannè Test System",
        icon_url: "https://raw.githubusercontent.com/twemoji/twemoji/master/assets/72x72/1f33f.png"
      },
      fields: [
        {
          name: "Environment",
          value: process.env.NODE_ENV || 'unknown',
          inline: true
        },
        {
          name: "Timestamp",
          value: new Date().toLocaleString(),
          inline: true
        }
      ]
    };
    
    console.log('📤 Sending test Discord notification...');

    // Add timeout and UA for robustness
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const discordResponse = await fetch(discordWebhook, {
      method: "POST",
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Canne-Test-Webhook/1.0'
      },
      body: JSON.stringify({
        username: "Cannè Test Bot",
        avatar_url: "https://raw.githubusercontent.com/twemoji/twemoji/master/assets/72x72/1f9ea.png",
        embeds: [testEmbed]
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    const responseText = await discordResponse.text();
    
    console.log('📬 Discord webhook test response:', {
      status: discordResponse.status,
      statusText: discordResponse.statusText,
      ok: discordResponse.ok,
      responseText: responseText.substring(0, 200)
    });
    
    if (!discordResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'Discord webhook request failed',
        status: discordResponse.status,
        statusText: discordResponse.statusText,
        response: responseText,
        debug: debugInfo
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Discord webhook test successful!',
      status: discordResponse.status,
      debug: debugInfo
    });
    
  } catch (error) {
    console.error('❌ Discord webhook test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Discord webhook test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ 
    error: 'Method not allowed. Use GET to test Discord webhook.' 
  }, { status: 405 });
}
