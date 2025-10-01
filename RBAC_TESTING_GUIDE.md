# RBAC Testing Guide

This guide will help you set up and test the Role-Based Access Control system with different user accounts.

## Test User Accounts

You've designated the following accounts for testing different roles:

| Email | Assigned Role | Purpose |
|-------|--------------|---------|
| zahlytics@gmail.com | **Admin** | Full system access + user management |
| zahgraphicsmedia@gmail.com | **Finance Editor** | Tax records management |
| tinaume8@gmail.com | **Planning Editor** | Planning data management |
| zahtech13@gmail.com | **Asset Editor** | Properties & owners management |
| sarwomjohn@gmail.com | **Client User** | Property owner (restricted) |
| oboko.hejumacla8@gmail.com | **Public Viewer** | Read-only access |

## Setup Process

### Step 1: Create User Accounts

Each person needs to sign up through your application:

1. Go to your application's login page
2. Click "Sign Up" (you may need to add this to your LoginPage)
3. Enter their email and create a password
4. Complete the signup process

**Note:** All users will initially have the `public_viewer` role by default.

### Step 2: Assign Roles

After all users have signed up, run the role assignment script:

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy the contents of `supabase/migrations/20251002000004_assign_test_user_roles.sql`
3. Paste and click **Run**
4. Check the results - you should see 6 rows returned showing the assigned roles

### Step 3: Have Users Log Out and Back In

**IMPORTANT:** After roles are assigned, each user must:
1. Log out of the application
2. Log back in
3. Their new role will now be active

## Testing Each Role

### 1. Admin (zahlytics@gmail.com)

**What to Test:**

✅ **User Management:**
- Access `/admin` page
- View all users in the system
- Change other users' roles
- Link client users to property owners

✅ **Full Data Access:**
- View all properties
- Create/Edit/Delete properties
- View all owners
- Create/Edit/Delete owners
- View all tax records
- Create/Edit/Delete tax records
- View all planning data
- Create/Edit/Delete planning data

✅ **UI Elements:**
- "User Management" appears in user dropdown
- Role badge shows "Administrator"
- All edit/delete buttons are visible

**Expected Behavior:** Can do everything in the system.

---

### 2. Finance Editor (zahgraphicsmedia@gmail.com)

**What to Test:**

✅ **Tax Records - Full Access:**
- View all tax records
- Create new tax records
- Edit existing tax records
- Delete tax records

✅ **Properties & Owners - Read Only:**
- View all properties (cannot edit)
- View all owners (cannot edit)
- No create/edit/delete buttons should appear

❌ **Planning Data:**
- Cannot access planning data at all
- Should see "No Access" or no data

❌ **User Management:**
- No "User Management" option in dropdown
- Cannot access `/admin` page

✅ **UI Elements:**
- Role badge shows "Finance Editor"
- Edit buttons only appear on tax records

**Expected Behavior:** Can manage tax records, view properties/owners for context.

---

### 3. Planning Editor (tinaume8@gmail.com)

**What to Test:**

✅ **Planning Data - Full Access:**
- View all planning data
- Create new planning records
- Edit existing planning data
- Delete planning records

✅ **Properties & Owners - Read Only:**
- View all properties (cannot edit)
- View all owners (cannot edit)

❌ **Tax Records:**
- Cannot access tax records
- Should see no data or "No Access"

❌ **User Management:**
- No "User Management" option
- Cannot access `/admin`

✅ **UI Elements:**
- Role badge shows "Planning Editor"
- Edit buttons only on planning data

**Expected Behavior:** Can manage planning/zoning data, view properties for context.

---

### 4. Asset Editor (zahtech13@gmail.com)

**What to Test:**

✅ **Properties & Owners - Full Access:**
- View all properties
- Create new properties
- Edit existing properties
- Delete properties
- View all owners
- Create new owners
- Edit existing owners
- Delete owners

✅ **Tax & Planning - Read Only:**
- View tax records (cannot edit)
- View planning data (cannot edit)
- No edit buttons on these sections

❌ **User Management:**
- Cannot access user management

✅ **UI Elements:**
- Role badge shows "Asset Editor"
- Edit buttons on properties and owners only

**Expected Behavior:** Can manage property and owner records, view other data for context.

---

### 5. Client User (sarwomjohn@gmail.com)

**What to Test:**

⚠️ **Setup Required First:**
Before testing, an admin must link this user to an owner:
1. Login as admin (zahlytics@gmail.com)
2. Go to `/admin`
3. Find sarwomjohn@gmail.com in the user list
4. In the "Owner Link" column, select an owner from dropdown
5. Save

✅ **Restricted Access (Own Data Only):**
- View ONLY properties linked to their owner_id
- View ONLY their owner record
- View ONLY their tax records
- All views are read-only (no edit buttons)

❌ **Other Data:**
- Cannot see other properties
- Cannot see other owners
- Cannot see planning data
- Cannot edit anything

✅ **UI Elements:**
- Role badge shows "Property Owner"
- No edit/delete buttons anywhere
- Limited data visible

**Expected Behavior:** Can only see their own properties and related data, read-only.

---

### 6. Public Viewer (oboko.hejumacla8@gmail.com)

**What to Test:**

✅ **Properties - Read Only:**
- View all properties (basic info only)
- No edit buttons

❌ **Everything Else:**
- Cannot see owners data
- Cannot see tax records
- Cannot see planning data
- Cannot access any management features

✅ **UI Elements:**
- Role badge shows "Public Viewer"
- Minimal UI elements
- No edit/delete buttons

**Expected Behavior:** Very limited read-only access to public property information.

---

## Testing Checklist

### For Each User:

- [ ] Sign up successfully
- [ ] Initial role is `public_viewer`
- [ ] Role assigned via SQL script
- [ ] Log out and back in
- [ ] Correct role badge appears in dropdown
- [ ] Can access expected data
- [ ] Cannot access restricted data
- [ ] Edit/Delete buttons appear only where allowed
- [ ] User Management appears (admin only)

### Cross-Role Testing:

- [ ] Admin can see all users in admin panel
- [ ] Admin can change user roles
- [ ] Finance editor can edit tax records
- [ ] Planning editor can edit planning data
- [ ] Asset editor can edit properties/owners
- [ ] Client user only sees their linked data
- [ ] Public viewer has minimal access

## Common Issues & Solutions

### Issue: User doesn't see role changes
**Solution:** Log out and log back in

### Issue: Client user sees no data
**Solution:** Make sure admin has linked them to an owner_id

### Issue: User sees "Permission denied" errors
**Solution:** Check that RLS policies are active:
```sql
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('properties', 'owners', 'tax_records', 'planning_data');
```
All should show `true` for rowsecurity.

### Issue: Edit buttons don't appear/disappear correctly
**Solution:** 
1. Check browser console for errors
2. Verify role is correctly assigned in database
3. Clear browser cache and reload

## Testing Timeline

**Day 1:**
- Set up all user accounts
- Assign roles
- Test admin and public viewer (extremes)

**Day 2:**
- Test finance editor and planning editor
- Verify edit permissions work correctly

**Day 3:**
- Test asset editor
- Set up and test client user

**Day 4:**
- Cross-role testing
- Bug fixes and adjustments

## Success Criteria

The RBAC system is working correctly when:

✅ Each role can access exactly what they should  
✅ Each role is blocked from what they shouldn't access  
✅ UI elements (buttons, menus) reflect permissions  
✅ Database RLS policies prevent unauthorized access  
✅ Role badges display correctly  
✅ Admin can manage all users  

---

**Need Help?** See RBAC_SETUP.md for detailed documentation and troubleshooting.
