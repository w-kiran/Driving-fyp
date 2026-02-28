import prisma from "../../config/db.js";
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