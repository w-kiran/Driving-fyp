import prisma from "../../../config/db.js";
export const addInstructor = async (req, res) => {
    const { name, availableSlots } = req.body;
    const instructor = await prisma.instructor.create({
        data: { name, availableSlots }
    });
    res.json(instructor);
};
export const getInstructors = async (req, res) => {
    const instructors = await prisma.instructor.findMany();
    res.json(instructors);
};
//# sourceMappingURL=instructor.controller.js.map