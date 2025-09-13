import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { notifyOrderStatusChange } from '@/lib/notifications';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Valid status transitions
const validTransitions: Record<string, string[]> = {
  'pending': ['awaiting_payment', 'verifying'],
  'awaiting_payment': ['pending', 'verifying', 'paid'],
  'verifying': ['awaiting_payment', 'paid', 'refunded'],
  'paid': ['verifying', 'assigned', 'refunded'],
  'assigned': ['paid', 'delivered', 'refunded'],
  'delivered': ['assigned', 'refunded'],
  'refunded': ['verifying', 'paid']
};

export async function POST(request: Request) {
  try {
    const { short_code, new_status, reason } = await request.json();
    
    if (!short_code || !new_status) {
      return NextResponse.json({ error: 'Short code and new status are required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get current order details
    const { data: orderData, error: fetchError } = await supabase
      .from('cashapp_orders')
      .select('*')
      .eq('short_code', short_code)
      .single();

    if (fetchError || !orderData) {
      console.error('Error fetching order:', fetchError);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const currentStatus = orderData.status;

    // Check if transition is valid
    if (!validTransitions[currentStatus]?.includes(new_status)) {
      return NextResponse.json({ 
        error: `Invalid status transition from ${currentStatus} to ${new_status}` 
      }, { status: 400 });
    }

    // Update the order status
    const { error: updateError } = await supabase
      .from('cashapp_orders')
      .update({ 
        status: new_status,
        updated_at: new Date().toISOString(),
        // Add optional reason/notes field if needed
        ...(reason && { admin_notes: reason })
      })
      .eq('short_code', short_code);

    if (updateError) {
      console.error('Error updating order status:', updateError);
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }

    // Handle special status changes
    try {
      switch (new_status) {
        case 'paid':
          await notifyOrderStatusChange.paid(
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
          break;
        
        case 'delivered':
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
          break;
        
        case 'assigned':
          // If changing back to assigned, we might need driver info
          if (orderData.driver_id) {
            const { data: driverData } = await supabase
              .from('drivers')
              .select('*')
              .eq('id', orderData.driver_id)
              .single();
            
            if (driverData) {
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
            }
          }
          break;
        
        case 'refunded':
          // Handle refund notifications if needed
          break;
      }
    } catch (notificationError) {
      console.error('Failed to send status change notification:', notificationError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({ 
      success: true, 
      message: `Order status changed from ${currentStatus} to ${new_status}`,
      previous_status: currentStatus,
      new_status: new_status
    });
  } catch (error) {
    console.error('Error in change-status route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
