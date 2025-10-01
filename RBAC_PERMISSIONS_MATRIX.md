# RBAC Permissions Matrix

This document shows exactly what each role can do with each type of data.

## Complete Permissions Breakdown

### Legend
- ✅ **Full Access** = Can Read, Create, Edit, AND Delete
- 👁️ **Read-Only** = Can view but CANNOT edit or delete
- ❌ **No Access** = Cannot see this data at all

---

## By Role

### 1. Admin
| Data Type | Read | Create | Edit | Delete |
|-----------|------|--------|------|--------|
| Properties | ✅ | ✅ | ✅ | ✅ |
| Owners | ✅ | ✅ | ✅ | ✅ |
| Tax Records | ✅ | ✅ | ✅ | ✅ |
| Planning Data | ✅ | ✅ | ✅ | ✅ |
| User Management | ✅ | ✅ | ✅ | ✅ |

**Summary:** Full access to everything. Can delete all data.

---

### 2. Finance Editor
| Data Type | Read | Create | Edit | Delete |
|-----------|------|--------|------|--------|
| Properties | ✅ | ❌ | ❌ | ❌ |
| Owners | ✅ | ❌ | ❌ | ❌ |
| Tax Records | ✅ | ✅ | ✅ | ✅ |
| Planning Data | ❌ | ❌ | ❌ | ❌ |

**Summary:** Can delete tax records. CANNOT delete properties or owners (read-only).

---

### 3. Planning Editor
| Data Type | Read | Create | Edit | Delete |
|-----------|------|--------|------|--------|
| Properties | ✅ | ❌ | ❌ | ❌ |
| Owners | ✅ | ❌ | ❌ | ❌ |
| Tax Records | ❌ | ❌ | ❌ | ❌ |
| Planning Data | ✅ | ✅ | ✅ | ✅ |

**Summary:** Can delete planning data. CANNOT delete properties or owners (read-only).

---

### 4. Asset Editor
| Data Type | Read | Create | Edit | Delete |
|-----------|------|--------|------|--------|
| Properties | ✅ | ✅ | ✅ | ✅ |
| Owners | ✅ | ✅ | ✅ | ✅ |
| Tax Records | ✅ | ❌ | ❌ | ❌ |
| Planning Data | ✅ | ❌ | ❌ | ❌ |

**Summary:** Can delete properties and owners. CANNOT delete tax records or planning data (read-only).

---

### 5. Client User (Property Owner)
| Data Type | Read | Create | Edit | Delete |
|-----------|------|--------|------|--------|
| Properties (own) | ✅ | ❌ | ❌ | ❌ |
| Owners (own) | ✅ | ❌ | ❌ | ❌ |
| Tax Records (own) | ✅ | ❌ | ❌ | ❌ |
| Planning Data | ❌ | ❌ | ❌ | ❌ |

**Summary:** CANNOT delete anything. Read-only access to their own data only.

---

### 6. Public Viewer
| Data Type | Read | Create | Edit | Delete |
|-----------|------|--------|------|--------|
| Properties | ✅ | ❌ | ❌ | ❌ |
| Owners | ❌ | ❌ | ❌ | ❌ |
| Tax Records | ❌ | ❌ | ❌ | ❌ |
| Planning Data | ❌ | ❌ | ❌ | ❌ |

**Summary:** CANNOT delete anything. Read-only access to properties only.

---

## Quick Reference: Who Can Delete What?

### Properties
- ✅ **Can Delete:** Admin, Asset Editor
- ❌ **Cannot Delete:** Finance Editor, Planning Editor, Client User, Public Viewer

### Owners
- ✅ **Can Delete:** Admin, Asset Editor
- ❌ **Cannot Delete:** Finance Editor, Planning Editor, Client User, Public Viewer

### Tax Records
- ✅ **Can Delete:** Admin, Finance Editor
- ❌ **Cannot Delete:** Planning Editor, Asset Editor, Client User, Public Viewer

### Planning Data
- ✅ **Can Delete:** Admin, Planning Editor
- ❌ **Cannot Delete:** Finance Editor, Asset Editor, Client User, Public Viewer

---

## Roles That Can See But NOT Delete

If you need a role that can **view data but cannot delete it**, use:

### For All Data (Read-Only):
- **Client User** - Can see their own properties, owners, and tax records (NO delete)
- **Public Viewer** - Can see basic property info (NO delete)

### For Specific Data (Read-Only):
- **Finance Editor** - Can see properties and owners but NOT delete them
- **Planning Editor** - Can see properties and owners but NOT delete them
- **Asset Editor** - Can see tax records and planning data but NOT delete them

---

## Answer to "Which role can see data but cannot delete it?"

**Multiple roles fit this description:**

1. **Client User** - Most restrictive. Can ONLY view their own data, cannot delete anything.

2. **Public Viewer** - Very limited. Can ONLY view properties, cannot delete anything.

3. **Finance Editor** - Can view properties and owners but cannot delete them. However, CAN delete tax records.

4. **Planning Editor** - Can view properties and owners but cannot delete them. However, CAN delete planning data.

5. **Asset Editor** - Can view tax records and planning data but cannot delete them. However, CAN delete properties and owners.

**Best Answer for Complete Read-Only Access:**
- Use **Client User** or **Public Viewer** - these roles CANNOT delete ANY data at all.

**Best Answer for Partial Read-Only Access:**
- Depends on what data they need to see vs. what they need to manage.
- Each editor role has read-only access to some tables while having full access to others.
