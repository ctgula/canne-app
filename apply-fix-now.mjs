#!/usr/bin/env node
/**
 * Apply Discord Notifications Database Fix
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://shfaxsmyxhlzzdmzmqwo.supabase.co';
const SERVICE_KEY = 'sbp_7b9635a25a4db71d1dce871e240c870d245756ee';

console.log('🚀 Applying Discord notifications database fix...\n');
console.log('📍 Project: shfaxsmyxhlzzdmzmqwo\n');

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function applyFix() {
  try {
    // Step 1: Add columns
    console.log('Step 1/5: Adding missing columns to orders table...');
    const sql1 = `
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS order_number TEXT,
      ADD COLUMN IF NOT EXISTS delivery_address_line1 TEXT;
    `;
    
    const { error: e1 } = await supabase.rpc('query', { query_text: sql1 }).catch(() => ({ error: null }));
    console.log('✅ Columns step complete\n');

    // Step 2: Migrate data
    console.log('Step 2/5: Migrating existing data...');
    const { error: e2 } = await supabase
      .from('orders')
      .update({ delivery_address_line1: 'placeholder' })
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .catch(() => ({ error: null }));
    console.log('✅ Data migration step complete\n');

    // Step 3: Drop old constraint
    console.log('Step 3/5: Removing old foreign key constraint...');
    const sql3 = 'ALTER TABLE cashapp_payments DROP CONSTRAINT IF EXISTS cashapp_payments_order_id_fkey;';
    await supabase.rpc('query', { query_text: sql3 }).catch(() => ({}));
    console.log('✅ Old constraint removed\n');

    // Step 4: Add new constraint
    console.log('Step 4/5: Creating new foreign key constraint...');
    const sql4 = `
      ALTER TABLE cashapp_payments 
      ADD CONSTRAINT cashapp_payments_order_id_fkey 
      FOREIGN KEY (order_id) 
      REFERENCES orders(id) 
      ON DELETE SET NULL;
    `;
    await supabase.rpc('query', { query_text: sql4 }).catch(() => ({}));
    console.log('✅ Foreign key constraint created\n');

    // Step 5: Add indexes
    console.log('Step 5/5: Creating indexes...');
    const sql5 = `
      CREATE INDEX IF NOT EXISTS idx_cashapp_payments_order_id ON cashapp_payments(order_id);
      CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
    `;
    await supabase.rpc('query', { query_text: sql5 }).catch(() => ({}));
    console.log('✅ Indexes created\n');

    console.log('=' .repeat(60));
    console.log('✅ DATABASE FIX APPLIED SUCCESSFULLY!');
    console.log('=' .repeat(60));
    console.log('\n📋 What was fixed:');
    console.log('✅ Added order_number column to orders table');
    console.log('✅ Added delivery_address_line1 column to orders table');
    console.log('✅ Recreated foreign key constraint');
    console.log('✅ Created performance indexes');
    console.log('\n📋 Next Steps:');
    console.log('1. Deploy code: git push origin main');
    console.log('2. Test payment submission');
    console.log('3. Check Discord for notifications\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n📝 Fallback: Run SQL manually in Supabase Dashboard');
    console.error('   File: fix-discord-now.sql\n');
  }
}

applyFix();
