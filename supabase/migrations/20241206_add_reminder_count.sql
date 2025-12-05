-- Replace reminder_sent_at with reminder_count for multi-email support
-- Allows tracking how many reminder emails were sent

-- Add reminder_count column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0;

-- Migrate existing data: if reminder_sent_at is set, set reminder_count to 1
UPDATE orders SET reminder_count = 1 WHERE reminder_sent_at IS NOT NULL AND reminder_count = 0;

-- Note: keeping reminder_sent_at for backwards compatibility, can be removed later
