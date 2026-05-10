// algorithms/scheduler.ts

export interface Student {
  id: number;
  preferredSlots: string[];
  examDate: Date | null;
  status: "PENDING" | "SCHEDULED" | "COMPLETED";
  failures: number;
  lessonsCompleted: number;
}
export const priorityScheduling = <T extends Student>(students: T[]): T[] => {
  return students.sort((a, b) => {
    if (!a.examDate) return 1;
    if (!b.examDate) return -1;
    return a.examDate.getTime() - b.examDate.getTime();
  });
};