import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { notifyOrderStatusChange } from '@/lib/notifications';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    const { short_code } = await request.json();
    
    if (!short_code) {
      return NextResponse.json({ error: 'Short code is required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get order details for notification
    const { data: orderData, error: fetchError } = await supabase
      .from('cashapp_orders')
      .select('*')
      .eq('short_code', short_code)
      .single();

    if (fetchError || !orderData) {
      console.error('Error fetching order:', fetchError);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Update the order status to 'delivered'
    const { error } = await supabase
      .from('cashapp_orders')
      .update({ 
        status: 'delivered',
        updated_at: new Date().toISOString()
      })
      .eq('short_code', short_code);

    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json({ error: 'Failed to complete order' }, { status: 500 });
    }

    // Trigger notification: "Delivered . Rate your drop."
    try {
      await notifyOrderStatusChange.delivered(
        {
          phone: orderData.customer_phone,
          email: orderData.customer_email,
          name: orderData.customer_name
        },
        {
          shortCode: orderData.short_code,
          amount: orderData.amount_cents,
          address: orderData.delivery_address
        }
      );
    } catch (notificationError) {
      console.error('Failed to send delivery notification:', notificationError);
      // Don't fail the request if notification fails
    }

    // Note: Payout remains 'queued' until manually paid by admin
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in complete route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
