import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';

export async function GET() {
  try {
    // Get orders from last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    const { count } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', fifteenMinutesAgo.toISOString());
    
    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error('ASAP count error:', error);
    return NextResponse.json({ count: 0 });
  }
}
