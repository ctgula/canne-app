import { createClient } from '@supabase/supabase-js';
import { notifyOrderStatusChange } from '@/lib/notifications';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    const { short_code } = await request.json();
    
    if (!short_code) {
      return Response.json({ error: 'Short code is required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get order details for notification
    const { data: orderData, error: fetchError } = await supabase
      .from('cashapp_payments')
      .select('*')
      .eq('short_code', short_code)
      .single();

    if (fetchError || !orderData) {
      console.error('Error fetching order:', fetchError);
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Update the order status to 'refunded'
    const { error } = await supabase
      .from('cashapp_payments')
      .update({ 
        status: 'refunded',
        updated_at: new Date().toISOString()
      })
      .eq('short_code', short_code);

    if (error) {
      console.error('Error updating order:', error);
      return Response.json({ error: 'Failed to refund order' }, { status: 500 });
    }

    // If there's a driver assigned, remove the payout
    if (orderData.driver_id) {
      const { error: payoutError } = await supabase
        .from('payouts')
        .delete()
        .eq('order_short_code', short_code);

      if (payoutError) {
        console.error('Error removing payout:', payoutError);
        // Don't fail the request if payout removal fails
      }
    }

    // Trigger notification: Refund confirmation
    try {
      await notifyOrderStatusChange.refunded(
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
      console.error('Failed to send refund notification:', notificationError);
      // Don't fail the request if notification fails
    }
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in refund route:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
