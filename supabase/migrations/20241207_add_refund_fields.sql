-- Add refund tracking fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_by TEXT;

-- Comment for documentation
COMMENT ON COLUMN orders.refund_reason IS 'Reason for refund, filled when order is refunded';
COMMENT ON COLUMN orders.refunded_at IS 'Timestamp when the order was refunded';
COMMENT ON COLUMN orders.refunded_by IS 'Email of admin who processed the refund';
