-- Add 'cancelled' status to orders table
-- This allows us to cancel pending orders when user starts a new checkout

-- Drop existing constraint and add new one with 'cancelled' status
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'expired', 'cancelled'));
