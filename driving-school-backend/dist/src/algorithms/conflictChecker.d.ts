export type ExistingLesson = {
    slot: string;
    instructorId: number;
    vehicleId: number;
};
export declare const hasConflict: (slot: string, instructorId: number, vehicleId: number, existingLessons: ExistingLesson[]) => boolean;
//# sourceMappingURL=conflictChecker.d.ts.map