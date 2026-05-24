// algorithms/allocator.ts

import { hasConflict } from "./conflictChecker.js";
import { sortInstructorsByLoad } from "./fairness.js";

export type Student = {
  id: number;
  preferredSlot: string;
  preferredDate: string;
  failures: number;
  lessonsCompleted: number;
  examDate: Date | null;
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
  date: string;
  slot: string;
  shifted: boolean; // true if student didn't get their exact preferred date+slot
  instructor: Instructor;
  vehicle: Vehicle;
} | null;

export type ExistingLesson = {
  date: string;
  slot: string;
  instructorId: number;
  vehicleId: number;
};

const ALL_SLOTS = ["MORNING", "AFTERNOON", "EVENING"];

/**
 * Try to allocate a student to a lesson.
 *
 * Priority order:
 * 1. preferredDate + preferredSlot (exact match)
 * 2. preferredDate + other slots
 * 3. other dates (tomorrow+1, tomorrow+2, etc.) + any slot
 *
 * Within each attempt, prefers least-loaded instructors.
 */
export const allocate = (
  student: Student,
  allDates: string[], // dates to try, in order
  instructors: Instructor[],
  vehicles: Vehicle[],
  existingLessons: ExistingLesson[]
): AllocationResult => {

  const fairInstructors = sortInstructorsByLoad([...instructors]);

  // Attempt 1: exact preferred date + preferred slot
  const preferredDateIdx = allDates.indexOf(student.preferredDate);
  if (preferredDateIdx !== -1) {
    const result = tryAllocate(
      student.preferredDate,
      student.preferredSlot,
      false,
      fairInstructors,
      vehicles,
      existingLessons
    );
    if (result) return result;
  }

  // Attempt 2: preferred date + other slots
  if (preferredDateIdx !== -1) {
    for (const slot of ALL_SLOTS) {
      if (slot === student.preferredSlot) continue;
      const result = tryAllocate(
        student.preferredDate,
        slot,
        true,
        fairInstructors,
        vehicles,
        existingLessons
      );
      if (result) return result;
    }
  }

  // Attempt 3: other dates + any slot
  for (const date of allDates) {
    if (date === student.preferredDate) continue; // already tried
    for (const slot of ALL_SLOTS) {
      const result = tryAllocate(
        date,
        slot,
        true,
        fairInstructors,
        vehicles,
        existingLessons
      );
      if (result) return result;
    }
  }

  return null;
};

function tryAllocate(
  date: string,
  slot: string,
  shifted: boolean,
  instructors: Instructor[],
  vehicles: Vehicle[],
  existingLessons: ExistingLesson[]
): AllocationResult | null {
  for (const instructor of instructors) {
    if (!instructor.availableSlots.includes(slot)) continue;

    for (const vehicle of vehicles) {
      if (!vehicle.availableSlots.includes(slot) || !vehicle.active) continue;

      if (!hasConflict(date, slot, instructor.id, vehicle.id, existingLessons)) {
        return { date, slot, shifted, instructor, vehicle };
      }
    }
  }
  return null;
}
