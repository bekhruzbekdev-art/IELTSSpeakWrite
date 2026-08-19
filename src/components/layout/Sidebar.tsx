import { LogOut, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { BrandMark } from '../ui/BrandMark';
import { navItems } from './navigation';
import './Sidebar.css';

interface SidebarProps {
  /** Drawer state — only relevant below the tablet breakpoint. */
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, signOut } = useAuth();

  return (
    <aside
      className={`sidebar${isOpen ? ' sidebar--open' : ''}`}
      aria-label="Main navigation"
    >
      <div className="sidebar__header">
        <BrandMark />
        <button
          type="button"
          className="sidebar__close"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <nav className="sidebar__nav">
        <p className="sidebar__section-label">Menu</p>
        <ul>
          {navItems.map(({ id, label, path, icon: Icon, enabled }) => (
            <li key={id}>
              {enabled ? (
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `sidebar__item${isActive ? ' sidebar__item--active' : ''}`
                  }
                  onClick={onClose}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              ) : (
                <button type="button" className="sidebar__item" disabled>
                  <Icon size={18} aria-hidden="true" />
                  <span>{label}</span>
                  <span className="sidebar__badge">Soon</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__footer">
        {user && (
          <div className="sidebar__user">
            <span className="sidebar__avatar" aria-hidden="true">
              {user.username.slice(0, 1).toUpperCase()}
            </span>
            <span className="sidebar__user-meta">
              <span className="sidebar__user-name">{user.username}</span>
              <span className="sidebar__user-role">Preview session</span>
            </span>
          </div>
        )}
        <button type="button" className="sidebar__logout" onClick={signOut}>
          <LogOut size={18} aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
