-- Add new fields for promo code restrictions

-- Minimum order amount for the promo code to apply
ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS min_order_amount NUMERIC(10, 2) DEFAULT NULL;

-- Restrict to specific tickets (array of ticket IDs)
ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS allowed_ticket_ids UUID[] DEFAULT NULL;

-- One use per email
ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS one_per_email BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN promo_codes.min_order_amount IS 'Minimum order amount required to use this promo code';
COMMENT ON COLUMN promo_codes.allowed_ticket_ids IS 'If set, promo code only applies to these ticket IDs. NULL means all tickets.';
COMMENT ON COLUMN promo_codes.one_per_email IS 'If true, each email can only use this promo code once';
