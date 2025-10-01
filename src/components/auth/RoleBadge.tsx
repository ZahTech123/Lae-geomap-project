import { UserRole } from '@/contexts/AuthContext';
import { getRoleName, getRoleColor } from '@/lib/permissions';
import { Badge } from '@/components/ui/badge';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

/**
 * Display a badge showing the user's role with appropriate styling
 */
export function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  return (
    <Badge className={`${getRoleColor(role)} ${className}`}>
      {getRoleName(role)}
    </Badge>
  );
}
