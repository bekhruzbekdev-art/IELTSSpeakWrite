import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ROLE_DEFINITIONS, can } from '../lib/permissions';
import type { Permission, Role } from '../types/rbac';

/**
 * DEVELOPMENT-ONLY preview session.
 *
 * There is no backend, no user store and no credential of any kind here. Any
 * non-empty username/password pair opens the UI; the password is never stored,
 * transmitted or compared. The role is chosen on the login form so each
 * surface can be reviewed — which also means the role is NOT a security
 * boundary. See src/lib/permissions.ts.
 */

const STORAGE_KEY = 'isws.preview-session';

interface PreviewUser {
  username: string;
  role: Role;
  displayName: string;
}

interface AuthContextValue {
  user: PreviewUser | null;
  isAuthenticated: boolean;
  /** Convenience for the common `can(user.role, permission)` call. */
  hasPermission: (permission: Permission) => boolean;
  signIn: (username: string, password: string, role: Role) => string | null;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isRole(value: unknown): value is Role {
  return (
    value === 'founder' ||
    value === 'support-teacher' ||
    value === 'teacher' ||
    value === 'student'
  );
}

function readStoredUser(): PreviewUser | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as PreviewUser).username === 'string' &&
      isRole((parsed as PreviewUser).role)
    ) {
      const user = parsed as PreviewUser;
      return {
        username: user.username,
        role: user.role,
        displayName: ROLE_DEFINITIONS[user.role].label,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PreviewUser | null>(readStoredUser);

  const signIn = useCallback(
    (username: string, password: string, role: Role): string | null => {
      const name = username.trim();

      if (!name || !password) {
        return 'Enter a username and password to open the preview.';
      }

      const nextUser: PreviewUser = {
        username: name,
        role,
        displayName: ROLE_DEFINITIONS[role].label,
      };
      setUser(nextUser);

      try {
        // Only the display name and role are kept; the password is discarded.
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      } catch {
        /* storage unavailable — the session still lives in memory */
      }

      return null;
    },
    [],
  );

  const signOut = useCallback(() => {
    setUser(null);
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing to clean up */
    }
  }, []);

  const hasPermission = useCallback(
    (permission: Permission) => (user ? can(user.role, permission) : false),
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      hasPermission,
      signIn,
      signOut,
    }),
    [user, hasPermission, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}
