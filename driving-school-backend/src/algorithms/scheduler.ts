// algorithms/scheduler.ts

export interface BookingData {
  id: number;
  preferredSlot: string;
  preferredDate: string;
  examDate: Date | null;
  status: "PENDING" | "SCHEDULED" | "COMPLETED";
  failures: number;
  lessonsCompleted: number;
  trainingDuration: number;
  studentId: number;
}

/**
 * Priority scheduling: sort by exam date (closer = first),
 * then by failures (more = first).
 * This determines the ORDER in which bookings are processed —
 * higher priority students get first pick of their preferred date+slot.
 */
export const priorityScheduling = <T extends BookingData>(bookings: T[]): T[] => {
  return bookings.sort((a, b) => {
    // Has exam date = higher priority
    if (a.examDate && b.examDate) {
      const diff = a.examDate.getTime() - b.examDate.getTime();
      if (diff !== 0) return diff;
    }
    if (a.examDate && !b.examDate) return -1;
    if (!a.examDate && b.examDate) return 1;

    // More failures = higher priority
    return b.failures - a.failures;
  });
};
