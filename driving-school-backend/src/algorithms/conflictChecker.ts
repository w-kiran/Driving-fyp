export type ExistingLesson = {
  date: string;
  slot: string;
  instructorId: number;
  vehicleId: number;
};

/**
 * Check if a given slot is already taken by the same instructor or vehicle on the same date.
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
