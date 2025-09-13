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
    const { short_code } = await req.json();

    // Update order status to delivered
    const { error } = await supabase
      .from("cashapp_orders")
      .update({ status: "delivered" })
      .eq("short_code", short_code);

    if (error) {
      console.error('Error completing order:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Note: Payout remains in "queued" status until manually paid
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in order completion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
