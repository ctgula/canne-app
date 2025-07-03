import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase admin client with service role key for server-side operations
// This client has admin privileges and should only be used in secure server contexts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.warn('Supabase Service Role Key is missing. Please check your environment variables.');
}

// Create the Supabase admin client with service role key, but make it optional for builds
export let supabaseAdmin: ReturnType<typeof createClient>;

// Only create the client if we have both URL and key
if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
} else {
  // Create a mock client for build time that won't actually make API calls
  // This prevents build failures when environment variables are not available
  supabaseAdmin = {
    from: () => ({
      select: () => ({
        eq: () => ({ single: () => ({ data: null, error: null }) }),
        single: () => ({ data: null, error: null })
      }),
      insert: () => ({
        select: () => ({
          single: () => ({ data: null, error: null })
        })
      }),
      upsert: () => ({
        select: () => ({
          single: () => ({ data: null, error: null })
        })
      })
    })
  } as any; // Type assertion to match the expected interface
}

// Helper functions for common admin operations

/**
 * Get a user by their ID
 */
export async function getUserById(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Create or update a user's profile
 */
export async function upsertProfile(profile: any) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert(profile)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Get all products
 */
export async function getAllProducts() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('price');
  
  if (error) throw error;
  return data;
}

/**
 * Get a product by tier
 */
export async function getProductByTier(tier: string) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('tier', tier)
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Create a new order
 */
export async function createOrder(order: any) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert(order)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Add items to an order
 */
export async function addOrderItems(items: any[]) {
  const { data, error } = await supabaseAdmin
    .from('order_items')
    .insert(items)
    .select();
  
  if (error) throw error;
  return data;
}

/**
 * Get orders for a user
 */
export async function getUserOrders(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
