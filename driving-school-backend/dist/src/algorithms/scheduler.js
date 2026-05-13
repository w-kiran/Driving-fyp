// algorithms/scheduler.ts
export const priorityScheduling = (students) => {
    return students.sort((a, b) => {
        if (!a.examDate)
            return 1;
        if (!b.examDate)
            return -1;
        return a.examDate.getTime() - b.examDate.getTime();
    });
};
//# sourceMappingURL=scheduler.js.map