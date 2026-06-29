// algorithms/allocator.ts

import { ConflictChecker } from "./conflictChecker.js";
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
  instructorLevel?: string;
  available: boolean;
  dailyLessonCount: number;
};

export type Vehicle = {
  id: number;
  name: string;
  vehicleNumber: string;
  type: string;
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
 * Determine the target instructor level based on exam date proximity.
 * Closer exam date → higher level instructor.
 */
const getTargetInstructorLevel = (examDate: Date | null): string => {
  if (!examDate) return "JUNIOR";

  const daysUntilExam = Math.ceil(
    (examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExam <= 14) return "SENIOR";
  if (daysUntilExam <= 30) return "INTERMEDIATE";
  return "JUNIOR";
};

/**
 * Try to allocate a student to a lesson.
 *
 * Priority order:
 * 1. preferredDate + preferredSlot (exact match)
 * 2. preferredDate + other slots
 * 3. other dates (tomorrow+1, tomorrow+2, etc.) + any slot
 *
 * Instructor selection:
 * - Students with closer exam dates get higher-level instructors
 * - Within same level, prefers least-loaded instructors
 * - Falls back to other level instructors if target level unavailable
 *
 * Uses ConflictChecker (Set-based O(1) lookup) for fast conflict detection.
 */
export const allocate = (
  student: Student,
  allDates: string[], // dates to try, in order
  instructors: Instructor[],
  vehicles: Vehicle[],
  conflictChecker: ConflictChecker
): AllocationResult => {

  // Determine target instructor level based on exam date proximity
  const targetLevel = getTargetInstructorLevel(student.examDate);

  // Group instructors by level
  const seniorInstructors = sortInstructorsByLoad(
    instructors.filter(i => i.instructorLevel === "SENIOR").map(i => ({...i}))
  );
  const intermediateInstructors = sortInstructorsByLoad(
    instructors.filter(i => i.instructorLevel === "INTERMEDIATE").map(i => ({...i}))
  );
  const juniorInstructors = sortInstructorsByLoad(
    instructors.filter(i => i.instructorLevel === "JUNIOR" || !i.instructorLevel).map(i => ({...i}))
  );

  // Try target level first, then fall back to other levels in order
  const levelAttemptOrder: Instructor[][] = [];
  if (targetLevel === "SENIOR") {
    levelAttemptOrder.push(seniorInstructors, intermediateInstructors, juniorInstructors);
  } else if (targetLevel === "INTERMEDIATE") {
    levelAttemptOrder.push(intermediateInstructors, seniorInstructors, juniorInstructors);
  } else {
    levelAttemptOrder.push(juniorInstructors, intermediateInstructors, seniorInstructors);
  }

  // Attempt 1: exact preferred date + preferred slot
  const preferredDateIdx = allDates.indexOf(student.preferredDate);
  if (preferredDateIdx !== -1) {
    for (const instructorGroup of levelAttemptOrder) {
      const result = tryAllocate(
        student.preferredDate,
        student.preferredSlot,
        false,
        instructorGroup,
        vehicles,
        conflictChecker
      );
      if (result) return result;
    }
  }

  // Attempt 2: preferred date + other slots
  if (preferredDateIdx !== -1) {
    for (const slot of ALL_SLOTS) {
      if (slot === student.preferredSlot) continue;
      for (const instructorGroup of levelAttemptOrder) {
        const result = tryAllocate(
          student.preferredDate,
          slot,
          true,
          instructorGroup,
          vehicles,
          conflictChecker
        );
        if (result) return result;
      }
    }
  }

  // Attempt 3: other dates + any slot
  for (const date of allDates) {
    if (date === student.preferredDate) continue; // already tried
    for (const slot of ALL_SLOTS) {
      for (const instructorGroup of levelAttemptOrder) {
        const result = tryAllocate(
          date,
          slot,
          true,
          instructorGroup,
          vehicles,
          conflictChecker
        );
        if (result) return result;
      }
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
  conflictChecker: ConflictChecker
): AllocationResult | null {
  for (const instructor of instructors) {
    if (!instructor.available) continue;

    for (const vehicle of vehicles) {
      if (!vehicle.active) continue;

      if (!conflictChecker.hasConflict(date, slot, instructor.id, vehicle.id)) {
        return { date, slot, shifted, instructor, vehicle };
      }
    }
  }
  return null;
}
