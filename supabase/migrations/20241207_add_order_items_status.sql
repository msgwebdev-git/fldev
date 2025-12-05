-- Add status column to order_items for QR scanning and refunds
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'valid'
  CHECK (status IN ('valid', 'used', 'refunded'));

-- Add scanned_at timestamp for tracking when ticket was used
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS scanned_at TIMESTAMP WITH TIME ZONE;

-- Index for faster status queries
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status);

-- Comments for documentation
COMMENT ON COLUMN order_items.status IS 'Ticket status: valid (can be used), used (scanned), refunded (order was refunded)';
COMMENT ON COLUMN order_items.scanned_at IS 'Timestamp when the ticket was scanned at entry';
