import prisma from "../../../config/db.js";
import type { Request, Response } from "express";

export const addVehicle = async (req:Request, res:Response) => {
  const { type, availableSlots } = req.body;

  const vehicle = await prisma.vehicle.create({
    data: { type, availableSlots }
  });

  res.json(vehicle);
};

export const getVehicles = async (req:Request, res:Response) => {
  const vehicles = await prisma.vehicle.findMany();
  res.json(vehicles);
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