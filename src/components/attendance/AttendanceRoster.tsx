import { attendanceRateFor, ATTENDANCE_LABELS, ATTENDANCE_STATUSES, markFor } from '../../lib/attendance';
import type { AttendanceMark, AttendanceStatus, CohortStudent } from '../../types/attendance';
import './AttendanceRoster.css';

interface AttendanceRosterProps {
  students: CohortStudent[];
  marks: AttendanceMark[];
  date: string;
  onMark: (studentId: string, status: AttendanceStatus) => void;
}

export function AttendanceRoster({
  students,
  marks,
  date,
  onMark,
}: AttendanceRosterProps) {
  if (students.length === 0) {
    return <p className="roster__empty">No students in this cohort.</p>;
  }

  return (
    <ul className="roster">
      {students.map((student) => {
        const current = markFor(marks, student.id, date);
        const rate = attendanceRateFor(student.id, marks);

        return (
          <li key={student.id} className="roster__row">
            <div className="roster__student">
              <span className="roster__name">{student.displayName}</span>
              <span className="roster__rate">
                {rate.recorded === 0
                  ? 'No history'
                  : `${rate.percentage}% attendance · ${rate.recorded} lessons`}
              </span>
            </div>

            <div
              className="roster__toggles"
              role="radiogroup"
              aria-label={`Attendance for ${student.displayName}`}
            >
              {ATTENDANCE_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  role="radio"
                  aria-checked={current === status}
                  className={`roster__toggle roster__toggle--${status}${
                    current === status ? ' roster__toggle--on' : ''
                  }`}
                  onClick={() => onMark(student.id, status)}
                >
                  {ATTENDANCE_LABELS[status]}
                </button>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
