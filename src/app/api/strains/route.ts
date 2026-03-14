import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('strains')
    .select('id, name, type, description, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch strains' }, { status: 500 });
  }

  return NextResponse.json({ strains: data || [] });
}
