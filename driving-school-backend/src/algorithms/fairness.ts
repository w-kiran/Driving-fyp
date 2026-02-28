export const sortInstructorsByLoad = (instructors: any[]) => {
  return instructors.sort(
    (a, b) => a.dailyLessonCount - b.dailyLessonCount
  );
};