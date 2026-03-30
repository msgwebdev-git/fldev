-- ============================================================
-- Add 'source' column to orders table
-- Values: online, offline, manual, giveaway, invitation
-- ============================================================

BEGIN;

-- 1. Add column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS source text DEFAULT 'online'
  CHECK (source IN ('online', 'offline', 'manual', 'giveaway', 'invitation'));

-- 2. Set source based on order_number prefix
UPDATE orders SET source = 'invitation' WHERE order_number LIKE 'INV%';
UPDATE orders SET source = 'giveaway' WHERE order_number LIKE 'GW%';
UPDATE orders SET source = 'manual' WHERE order_number LIKE 'MAN%';
UPDATE orders SET source = 'offline' WHERE order_number LIKE 'OFF%';
UPDATE orders SET source = 'manual' WHERE order_number LIKE 'WP-%';
-- Everything else stays 'online' (FL% prefix, default)

-- 3. Fix is_invitation — only TRUE for actual invitations (INV prefix)
UPDATE orders SET is_invitation = false WHERE order_number NOT LIKE 'INV%' AND is_invitation = true;
UPDATE orders SET is_invitation = true WHERE order_number LIKE 'INV%';

COMMIT;

-- Verify
-- SELECT source, count(*), sum(total_amount) FROM orders WHERE status = 'paid' GROUP BY source ORDER BY source;
