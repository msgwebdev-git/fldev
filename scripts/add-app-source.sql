-- Add 'app' to source check constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_source_check;
ALTER TABLE orders ADD CONSTRAINT orders_source_check
  CHECK (source IN ('online', 'offline', 'manual', 'giveaway', 'invitation', 'app'));
