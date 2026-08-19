import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ROLE_DEFINITIONS } from '../lib/permissions';
import type { Permission } from '../types/rbac';

interface RequirePermissionProps {
  /** The route opens when the role holds ANY of these. */
  anyOf: Permission[];
}

/**
 * Route-level gate. This hides screens a role has no business seeing; it is
 * not a security boundary — see src/lib/permissions.ts.
 */
export function RequirePermission({ anyOf }: RequirePermissionProps) {
  const { user, hasPermission } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const allowed = anyOf.some((permission) => hasPermission(permission));
  if (!allowed) {
    return <Navigate to={ROLE_DEFINITIONS[user.role].homePath} replace />;
  }

  return <Outlet />;
}
