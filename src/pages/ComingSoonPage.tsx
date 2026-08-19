import { Construction } from 'lucide-react';
import './ComingSoonPage.css';

interface ComingSoonPageProps {
  title: string;
}

/** Placeholder destination for sidebar sections that are not built yet. */
export function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <div className="coming-soon">
      <span className="coming-soon__icon" aria-hidden="true">
        <Construction size={22} />
      </span>
      <h1 className="coming-soon__title">{title}</h1>
      <p className="coming-soon__text">Coming soon.</p>
    </div>
  );
}
