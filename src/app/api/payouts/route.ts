import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: payouts, error } = await supabase
      .from('payouts')
      .select(`
        *,
        drivers!inner(full_name, phone, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payouts:', error);
      return Response.json({ error: 'Failed to fetch payouts' }, { status: 500 });
    }

    return Response.json({ payouts: payouts || [] });
  } catch (error) {
    console.error('Error in payouts route:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
