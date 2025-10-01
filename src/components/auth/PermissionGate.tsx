import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { canPerformAction, TableName, Action } from '@/lib/permissions';

interface PermissionGateProps {
  children: ReactNode;
  table: TableName;
  action: Action;
  fallback?: ReactNode;
}

/**
 * Component that only renders children if user has permission for a specific action on a table
 * @param children - Content to render if user has permission
 * @param table - The table name to check permission for
 * @param action - The action to check (read, write, delete)
 * @param fallback - Optional content to show when user doesn't have permission
 */
export function PermissionGate({ children, table, action, fallback = null }: PermissionGateProps) {
  const { role, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!canPerformAction(role, table, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
