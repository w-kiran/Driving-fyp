// algorithms/allocator.ts

import { hasConflict } from "./conflictChecker.js";
import { sortInstructorsByLoad } from "./fairness.js";

export type Student = {
  id: number;
  name: string;
  preferredSlots: string[];
  failures: number;
  lessonsCompleted: number;
  email: string;
  examDate?: Date | null;
  status: "PENDING" | "SCHEDULED" | "COMPLETED";
};

export type Instructor = {
  id: number;
  name: string;
  availableSlots: string[];
  dailyLessonCount: number;
};

export type Vehicle = {
  id: number;
  type: string;
  availableSlots: string[];
  active: boolean;
};

export type AllocationResult = {
  slot: string;
  instructor: Instructor;
  vehicle: Vehicle;
} | null;

export type ExistingLesson = {
  slot: string;
  instructorId: number;
  vehicleId: number;
};

export const allocate = (
  student: Student,
  instructors: Instructor[],
  vehicles: Vehicle[],
  existingLessons: ExistingLesson[]
): AllocationResult => {

  const fairInstructors = sortInstructorsByLoad(instructors);

  for (const slot of student.preferredSlots) {

    for (const instructor of fairInstructors) {

      if (!instructor.availableSlots.includes(slot)) continue;

      for (const vehicle of vehicles) {

        if (!vehicle.availableSlots.includes(slot) || !vehicle.active) continue;

        const conflict = hasConflict(
          slot,
          instructor.id,
          vehicle.id,
          existingLessons
        );

        if (!conflict) {
          return { slot, instructor, vehicle };
        }

      }
    }
  }

  return null;
};