import { UserRole } from '@/contexts/AuthContext';

export type TableName = 'properties' | 'owners' | 'tax_records' | 'planning_data';
export type Action = 'read' | 'write' | 'delete';

interface Permission {
  read: boolean;
  write: boolean;
  delete: boolean;
}

// Define permissions matrix based on RBAC requirements
const PERMISSIONS: Record<TableName, Record<UserRole, Permission>> = {
  properties: {
    admin: { read: true, write: true, delete: true },
    finance_editor: { read: true, write: false, delete: false },
    planning_editor: { read: true, write: false, delete: false },
    asset_editor: { read: true, write: true, delete: true },
    client_user: { read: true, write: false, delete: false }, // RLS applied
    public_viewer: { read: true, write: false, delete: false },
  },
  owners: {
    admin: { read: true, write: true, delete: true },
    finance_editor: { read: true, write: false, delete: false },
    planning_editor: { read: true, write: false, delete: false },
    asset_editor: { read: true, write: true, delete: true },
    client_user: { read: true, write: false, delete: false }, // RLS applied
    public_viewer: { read: false, write: false, delete: false },
  },
  tax_records: {
    admin: { read: true, write: true, delete: true },
    finance_editor: { read: true, write: true, delete: true },
    planning_editor: { read: false, write: false, delete: false },
    asset_editor: { read: true, write: false, delete: false },
    client_user: { read: true, write: false, delete: false }, // RLS applied
    public_viewer: { read: false, write: false, delete: false },
  },
  planning_data: {
    admin: { read: true, write: true, delete: true },
    finance_editor: { read: false, write: false, delete: false },
    planning_editor: { read: true, write: true, delete: true },
    asset_editor: { read: true, write: false, delete: false },
    client_user: { read: false, write: false, delete: false },
    public_viewer: { read: false, write: false, delete: false },
  },
};

/**
 * Check if a user with the given role can perform an action on a table
 */
export function canPerformAction(
  role: UserRole | null,
  table: TableName,
  action: Action
): boolean {
  if (!role) return false;
  return PERMISSIONS[table][role][action];
}

/**
 * Check if user can read from a table
 */
export function canRead(role: UserRole | null, table: TableName): boolean {
  return canPerformAction(role, table, 'read');
}

/**
 * Check if user can write to a table
 */
export function canWrite(role: UserRole | null, table: TableName): boolean {
  return canPerformAction(role, table, 'write');
}

/**
 * Check if user can delete from a table
 */
export function canDelete(role: UserRole | null, table: TableName): boolean {
  return canPerformAction(role, table, 'delete');
}

/**
 * Check if user has a specific role
 */
export function hasRole(userRole: UserRole | null, ...allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

/**
 * Check if user is an admin
 */
export function isAdmin(role: UserRole | null): boolean {
  return role === 'admin';
}

/**
 * Get all permissions for a role on a specific table
 */
export function getTablePermissions(
  role: UserRole | null,
  table: TableName
): Permission {
  if (!role) {
    return { read: false, write: false, delete: false };
  }
  return PERMISSIONS[table][role];
}

/**
 * Get user-friendly role name
 */
export function getRoleName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    admin: 'Administrator',
    finance_editor: 'Finance Editor',
    planning_editor: 'Planning Editor',
    asset_editor: 'Asset Editor',
    client_user: 'Property Owner',
    public_viewer: 'Public Viewer',
  };
  return roleNames[role];
}

/**
 * Get role color for badges
 */
export function getRoleColor(role: UserRole): string {
  const roleColors: Record<UserRole, string> = {
    admin: 'bg-purple-500 text-white',
    finance_editor: 'bg-green-500 text-white',
    planning_editor: 'bg-blue-500 text-white',
    asset_editor: 'bg-orange-500 text-white',
    client_user: 'bg-gray-500 text-white',
    public_viewer: 'bg-slate-400 text-white',
  };
  return roleColors[role];
}
