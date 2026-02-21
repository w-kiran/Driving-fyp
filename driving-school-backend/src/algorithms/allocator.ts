// algorithms/allocator.ts

export type Student = {
  id: number;
  name: string;
  preferredSlots: string[];
  failures: number;
  lessonsCompleted: number;
  email: string;
  examDate?: Date;
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

export const allocate = (
  student: Student,
  instructors: Instructor[],
  vehicles: Vehicle[]
): AllocationResult => {
  for (const slot of student.preferredSlots) {
    const instructor = instructors.find(i => i.availableSlots.includes(slot));
    const vehicle = vehicles.find(v => v.availableSlots.includes(slot) && v.active);

    if (instructor && vehicle) {
      return { slot, instructor, vehicle };
    }
  }

  return null; // no available slot found
};