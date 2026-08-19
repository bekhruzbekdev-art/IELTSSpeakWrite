import type { AttendanceMark, AttendanceRate, AttendanceStatus } from '../types/attendance';

export const ATTENDANCE_STATUSES: AttendanceStatus[] = [
  'present',
  'late',
  'absent',
  'excused',
];

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  excused: 'Excused',
};

/**
 * Attendance rate = (present + late) / (all marks except excused).
 *
 * Excused absences are removed from the denominator rather than counted
 * against the student — an approved absence should not read as a failure.
 */
export function attendanceRateFor(
  studentId: string,
  marks: AttendanceMark[],
): AttendanceRate {
  const mine = marks.filter((mark) => mark.studentId === studentId);

  const present = mine.filter((m) => m.status === 'present').length;
  const late = mine.filter((m) => m.status === 'late').length;
  const absent = mine.filter((m) => m.status === 'absent').length;
  const excused = mine.filter((m) => m.status === 'excused').length;

  const counted = present + late + absent;
  const percentage = counted === 0 ? 0 : Math.round(((present + late) / counted) * 100);

  return {
    studentId,
    recorded: mine.length,
    present,
    late,
    absent,
    excused,
    percentage,
  };
}

export function markFor(
  marks: AttendanceMark[],
  studentId: string,
  date: string,
): AttendanceStatus | null {
  return (
    marks.find((mark) => mark.studentId === studentId && mark.date === date)?.status ?? null
  );
}
