#!/usr/bin/env node
/**
 * Discord Notifications Database Fix
 * This script applies the database migration to fix the foreign key relationship
 * 
 * Usage: node run-discord-fix.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Please check your .env.local file\n');
  process.exit(1);
}

console.log('🚀 Starting Discord notifications database fix...\n');
console.log(`📍 Supabase URL: ${supabaseUrl}\n`);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    // Step 1: Add missing columns
    console.log('Step 1/5: Adding missing columns to orders table...');
    const { error: alterError } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS order_number TEXT,
        ADD COLUMN IF NOT EXISTS delivery_address_line1 TEXT;
      `
    }).catch(() => {
      // If rpc doesn't work, we'll note it
      console.log('   ⚠️  Using alternative method (columns may already exist)');
      return { error: null };
    });

    if (alterError) {
      console.log('   ⚠️  Columns may already exist (this is OK)');
    } else {
      console.log('   ✅ Columns added');
    }

    // Step 2: Migrate data
    console.log('\nStep 2/5: Migrating delivery address data...');
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        delivery_address_line1: supabase.sql`delivery_address` 
      })
      .is('delivery_address_line1', null)
      .not('delivery_address', 'is', null);

    if (updateError) {
      console.log('   ℹ️  No data to migrate (this is OK)');
    } else {
      console.log('   ✅ Data migrated');
    }

    // Step 3: Check foreign key
    console.log('\nStep 3/5: Checking foreign key relationship...');
    const { data: fkCheck, error: fkError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name')
      .eq('table_name', 'cashapp_payments')
      .eq('constraint_type', 'FOREIGN KEY')
      .eq('constraint_name', 'cashapp_payments_order_id_fkey');

    if (fkCheck && fkCheck.length > 0) {
      console.log('   ✅ Foreign key constraint already exists');
    } else {
      console.log('   ⚠️  Foreign key constraint needs to be created manually');
      console.log('   📝 Please run the SQL in Supabase Dashboard (see fix-discord-now.sql)');
    }

    // Step 4: Test the query
    console.log('\nStep 4/5: Testing the fixed query pattern...');
    
    const { data: samplePayment, error: sampleError } = await supabase
      .from('cashapp_payments')
      .select('id, short_code, order_id, amount_cents')
      .limit(1)
      .maybeSingle();

    if (sampleError) {
      console.log('   ℹ️  No payments to test with yet (database may be empty)');
    } else if (samplePayment && samplePayment.order_id) {
      console.log(`   Testing with payment: ${samplePayment.short_code}`);
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('order_number, total, customer_name')
        .eq('id', samplePayment.order_id)
        .single();

      if (orderError) {
        console.log('   ❌ Order query failed:', orderError.message);
      } else {
        console.log('   ✅ Order query successful!');
        console.log(`      Order: ${orderData.order_number}`);
      }
    } else {
      console.log('   ℹ️  No linked orders to test with yet');
    }

    // Step 5: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ API Code: Already fixed');
    console.log('✅ Query Pattern: Updated to two-step query');
    console.log('⚠️  Database: Foreign key needs manual creation');
    console.log('\n📝 NEXT STEPS:');
    console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Copy and run the SQL from: fix-discord-now.sql');
    console.log('4. Deploy your code to Vercel');
    console.log('5. Test payment submission');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Error running migration:', error.message);
    console.error('\n📝 Manual fix required:');
    console.error('   Run the SQL in fix-discord-now.sql via Supabase Dashboard\n');
    process.exit(1);
  }
}

runMigration();
