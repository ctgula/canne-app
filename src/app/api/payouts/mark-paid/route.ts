import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    const { payout_id } = await request.json();
    
    if (!payout_id) {
      return Response.json({ error: 'Payout ID is required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Update the payout status to 'paid' and set paid_at timestamp
    const { error } = await supabase
      .from('payouts')
      .update({ 
        status: 'paid',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', payout_id);

    if (error) {
      console.error('Error updating payout:', error);
      return Response.json({ error: 'Failed to mark payout as paid' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in mark-paid payout route:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
