-- =====================================================
-- RBAC SETUP - FINAL VERSION WITH DUPLICATE CLEANUP
-- =====================================================
-- Handles duplicate owner_id values before adding constraints
-- =====================================================

-- =====================================================
-- STEP 1: CLEAN UP DUPLICATE OWNER_IDs
-- =====================================================
-- First, let's see what we're dealing with and keep only the first occurrence of each owner_id
-- This creates a new temporary column, moves unique owner_ids there, then swaps

-- Add a temporary column to store row numbers
ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS row_num INTEGER;

-- Assign row numbers to duplicates (keeping the first occurrence as 1)
WITH ranked_owners AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY owner_id ORDER BY id) as rn
  FROM public.owners
)
UPDATE public.owners o
SET row_num = r.rn
FROM ranked_owners r
WHERE o.id = r.id;

-- Delete duplicates (keep only row_num = 1)
DELETE FROM public.owners WHERE row_num > 1;

-- Drop the temporary column
ALTER TABLE public.owners DROP COLUMN IF EXISTS row_num;

-- Now add the unique constraint
ALTER TABLE public.owners DROP CONSTRAINT IF EXISTS unique_owner_id;
ALTER TABLE public.owners ADD CONSTRAINT unique_owner_id UNIQUE (owner_id);

-- =====================================================
-- STEP 2: CREATE USER ROLE ENUM
-- =====================================================
DO $$ 
BEGIN
  DROP TYPE IF EXISTS user_role CASCADE;
  
  CREATE TYPE user_role AS ENUM (
    'admin',
    'finance_editor',
    'planning_editor',
    'asset_editor',
    'client_user',
    'public_viewer'
  );
END $$;

-- =====================================================
-- STEP 3: CREATE PROFILES TABLE
-- =====================================================
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'public_viewer',
  owner_id TEXT REFERENCES public.owners(owner_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_owner_id ON public.profiles(owner_id);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create policies
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
-- STEP 4: CREATE AUTO-PROFILE TRIGGER
-- =====================================================
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STEP 5: CREATE HELPER FUNCTIONS
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_my_owner_id()
RETURNS TEXT AS $$
  SELECT owner_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =====================================================
-- STEP 6: ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_data ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 7: DROP ALL EXISTING POLICIES
-- =====================================================
-- Properties
DROP POLICY IF EXISTS "admin_all_properties" ON public.properties;
DROP POLICY IF EXISTS "finance_editor_read_properties" ON public.properties;
DROP POLICY IF EXISTS "planning_editor_read_properties" ON public.properties;
DROP POLICY IF EXISTS "asset_editor_all_properties" ON public.properties;
DROP POLICY IF EXISTS "client_user_read_own_properties" ON public.properties;
DROP POLICY IF EXISTS "public_viewer_read_properties" ON public.properties;

-- Owners
DROP POLICY IF EXISTS "admin_all_owners" ON public.owners;
DROP POLICY IF EXISTS "finance_editor_read_owners" ON public.owners;
DROP POLICY IF EXISTS "planning_editor_read_owners" ON public.owners;
DROP POLICY IF EXISTS "asset_editor_all_owners" ON public.owners;
DROP POLICY IF EXISTS "client_user_read_own_owners" ON public.owners;

-- Tax Records
DROP POLICY IF EXISTS "admin_all_tax_records" ON public.tax_records;
DROP POLICY IF EXISTS "finance_editor_all_tax_records" ON public.tax_records;
DROP POLICY IF EXISTS "asset_editor_read_tax_records" ON public.tax_records;
DROP POLICY IF EXISTS "client_user_read_own_tax_records" ON public.tax_records;

-- Planning Data
DROP POLICY IF EXISTS "admin_all_planning_data" ON public.planning_data;
DROP POLICY IF EXISTS "planning_editor_all_planning_data" ON public.planning_data;
DROP POLICY IF EXISTS "asset_editor_read_planning_data" ON public.planning_data;

-- =====================================================
-- STEP 8: CREATE RLS POLICIES FOR PROPERTIES
-- =====================================================
CREATE POLICY "admin_all_properties"
  ON public.properties FOR ALL
  TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "finance_editor_read_properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (get_my_role() = 'finance_editor');

CREATE POLICY "planning_editor_read_properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (get_my_role() = 'planning_editor');

CREATE POLICY "asset_editor_all_properties"
  ON public.properties FOR ALL
  TO authenticated
  USING (get_my_role() = 'asset_editor')
  WITH CHECK (get_my_role() = 'asset_editor');

CREATE POLICY "client_user_read_own_properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (
    get_my_role() = 'client_user' 
    AND parcel_id IN (
      SELECT parcel_id FROM public.owners WHERE owner_id = get_my_owner_id()
    )
  );

CREATE POLICY "public_viewer_read_properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (get_my_role() = 'public_viewer');

-- =====================================================
-- STEP 9: CREATE RLS POLICIES FOR OWNERS
-- =====================================================
CREATE POLICY "admin_all_owners"
  ON public.owners FOR ALL
  TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "finance_editor_read_owners"
  ON public.owners FOR SELECT
  TO authenticated
  USING (get_my_role() = 'finance_editor');

CREATE POLICY "planning_editor_read_owners"
  ON public.owners FOR SELECT
  TO authenticated
  USING (get_my_role() = 'planning_editor');

CREATE POLICY "asset_editor_all_owners"
  ON public.owners FOR ALL
  TO authenticated
  USING (get_my_role() = 'asset_editor')
  WITH CHECK (get_my_role() = 'asset_editor');

CREATE POLICY "client_user_read_own_owners"
  ON public.owners FOR SELECT
  TO authenticated
  USING (
    get_my_role() = 'client_user' 
    AND owner_id = get_my_owner_id()
  );

-- =====================================================
-- STEP 10: CREATE RLS POLICIES FOR TAX_RECORDS
-- =====================================================
CREATE POLICY "admin_all_tax_records"
  ON public.tax_records FOR ALL
  TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "finance_editor_all_tax_records"
  ON public.tax_records FOR ALL
  TO authenticated
  USING (get_my_role() = 'finance_editor')
  WITH CHECK (get_my_role() = 'finance_editor');

CREATE POLICY "asset_editor_read_tax_records"
  ON public.tax_records FOR SELECT
  TO authenticated
  USING (get_my_role() = 'asset_editor');

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

-- =====================================================
-- STEP 11: CREATE RLS POLICIES FOR PLANNING_DATA
-- =====================================================
CREATE POLICY "admin_all_planning_data"
  ON public.planning_data FOR ALL
  TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "planning_editor_all_planning_data"
  ON public.planning_data FOR ALL
  TO authenticated
  USING (get_my_role() = 'planning_editor')
  WITH CHECK (get_my_role() = 'planning_editor');

CREATE POLICY "asset_editor_read_planning_data"
  ON public.planning_data FOR SELECT
  TO authenticated
  USING (get_my_role() = 'asset_editor');

-- =====================================================
-- STEP 12: CREATE PROFILES FOR EXISTING USERS
-- =====================================================
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'public_viewer'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE - RBAC IS NOW ACTIVE
-- =====================================================
-- Note: Duplicate owner_id records were removed (kept first occurrence only)
