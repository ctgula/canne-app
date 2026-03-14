import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getSignedDownloadUrl, getSignedPreviewUrl } from '@/lib/collectible-storage';

// GET — fetch the collectible print assigned to an order (for the unlock page)
export async function GET(
  _request: Request,
  { params }: any
) {
  const { orderId } = params;

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  try {
    // Fetch order with assigned print
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        payment_status,
        assigned_print_id,
        print_assigned_at,
        download_unlocked,
        full_name,
        created_at
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if payment is confirmed (status = paid, delivered, assigned, en_route)
    const paidStatuses = ['paid', 'assigned', 'en_route', 'delivered', 'completed'];
    const isPaid = paidStatuses.includes(order.status);

    if (!isPaid) {
      return NextResponse.json({
        success: true,
        unlocked: false,
        status: order.status,
        order_number: order.order_number,
        message: 'Your payment has not been confirmed yet.',
      });
    }

    // Check if print is assigned
    if (!order.assigned_print_id || !order.download_unlocked) {
      return NextResponse.json({
        success: true,
        unlocked: false,
        status: order.status,
        order_number: order.order_number,
        message: 'Your collectible is being prepared. Please refresh in a moment.',
      });
    }

    // Fetch the assigned print details
    const { data: print, error: printError } = await supabaseAdmin
      .from('collectible_prints')
      .select('id, title, slug, drop_number, edition_name, file_path, preview_path, rarity')
      .eq('id', order.assigned_print_id)
      .single();

    if (printError || !print) {
      return NextResponse.json({ error: 'Collectible print not found' }, { status: 404 });
    }

    // Generate signed URLs
    const downloadUrl = await getSignedDownloadUrl(print.file_path);
    const previewUrl = print.preview_path
      ? await getSignedPreviewUrl(print.preview_path)
      : await getSignedPreviewUrl(print.file_path);

    return NextResponse.json({
      success: true,
      unlocked: true,
      order_number: order.order_number,
      customer_name: order.full_name,
      assigned_at: order.print_assigned_at,
      print: {
        id: print.id,
        title: print.title,
        slug: print.slug,
        drop_number: print.drop_number,
        edition_name: print.edition_name,
        rarity: print.rarity,
        preview_url: previewUrl,
        download_url: downloadUrl,
      },
    });
  } catch (err) {
    console.error('Error in /api/unlock/[orderId]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
