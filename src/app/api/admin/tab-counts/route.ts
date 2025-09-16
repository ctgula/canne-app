import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const statuses = [
      { key: 'pending', set: ['awaiting_payment', 'verifying', 'paid'] },
      { key: 'assigned', set: ['assigned'] },
      { key: 'delivered', set: ['delivered'] },
      { key: 'issue', set: ['undelivered', 'refunded', 'canceled'] },
    ] as const;

    const results = await Promise.all(
      statuses.map(s => supabase.from('orders').select('id', { count: 'exact', head: true }).in('status', s.set))
    );

    const counts = {
      pending: results[0].count || 0,
      assigned: results[1].count || 0,
      delivered: results[2].count || 0,
      issue: results[3].count || 0,
    };

    return NextResponse.json(counts);
  } catch (error) {
    console.error('tab-counts error', error);
    return NextResponse.json({ pending: 0, assigned: 0, delivered: 0, issue: 0 }, { status: 200 });
  }
}
