import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
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
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as LocationState | null)?.from ?? '/sprint';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(signIn(username, password));
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
          Preview build — no accounts exist yet. Any username and password opens the
          interface so the design can be reviewed.
        </p>
      </div>
    </div>
  );
}
