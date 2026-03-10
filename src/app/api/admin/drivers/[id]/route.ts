import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';

// GET - Get single driver with assignments
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data: driver, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching driver:', error);
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json({ driver });
  } catch (error) {
    console.error('Error in GET /api/admin/drivers/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update driver
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, phone, email, vehicle_info, status } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (vehicle_info !== undefined) updateData.vehicle_info = vehicle_info;
    if (status !== undefined) updateData.status = status;

    const { data: driver, error } = await supabase
      .from('drivers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating driver:', error);
      return NextResponse.json({ error: 'Failed to update driver' }, { status: 500 });
    }

    return NextResponse.json({ driver });
  } catch (error) {
    console.error('Error in PATCH /api/admin/drivers/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete driver
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Check if driver has any active orders
    const { data: activeOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('driver_id', id)
      .not('status', 'in', '(delivered,cancelled,canceled,refunded)');

    if (activeOrders && activeOrders.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete driver with active orders' 
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting driver:', error);
      return NextResponse.json({ error: 'Failed to delete driver' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/drivers/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
