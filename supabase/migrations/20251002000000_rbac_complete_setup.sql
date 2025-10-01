-- =====================================================
-- COMPLETE RBAC (Role-Based Access Control) SETUP
-- =====================================================
-- This migration sets up a complete role-based access control system
-- with 6 roles: admin, finance_editor, planning_editor, asset_editor,
-- client_user, and public_viewer
--
-- EXECUTION: Run this entire script in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: CREATE USER ROLE ENUM
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM (
      'admin',
      'finance_editor',
      'planning_editor',
      'asset_editor',
      'client_user',
      'public_viewer'
    );
  END IF;
END $$;

-- =====================================================
-- STEP 2: CREATE PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'public_viewer',
  owner_id TEXT REFERENCES public.owners(owner_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_owner_id ON public.profiles(owner_id);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies: users can read their own profile, admins can read/update all
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- =====================================================
-- STEP 3: CREATE AUTO-PROFILE TRIGGER
-- =====================================================
-- This trigger automatically creates a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STEP 4: CREATE HELPER FUNCTIONS
-- =====================================================
-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's owner_id (for client_user RLS filtering)
CREATE OR REPLACE FUNCTION public.get_my_owner_id()
RETURNS TEXT AS $$
  SELECT owner_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =====================================================
-- STEP 5: ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_data ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 6: RLS POLICIES FOR PROPERTIES TABLE
-- =====================================================
-- Drop existing policies if any
DROP POLICY IF EXISTS "admin_all_properties" ON public.properties;
DROP POLICY IF EXISTS "finance_editor_read_properties" ON public.properties;
DROP POLICY IF EXISTS "planning_editor_read_properties" ON public.properties;
DROP POLICY IF EXISTS "asset_editor_all_properties" ON public.properties;
DROP POLICY IF EXISTS "client_user_read_own_properties" ON public.properties;
DROP POLICY IF EXISTS "public_viewer_read_properties" ON public.properties;

-- Admin: Full access
CREATE POLICY "admin_all_properties"
  ON public.properties FOR ALL
  TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- Finance Editor: Read-only
CREATE POLICY "finance_editor_read_properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (get_my_role() = 'finance_editor');

-- Planning Editor: Read-only
CREATE POLICY "planning_editor_read_properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (get_my_role() = 'planning_editor');

-- Asset Editor: Full access (read/write/delete)
CREATE POLICY "asset_editor_all_properties"
  ON public.properties FOR ALL
  TO authenticated
  USING (get_my_role() = 'asset_editor')
  WITH CHECK (get_my_role() = 'asset_editor');

-- Client User: Read-only their own properties (via parcel_id from owners table)
CREATE POLICY "client_user_read_own_properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (
    get_my_role() = 'client_user' 
    AND parcel_id IN (
      SELECT parcel_id FROM public.owners WHERE owner_id = get_my_owner_id()
    )
  );

-- Public Viewer: Read-only (basic property info)
CREATE POLICY "public_viewer_read_properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (get_my_role() = 'public_viewer');

-- =====================================================
-- STEP 7: RLS POLICIES FOR OWNERS TABLE
-- =====================================================
DROP POLICY IF EXISTS "admin_all_owners" ON public.owners;
DROP POLICY IF EXISTS "finance_editor_read_owners" ON public.owners;
DROP POLICY IF EXISTS "planning_editor_read_owners" ON public.owners;
DROP POLICY IF EXISTS "asset_editor_all_owners" ON public.owners;
DROP POLICY IF EXISTS "client_user_read_own_owners" ON public.owners;

-- Admin: Full access
CREATE POLICY "admin_all_owners"
  ON public.owners FOR ALL
  TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- Finance Editor: Read-only
CREATE POLICY "finance_editor_read_owners"
  ON public.owners FOR SELECT
  TO authenticated
  USING (get_my_role() = 'finance_editor');

-- Planning Editor: Read-only
CREATE POLICY "planning_editor_read_owners"
  ON public.owners FOR SELECT
  TO authenticated
  USING (get_my_role() = 'planning_editor');

-- Asset Editor: Full access
CREATE POLICY "asset_editor_all_owners"
  ON public.owners FOR ALL
  TO authenticated
  USING (get_my_role() = 'asset_editor')
  WITH CHECK (get_my_role() = 'asset_editor');

