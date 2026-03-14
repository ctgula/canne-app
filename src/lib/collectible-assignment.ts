import { supabaseAdmin } from './supabase-admin';

export interface AssignedPrint {
  id: string;
  title: string;
  slug: string;
  drop_number: number;
  edition_name: string | null;
  file_path: string;
  preview_path: string | null;
  rarity: string | null;
}

export interface AssignmentResult {
  success: boolean;
  alreadyAssigned: boolean;
  print: AssignedPrint | null;
  error?: string;
}

/**
 * Assign a random collectible print to an order.
 *
 * Rules:
 * - Idempotent: if the order already has an assigned print, returns it without re-rolling.
 * - Server-side only: never call from the client.
 * - Selects from all active prints with equal probability (extensible to weighted/rarity later).
 */
export async function assignRandomCollectibleToOrder(orderId: string): Promise<AssignmentResult> {
  try {
    // 1. Fetch the order and check current assignment
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, assigned_print_id, download_unlocked')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return { success: false, alreadyAssigned: false, print: null, error: 'Order not found' };
    }

    // 2. If already assigned, return the existing print (idempotent)
    if (order.assigned_print_id) {
      const { data: existingPrint } = await supabaseAdmin
        .from('collectible_prints')
        .select('id, title, slug, drop_number, edition_name, file_path, preview_path, rarity')
        .eq('id', order.assigned_print_id)
        .single();

      return {
        success: true,
        alreadyAssigned: true,
        print: existingPrint as AssignedPrint,
      };
    }

    // 3. Fetch all active prints
    const { data: activePrints, error: printsError } = await supabaseAdmin
      .from('collectible_prints')
      .select('id, title, slug, drop_number, edition_name, file_path, preview_path, rarity')
      .eq('is_active', true);

    if (printsError || !activePrints || activePrints.length === 0) {
      return { success: false, alreadyAssigned: false, print: null, error: 'No active prints available' };
    }

    // 4. Random selection (equal weight — extensible to weighted later)
    const randomIndex = Math.floor(Math.random() * activePrints.length);
    const selectedPrint = activePrints[randomIndex] as AssignedPrint;

    // 5. Atomically assign — use a conditional update to prevent races
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        assigned_print_id: selectedPrint.id,
        print_assigned_at: new Date().toISOString(),
        download_unlocked: true,
      })
      .eq('id', orderId)
      .is('assigned_print_id', null) // Only update if not yet assigned (race guard)
      .select('assigned_print_id')
      .single();

    if (updateError || !updated) {
      // Another process may have assigned concurrently — fetch what was assigned
      const { data: raceCheck } = await supabaseAdmin
        .from('orders')
        .select('assigned_print_id')
        .eq('id', orderId)
        .single();

      if (raceCheck?.assigned_print_id) {
        const { data: racePrint } = await supabaseAdmin
          .from('collectible_prints')
          .select('id, title, slug, drop_number, edition_name, file_path, preview_path, rarity')
          .eq('id', raceCheck.assigned_print_id)
          .single();

        return { success: true, alreadyAssigned: true, print: racePrint as AssignedPrint };
      }

      return { success: false, alreadyAssigned: false, print: null, error: 'Failed to assign print' };
    }

    return {
      success: true,
      alreadyAssigned: false,
      print: selectedPrint,
    };
  } catch (err) {
    console.error('collectible assignment error:', err);
    return { success: false, alreadyAssigned: false, print: null, error: 'Internal error' };
  }
}
