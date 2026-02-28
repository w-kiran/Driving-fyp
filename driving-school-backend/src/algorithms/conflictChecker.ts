export type ExistingLesson = {
  slot: string;
  instructorId: number;
  vehicleId: number;
};

export const hasConflict = (
  slot: string,
  instructorId: number,
  vehicleId: number,
  existingLessons: ExistingLesson[]
) => {
  return existingLessons.some(
    lesson =>
      lesson.slot === slot &&
      (lesson.instructorId === instructorId ||
        lesson.vehicleId === vehicleId)
  );
};