/**
 * Generate PDF tickets and send emails for migrated WP orders.
 * Run AFTER migration-output.sql has been loaded into Supabase.
 *
 * Usage:
 *   npx tsx scripts/send-migrated-tickets.ts [--dry-run]
 *
 * This script:
 * 1. Finds all orders with prefix "WP-" that have no PDF generated yet
 * 2. Generates PDF tickets for each order
 * 3. Sends confirmation emails with download links
 */

import path from 'path';
import dotenv from 'dotenv';

// Load env before importing services
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DRY_RUN = process.argv.includes('--dry-run');
const BATCH_SIZE = 5; // Process 5 orders at a time to avoid overload
const DELAY_MS = 2000; // 2 sec between batches (Resend rate limits)

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log(`\nGenerate tickets & send emails for migrated orders`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\n`);

  // 1. Find migrated orders without PDFs
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id, order_number, customer_email, customer_name, total_amount,
      order_items!inner(id, pdf_url)
    `)
    .like('order_number', 'WP-%')
    .eq('status', 'paid')
    .is('order_items.pdf_url', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch orders:', error.message);
    process.exit(1);
  }

  // Deduplicate (inner join can return duplicates)
  const uniqueOrders = [...new Map(orders!.map(o => [o.id, o])).values()];

  console.log(`Found ${uniqueOrders.length} orders to process\n`);

  if (uniqueOrders.length === 0) {
    console.log('Nothing to do. All migrated orders already have tickets.');
    return;
  }

  // 2. Dynamically import the order service (needs env loaded first)
  // We call processSuccessfulOrder which generates PDFs + sends email
  const { orderService } = await import('../server/src/services/order.js');

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  // 3. Process in batches
  for (let i = 0; i < uniqueOrders.length; i += BATCH_SIZE) {
    const batch = uniqueOrders.slice(i, i + BATCH_SIZE);

    for (const order of batch) {
      const label = `${order.order_number} | ${order.customer_name} <${order.customer_email}> | ${order.total_amount} MDL`;

      if (DRY_RUN) {
        console.log(`  [DRY] ${label}`);
        success++;
        continue;
      }

      try {
        await orderService.processSuccessfulOrder(order.id);
        console.log(`  OK ${label}`);
        success++;
      } catch (err: any) {
        console.error(`  FAIL ${label} — ${err.message}`);
        errors.push(`${order.order_number}: ${err.message}`);
        failed++;
      }
    }

    // Rate limit between batches (skip on last batch)
    if (!DRY_RUN && i + BATCH_SIZE < uniqueOrders.length) {
      console.log(`  ... waiting ${DELAY_MS / 1000}s ...\n`);
      await sleep(DELAY_MS);
    }
  }

  // 4. Summary
  console.log('\n' + '='.repeat(50));
  console.log(`DONE ${DRY_RUN ? '(DRY RUN)' : ''}`);
  console.log('='.repeat(50));
  console.log(`  Success: ${success}`);
  console.log(`  Failed:  ${failed}`);

  if (errors.length > 0) {
    console.log(`\n  Errors:`);
    errors.forEach(e => console.log(`  - ${e}`));
  }

  if (DRY_RUN) {
    console.log(`\nRun without --dry-run to actually generate and send.`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
