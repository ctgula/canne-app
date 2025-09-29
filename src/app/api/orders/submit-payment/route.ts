import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { short_code, cashapp_handle, screenshot_url } = await req.json();

    const { error } = await supabase
      .from("cashapp_payments")
      .update({
        status: "verifying",
        cashtag: cashapp_handle,
        payment_note: screenshot_url
      })
      .eq("short_code", short_code);

    if (error) {
      console.error('Error updating Cash App order:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in Cash App payment submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
