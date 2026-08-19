import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ROLE_DEFINITIONS, SELECTABLE_ROLES } from '../lib/permissions';
import type { Role } from '../types/rbac';
import { BrandMark } from '../components/ui/BrandMark';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import './LoginPage.css';

interface LocationState {
  from?: string;
}

export function LoginPage() {
  const { isAuthenticated, signIn } = useAuth();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as LocationState | null)?.from ?? ROLE_DEFINITIONS[role].homePath;

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(signIn(username, password, role));
  };

  return (
    <div className="login">
      <div className="login__toolbar">
        <ThemeToggle />
      </div>

      <div className="login__card">
        <BrandMark variant="stacked" />

        <p className="login__tagline">30 Days of Speaking + Writing Practice</p>

        <form className="login__form" onSubmit={handleSubmit} noValidate>
          <label className="login__field">
            <span className="login__label">Username</span>
            <input
              className="login__input"
              type="text"
              name="username"
              autoComplete="off"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>

          <label className="login__field">
            <span className="login__label">Password</span>
            <input
              className="login__input"
              type="password"
              name="password"
              autoComplete="off"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <fieldset className="login__roles">
            <legend className="login__label">Sign in as</legend>
            <div className="login__role-grid">
              {SELECTABLE_ROLES.map((id) => (
                <label
                  key={id}
                  className={`login__role${role === id ? ' login__role--selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={id}
                    checked={role === id}
                    onChange={() => setRole(id)}
                    className="visually-hidden"
                  />
                  {ROLE_DEFINITIONS[id].label}
                </label>
              ))}
            </div>
            <p className="login__role-summary">{ROLE_DEFINITIONS[role].summary}</p>
          </fieldset>

          {error && (
            <p className="login__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="login__submit">
            Login
          </button>
        </form>

        <p className="login__note">
          Preview build — no accounts exist yet. Any username and password opens
          the interface. The role picker is a development control: it selects
          which surfaces render and is <strong>not</strong> a security boundary.
        </p>
      </div>
    </div>
  );
}
