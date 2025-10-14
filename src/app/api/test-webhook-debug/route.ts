import { NextResponse } from 'next/server';

export async function GET() {
  const webhookUrl = process.env.DISCORD_WEBHOOK;
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    webhookConfigured: !!webhookUrl,
    webhookLength: webhookUrl?.length || 0,
    webhookPreview: webhookUrl ? `${webhookUrl.substring(0, 50)}...` : 'NOT SET',
    allEnvVars: Object.keys(process.env).filter(k => k.includes('DISCORD') || k.includes('WEBHOOK')),
  };

  console.log('🔍 Webhook Debug Info:', diagnostics);

  if (!webhookUrl) {
    return NextResponse.json({
      success: false,
      error: 'DISCORD_WEBHOOK not configured',
      diagnostics,
      solution: 'Add DISCORD_WEBHOOK environment variable in Vercel and redeploy'
    }, { status: 400 });
  }

  try {
    console.log('📤 Testing Discord webhook...');
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: '🧪 **Webhook Test from Vercel**',
        embeds: [{
          title: '✅ Discord Webhook Working!',
          description: 'Your webhook is properly configured and working on Vercel.',
          color: 0x00FF00,
          fields: [
            { name: 'Environment', value: process.env.VERCEL_ENV || 'development', inline: true },
            { name: 'Time', value: new Date().toLocaleString(), inline: true }
          ],
          timestamp: new Date().toISOString()
        }]
      })
    });

    const responseText = await response.text();
    
    console.log('📬 Discord Response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Discord webhook request failed',
        status: response.status,
        statusText: response.statusText,
        response: responseText,
        diagnostics
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: '✅ Discord webhook is working! Check your Discord channel.',
      status: response.status,
      diagnostics
    });

  } catch (error) {
    console.error('❌ Webhook test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Exception while testing webhook',
      details: error instanceof Error ? error.message : String(error),
      diagnostics
    }, { status: 500 });
  }
}
