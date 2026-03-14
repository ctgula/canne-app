import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const updates = await request.json();

  const allowed: Record<string, unknown> = {};
  if (updates.name !== undefined) allowed.name = updates.name.trim();
  if (updates.type !== undefined) allowed.type = updates.type;
  if (updates.description !== undefined) allowed.description = updates.description?.trim() || null;
  if (updates.is_active !== undefined) allowed.is_active = updates.is_active;
  if (updates.sort_order !== undefined) allowed.sort_order = updates.sort_order;
  allowed.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('strains')
    .update(allowed)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to update strain' }, { status: 500 });
  return NextResponse.json({ strain: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabase.from('strains').delete().eq('id', id);
  if (error) return NextResponse.json({ error: 'Failed to delete strain' }, { status: 500 });
  return NextResponse.json({ success: true });
}
