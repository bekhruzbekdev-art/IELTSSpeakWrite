import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * DEVELOPMENT-ONLY preview session.
 *
 * There is no backend, no user store and no credential of any kind here.
 * Any non-empty username/password pair opens the UI so the shell can be
 * previewed. The password is never stored, transmitted or compared.
 * Real authentication is a later stage and will replace this module.
 */

const STORAGE_KEY = 'isws.preview-session';

interface PreviewUser {
  /** Whatever name was typed on the login form — display only. */
  username: string;
}

interface AuthContextValue {
  user: PreviewUser | null;
  isAuthenticated: boolean;
  /** Returns an error message, or `null` when the preview session opens. */
  signIn: (username: string, password: string) => string | null;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): PreviewUser | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as PreviewUser).username === 'string'
    ) {
      return { username: (parsed as PreviewUser).username };
    }
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PreviewUser | null>(readStoredUser);

  const signIn = useCallback((username: string, password: string): string | null => {
    const name = username.trim();

    if (!name || !password) {
      return 'Enter a username and password to open the preview.';
    }

    const nextUser: PreviewUser = { username: name };
    setUser(nextUser);

    try {
      // Only the display name is kept. The password is discarded here.
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } catch {
      /* storage unavailable — the session still lives in memory */
    }

    return null;
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing to clean up */
    }
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, signIn, signOut }),
    [user, signIn, signOut],
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
