import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get single driver with assignments
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: driver, error } = await supabase
      .from('drivers')
      .select(`
        *,
        driver_assignments (
          id,
          order_id,
          status,
          assigned_at,
          completed_at,
          orders (
            order_number,
            total,
            customer_phone,
            delivery_address
          )
        )
      `)
      .eq('id', params.id)
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
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { name, phone, email, is_active } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: driver, error } = await supabase
      .from('drivers')
      .update(updateData)
      .eq('id', params.id)
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
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if driver has any active assignments
    const { data: activeAssignments } = await supabase
      .from('driver_assignments')
      .select('id')
      .eq('driver_id', params.id)
      .in('status', ['assigned', 'in_transit']);

    if (activeAssignments && activeAssignments.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete driver with active assignments' 
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', params.id);

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
