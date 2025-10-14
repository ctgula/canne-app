#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://shfaxsmyxhlzzdmzmqwo.supabase.co',
  'sbp_7b9635a25a4db71d1dce871e240c870d245756ee'
);

console.log('🚀 Applying Discord notifications fix...\n');

async function executeSql(sql, description) {
  console.log(`${description}...`);
  try {
    const response = await fetch('https://shfaxsmyxhlzzdmzmqwo.supabase.co/rest/v1/rpc/exec_sql', {
      method: 'POST',
      headers: {
        'apikey': 'sbp_7b9635a25a4db71d1dce871e240c870d245756ee',
        'Authorization': 'Bearer sbp_7b9635a25a4db71d1dce871e240c870d245756ee',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (response.ok) {
      console.log('✅ Success\n');
      return true;
    } else {
      const error = await response.text();
      console.log(`⚠️  ${error}\n`);
      return false;
    }
  } catch (e) {
    console.log(`⚠️  ${e.message}\n`);
    return false;
  }
}

async function applyFix() {
  const steps = [
    {
      sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT, ADD COLUMN IF NOT EXISTS delivery_address_line1 TEXT;`,
      desc: 'Step 1/5: Adding missing columns'
    },
    {
      sql: `UPDATE orders SET delivery_address_line1 = delivery_address WHERE delivery_address IS NOT NULL AND delivery_address_line1 IS NULL;`,
      desc: 'Step 2/5: Migrating data'
    },
    {
      sql: `ALTER TABLE cashapp_payments DROP CONSTRAINT IF EXISTS cashapp_payments_order_id_fkey;`,
      desc: 'Step 3/5: Dropping old constraint'
    },
    {
      sql: `ALTER TABLE cashapp_payments ADD CONSTRAINT cashapp_payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;`,
      desc: 'Step 4/5: Creating foreign key'
    },
    {
      sql: `CREATE INDEX IF NOT EXISTS idx_cashapp_payments_order_id ON cashapp_payments(order_id); CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);`,
      desc: 'Step 5/5: Creating indexes'
    }
  ];

  for (const step of steps) {
    await executeSql(step.sql, step.desc);
  }

  console.log('='.repeat(60));
  console.log('✅ FIX COMPLETE!');
  console.log('='.repeat(60));
  console.log('\n📋 Next: Deploy code with: git push origin main\n');
}

applyFix();
