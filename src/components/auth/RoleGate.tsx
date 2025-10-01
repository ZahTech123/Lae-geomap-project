import { ReactNode } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface RoleGateProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

/**
 * Component that only renders children if user has one of the allowed roles
 * @param children - Content to render if user has permission
 * @param allowedRoles - Array of roles that can see the content
 * @param fallback - Optional content to show when user doesn't have permission
 */
export function RoleGate({ children, allowedRoles, fallback = null }: RoleGateProps) {
  const { role, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
