export type Student = {
    id: number;
    preferredSlots: string[];
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
    slot: string;
    instructor: Instructor;
    vehicle: Vehicle;
} | null;
export type ExistingLesson = {
    slot: string;
    instructorId: number;
    vehicleId: number;
};
export declare const allocate: (student: Student, instructors: Instructor[], vehicles: Vehicle[], existingLessons: ExistingLesson[]) => AllocationResult;
//# sourceMappingURL=allocator.d.ts.map