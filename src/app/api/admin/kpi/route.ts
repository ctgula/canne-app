import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get today's date for filtering
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Fetch revenue (sum of totals for delivered orders)
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total')
      .eq('status', 'delivered')
      .gte('created_at', startOfDay.toISOString());
    
    const revenue = (revenueData || []).reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Count total orders today
    const { count: ordersCount } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfDay.toISOString());
    
    // Count pending orders (awaiting_payment, verifying, paid)
    const { count: pendingCount } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['awaiting_payment', 'verifying', 'paid']);
    
    // Simple P90 approximation (orders older than 90% of completion times)
    // For now, return null - can be enhanced with actual delivery time analysis
    const p90 = null;
    
    return NextResponse.json({
      revenue: Math.round(revenue * 100), // Convert to cents
      orders: ordersCount || 0,
      pending: pendingCount || 0,
      p90,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('KPI fetch error:', error);
    return NextResponse.json({
      revenue: 0,
      orders: 0,
      pending: 0,
      p90: null,
      lastUpdated: new Date()
    });
  }
}
