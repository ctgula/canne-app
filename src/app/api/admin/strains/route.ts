import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';

export async function GET() {
  const { data, error } = await supabase
    .from('strains')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) return NextResponse.json({ error: 'Failed to fetch strains' }, { status: 500 });
  return NextResponse.json({ strains: data || [] });
}

export async function POST(request: NextRequest) {
  const { name, type, description, sort_order } = await request.json();
  if (!name || !type) return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });

  const { data, error } = await supabase
    .from('strains')
    .insert({ name: name.trim(), type, description: description?.trim() || null, sort_order: sort_order ?? 99 })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to create strain' }, { status: 500 });
  }
  return NextResponse.json({ strain: data });
}
