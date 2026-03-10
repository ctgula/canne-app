import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';

// POST - Assign driver to order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const { driver_id, admin_user = 'admin' } = await request.json();

    if (!driver_id) {
      return NextResponse.json({ error: 'driver_id is required' }, { status: 400 });
    }

    // Verify driver exists
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('id, name, phone')
      .eq('id', driver_id)
      .single();

    if (driverError || !driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Get current order
    const { data: currentOrder, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError || !currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order with driver
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ 
        driver_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error assigning driver:', updateError);
      return NextResponse.json({ error: 'Failed to assign driver' }, { status: 500 });
    }

    // Log the assignment
    await supabase
      .from('order_status_events')
      .insert({
        order_id: id,
        old_status: currentOrder.status,
        new_status: currentOrder.status,
        note: `Driver assigned: ${driver.name} (${driver.phone})`,
        changed_by: admin_user
      });

    return NextResponse.json({ 
      success: true, 
      message: `Driver ${driver.name} assigned to order`,
      order: updatedOrder,
      driver
    });

  } catch (error) {
    console.error('Error in POST /api/admin/orders/[id]/assign-driver:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
