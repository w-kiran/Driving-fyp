// algorithms/scheduler.ts

export interface Student {
  id: number;
  name: string;
  email: string;
  password: string;
  preferredSlots: string[];
  examDate: Date | null; // <-- allow null
  status: "PENDING" | "SCHEDULED" | "COMPLETED";
  failures: number;
  lessonsCompleted: number;
  createdAt: Date;
}

export const priorityScheduling = (students: Student[]) => {
  return students.sort((a, b) => {
    if (!a.examDate) return 1; // put students without examDate at the end
    if (!b.examDate) return -1;
    return a.examDate.getTime() - b.examDate.getTime();
  });
};