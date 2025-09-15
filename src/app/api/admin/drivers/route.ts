import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - List all drivers with assignments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const active = searchParams.get('active');

    let query = supabase
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
      `);

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (active !== null) {
      query = query.eq('is_active', active === 'true');
    }

    const { data: drivers, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching drivers:', error);
      return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 });
    }

    return NextResponse.json({ drivers });
  } catch (error) {
    console.error('Error in GET /api/admin/drivers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new driver
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email } = body;

    if (!name || !phone || !email) {
      return NextResponse.json({ error: 'Name, phone, and email are required' }, { status: 400 });
    }

    // Check if driver with this phone or email already exists
    const { data: existingDriver } = await supabase
      .from('drivers')
      .select('id')
      .or(`phone.eq.${phone},email.eq.${email}`)
      .single();

    if (existingDriver) {
      return NextResponse.json({ error: 'Driver with this phone or email already exists' }, { status: 409 });
    }

    const { data: driver, error } = await supabase
      .from('drivers')
      .insert({
        name,
        phone,
        email,
        is_active: true,
        balance_cents: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating driver:', error);
      return NextResponse.json({ error: 'Failed to create driver' }, { status: 500 });
    }

    return NextResponse.json({ driver }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/drivers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
