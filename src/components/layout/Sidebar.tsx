import { LogOut, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { demoAccount } from '../../data/demo';
import { AvatarGlyph } from '../profile/AvatarGlyph';
import { BrandMark } from '../ui/BrandMark';
import { navigationFor } from './navigation';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, signOut } = useAuth();
  const sections = user ? navigationFor(user.role) : [];

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
        {sections.map((section) => (
          <div key={section.id} className="sidebar__section">
            <p className="sidebar__section-label">{section.label}</p>
            <ul>
              {section.items.map(({ id, label, path, icon: Icon, exact }) => (
                <li key={id}>
                  <NavLink
                    to={path}
                    end={exact ?? false}
                    className={({ isActive }) =>
                      `sidebar__item${isActive ? ' sidebar__item--active' : ''}`
                    }
                    onClick={onClose}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sidebar__footer">
        {user && (
          <NavLink to="/profile" end className="sidebar__user" onClick={onClose}>
            <AvatarGlyph preset={demoAccount.avatar} size={34} />
            <span className="sidebar__user-meta">
              <span className="sidebar__user-name">{user.username}</span>
              <span className="sidebar__user-role">{user.displayName}</span>
            </span>
          </NavLink>
        )}
        <button type="button" className="sidebar__logout" onClick={signOut}>
          <LogOut size={18} aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
