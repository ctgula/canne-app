import { NextResponse } from "next/server";
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: Request, { params }: { params: Promise<{ shortCode: string }> }) {
  try {
    const resolvedParams = await params;
    const shortCode = resolvedParams.shortCode;

    const { data, error } = await supabaseAdmin
      .from("cashapp_payments")
      .select("id, short_code, amount_cents, status, order_id, created_at, expires_at")
      .eq("short_code", shortCode)
      .single();

    if (error) {
      console.error('Error fetching Cash App order:', error);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Cash App order fetch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
