import prisma from "../../../config/db.js";
export const getAllLessons = async (req, res) => {
    try {
        const status = req.query.status;
        const instructorId = req.query.instructorId;
        const date = req.query.date;
        const where = {};
        if (status)
            where.status = status;
        if (instructorId)
            where.instructorId = parseInt(instructorId);
        const lessons = await prisma.lesson.findMany({
            where,
            include: { student: true, instructor: true, vehicle: true },
            orderBy: { createdAt: "desc" }
        });
        if (date) {
            const filtered = lessons.filter(l => l.slot === date);
            return res.json({ lessons: filtered });
        }
        res.json({ lessons });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
export const getLessonById = async (req, res) => {
    try {
        const id = req.params.id;
        const lesson = await prisma.lesson.findUnique({
            where: { id: parseInt(id) },
            include: { student: true, instructor: true, vehicle: true }
        });
        if (!lesson)
            return res.status(404).json({ message: "Lesson not found" });
        res.json({ lesson });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
export const updateLesson = async (req, res) => {
    try {
        const id = req.params.id;
        const { slot, status, trainingDuration, instructorId, vehicleId } = req.body;
        const lesson = await prisma.lesson.findUnique({
            where: { id: parseInt(id) }
        });
        if (!lesson)
            return res.status(404).json({ message: "Lesson not found" });
        const data = {};
        if (slot)
            data.slot = slot;
        if (status)
            data.status = status;
        if (trainingDuration)
            data.trainingDuration = trainingDuration;
        if (instructorId)
            data.instructorId = parseInt(instructorId);
        if (vehicleId)
            data.vehicleId = parseInt(vehicleId);
        const updated = await prisma.lesson.update({
            where: { id: parseInt(id) },
            data,
            include: { student: true, instructor: true, vehicle: true }
        });
        res.json({ message: "Lesson updated", lesson: updated });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
export const deleteLesson = async (req, res) => {
    try {
        const id = req.params.id;
        const lesson = await prisma.lesson.findUnique({
            where: { id: parseInt(id) }
        });
        if (!lesson)
            return res.status(404).json({ message: "Lesson not found" });
        await prisma.lesson.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: "Lesson deleted" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
//# sourceMappingURL=lesson.controller.js.map