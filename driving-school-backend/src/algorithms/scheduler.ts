// algorithms/scheduler.ts

const SLOT_PRIORITY: Record<string, number> = {
  SLOT_1: 0,
  SLOT_2: 1,
  SLOT_3: 2,
  SLOT_4: 3,
  SLOT_5: 4,
  SLOT_6: 5,
  SLOT_7: 6,
  SLOT_8: 7,
  SLOT_9: 8,
  SLOT_10: 9,
  SLOT_11: 10,
  SLOT_12: 11,
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
 * then by preferredSlot (SLOT_1 > SLOT_2 > ... > SLOT_12).
 * This determines the ORDER in which bookings are processed —
 * higher priority students get first pick of their preferred slot.
 */
export const priorityScheduling = <T extends BookingData>(bookings: T[]): T[] => {
  return bookings.sort((a, b) => {
    // 1. Sort by preferredDate (closer dates = higher priority)
    const dateDiff = new Date(a.preferredDate).getTime() - new Date(b.preferredDate).getTime();
    if (dateDiff !== 0) return dateDiff;

    // 2. Sort by preferredSlot (SLOT_1 > SLOT_2 > ... > SLOT_12)
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
