import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ROLE_DEFINITIONS } from './lib/permissions';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { LearningProfilePage } from './pages/LearningProfilePage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { SprintPage } from './pages/SprintPage';
import { SupportPage } from './pages/SupportPage';
import { AdminHomePage } from './pages/admin/AdminHomePage';
import { AttendancePage } from './pages/admin/AttendancePage';
import { RequireAuth } from './routes/RequireAuth';
import { RequirePermission } from './routes/RequirePermission';

/** Sends each role to the surface it actually starts on. */
function RoleHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_DEFINITIONS[user.role].homePath} replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          {/* Student surfaces */}
          <Route element={<RequirePermission anyOf={['sprint.view']} />}>
            <Route path="/sprint" element={<SprintPage />} />
          </Route>
          <Route element={<RequirePermission anyOf={['leaderboard.view']} />}>
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Route>
          <Route element={<RequirePermission anyOf={['learning-profile.view']} />}>
            <Route path="/profile/learning" element={<LearningProfilePage />} />
          </Route>

          {/* Shared */}
          <Route
            element={
              <RequirePermission
                anyOf={['support.ask', 'support.respond', 'unlock-request.review']}
              />
            }
          >
            <Route path="/support" element={<SupportPage />} />
          </Route>
          <Route element={<RequirePermission anyOf={['profile.view']} />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route element={<RequirePermission anyOf={['settings.view']} />}>
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Admin */}
          <Route
            element={
              <RequirePermission
                anyOf={[
                  'cohort.monitor',
                  'users.manage',
                  'audit-log.view',
                  'platform-analytics.view',
                ]}
              />
            }
          >
            <Route path="/admin" element={<AdminHomePage />} />
          </Route>
          <Route element={<RequirePermission anyOf={['attendance.manage']} />}>
            <Route path="/admin/attendance" element={<AttendancePage />} />
          </Route>

          <Route path="/" element={<RoleHome />} />
        </Route>
      </Route>

      <Route path="*" element={<RoleHome />} />
    </Routes>
  );
}
