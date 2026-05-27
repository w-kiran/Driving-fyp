// algorithms/scheduler.ts

const SLOT_PRIORITY: Record<string, number> = {
  MORNING: 0,
  AFTERNOON: 1,
  EVENING: 2,
};

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
 * Priority scheduling: sort by preferredDate (closer = first),
 * then by preferredSlot (MORNING > AFTERNOON > EVENING).
 * This determines the ORDER in which bookings are processed —
 * higher priority students get first pick of their preferred slot.
 */
export const priorityScheduling = <T extends BookingData>(bookings: T[]): T[] => {
  return bookings.sort((a, b) => {
    // 1. Sort by preferredDate (closer dates = higher priority)
    const dateDiff = new Date(a.preferredDate).getTime() - new Date(b.preferredDate).getTime();
    if (dateDiff !== 0) return dateDiff;

    // 2. Sort by preferredSlot (MORNING > AFTERNOON > EVENING)
    const slotDiff = (SLOT_PRIORITY[a.preferredSlot] ?? 99) - (SLOT_PRIORITY[b.preferredSlot] ?? 99);
    if (slotDiff !== 0) return slotDiff;

    // 3. Tiebreaker: exam date (closer = higher priority)
    if (a.examDate && b.examDate) {
      const examDiff = a.examDate.getTime() - b.examDate.getTime();
      if (examDiff !== 0) return examDiff;
    }
    if (a.examDate && !b.examDate) return -1;
    if (!a.examDate && b.examDate) return 1;

    // 4. Tiebreaker: more failures = higher priority
    return b.failures - a.failures;
  });
};
