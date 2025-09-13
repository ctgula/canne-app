import { createClient } from '@supabase/supabase-js';
import { notifyOrderStatusChange } from '@/lib/notifications';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Find orders stuck in awaiting_payment for more than 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { data: stuckOrders, error: fetchError } = await supabase
      .from('cashapp_orders')
      .select('*')
      .eq('status', 'awaiting_payment')
      .lt('created_at', fifteenMinutesAgo);

    if (fetchError) {
      console.error('Error fetching stuck orders:', fetchError);
      return Response.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    if (!stuckOrders || stuckOrders.length === 0) {
      return Response.json({ message: 'No orders to cancel', cancelled: 0 });
    }

    let cancelledCount = 0;

    // Cancel each stuck order
    for (const order of stuckOrders) {
      const { error: updateError } = await supabase
        .from('cashapp_orders')
        .update({ 
          status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (updateError) {
        console.error(`Error cancelling order ${order.short_code}:`, updateError);
        continue;
      }

      // Send refund notification
      try {
        await notifyOrderStatusChange.refunded(
          {
            phone: order.customer_phone,
            email: order.customer_email,
            name: order.customer_name
          },
          {
            shortCode: order.short_code,
            amount: order.amount_cents,
            address: order.delivery_address
          }
        );
      } catch (notificationError) {
        console.error(`Failed to send cancellation notification for ${order.short_code}:`, notificationError);
        // Don't fail the cancellation if notification fails
      }

      cancelledCount++;
    }

    return Response.json({ 
      message: `Cancelled ${cancelledCount} stuck orders`, 
      cancelled: cancelledCount 
    });
  } catch (error) {
    console.error('Error in auto-cancel route:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
