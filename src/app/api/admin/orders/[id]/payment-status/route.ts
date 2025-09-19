import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_PAYMENT_STATUSES = ['paid', 'unpaid'];

// PATCH - Update order payment status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const { payment_status: newPaymentStatus, reason, admin_user = 'admin' } = await request.json();

    // Validate payment status
    if (!VALID_PAYMENT_STATUSES.includes(newPaymentStatus)) {
      return NextResponse.json({ 
        error: `Invalid payment status. Must be one of: ${VALID_PAYMENT_STATUSES.join(', ')}` 
      }, { status: 400 });
    }

    // Get current order
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('id, payment_status, order_number')
      .eq('id', id)
      .single();

    if (fetchError || !currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const oldPaymentStatus = currentOrder.payment_status || 'unpaid';

    // Skip if payment status is the same (idempotent)
    if (oldPaymentStatus === newPaymentStatus) {
      return NextResponse.json({ 
        success: true, 
        message: 'Payment status unchanged',
        order: currentOrder 
      });
    }

    // Update order payment status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ 
        payment_status: newPaymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating payment status:', updateError);
      return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Payment status updated to ${newPaymentStatus}`,
      order: updatedOrder 
    });

  } catch (error) {
    console.error('Error in PATCH /api/admin/orders/[id]/payment-status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
