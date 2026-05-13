import prisma from "../../../config/db.js";
import { priorityScheduling } from "../../../algorithms/scheduler.js";
import { allocate } from "../../../algorithms/allocator.js";
export const generateSchedule = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: { status: "PENDING" },
            include: { student: true }
        });
        const instructors = await prisma.instructor.findMany();
        const instructorsForAllocation = instructors.map(i => ({
            ...i,
            availableSlots: i.availableSlots
        }));
        const vehicles = await prisma.vehicle.findMany({
            where: { active: true }
        });
        const vehiclesForAllocation = vehicles.map(v => ({
            ...v,
            availableSlots: v.availableSlots
        }));
        const existingLessons = await prisma.lesson.findMany({
            include: { vehicle: true }
        });
        const lessonsForAllocation = existingLessons.map(l => ({
            slot: l.slot,
            instructorId: l.instructorId,
            vehicleId: l.vehicleId
        }));
        const orderedBookings = priorityScheduling(bookings.map(b => ({
            id: b.id,
            preferredSlots: [b.preferredSlot],
            examDate: b.preferredDate ? new Date(b.preferredDate) : null,
            status: b.status,
            failures: b.failures ?? 0,
            lessonsCompleted: b.lessonsCompleted ?? 0,
            trainingDuration: b.trainingDuration ?? 60,
            studentId: b.studentId
        })));
        let scheduled = 0;
        let failed = 0;
        for (const booking of orderedBookings) {
            const allocation = allocate(booking, instructorsForAllocation, vehiclesForAllocation, lessonsForAllocation);
            if (!allocation) {
                failed++;
                continue;
            }
            const lesson = await prisma.lesson.create({
                data: {
                    slot: allocation.slot,
                    trainingDuration: booking.trainingDuration,
                    status: "SCHEDULED",
                    studentId: booking.studentId,
                    instructorId: allocation.instructor.id,
                    vehicleId: allocation.vehicle.id
                },
                include: { vehicle: true }
            });
            lessonsForAllocation.push({
                slot: lesson.slot,
                instructorId: lesson.instructorId,
                vehicleId: lesson.vehicleId
            });
            await prisma.booking.update({
                where: { id: booking.id },
                data: { status: "SCHEDULED" }
            });
            await prisma.instructor.update({
                where: { id: allocation.instructor.id },
                data: {
                    dailyLessonCount: { increment: 1 }
                }
            });
            scheduled++;
        }
        res.json({
            message: "Schedule generated successfully",
            scheduled,
            failed
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Scheduling failed" });
    }
};
//# sourceMappingURL=scheduler.controller.js.map