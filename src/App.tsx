import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { LearningProfilePage } from './pages/LearningProfilePage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { SprintPage } from './pages/SprintPage';
import { RequireAuth } from './routes/RequireAuth';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/sprint" element={<SprintPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/learning" element={<LearningProfilePage />} />

          {/* Not built yet — the sidebar entries stay disabled. */}
          <Route path="/support" element={<ComingSoonPage title="Support" />} />
          <Route path="/settings" element={<ComingSoonPage title="Settings" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/sprint" replace />} />
    </Routes>
  );
}
