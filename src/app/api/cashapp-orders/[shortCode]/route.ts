import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request, { params }: { params: Promise<{ shortCode: string }> }) {
  try {
    const resolvedParams = await params;
    const shortCode = resolvedParams.shortCode;
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("cashapp_payments")
      .select("*")
      .eq("short_code", shortCode)
      .single();

    if (error) {
      console.error('Error fetching Cash App order:', error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Cash App order fetch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
