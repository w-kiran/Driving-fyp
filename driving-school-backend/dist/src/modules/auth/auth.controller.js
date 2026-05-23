import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();
const COOKIE_NAME = "token";
const setTokenCookie = (res, token) => {
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
};
export const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
        where: { email }
    });
    if (!user || user.role !== "ADMIN") {
        return res.status(404).json({ message: "Admin not found" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
        return res.status(400).json({ message: "Invalid password" });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    setTokenCookie(res, token);
    res.json({
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
};
export const studentRegister = async (req, res) => {
    const { name, email, password, phone, address, dob } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return res.status(400).json({ message: "Email already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
        data: {
            name,
            email,
            password: hashed,
            role: "STUDENT",
            student: {
                create: {
                    phone,
                    address,
                    dob: new Date(dob),
                }
            }
        }
    });
    res.json({ message: "Student registered successfully" });
};
export const studentLogin = async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
        where: { email },
        include: { student: true }
    });
    if (!user || user.role !== "STUDENT") {
        return res.status(404).json({ message: "Student not found" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
        return res.status(400).json({ message: "Invalid password" });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    setTokenCookie(res, token);
    res.json({
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
};
export const logout = async (_req, res) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ message: "Logged out successfully" });
};
//# sourceMappingURL=auth.controller.js.map