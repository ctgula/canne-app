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
    const { short_code, driver_id } = await req.json();

    // First, get the order to calculate payout
    const { data: order, error: orderError } = await supabase
      .from("cashapp_orders")
      .select("id, amount_cents")
      .eq("short_code", short_code)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Calculate payout: $8 base + $4 per bundle (simplified to $8 base for now)
    const payoutAmount = 800; // $8 in cents

    // Update order status and assign driver
    const { error: updateError } = await supabase
      .from("cashapp_orders")
      .update({ 
        status: "assigned",
        driver_id 
      })
      .eq("short_code", short_code);

    if (updateError) {
      console.error('Error assigning driver to order:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Create payout record
    const { error: payoutError } = await supabase
      .from("payouts")
      .insert({
        driver_id,
        order_id: order.id,
        amount_cents: payoutAmount,
        status: "queued"
      });

    if (payoutError) {
      console.error('Error creating payout record:', payoutError);
      return NextResponse.json({ error: payoutError.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in driver assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
