export type ExistingLesson = {
  date: string;
  slot: string;
  instructorId: number;
  vehicleId: number;
};

/**
 * O(n) conflict checker — iterates through the full lesson array each time.
 * Kept for backward compatibility; prefer ConflictChecker for large datasets.
 */
export const hasConflict = (
  date: string,
  slot: string,
  instructorId: number,
  vehicleId: number,
  existingLessons: ExistingLesson[]
) => {
  return existingLessons.some(
    lesson =>
      lesson.date === date &&
      lesson.slot === slot &&
      (lesson.instructorId === instructorId ||
        lesson.vehicleId === vehicleId)
  );
};

/**
 * O(1) conflict checker using Sets.
 * Maintains two look-up sets (instructor-slot and vehicle-slot)
 * so that conflict checking is instant regardless of dataset size.
 * call .add() each time a lesson is scheduled to keep it in sync.
 */
export class ConflictChecker {
  private instructorSlotMap: Set<string>;
  private vehicleSlotMap: Set<string>;

  constructor(lessons: ExistingLesson[]) {
    this.instructorSlotMap = new Set();
    this.vehicleSlotMap = new Set();
    for (const lesson of lessons) {
      this.add(lesson);
    }
  }

  add(lesson: ExistingLesson): void {
    this.instructorSlotMap.add(`${lesson.date}|${lesson.slot}|${lesson.instructorId}`);
    this.vehicleSlotMap.add(`${lesson.date}|${lesson.slot}|${lesson.vehicleId}`);
  }

  hasConflict(date: string, slot: string, instructorId: number, vehicleId: number): boolean {
    return (
      this.instructorSlotMap.has(`${date}|${slot}|${instructorId}`) ||
      this.vehicleSlotMap.has(`${date}|${slot}|${vehicleId}`)
    );
  }
}
