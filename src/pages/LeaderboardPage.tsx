import { Info } from 'lucide-react';
import { LeaderboardTable } from '../components/leaderboard/LeaderboardTable';
import { Podium } from '../components/leaderboard/Podium';
import { PageHeader, SectionHeading, Surface } from '../components/ui/Surface';
import { demoCohort } from '../data/demo';
import { MAX_SPRINT_POINTS } from '../lib/sprintProgress';
import './LeaderboardPage.css';

export function LeaderboardPage() {
  const ranked = [...demoCohort.entries].sort((a, b) => b.points - a.points);
  const topThree = ranked.filter((entry) => entry.rank <= 3);
  const rest = ranked.filter((entry) => entry.rank > 3);

  return (
    <div className="leaderboard-page">
      <PageHeader
        title="Leaderboard"
        subtitle={`${demoCohort.name} · ${demoCohort.memberCount} students`}
      />

      <Surface padding="lg">
        <SectionHeading
          title="Top three"
          description={`Ranked by Sprint points, out of a possible ${MAX_SPRINT_POINTS}.`}
        />
        <Podium entries={topThree} />
      </Surface>

      <Surface padding="lg">
        <SectionHeading title="Standings" description="Fourth place onwards." />
        <LeaderboardTable entries={rest} maxPoints={MAX_SPRINT_POINTS} />
      </Surface>

      <p className="leaderboard-page__privacy">
        <Info size={14} aria-hidden="true" />
        <span>
          Rankings are scoped to your cohort and shown under initials, so no
          student is identifiable outside their own class.
        </span>
      </p>
    </div>
  );
}
