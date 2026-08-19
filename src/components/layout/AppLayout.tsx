import { Menu } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppData } from '../../state/AppDataContext';
import { BrandMark } from '../ui/BrandMark';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Sidebar } from './Sidebar';
import './AppLayout.css';

export function AppLayout() {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const { examMode, startingPoint } = useAppData();

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // A navigation always dismisses the mobile drawer.
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isDrawerOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isDrawerOpen]);

  /*
   * EXAM MODE: the sidebar and top bar are removed outright, and any route
   * outside the paper is bounced straight back to it — hiding the chrome
   * alone would still leave a typed URL as a way out.
   */
  if (examMode) {
    const onExamRoute = location.pathname.startsWith('/sprint/starting-point/');

    if (!onExamRoute) {
      const activeMock =
        startingPoint.speaking.status === 'in-progress' ? 'speaking' : 'writing';
      return <Navigate to={`/sprint/starting-point/${activeMock}`} replace />;
    }

    return <Outlet />;
  }

  return (
    <div className="app-layout">
      <Sidebar isOpen={isDrawerOpen} onClose={closeDrawer} />

      {isDrawerOpen && (
        <div
          className="app-layout__overlay"
          onClick={closeDrawer}
          role="presentation"
        />
      )}

      <div className="app-layout__main">
        <header className="app-layout__topbar">
          <button
            type="button"
            className="app-layout__menu"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            aria-expanded={isDrawerOpen}
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <BrandMark />
          <div className="app-layout__topbar-actions">
            <ThemeToggle />
          </div>
        </header>

        <main className="app-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
