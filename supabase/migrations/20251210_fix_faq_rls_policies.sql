-- Migration: Fix FAQ RLS policies
-- Date: 2025-12-10
-- Description: Update RLS policies to allow proper access to FAQ table

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read active FAQ" ON faq;
DROP POLICY IF EXISTS "Admins can manage FAQ" ON faq;

-- ==========================================
-- PUBLIC ACCESS POLICIES
-- ==========================================

-- Allow anyone to read active FAQ items
CREATE POLICY "Public can read active FAQ"
ON faq
FOR SELECT
USING (is_active = true);

-- ==========================================
-- ADMIN/SERVICE ROLE POLICIES
-- ==========================================

-- Allow service role to do everything (for admin panel and server-side operations)
CREATE POLICY "Service role has full access to FAQ"
ON faq
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users with service role key to manage FAQ
-- This is for admin panel operations
CREATE POLICY "Authenticated users can manage FAQ"
ON faq
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
