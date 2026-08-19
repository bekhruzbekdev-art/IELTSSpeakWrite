import { useMemo, useState } from 'react';
import { AttendanceRoster } from '../../components/attendance/AttendanceRoster';
import { PageHeader, SectionHeading, Surface } from '../../components/ui/Surface';
import { demoCohorts, demoCohortStudents, isoDate } from '../../data/demo';
import { ATTENDANCE_LABELS, ATTENDANCE_STATUSES, markFor } from '../../lib/attendance';
import { useAppData } from '../../state/AppDataContext';
import type { AttendanceStatus } from '../../types/attendance';
import './AttendancePage.css';

export function AttendancePage() {
  const { attendance, setAttendance } = useAppData();
  const [cohortId, setCohortId] = useState(demoCohorts[0]?.id ?? '');
  const [date, setDate] = useState(() => isoDate(new Date()));

  const students = useMemo(
    () => demoCohortStudents.filter((student) => student.cohortId === cohortId),
    [cohortId],
  );

  const cohortMarks = useMemo(
    () => attendance.filter((mark) => mark.cohortId === cohortId),
    [attendance, cohortId],
  );

  // Tally for the selected date only.
  const tally = useMemo(() => {
    const counts: Record<AttendanceStatus, number> = {
      present: 0,
      late: 0,
      absent: 0,
      excused: 0,
    };
    let unmarked = 0;

    students.forEach((student) => {
      const status = markFor(cohortMarks, student.id, date);
      if (status) counts[status] += 1;
      else unmarked += 1;
    });

    return { counts, unmarked };
  }, [students, cohortMarks, date]);

  return (
    <div className="attendance-page">
      <PageHeader
        title="Attendance"
        subtitle="Mark today's live lesson, or correct an earlier date"
      />

      <Surface padding="lg">
        <div className="attendance-page__controls">
          <label className="attendance-page__field">
            <span className="attendance-page__label">Cohort</span>
            <select
              className="attendance-page__input"
              value={cohortId}
              onChange={(event) => setCohortId(event.target.value)}
            >
              {demoCohorts.map((cohort) => (
                <option key={cohort.id} value={cohort.id}>
                  {cohort.name}
                </option>
              ))}
            </select>
          </label>

          <label className="attendance-page__field">
            <span className="attendance-page__label">Date</span>
            <input
              type="date"
              className="attendance-page__input"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
        </div>

        <ul className="attendance-page__tally">
          {ATTENDANCE_STATUSES.map((status) => (
            <li key={status} className={`attendance-page__tally-item tally--${status}`}>
              <span className="attendance-page__tally-value">{tally.counts[status]}</span>
              <span className="attendance-page__tally-label">
                {ATTENDANCE_LABELS[status]}
              </span>
            </li>
          ))}
          <li className="attendance-page__tally-item tally--unmarked">
            <span className="attendance-page__tally-value">{tally.unmarked}</span>
            <span className="attendance-page__tally-label">Not marked</span>
          </li>
        </ul>
      </Surface>

      <Surface padding="lg">
        <SectionHeading
          title="Roster"
          description="Tap a status to record it. Changes save as you go."
        />
        <AttendanceRoster
          students={students}
          marks={cohortMarks}
          date={date}
          onMark={(studentId, status) =>
            setAttendance({ studentId, cohortId, date, status })
          }
        />
      </Surface>
    </div>
  );
}
