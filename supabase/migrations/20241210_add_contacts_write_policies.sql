-- Add write policies for contacts tables

-- Allow all operations on contacts table (for admin access via service role or anon key)
CREATE POLICY "Allow insert on contacts" ON contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update on contacts" ON contacts
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete on contacts" ON contacts
  FOR DELETE USING (true);

-- Allow all operations on site_contacts table
CREATE POLICY "Allow insert on site_contacts" ON site_contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update on site_contacts" ON site_contacts
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete on site_contacts" ON site_contacts
  FOR DELETE USING (true);
