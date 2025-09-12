import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

function makeShortCode() {
  const s = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${s}`;
}

export async function POST(req: Request) {
  try {
    console.log('Creating Cash App order...');
    
    // Create Supabase client with environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { amount_cents, customer_phone } = await req.json();
    const short_code = makeShortCode();
    
    console.log('Inserting order:', { short_code, amount_cents, customer_phone });

    const { data, error } = await supabase.from("cashapp_orders").insert({
      short_code, 
      amount_cents, 
      customer_phone, 
      status: "awaiting_payment"
    }).select();

    if (error) {
      console.error('Supabase error creating Cash App order:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    console.log('Cash App order created successfully:', data);
    return NextResponse.json({ short_code });
  } catch (error) {
    console.error('Error in Cash App order creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
