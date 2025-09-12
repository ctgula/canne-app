import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function makeShortCode() {
  const s = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${s}`;
}

export async function POST(req: Request) {
  try {
    const { amount_cents, customer_phone } = await req.json();
    const short_code = makeShortCode();

    const { error } = await supabase.from("cashapp_orders").insert({
      short_code, 
      amount_cents, 
      customer_phone, 
      status: "awaiting_payment"
    });

    if (error) {
      console.error('Error creating Cash App order:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ short_code });
  } catch (error) {
    console.error('Error in Cash App order creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
