import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize the Supabase admin client with service role key for server-side operations
// This client has admin privileges and should only be used in secure server contexts

let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    );
  }

  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _supabaseAdmin;
}

// Lazy-initialized admin client — crashes at call time if env vars are missing, not at import time
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdmin() as any)[prop];
  },
});

// Export a function to validate environment variables at runtime
export const validateSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  if (!key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  return { supabaseUrl: url, supabaseServiceKey: key };
};

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
