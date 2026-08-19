import type { ReactNode } from 'react';
import './Surface.css';

interface SurfaceProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

/** The standard raised panel every page composes from. */
export function Surface({ children, className = '', padding = 'md' }: SurfaceProps) {
  return (
    <section className={`surface surface--${padding} ${className}`.trim()}>
      {children}
    </section>
  );
}

interface SectionHeadingProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeading({ title, description, action }: SectionHeadingProps) {
  return (
    <header className="section-heading">
      <div>
        <h2 className="section-heading__title">{title}</h2>
        {description && <p className="section-heading__description">{description}</p>}
      </div>
      {action}
    </header>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <h1 className="page-header__title">{title}</h1>
        <p className="page-header__subtitle">{subtitle}</p>
      </div>
      {action}
    </header>
  );
}
