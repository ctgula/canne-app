-- Enable RLS (Row Level Security) on all tables to block client-side inserts by default
-- This ensures only server-side operations with service role key can insert data

-- Enable RLS on customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Enable RLS on orders table  
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Enable RLS on order_items table
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Enable RLS on products table (if not already enabled)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "customers_insert_policy" ON public.customers;
DROP POLICY IF EXISTS "orders_insert_policy" ON public.orders;
DROP POLICY IF EXISTS "order_items_insert_policy" ON public.order_items;
DROP POLICY IF EXISTS "products_select_policy" ON public.products;

-- Create restrictive policies that block client-side inserts by default

-- Customers: Block all client-side operations (only server-side with service role can insert)
CREATE POLICY "customers_insert_policy" ON public.customers
  FOR INSERT WITH CHECK (false);

CREATE POLICY "customers_select_policy" ON public.customers
  FOR SELECT USING (false);

CREATE POLICY "customers_update_policy" ON public.customers
  FOR UPDATE USING (false);

CREATE POLICY "customers_delete_policy" ON public.customers
  FOR DELETE USING (false);

-- Orders: Block all client-side operations (only server-side with service role can insert)
CREATE POLICY "orders_insert_policy" ON public.orders
  FOR INSERT WITH CHECK (false);

CREATE POLICY "orders_select_policy" ON public.orders
  FOR SELECT USING (false);

CREATE POLICY "orders_update_policy" ON public.orders
  FOR UPDATE USING (false);

CREATE POLICY "orders_delete_policy" ON public.orders
  FOR DELETE USING (false);

-- Order Items: Block all client-side operations (only server-side with service role can insert)
CREATE POLICY "order_items_insert_policy" ON public.order_items
  FOR INSERT WITH CHECK (false);

CREATE POLICY "order_items_select_policy" ON public.order_items
  FOR SELECT USING (false);

CREATE POLICY "order_items_update_policy" ON public.order_items
  FOR UPDATE USING (false);

CREATE POLICY "order_items_delete_policy" ON public.order_items
  FOR DELETE USING (false);

-- Products: Allow read-only access for clients (they need to see products)
CREATE POLICY "products_select_policy" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "products_insert_policy" ON public.products
  FOR INSERT WITH CHECK (false);

CREATE POLICY "products_update_policy" ON public.products
  FOR UPDATE USING (false);

CREATE POLICY "products_delete_policy" ON public.products
  FOR DELETE USING (false);

-- Verify RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Enabled' 
    ELSE '❌ RLS Disabled' 
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('customers', 'orders', 'order_items', 'products')
ORDER BY tablename;

-- Show all policies for verification
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as command,
  CASE 
    WHEN cmd = 'r' THEN 'SELECT'
    WHEN cmd = 'w' THEN 'UPDATE'
    WHEN cmd = 'a' THEN 'INSERT'
    WHEN cmd = 'd' THEN 'DELETE'
    WHEN cmd = '*' THEN 'ALL'
    ELSE cmd
  END as operation,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('customers', 'orders', 'order_items', 'products')
ORDER BY tablename, policyname;
