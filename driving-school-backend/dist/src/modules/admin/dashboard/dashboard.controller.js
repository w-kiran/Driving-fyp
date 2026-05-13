import prisma from "../../../config/db.js";
export const getDashboardStats = async (req, res) => {
    try {
        const [totalStudents, totalInstructors, pendingBookings, scheduledLessons, completedLessons, totalVehicles, instructorStats] = await Promise.all([
            prisma.student.count(),
            prisma.instructor.count(),
            prisma.booking.count({ where: { status: "PENDING" } }),
            prisma.lesson.count({ where: { status: "SCHEDULED" } }),
            prisma.lesson.count({ where: { status: "COMPLETED" } }),
            prisma.vehicle.count({ where: { active: true } }),
            prisma.instructor.findMany({
                select: {
                    id: true,
                    name: true,
                    dailyLessonCount: true,
                    _count: { select: { lessons: true } }
                }
            })
        ]);
        const stats = {
            students: totalStudents,
            instructors: totalInstructors,
            vehicles: totalVehicles,
            bookings: {
                pending: pendingBookings
            },
            lessons: {
                scheduled: scheduledLessons,
                completed: completedLessons
            },
            instructorLoad: instructorStats.map(i => ({
                id: i.id,
                name: i.name,
                dailyLessonCount: i.dailyLessonCount,
                totalLessons: i._count.lessons
            }))
        };
        res.json({ stats });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
//# sourceMappingURL=dashboard.controller.js.map