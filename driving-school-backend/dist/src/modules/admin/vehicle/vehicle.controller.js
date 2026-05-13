import prisma from "../../../config/db.js";
export const addVehicle = async (req, res) => {
    const { type, availableSlots } = req.body;
    const vehicle = await prisma.vehicle.create({
        data: { type, availableSlots }
    });
    res.json(vehicle);
};
export const getVehicles = async (req, res) => {
    const vehicles = await prisma.vehicle.findMany();
    res.json(vehicles);
};
//# sourceMappingURL=vehicle.controller.js.map