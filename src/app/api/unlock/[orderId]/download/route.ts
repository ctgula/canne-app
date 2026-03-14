import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getSignedDownloadUrl } from '@/lib/collectible-storage';

// POST — log a download and return a fresh signed URL
export async function POST(
  request: Request,
  { params }: any
) {
  const { orderId } = params;

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  try {
    // Validate order is unlocked
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, assigned_print_id, download_unlocked')
      .eq('id', orderId)
      .single();

    if (orderError || !order || !order.download_unlocked || !order.assigned_print_id) {
      return NextResponse.json({ error: 'Download not available' }, { status: 403 });
    }

    // Get the print file path
    const { data: print } = await supabaseAdmin
      .from('collectible_prints')
      .select('id, file_path')
      .eq('id', order.assigned_print_id)
      .single();

    if (!print) {
      return NextResponse.json({ error: 'Print not found' }, { status: 404 });
    }

    // Log the download
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
    const userAgent = request.headers.get('user-agent') || null;

    await supabaseAdmin
      .from('collectible_downloads')
      .insert({
        order_id: orderId,
        collectible_print_id: print.id,
        ip_address: ip,
        user_agent: userAgent,
      });

    // Generate fresh signed URL
    const downloadUrl = await getSignedDownloadUrl(print.file_path);

    if (!downloadUrl) {
      return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 });
    }

    return NextResponse.json({ success: true, download_url: downloadUrl });
  } catch (err) {
    console.error('Error in download route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
