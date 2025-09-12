import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { short_code } = await req.json();

    const { error } = await supabase
      .from("cashapp_orders")
      .update({ status: "paid" })
      .eq("short_code", short_code);

    if (error) {
      console.error('Error marking Cash App order as paid:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in Cash App payment confirmation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
