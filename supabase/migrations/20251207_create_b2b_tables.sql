-- Create B2B orders table
CREATE TABLE IF NOT EXISTS b2b_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  company_tax_id TEXT,
  company_address TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('online', 'invoice')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'invoice_sent', 'paid', 'tickets_sent', 'completed', 'cancelled')),
  total_amount NUMERIC(10, 2) NOT NULL,
  discount_percent NUMERIC(5, 2) DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  final_amount NUMERIC(10, 2) NOT NULL,
  invoice_url TEXT,
  invoice_number TEXT UNIQUE,
  invoice_sent_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  tickets_sent_at TIMESTAMP WITH TIME ZONE,
  maib_transaction_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'ok', 'failed', 'reversed')),
  failure_reason TEXT,
  notes TEXT,
  language TEXT DEFAULT 'ro' CHECK (language IN ('ro', 'ru')),
  client_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create B2B order items table
CREATE TABLE IF NOT EXISTS b2b_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  b2b_order_id UUID NOT NULL REFERENCES b2b_orders(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES tickets(id),
  ticket_option_id UUID REFERENCES ticket_options(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL,
  discount_percent NUMERIC(5, 2) DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  total_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create B2B order history table
CREATE TABLE IF NOT EXISTS b2b_order_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  b2b_order_id UUID NOT NULL REFERENCES b2b_orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_b2b_orders_order_number ON b2b_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_b2b_orders_status ON b2b_orders(status);
CREATE INDEX IF NOT EXISTS idx_b2b_orders_contact_email ON b2b_orders(contact_email);
CREATE INDEX IF NOT EXISTS idx_b2b_orders_company_name ON b2b_orders(company_name);
CREATE INDEX IF NOT EXISTS idx_b2b_orders_payment_method ON b2b_orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_b2b_orders_created_at ON b2b_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_b2b_orders_maib_transaction_id ON b2b_orders(maib_transaction_id);
CREATE INDEX IF NOT EXISTS idx_b2b_order_items_b2b_order_id ON b2b_order_items(b2b_order_id);
CREATE INDEX IF NOT EXISTS idx_b2b_order_items_ticket_id ON b2b_order_items(ticket_id);
CREATE INDEX IF NOT EXISTS idx_b2b_order_history_b2b_order_id ON b2b_order_history(b2b_order_id);
CREATE INDEX IF NOT EXISTS idx_b2b_order_history_created_at ON b2b_order_history(created_at);

-- Enable RLS
ALTER TABLE b2b_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_order_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for b2b_orders

-- Service role has full access
CREATE POLICY "Service role full access to b2b_orders"
  ON b2b_orders FOR ALL
  USING (auth.role() = 'service_role');

-- Authenticated users (admin) can view all orders
CREATE POLICY "Authenticated users can view b2b_orders"
  ON b2b_orders FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can manage orders
CREATE POLICY "Authenticated users can manage b2b_orders"
  ON b2b_orders FOR ALL
  USING (auth.role() = 'authenticated');

-- RLS Policies for b2b_order_items

-- Service role has full access
CREATE POLICY "Service role full access to b2b_order_items"
  ON b2b_order_items FOR ALL
  USING (auth.role() = 'service_role');

-- Authenticated users can view all order items
CREATE POLICY "Authenticated users can view b2b_order_items"
  ON b2b_order_items FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can manage order items
CREATE POLICY "Authenticated users can manage b2b_order_items"
  ON b2b_order_items FOR ALL
  USING (auth.role() = 'authenticated');

-- RLS Policies for b2b_order_history

-- Service role has full access
CREATE POLICY "Service role full access to b2b_order_history"
  ON b2b_order_history FOR ALL
  USING (auth.role() = 'service_role');

-- Authenticated users can view history
CREATE POLICY "Authenticated users can view b2b_order_history"
  ON b2b_order_history FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can add history entries
CREATE POLICY "Authenticated users can insert b2b_order_history"
  ON b2b_order_history FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Updated_at trigger for b2b_orders
DROP TRIGGER IF EXISTS update_b2b_orders_updated_at ON b2b_orders;
CREATE TRIGGER update_b2b_orders_updated_at
  BEFORE UPDATE ON b2b_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically add history entry on status change
CREATE OR REPLACE FUNCTION add_b2b_order_history_entry()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO b2b_order_history (b2b_order_id, status, note)
    VALUES (NEW.id, NEW.status, 'Status automatically changed from ' || OLD.status || ' to ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS b2b_order_status_change ON b2b_orders;
CREATE TRIGGER b2b_order_status_change
  AFTER UPDATE ON b2b_orders
  FOR EACH ROW
  EXECUTE FUNCTION add_b2b_order_history_entry();

-- Add comment descriptions
COMMENT ON TABLE b2b_orders IS 'B2B corporate orders with invoice support';
COMMENT ON TABLE b2b_order_items IS 'Line items for B2B orders';
COMMENT ON TABLE b2b_order_history IS 'Audit trail for B2B order status changes';
COMMENT ON COLUMN b2b_orders.payment_method IS 'Payment method: online (immediate MAIB payment) or invoice (pay later)';
COMMENT ON COLUMN b2b_orders.discount_percent IS 'Progressive discount based on quantity (10-20%)';
COMMENT ON COLUMN b2b_orders.status IS 'Order status: pending -> invoice_sent -> paid -> tickets_sent -> completed or cancelled';
