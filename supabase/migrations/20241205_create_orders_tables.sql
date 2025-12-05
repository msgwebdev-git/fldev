-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'expired', 'cancelled')),
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  promo_code TEXT,
  maib_transaction_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'ok', 'failed', 'reversed')),
  failure_reason TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  language TEXT DEFAULT 'ro' CHECK (language IN ('ro', 'ru')),
  client_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES tickets(id),
  ticket_option_id UUID REFERENCES ticket_options(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL,
  ticket_code TEXT NOT NULL UNIQUE,
  qr_data TEXT NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_percent NUMERIC(5, 2) CHECK (discount_percent >= 0 AND discount_percent <= 100),
  discount_amount NUMERIC(10, 2) CHECK (discount_amount >= 0),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_logs table (for tracking sent emails)
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('confirmation', 'reminder', 'refund')),
  recipient TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_maib_transaction_id ON orders(maib_transaction_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_ticket_code ON order_items(ticket_code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Orders: Only authenticated users (admin) can view all, service role bypasses RLS
CREATE POLICY "Service role full access to orders"
  ON orders FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can view orders"
  ON orders FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage orders"
  ON orders FOR ALL
  USING (auth.role() = 'authenticated');

-- Order items: Same as orders
CREATE POLICY "Service role full access to order_items"
  ON order_items FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can view order_items"
  ON order_items FOR SELECT
  USING (auth.role() = 'authenticated');

-- Promo codes: Public read for validation, admin write
CREATE POLICY "Anyone can read active promo codes"
  ON promo_codes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage promo codes"
  ON promo_codes FOR ALL
  USING (auth.role() = 'authenticated');

-- Email logs: Admin only
CREATE POLICY "Authenticated users can view email_logs"
  ON email_logs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role full access to email_logs"
  ON email_logs FOR ALL
  USING (auth.role() = 'service_role');

-- Updated_at trigger for orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample promo codes
INSERT INTO promo_codes (code, discount_percent, usage_limit, valid_until) VALUES
  ('WOLF10', 10, 100, '2025-12-31 23:59:59'),
  ('FESTIVAL20', 20, 50, '2025-12-31 23:59:59'),
  ('VIP50', 50, 10, '2025-12-31 23:59:59')
ON CONFLICT (code) DO NOTHING;