-- Client User: Read-only their own records
CREATE POLICY "client_user_read_own_owners"
  ON public.owners FOR SELECT
  TO authenticated
  USING (
    get_my_role() = 'client_user' 
    AND owner_id = get_my_owner_id()
  );

-- Public Viewer: No access to owners table

-- =====================================================
-- STEP 8: RLS POLICIES FOR TAX_RECORDS TABLE
-- =====================================================
DROP POLICY IF EXISTS "admin_all_tax_records" ON public.tax_records;
DROP POLICY IF EXISTS "finance_editor_all_tax_records" ON public.tax_records;
DROP POLICY IF EXISTS "asset_editor_read_tax_records" ON public.tax_records;
DROP POLICY IF EXISTS "client_user_read_own_tax_records" ON public.tax_records;

-- Admin: Full access
CREATE POLICY "admin_all_tax_records"
  ON public.tax_records FOR ALL
  TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- Finance Editor: Full access (read/write/delete)
CREATE POLICY "finance_editor_all_tax_records"
  ON public.tax_records FOR ALL
  TO authenticated
  USING (get_my_role() = 'finance_editor')
  WITH CHECK (get_my_role() = 'finance_editor');

-- Asset Editor: Read-only
CREATE POLICY "asset_editor_read_tax_records"
  ON public.tax_records FOR SELECT
  TO authenticated
  USING (get_my_role() = 'asset_editor');

-- Client User: Read-only their own tax records (via property ownership)
CREATE POLICY "client_user_read_own_tax_records"
  ON public.tax_records FOR SELECT
  TO authenticated
  USING (
    get_my_role() = 'client_user' 
    AND property_id IN (
      SELECT property_id FROM public.properties 
      WHERE parcel_id IN (
        SELECT parcel_id FROM public.owners WHERE owner_id = get_my_owner_id()
      )
    )
  );

-- Planning Editor: No access to tax records
-- Public Viewer: No access to tax records

-- =====================================================
-- STEP 9: RLS POLICIES FOR PLANNING_DATA TABLE
-- =====================================================
DROP POLICY IF EXISTS "admin_all_planning_data" ON public.planning_data;
DROP POLICY IF EXISTS "planning_editor_all_planning_data" ON public.planning_data;
DROP POLICY IF EXISTS "asset_editor_read_planning_data" ON public.planning_data;

-- Admin: Full access
CREATE POLICY "admin_all_planning_data"
  ON public.planning_data FOR ALL
  TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- Planning Editor: Full access (read/write/delete)
CREATE POLICY "planning_editor_all_planning_data"
  ON public.planning_data FOR ALL
  TO authenticated
  USING (get_my_role() = 'planning_editor')
  WITH CHECK (get_my_role() = 'planning_editor');

-- Asset Editor: Read-only
CREATE POLICY "asset_editor_read_planning_data"
  ON public.planning_data FOR SELECT
  TO authenticated
  USING (get_my_role() = 'asset_editor');

-- Finance Editor: No access to planning data
-- Client User: No access to planning data
-- Public Viewer: No access to planning data

-- =====================================================
-- STEP 10: CREATE FIRST ADMIN USER (MANUAL EXECUTION)
-- =====================================================
-- IMPORTANT: Uncomment and modify the email below to create your first admin user
-- Execute this AFTER you've created a user account in Supabase Auth
-- Replace 'your-admin-email@example.com' with the actual admin email

/*
UPDATE public.profiles 
SET role = 'admin', full_name = 'System Administrator'
WHERE email = 'your-admin-email@example.com';
*/

-- Alternative: If you know the user's UUID, you can use:
/*
UPDATE public.profiles 
SET role = 'admin', full_name = 'System Administrator'
WHERE id = 'user-uuid-here';
*/

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Summary of what was created:
-- 1. user_role enum with 6 roles
-- 2. profiles table with auto-creation trigger
-- 3. Helper functions: get_my_role(), get_my_owner_id()
-- 4. RLS policies for properties (6 roles)
-- 5. RLS policies for owners (5 roles)
-- 6. RLS policies for tax_records (4 roles)
-- 7. RLS policies for planning_data (3 roles)
--
-- Next steps:
-- 1. Create your first user account via Supabase Auth
-- 2. Uncomment and run the admin user creation SQL above
-- 3. Use the admin account to assign roles to other users
-- =====================================================
