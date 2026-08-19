import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { LoginPage } from './pages/LoginPage';
import { SprintPage } from './pages/SprintPage';
import { RequireAuth } from './routes/RequireAuth';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/sprint" element={<SprintPage />} />

          {/* Placeholder destinations — the sidebar entries stay disabled. */}
          <Route path="/leaderboard" element={<ComingSoonPage title="Leaderboard" />} />
          <Route
            path="/learning-profile"
            element={<ComingSoonPage title="Learning Profile" />}
          />
          <Route path="/support" element={<ComingSoonPage title="Support" />} />
          <Route path="/profile" element={<ComingSoonPage title="Profile" />} />
          <Route path="/settings" element={<ComingSoonPage title="Settings" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/sprint" replace />} />
    </Routes>
  );
}
