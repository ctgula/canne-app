import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Process driver payout
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { amount_cents } = body;

    if (!amount_cents || amount_cents <= 0) {
      return NextResponse.json({ error: 'Valid payout amount is required' }, { status: 400 });
    }

    // Get current driver balance
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('balance_cents, name')
      .eq('id', id)
      .single();

    if (driverError || !driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    if (driver.balance_cents < amount_cents) {
      return NextResponse.json({ error: 'Insufficient balance for payout' }, { status: 400 });
    }

    // Start transaction
    const { data: payout, error: payoutError } = await supabase
      .from('driver_payouts')
      .insert({
        driver_id: id,
        amount_cents,
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (payoutError) {
      console.error('Error creating payout record:', payoutError);
      return NextResponse.json({ error: 'Failed to create payout record' }, { status: 500 });
    }

    // Update driver balance
    const { error: updateError } = await supabase
      .from('drivers')
      .update({ 
        balance_cents: driver.balance_cents - amount_cents,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating driver balance:', updateError);
      // Rollback payout record
      await supabase.from('driver_payouts').delete().eq('id', payout.id);
      return NextResponse.json({ error: 'Failed to update driver balance' }, { status: 500 });
    }

    // Log the payout for audit trail
    await supabase.from('admin_audit_log').insert({
      action: 'driver_payout',
      resource_type: 'driver',
      resource_id: id,
      details: {
        driver_name: driver.name,
        payout_amount: amount_cents,
        payout_id: payout.id
      },
      created_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      payout,
      message: `Payout of $${(amount_cents / 100).toFixed(2)} processed successfully`
    });
  } catch (error) {
    console.error('Error in POST /api/admin/drivers/[id]/payout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
