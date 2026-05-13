export interface Student {
    id: number;
    preferredSlots: string[];
    examDate: Date | null;
    status: "PENDING" | "SCHEDULED" | "COMPLETED";
    failures: number;
    lessonsCompleted: number;
}
export declare const priorityScheduling: <T extends Student>(students: T[]) => T[];
//# sourceMappingURL=scheduler.d.ts.map