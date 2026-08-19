import type { LeaderboardEntry } from '../../types/leaderboard';
import './LeaderboardTable.css';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  maxPoints: number;
}

/** Ranks 4 and below. Ordered strictly by Sprint points. */
export function LeaderboardTable({ entries, maxPoints }: LeaderboardTableProps) {
  return (
    <table className="leaderboard-table">
      <caption className="visually-hidden">
        Cohort ranking from fourth place, ordered by Sprint points
      </caption>
      <thead>
        <tr>
          <th scope="col" className="leaderboard-table__rank-col">
            #
          </th>
          <th scope="col">Student</th>
          <th scope="col" className="leaderboard-table__num">
            Days
          </th>
          <th scope="col" className="leaderboard-table__num">
            Points
          </th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr
            key={entry.id}
            className={entry.isCurrentUser ? 'leaderboard-table__row--you' : undefined}
          >
            <td className="leaderboard-table__rank-col">{entry.rank}</td>
            <td>
              <span className="leaderboard-table__name">{entry.displayName}</span>
            </td>
            <td className="leaderboard-table__num">{entry.completedDays} / 30</td>
            <td className="leaderboard-table__num leaderboard-table__points">
              {entry.points}
              <span className="leaderboard-table__max"> / {maxPoints}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
