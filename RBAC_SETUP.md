# Role-Based Access Control (RBAC) Setup Guide

This guide explains how to set up and use the Role-Based Access Control system in your application.

## Table of Contents

1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [Role Definitions](#role-definitions)
4. [Initial Setup](#initial-setup)
5. [User Management](#user-management)
6. [Frontend Usage](#frontend-usage)
7. [Troubleshooting](#troubleshooting)

## Overview

The application implements a comprehensive 6-role RBAC system:

- **Admin**: Full system access and user management
- **Finance Editor**: Manage tax records, read properties and owners
- **Planning Editor**: Manage planning data, read properties and owners  
- **Asset Editor**: Manage properties and owners, read tax and planning data
- **Client User**: Property owners with restricted access to their own data
- **Public Viewer**: Limited read-only access to public property information

## Database Setup

### Step 1: Run the Migration

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Open the file: `supabase/migrations/20251002000000_rbac_complete_setup.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run**

This migration creates:
- ✅ User role enum with 6 roles
- ✅ Profiles table with auto-creation trigger
- ✅ Row Level Security (RLS) policies for all tables
- ✅ Helper functions for role checking

### Step 2: Verify Migration

Check that these were created successfully:

```sql
-- Check if profiles table exists
SELECT * FROM profiles LIMIT 1;

-- Check if enum was created
SELECT enum_range(NULL::user_role);

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('properties', 'owners', 'tax_records', 'planning_data');
```

## Role Definitions

### Access Matrix

| Role | Properties | Owners | Tax Records | Planning Data | User Management |
|------|-----------|--------|-------------|---------------|-----------------|
| **Admin** | Read/Write | Read/Write | Read/Write | Read/Write | Full Access |
| **Finance Editor** | Read-only | Read-only | Read/Write | No Access | No Access |
| **Planning Editor** | Read-only | Read-only | No Access | Read/Write | No Access |
| **Asset Editor** | Read/Write | Read/Write | Read-only | Read-only | No Access |
| **Client User** | Read-only (own) | Read-only (own) | Read-only (own) | No Access | No Access |
| **Public Viewer** | Read-only | No Access | No Access | No Access | No Access |

### Role Descriptions

**Administrator (admin)**
- Full system access
- Can manage all data
- Can assign roles to users
- Can link client users to property owners

**Finance Editor (finance_editor)**
- Department: Finance
- Primary function: Tax record management
- Can create, edit, delete tax records
- Can view properties and owners for context

**Planning Editor (planning_editor)**
- Department: Planning
- Primary function: Zoning and permit management
- Can create, edit, delete planning data
- Can view properties and owners for context

**Asset Editor (asset_editor)**
- Department: Asset Management
- Primary function: Property and owner management
- Can create, edit, delete properties and owners
- Can view tax and planning data for context

**Client User (client_user)**
- Type: Property Owners
- Can only see their own properties, tax records, and owner information
- Row Level Security (RLS) filters data based on owner_id
- Cannot modify any data

**Public Viewer (public_viewer)**
- Type: General Public
- Can only view basic property information
- No access to owners, tax records, or planning data
- Default role for new users

## Initial Setup

### Create Your First Admin User

1. **Sign up a new user account** through your application's signup/login page

2. **Get the user's ID** from Supabase:
   ```sql
   SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;
   ```

3. **Promote to admin** using one of these methods:

   **Option A - By Email:**
   ```sql
   UPDATE profiles 
   SET role = 'admin', full_name = 'System Administrator'
   WHERE email = 'your-admin-email@example.com';
   ```

   **Option B - By User ID:**
   ```sql
   UPDATE profiles 
   SET role = 'admin', full_name = 'System Administrator'
   WHERE id = 'user-uuid-here';
   ```

4. **Verify admin access:**
   - Log out and log back in
   - Check user dropdown - should show "Administrator" badge
   - "User Management" option should appear in dropdown

## User Management

### Accessing User Management

1. Log in as an admin user
2. Click on your user avatar (top right)
3. Select **"User Management"** from dropdown
4. Or navigate directly to `/admin`

### Assigning Roles

1. Go to User Management page
2. Find the user in the table
3. Click the role dropdown in the "Actions" column
4. Select the new role
5. Change is applied immediately

### Linking Client Users to Owners

For users with the `client_user` role:

1. Go to User Management page
2. Find the client user
3. In the "Owner Link" column, click the dropdown
4. Select the appropriate owner from the list
5. The user will now only see data related to that owner_id

### Searching Users

Use the search bar at the top of the user table to filter by:
- Email address
- Full name

## Frontend Usage

### Using RoleGate Component

Show content only to specific roles:

```tsx
import { RoleGate } from '@/components/auth/RoleGate';

<RoleGate allowedRoles={['admin', 'finance_editor']}>
  <button>Edit Tax Record</button>
</RoleGate>
```

### Using PermissionGate Component

Show content based on table permissions:

```tsx
import { PermissionGate } from '@/components/auth/PermissionGate';

<PermissionGate table="tax_records" action="write">
  <button>Create New Tax Record</button>
</PermissionGate>
```

### Using the Auth Hook

Access user role in your components:

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, profile, role } = useAuth();
  
  return (
    <div>
      <p>Role: {role}</p>
      <p>Name: {profile?.full_name}</p>
    </div>
  );
}
```

### Using Permission Functions

Check permissions programmatically:

```tsx
import { useAuth } from '@/contexts/AuthContext';
import { canWrite, canDelete, isAdmin } from '@/lib/permissions';

function MyComponent() {
  const { role } = useAuth();
  
  const canEditTax = canWrite(role, 'tax_records');
  const canDeleteProperty = canDelete(role, 'properties');
  const isUserAdmin = isAdmin(role);
  
  // Use in your logic...
}
```

### Display Role Badge

```tsx
import { RoleBadge } from '@/components/auth/RoleBadge';

<RoleBadge role={user.role} />
```

## Troubleshooting

### Issue: Users can't see any data after migration

**Solution:** RLS is now enabled. Ensure:
1. User has a profile with a valid role
2. Check browser console for permission errors
3. Verify RLS policies were created:
   ```sql
   SELECT * FROM pg_policies 
   WHERE schemaname = 'public';
   ```

### Issue: Admin can't access User Management page

**Possible causes:**
1. User doesn't have admin role in profiles table
2. Profile wasn't created (trigger issue)

**Solution:**
```sql
-- Check user's role
SELECT id, email, role FROM profiles WHERE email = 'admin@example.com';

-- If no profile exists, create one
INSERT INTO profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'admin@example.com';
```

### Issue: Client users can see all properties

**Solution:** Ensure owner_id is properly linked:
```sql
-- Check if owner_id is set
SELECT id, email, role, owner_id FROM profiles WHERE role = 'client_user';

-- Link user to owner
UPDATE profiles 
SET owner_id = 'ownw2_0001' 
WHERE id = 'user-uuid';
```

### Issue: RLS policies are blocking admin access

**Solution:** Admin should have full access. Verify:
```sql
-- Check admin policies exist
SELECT * FROM pg_policies 
WHERE policyname LIKE '%admin%';

-- Refresh user session
```
Then log out and log back in.

### Issue: New users aren't getting profiles

**Solution:** Check if trigger exists and is working:
```sql
-- Check trigger
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Test manually
INSERT INTO profiles (id, email, role)
SELECT id, email, 'public_viewer'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);
```

## Security Best Practices

1. **Always use RLS**: Never disable Row Level Security on tables
2. **Verify role before updates**: Use permission checks in your code
3. **Audit admin actions**: Consider logging role changes
4. **Limit admin accounts**: Only create admin users when necessary
5. **Review roles regularly**: Ensure users have appropriate access levels

## Testing Your Setup

### Test Each Role

Create test users for each role and verify:

1. **Admin**: Can access everything including /admin page
2. **Finance Editor**: Can edit tax_records but not planning_data
3. **Planning Editor**: Can edit planning_data but not tax_records
4. **Asset Editor**: Can edit properties and owners
5. **Client User**: Only sees their linked properties
6. **Public Viewer**: Only sees basic property info

### Test RLS Policies

```sql
-- Test as different roles
SET LOCAL ROLE authenticated;
SET request.jwt.claims TO '{"sub": "user-id-here"}';

-- Try querying as that user
SELECT * FROM properties;
```

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Permission Matrix](#access-matrix)
- [Frontend Examples](#frontend-usage)

## Support

For issues or questions:
1. Check this documentation
2. Review Supabase logs
3. Check browser console for errors
4. Verify database policies are active

---

**Last Updated:** October 2, 2025
**Version:** 1.0.0
