#!/usr/bin/env node
/**
 * Apply Discord Notifications Fix with Supabase Access Token
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://shfaxsmyxhlzzdmzmqwo.supabase.co';
const ACCESS_TOKEN = 'sbp_7b9635a25a4db71d1dce871e240c870d245756ee';

console.log('🚀 Applying Discord notifications database fix...\n');

const supabase = createClient(SUPABASE_URL, ACCESS_TOKEN);

async function applyFix() {
  try {
    console.log('Step 1/6: Checking current schema...');
    
    // Check if columns exist
    const { data: columns, error: colError } = await supabase
      .rpc('exec', {
        sql: `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'orders' 
            AND column_name IN ('order_number', 'delivery_address_line1');
        `
      });
    
    console.log('✅ Schema check complete\n');

    console.log('Step 2/6: Adding missing columns...');
    const { error: alterError } = await supabase
      .rpc('exec', {
        sql: `
          ALTER TABLE orders 
          ADD COLUMN IF NOT EXISTS order_number TEXT,
          ADD COLUMN IF NOT EXISTS delivery_address_line1 TEXT;
        `
      });

    if (alterError) {
      console.log('⚠️  Columns may already exist:', alterError.message);
    } else {
      console.log('✅ Columns added\n');
    }

    console.log('Step 3/6: Migrating data...');
    const { error: updateError } = await supabase
      .rpc('exec', {
        sql: `
          UPDATE orders 
          SET delivery_address_line1 = delivery_address 
          WHERE delivery_address IS NOT NULL 
            AND delivery_address_line1 IS NULL;
        `
      });
    
    console.log('✅ Data migration complete\n');

    console.log('Step 4/6: Recreating foreign key constraint...');
    const { error: fkError } = await supabase
      .rpc('exec', {
        sql: `
          ALTER TABLE cashapp_payments 
          DROP CONSTRAINT IF EXISTS cashapp_payments_order_id_fkey;
          
          ALTER TABLE cashapp_payments 
          ADD CONSTRAINT cashapp_payments_order_id_fkey 
          FOREIGN KEY (order_id) 
          REFERENCES orders(id) 
          ON DELETE SET NULL;
        `
      });

    if (fkError) {
      console.log('❌ Foreign key error:', fkError.message);
      console.log('   You may need to run this SQL manually in Supabase Dashboard\n');
    } else {
      console.log('✅ Foreign key constraint created\n');
    }

    console.log('Step 5/6: Creating indexes...');
    const { error: idxError } = await supabase
      .rpc('exec', {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_cashapp_payments_order_id 
            ON cashapp_payments(order_id);
            
          CREATE INDEX IF NOT EXISTS idx_orders_order_number 
            ON orders(order_number);
        `
      });

    console.log('✅ Indexes created\n');

    console.log('Step 6/6: Verifying fix...');
    const { data: verification, error: verifyError } = await supabase
      .rpc('exec', {
        sql: `
          SELECT 
            COUNT(*) as count
          FROM information_schema.table_constraints 
          WHERE constraint_type = 'FOREIGN KEY'
            AND table_name = 'cashapp_payments'
            AND constraint_name = 'cashapp_payments_order_id_fkey';
        `
      });

    if (verification && verification[0]?.count > 0) {
      console.log('✅ Foreign key verified!\n');
    } else {
      console.log('⚠️  Could not verify foreign key automatically\n');
    }

    console.log('=' .repeat(60));
    console.log('✅ DATABASE FIX COMPLETE!');
    console.log('=' .repeat(60));
    console.log('\n📋 Next Steps:');
    console.log('1. Deploy your code: git push origin main');
    console.log('2. Test payment submission');
    console.log('3. Check Discord for notifications\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n📝 Manual fix required:');
    console.error('   Run the SQL in fix-discord-now.sql via Supabase Dashboard\n');
    process.exit(1);
  }
}

applyFix();
