-- =====================================================
-- ASSIGN ROLES TO TEST USERS
-- =====================================================
-- This script assigns different roles to test user accounts
-- Run this AFTER the users have signed up in your application
-- =====================================================

-- Update roles for test users (if they exist in auth.users)
-- Note: Users must sign up first before roles can be assigned

-- Admin - Full system access
UPDATE profiles 
SET role = 'admin', full_name = 'Admin Test User'
WHERE email = 'zahlytics@gmail.com';

-- Finance Editor - Can manage tax records
UPDATE profiles 
SET role = 'finance_editor', full_name = 'Finance Editor Test'
WHERE email = 'zahgraphicsmedia@gmail.com';

-- Planning Editor - Can manage planning data
UPDATE profiles 
SET role = 'planning_editor', full_name = 'Planning Editor Test'
WHERE email = 'tinaume8@gmail.com';

-- Asset Editor - Can manage properties and owners
UPDATE profiles 
SET role = 'asset_editor', full_name = 'Asset Editor Test'
WHERE email = 'zahtech13@gmail.com';

-- Client User - Property owner with restricted access
UPDATE profiles 
SET role = 'client_user', full_name = 'Client User Test'
WHERE email = 'sarwomjohn@gmail.com';
-- Note: For client users, you'll need to link them to an owner_id using the admin interface

-- Public Viewer - Basic read-only access
UPDATE profiles 
SET role = 'public_viewer', full_name = 'Public Viewer Test'
WHERE email = 'oboko.hejumacla8@gmail.com';

-- Verify the assignments
SELECT email, role, full_name, created_at
FROM profiles
WHERE email IN (
  'zahlytics@gmail.com',
  'zahgraphicsmedia@gmail.com',
  'tinaume8@gmail.com',
  'zahtech13@gmail.com',
  'sarwomjohn@gmail.com',
  'oboko.hejumacla8@gmail.com'
)
ORDER BY 
  CASE role
    WHEN 'admin' THEN 1
    WHEN 'finance_editor' THEN 2
    WHEN 'planning_editor' THEN 3
    WHEN 'asset_editor' THEN 4
    WHEN 'client_user' THEN 5
    WHEN 'public_viewer' THEN 6
  END;
