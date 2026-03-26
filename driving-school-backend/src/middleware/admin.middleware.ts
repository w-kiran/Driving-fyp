import type{ Response, NextFunction } from "express";
import type { AuthRequest } from "./auth.middleware.js";

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }

  next();
};