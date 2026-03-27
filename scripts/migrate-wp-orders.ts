/**
 * Migration script: WordPress/WooCommerce → Supabase
 * Generates SQL file for manual import into Supabase SQL Editor.
 *
 * Usage:
 *   npx tsx scripts/migrate-wp-orders.ts
 *
 * Output:
 *   scripts/migration-output.sql — load this into Supabase SQL Editor
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SQL_FILE = path.resolve(__dirname, '../u106493613_tikcets_fl.sql');
const OUTPUT_FILE = path.resolve(__dirname, 'migration-output.sql');
const CUTOFF_DATE = '2025-09-05';

// Mapping WooCommerce product names → new ticket names in Supabase
const PRODUCT_NAME_MAP: Record<string, string> = {
  'Day Pass': 'dayPass',
  'Weekend Pass': 'weekendPass',
  'Camping Pass': 'campingPass',
  'Family Day Pass': 'familyDayPass',
  'Family Weekend Pass': 'familyWeekendPass',
  'Family Camping Pass': 'familyCampingPass',
};

interface WcOrder {
  id: number;
  status: string;
  totalAmount: number;
  billingEmail: string;
  dateCreated: string;
  paymentMethod: string;
  transactionId: string | null;
}

interface WcAddress {
  orderId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface WcItem {
  orderItemId: number;
  productName: string;
  orderId: number;
}

// ────────────────────────────────────────────
// SQL PARSING
// ────────────────────────────────────────────

function extractInserts(sql: string, tableName: string): string {
  const lines = sql.split('\n');
  const result: string[] = [];
  let collecting = false;

  for (const line of lines) {
    if (line.startsWith(`INSERT INTO \`${tableName}\``)) {
      collecting = true;
    }
    if (collecting) {
      result.push(line);
      if (line.trimEnd().endsWith(';')) {
        collecting = false;
      }
    }
  }

  return result.join('\n');
}

function parseValues(insertBlock: string): string[][] {
  const rows: string[][] = [];
  const rowRegex = /\(([^)]+)\)/g;
  let match;
  while ((match = rowRegex.exec(insertBlock)) !== null) {
    const raw = match[1];
    const values: string[] = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';

    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];
      if (inQuote) {
        if (ch === '\\' && i + 1 < raw.length) {
          current += raw[i + 1];
          i++;
        } else if (ch === quoteChar) {
          inQuote = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '\'' || ch === '"') {
          inQuote = true;
          quoteChar = ch;
        } else if (ch === ',') {
          values.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
    }
    values.push(current.trim());
    rows.push(values);
  }
  return rows;
}

// ────────────────────────────────────────────
// DATA EXTRACTION
// ────────────────────────────────────────────

function extractOrders(sql: string): WcOrder[] {
  const block = extractInserts(sql, 'wp_wc_orders');
  const rows = parseValues(block);
  const orders: WcOrder[] = [];

  for (const r of rows) {
    const id = parseInt(r[0]);
    const status = r[1];
    const totalAmount = parseFloat(r[5]);
    const billingEmail = r[7];
    const dateCreated = r[8];
    const paymentMethod = r[11];
    const transactionId = r[13] === 'NULL' ? null : r[13];

    const isPaid = ['wc-processing', 'wc-completed', 'wc-validated'].includes(status);
    const isAfterCutoff = dateCreated >= CUTOFF_DATE;

    if (isPaid && isAfterCutoff) {
      orders.push({ id, status, totalAmount, billingEmail, dateCreated, paymentMethod, transactionId });
    }
  }

  return orders;
}

function extractAddresses(sql: string): Map<number, WcAddress> {
  const block = extractInserts(sql, 'wp_wc_order_addresses');
  const rows = parseValues(block);
  const map = new Map<number, WcAddress>();

  for (const r of rows) {
    const addressType = r[2];
    if (addressType !== 'billing') continue;

    const orderId = parseInt(r[1]);
    map.set(orderId, {
      orderId,
      firstName: r[3] === 'NULL' ? '' : r[3],
      lastName: r[4] === 'NULL' ? '' : r[4],
      email: r[12] === 'NULL' ? '' : r[12],
      phone: r[13] === 'NULL' ? '' : r[13],
    });
  }

  return map;
}

function extractOrderItems(sql: string): WcItem[] {
  const block = extractInserts(sql, 'wp_woocommerce_order_items');
  const rows = parseValues(block);
  const items: WcItem[] = [];

  for (const r of rows) {
    const orderItemType = r[2];
    if (orderItemType !== 'line_item') continue;

    items.push({
      orderItemId: parseInt(r[0]),
      productName: r[1],
      orderId: parseInt(r[3]),
    });
  }

  return items;
}

function extractOrderItemMeta(sql: string, relevantItemIds: Set<number>): Map<number, { qty: number; lineTotal: number }> {
  const block = extractInserts(sql, 'wp_woocommerce_order_itemmeta');
  const rows = parseValues(block);
  const map = new Map<number, { qty: number; lineTotal: number }>();

  for (const r of rows) {
    const orderItemId = parseInt(r[1]);
    const metaKey = r[2];
    const metaValue = r[3];

    if (!relevantItemIds.has(orderItemId)) continue;
    if (metaKey !== '_qty' && metaKey !== '_line_total') continue;

    if (!map.has(orderItemId)) {
      map.set(orderItemId, { qty: 1, lineTotal: 0 });
    }

    const entry = map.get(orderItemId)!;
    if (metaKey === '_qty') entry.qty = parseInt(metaValue) || 1;
    if (metaKey === '_line_total') entry.lineTotal = parseFloat(metaValue) || 0;
  }

  return map;
}

// ────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────

function generateOrderNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'WP-';
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generateTicketCode(): string {
  return `FL26-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
}

function generateQrData(ticketCode: string): string {
  return JSON.stringify({
    code: ticketCode,
    event: 'Festivalul Lupilor 2026',
    version: 2,
  });
}

function escSql(val: string): string {
  return val.replace(/'/g, "''");
}

// ────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────

async function main() {
  console.log(`\nWooCommerce -> Supabase SQL Generator`);
  console.log(`   SQL file: ${SQL_FILE}`);
  console.log(`   Output:   ${OUTPUT_FILE}`);
  console.log(`   Cutoff:   ${CUTOFF_DATE}\n`);

  // 1. Read SQL dump
  console.log('Reading SQL dump...');
  const sql = fs.readFileSync(SQL_FILE, 'utf-8');
  console.log(`   ${(sql.length / 1024 / 1024).toFixed(1)} MB\n`);

  // 2. Parse tables
  console.log('Parsing WooCommerce tables...');
  const orders = extractOrders(sql);
  console.log(`   Orders (paid, from ${CUTOFF_DATE}): ${orders.length}`);

  const addresses = extractAddresses(sql);
  console.log(`   Billing addresses: ${addresses.size}`);

  const allItems = extractOrderItems(sql);
  const paidOrderIds = new Set(orders.map(o => o.id));
  const items = allItems.filter(i => paidOrderIds.has(i.orderId));
  console.log(`   Order items: ${items.length}`);

  const relevantItemIds = new Set(items.map(i => i.orderItemId));
  const itemMeta = extractOrderItemMeta(sql, relevantItemIds);
  console.log(`   Item meta: ${itemMeta.size}\n`);

  // 3. Get ticket types from Supabase
  console.log('Fetching tickets from Supabase...');
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('id, name, price');

  if (ticketsError) {
    console.error('Failed to fetch tickets:', ticketsError.message);
    process.exit(1);
  }

  const ticketMap = new Map<string, { id: string; currentPrice: number }>();
  for (const t of tickets!) {
    ticketMap.set(t.name, { id: t.id, currentPrice: t.price });
    console.log(`   ${t.name}: ${t.price} MDL (${t.id})`);
  }
  console.log('');

  // 4. Validate mapping
  const unmapped = new Set<string>();
  for (const item of items) {
    const mapped = PRODUCT_NAME_MAP[item.productName];
    if (!mapped || !ticketMap.has(mapped)) {
      unmapped.add(item.productName);
    }
  }
  if (unmapped.size > 0) {
    console.error('Unmapped product names:');
    unmapped.forEach(n => console.error(`   - "${n}"`));
    process.exit(1);
  }

  // 5. Group items by order
  const itemsByOrder = new Map<number, typeof items>();
  for (const item of items) {
    if (!itemsByOrder.has(item.orderId)) {
      itemsByOrder.set(item.orderId, []);
    }
    itemsByOrder.get(item.orderId)!.push(item);
  }

  // 6. Generate SQL
  console.log('Generating SQL...\n');

  const sqlLines: string[] = [];
  sqlLines.push('-- ============================================================');
  sqlLines.push('-- Migration: WordPress/WooCommerce -> Supabase');
  sqlLines.push(`-- Generated: ${new Date().toISOString()}`);
  sqlLines.push(`-- Orders: from ${CUTOFF_DATE}`);
  sqlLines.push('-- ============================================================');
  sqlLines.push('');
  sqlLines.push('BEGIN;');
  sqlLines.push('');

  let totalOrders = 0;
  let totalItems = 0;
  let totalAmount = 0;
  const errors: string[] = [];

  for (const order of orders) {
    const addr = addresses.get(order.id);
    const orderItems = itemsByOrder.get(order.id) || [];

    if (!addr) {
      errors.push(`Order ${order.id}: no billing address`);
      continue;
    }
    if (orderItems.length === 0) {
      errors.push(`Order ${order.id}: no items`);
      continue;
    }

    const customerName = `${addr.firstName} ${addr.lastName}`.trim() || 'Unknown';
    const customerEmail = addr.email || order.billingEmail;
    const customerPhone = addr.phone || '';
    const orderNumber = generateOrderNumber();

    // Build items
    let orderTotal = 0;
    const itemRows: Array<{
      ticketId: string;
      unitPrice: number;
      ticketCode: string;
      qrData: string;
    }> = [];

    for (const item of orderItems) {
      const meta = itemMeta.get(item.orderItemId);
      const unitPrice = meta?.lineTotal || 0;
      const qty = meta?.qty || 1;
      const ticketName = PRODUCT_NAME_MAP[item.productName];
      const ticket = ticketMap.get(ticketName)!;

      for (let q = 0; q < qty; q++) {
        const ticketCode = generateTicketCode();
        itemRows.push({
          ticketId: ticket.id,
          unitPrice: unitPrice / qty,
          ticketCode,
          qrData: generateQrData(ticketCode),
        });
        orderTotal += unitPrice / qty;
      }
    }

    totalOrders++;
    totalItems += itemRows.length;
    totalAmount += orderTotal;

    // SQL: Insert order using CTE to capture generated id
    sqlLines.push(`-- WP Order #${order.id} | ${customerName} | ${customerEmail} | ${orderTotal} MDL`);
    sqlLines.push(`WITH new_order AS (`);
    sqlLines.push(`  INSERT INTO orders (order_number, status, customer_email, customer_name, customer_phone, total_amount, discount_amount, payment_status, paid_at, language, created_at, updated_at)`);
    sqlLines.push(`  VALUES ('${escSql(orderNumber)}', 'paid', '${escSql(customerEmail)}', '${escSql(customerName)}', '${escSql(customerPhone)}', ${orderTotal}, 0, 'ok', '${order.dateCreated}', 'ro', '${order.dateCreated}', NOW())`);
    sqlLines.push(`  RETURNING id`);
    sqlLines.push(`)`);
    sqlLines.push(`INSERT INTO order_items (order_id, ticket_id, quantity, unit_price, ticket_code, qr_data, status, is_invitation)`);
    sqlLines.push(`SELECT new_order.id,`);
    sqlLines.push(`  v.ticket_id::uuid, 1, v.unit_price, v.ticket_code, v.qr_data, 'valid', false`);
    sqlLines.push(`FROM new_order,`);
    sqlLines.push(`(VALUES`);

    const valueLines = itemRows.map((item, idx) => {
      const comma = idx < itemRows.length - 1 ? ',' : '';
      return `  ('${item.ticketId}', ${item.unitPrice}, '${escSql(item.ticketCode)}', '${escSql(item.qrData)}')${comma}`;
    });
    sqlLines.push(...valueLines);

    sqlLines.push(`) AS v(ticket_id, unit_price, ticket_code, qr_data);`);
    sqlLines.push('');

    console.log(`  ${orderNumber} | ${customerName} <${customerEmail}> | ${itemRows.length} items | ${orderTotal} MDL`);
  }

  sqlLines.push('COMMIT;');
  sqlLines.push('');
  sqlLines.push(`-- Summary: ${totalOrders} orders, ${totalItems} items, ${totalAmount.toLocaleString()} MDL`);

  // 7. Write output file
  fs.writeFileSync(OUTPUT_FILE, sqlLines.join('\n'), 'utf-8');

  console.log('\n' + '='.repeat(60));
  console.log(`SUMMARY`);
  console.log('='.repeat(60));
  console.log(`   Orders:  ${totalOrders}`);
  console.log(`   Items:   ${totalItems}`);
  console.log(`   Total:   ${totalAmount.toLocaleString()} MDL`);

  if (errors.length > 0) {
    console.log(`\n   Errors (${errors.length}):`);
    errors.forEach(e => console.log(`   - ${e}`));
  }

  console.log(`\n   Output: ${OUTPUT_FILE}`);
  console.log(`   Load this file into Supabase SQL Editor and run it.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
