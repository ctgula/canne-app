import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: orders, error } = await supabase
      .from("cashapp_payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error('Error fetching Cash App orders:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error in Cash App orders fetch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
