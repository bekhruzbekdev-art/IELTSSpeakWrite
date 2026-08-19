import { useEffect, useState } from 'react';
import { formatDuration } from '../../lib/format';
import { msUntilNextMidnight } from '../../lib/sprintProgress';

/** Time left in the student's current calendar day, ticking each minute. */
export function CountdownTimer() {
  const [remaining, setRemaining] = useState(() => msUntilNextMidnight());

  useEffect(() => {
    const id = window.setInterval(() => setRemaining(msUntilNextMidnight()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return <>{formatDuration(remaining)} remaining</>;
}
