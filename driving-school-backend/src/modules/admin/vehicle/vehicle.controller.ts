import prisma from "../../../config/db.js";
import type { Request, Response } from "express";

export const addVehicle = async (req:Request, res:Response) => {
  const { type } = req.body;

  const vehicle = await prisma.vehicle.create({
    data: { type }
  });

  res.json({ vehicle });
};

export const getVehicles = async (req:Request, res:Response) => {
  const vehicles = await prisma.vehicle.findMany();
  res.json({ vehicles });
};

export const toggleVehicleActive = async (req:Request, res:Response) => {
  const id = parseInt(req.params.id as string);
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

  const updated = await prisma.vehicle.update({
    where: { id },
    data: { active: !vehicle.active }
  });
  res.json(updated);
};

export const updateVehicle = async (req:Request, res:Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { type } = req.body;

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    const updated = await prisma.vehicle.update({
      where: { id },
      data: { type }
    });
    res.json({ vehicle: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteVehicle = async (req:Request, res:Response) => {
  try {
    const id = parseInt(req.params.id as string);

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    await prisma.$transaction(async (tx) => {
      await tx.lesson.deleteMany({ where: { vehicleId: id } });
      await tx.vehicle.delete({ where: { id } });
    });

    res.json({ message: "Vehicle deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};