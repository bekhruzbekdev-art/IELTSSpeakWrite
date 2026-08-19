import {
  CalendarCheck,
  ChartNoAxesColumn,
  LifeBuoy,
  ScrollText,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { PageHeader, SectionHeading, Surface } from '../../components/ui/Surface';
import { demoCohortStudents } from '../../data/demo';
import { ROLE_DEFINITIONS, ROLE_PERMISSIONS } from '../../lib/permissions';
import { useAppData } from '../../state/AppDataContext';
import type { Permission } from '../../types/rbac';
import './AdminHomePage.css';

interface Tool {
  id: string;
  label: string;
  description: string;
  icon: typeof Users;
  permission: Permission;
  path?: string;
}

const TOOLS: Tool[] = [
  {
    id: 'attendance',
    label: 'Attendance',
    description: 'Mark live lesson attendance and review history.',
    icon: CalendarCheck,
    permission: 'attendance.manage',
    path: '/admin/attendance',
  },
  {
    id: 'support',
    label: 'Support & unlock queue',
    description: 'Answer student questions and decide day unlock requests.',
    icon: LifeBuoy,
    permission: 'unlock-request.review',
    path: '/support',
  },
  {
    id: 'users',
    label: 'User management',
    description: 'Provision students and staff, reset credentials.',
    icon: Users,
    permission: 'users.manage',
  },
  {
    id: 'audit',
    label: 'Audit log',
    description: 'Every staff action, who took it and when.',
    icon: ScrollText,
    permission: 'audit-log.view',
  },
  {
    id: 'analytics',
    label: 'Platform analytics',
    description: 'Cohort completion, retention and score movement.',
    icon: ChartNoAxesColumn,
    permission: 'platform-analytics.view',
  },
];

export function AdminHomePage() {
  const { user, hasPermission } = useAuth();
  const { unlockRequests, threads, attendance } = useAppData();

  if (!user) return null;

  const permissions = [...ROLE_PERMISSIONS[user.role]].sort();
  const pending = unlockRequests.filter((r) => r.status === 'pending').length;
  const openThreads = threads.filter((t) => !t.resolved).length;
  const available = TOOLS.filter((tool) => hasPermission(tool.permission));

  return (
    <div className="admin-home">
      <PageHeader
        title="Admin Panel"
        subtitle={ROLE_DEFINITIONS[user.role].summary}
      />

      <ul className="admin-home__stats">
        <li>
          <span className="admin-home__stat-value">{pending}</span>
          <span className="admin-home__stat-label">Unlock requests pending</span>
        </li>
        <li>
          <span className="admin-home__stat-value">{openThreads}</span>
          <span className="admin-home__stat-label">Open support chats</span>
        </li>
        <li>
          <span className="admin-home__stat-value">{demoCohortStudents.length}</span>
          <span className="admin-home__stat-label">Students across cohorts</span>
        </li>
        <li>
          <span className="admin-home__stat-value">{attendance.length}</span>
          <span className="admin-home__stat-label">Attendance marks recorded</span>
        </li>
      </ul>

      <Surface padding="lg">
        <SectionHeading
          title="Tools"
          description="Only what your role can reach is listed."
        />
        <ul className="admin-home__tools">
          {available.map(({ id, label, description, icon: Icon, path }) => {
            const body = (
              <>
                <span className="admin-home__tool-icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span className="admin-home__tool-text">
                  <span className="admin-home__tool-label">{label}</span>
                  <span className="admin-home__tool-description">{description}</span>
                </span>
                {!path && <span className="admin-home__tool-tag">Not built yet</span>}
              </>
            );

            return (
              <li key={id}>
                {path ? (
                  <Link to={path} className="admin-home__tool">
                    {body}
                  </Link>
                ) : (
                  <span className="admin-home__tool admin-home__tool--inert">{body}</span>
                )}
              </li>
            );
          })}
        </ul>
      </Surface>

      <Surface padding="lg">
        <SectionHeading
          title="Your permissions"
          description={`Granted to ${ROLE_DEFINITIONS[user.role].label}. This list is enforced in the UI only — it is not a security boundary until the API enforces it too.`}
        />
        <ul className="admin-home__permissions">
          {permissions.map((permission) => (
            <li key={permission} className="admin-home__permission">
              {permission}
            </li>
          ))}
        </ul>
      </Surface>
    </div>
  );
}
