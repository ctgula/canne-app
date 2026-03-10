import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Mark all queued payouts for a driver as paid (batch payout)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Verify driver exists
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('id, name')
      .eq('id', id)
      .single();

    if (driverError || !driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Get all queued payouts for this driver
    const { data: queuedPayouts, error: fetchError } = await supabase
      .from('payouts')
      .select('id, amount_cents')
      .eq('driver_id', id)
      .eq('status', 'queued');

    if (fetchError) {
      console.error('Error fetching queued payouts:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 });
    }

    if (!queuedPayouts || queuedPayouts.length === 0) {
      return NextResponse.json({ error: 'No queued payouts for this driver' }, { status: 400 });
    }

    const totalCents = queuedPayouts.reduce((sum, p) => sum + p.amount_cents, 0);

    // Mark all queued payouts as paid
    const { error: updateError } = await supabase
      .from('payouts')
      .update({ 
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('driver_id', id)
      .eq('status', 'queued');

    if (updateError) {
      console.error('Error marking payouts as paid:', updateError);
      return NextResponse.json({ error: 'Failed to process payouts' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      payouts_processed: queuedPayouts.length,
      total_paid_cents: totalCents,
      message: `Payout of $${(totalCents / 100).toFixed(2)} processed for ${driver.name} (${queuedPayouts.length} orders)`
    });
  } catch (error) {
    console.error('Error in POST /api/admin/drivers/[id]/payout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
