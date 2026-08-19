export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface CohortStudent {
  id: string;
  displayName: string;
  cohortId: string;
}

/** One student's mark for one lesson date. */
export interface AttendanceMark {
  studentId: string;
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  cohortId: string;
  status: AttendanceStatus;
}

export interface AttendanceRate {
  studentId: string;
  recorded: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  /** Present + late, over all non-excused marks. 0–100. */
  percentage: number;
}
