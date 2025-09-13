import { createClient } from '@supabase/supabase-js';
import { notifyOrderStatusChange } from '@/lib/notifications';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    const { short_code, driver_id } = await request.json();
    
    if (!short_code || !driver_id) {
      return Response.json({ error: 'Short code and driver ID are required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get order and driver details for notifications
    const { data: orderData, error: orderError } = await supabase
      .from('cashapp_orders')
      .select('*')
      .eq('short_code', short_code)
      .single();

    const { data: driverData, error: driverError } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', driver_id)
      .single();

    if (orderError || !orderData) {
      console.error('Error fetching order:', orderError);
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    if (driverError || !driverData) {
      console.error('Error fetching driver:', driverError);
      return Response.json({ error: 'Driver not found' }, { status: 404 });
    }
    
    // Update the order with driver assignment
    const { error: updateError } = await supabase
      .from('cashapp_orders')
      .update({ 
        status: 'assigned',
        driver_id: driver_id,
        updated_at: new Date().toISOString()
      })
      .eq('short_code', short_code);

    if (updateError) {
      console.error('Error updating order:', updateError);
      return Response.json({ error: 'Failed to assign driver' }, { status: 500 });
    }

    // Create payout record for the driver
    const basePayout = 1500; // $15.00 in cents
    const { error: payoutError } = await supabase
      .from('payouts')
      .insert({
        driver_id: driver_id,
        order_short_code: short_code,
        amount_cents: basePayout,
        status: 'queued',
        created_at: new Date().toISOString()
      });

    if (payoutError) {
      console.error('Error creating payout:', payoutError);
      // Don't fail the request if payout creation fails
    }

    // Trigger notifications
    try {
      // Notify customer: " [Driver Name] is your driver. ETA: 30-45 minutes"
      await notifyOrderStatusChange.assigned(
        {
          phone: orderData.customer_phone,
          email: orderData.customer_email,
          name: orderData.customer_name
        },
        {
          name: driverData.full_name,
          phone: driverData.phone,
          email: driverData.email
        },
        {
          shortCode: orderData.short_code,
          address: orderData.delivery_address,
          eta: "30-45 minutes"
        }
      );

      // Notify driver of new job
      const notificationService = await import('@/lib/notifications').then(m => m.notificationService);
      await notificationService.notifyNewJobAssigned(
        {
          name: driverData.full_name,
          phone: driverData.phone,
          email: driverData.email
        },
        {
          shortCode: orderData.short_code,
          address: orderData.delivery_address,
          customerName: orderData.customer_name
        }
      );
    } catch (notificationError) {
      console.error('Failed to send assignment notifications:', notificationError);
      // Don't fail the request if notifications fail
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in assign-driver route:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
