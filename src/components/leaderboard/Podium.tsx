import { Crown } from 'lucide-react';
import type { LeaderboardEntry } from '../../types/leaderboard';
import './Podium.css';

type Place = 'gold' | 'silver' | 'bronze';

const PLACE_BY_RANK: Record<number, Place> = { 1: 'gold', 2: 'silver', 3: 'bronze' };

function PodiumColumn({ entry }: { entry: LeaderboardEntry }) {
  const place = PLACE_BY_RANK[entry.rank] ?? 'bronze';

  return (
    <li className={`podium__column podium__column--${place}`}>
      <div className="podium__person">
        {entry.rank === 1 && (
          <Crown size={18} className="podium__crown" aria-hidden="true" />
        )}
        <span className="podium__avatar" aria-hidden="true">
          {entry.displayName.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase()}
        </span>
        <span className="podium__name">{entry.displayName}</span>
        <span className="podium__points">{entry.points} pts</span>
      </div>

      <div className="podium__pillar">
        <span className="podium__rank">{entry.rank}</span>
      </div>
    </li>
  );
}

/** Top three, ordered #2 · #1 · #3 so the winner stands centre and tallest. */
export function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const byRank = (rank: number) => entries.find((entry) => entry.rank === rank);
  const ordered = [byRank(2), byRank(1), byRank(3)].filter(
    (entry): entry is LeaderboardEntry => entry !== undefined,
  );

  return (
    <ol className="podium" aria-label="Top three">
      {ordered.map((entry) => (
        <PodiumColumn key={entry.id} entry={entry} />
      ))}
    </ol>
  );
}
