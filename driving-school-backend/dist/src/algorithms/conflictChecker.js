export const hasConflict = (slot, instructorId, vehicleId, existingLessons) => {
    return existingLessons.some(lesson => lesson.slot === slot &&
        (lesson.instructorId === instructorId ||
            lesson.vehicleId === vehicleId));
};
//# sourceMappingURL=conflictChecker.js.map