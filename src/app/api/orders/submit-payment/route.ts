import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { short_code, cashapp_handle, screenshot_url } = await req.json();

    const { error } = await supabase
      .from("cashapp_orders")
      .update({
        status: "verifying",
        cashapp_handle,
        payment_screenshot_url: screenshot_url
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
