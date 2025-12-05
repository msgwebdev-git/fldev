-- Add invitation support to orders and order_items tables
-- Invitations are free tickets that don't count as sales

-- Add is_invitation column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_invitation BOOLEAN DEFAULT false;

-- Add is_invitation column to order_items table (for quick access when scanning)
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS is_invitation BOOLEAN DEFAULT false;

-- Add indexes for filtering invitations
CREATE INDEX IF NOT EXISTS idx_orders_is_invitation ON orders(is_invitation);
CREATE INDEX IF NOT EXISTS idx_order_items_is_invitation ON order_items(is_invitation);

-- Comments for documentation
COMMENT ON COLUMN orders.is_invitation IS 'True if this order is an invitation (free ticket, not a sale)';
COMMENT ON COLUMN order_items.is_invitation IS 'True if this ticket is an invitation (denormalized for quick scanning)';
