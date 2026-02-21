// algorithms/scheduler.ts

export type Student = {
  id: number;
  name: string;
  email: string;
  failures: number;
  lessonsCompleted: number;
  preferredSlots: string[];
  examDate?: Date;
  status: "PENDING" | "SCHEDULED" | "COMPLETED";
};

export const priorityScheduling = (students: Student[]): Student[] => {
  return students.sort((a, b) => {
    // Higher failures = higher priority
    const scoreA = a.failures * 2;
    const scoreB = b.failures * 2;
    return scoreB - scoreA; // descending order
  });
};