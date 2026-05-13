// algorithms/allocator.ts
import { hasConflict } from "./conflictChecker.js";
import { sortInstructorsByLoad } from "./fairness.js";
export const allocate = (student, instructors, vehicles, existingLessons) => {
    const fairInstructors = sortInstructorsByLoad(instructors);
    for (const slot of student.preferredSlots) {
        for (const instructor of fairInstructors) {
            if (!instructor.availableSlots.includes(slot))
                continue;
            for (const vehicle of vehicles) {
                if (!vehicle.availableSlots.includes(slot) || !vehicle.active)
                    continue;
                const conflict = hasConflict(slot, instructor.id, vehicle.id, existingLessons);
                if (!conflict) {
                    return { slot, instructor, vehicle };
                }
            }
        }
    }
    return null;
};
//# sourceMappingURL=allocator.js.map