import { z } from "zod";

// ─── Slot enum ───────────────────────────────────────────
const slotEnum = z.enum([
  "SLOT_1", "SLOT_2", "SLOT_3", "SLOT_4",
  "SLOT_5", "SLOT_6", "SLOT_7", "SLOT_8",
  "SLOT_9", "SLOT_10", "SLOT_11", "SLOT_12",
]);

// ─── Vehicle type enum ────────────────────────────────────
const vehicleTypeEnum = z.enum(["CAR", "BIKE", "SCOOTER"]);

// ─── Experience level enum ────────────────────────────────
const experienceLevelEnum = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);

// ─── Instructor level enum ────────────────────────────────
const instructorLevelEnum = z.enum(["JUNIOR", "INTERMEDIATE", "SENIOR"]);

// ─── Booking status enum ──────────────────────────────────
const bookingStatusEnum = z.enum(["PENDING", "SCHEDULED", "COMPLETED", "CANCELLED"]);

// ─── Training duration ────────────────────────────────────
const trainingDurationEnum = z.union([z.literal(30), z.literal(60)]);

// ─── Date string (YYYY-MM-DD) ─────────────────────────────
const dateStringRegex = /^\d{4}-\d{2}-\d{2}$/;
const dateString = z.string().regex(dateStringRegex, "Date must be in YYYY-MM-DD format");

// ═══════════════════════════════════════════════════════════
// AUTH SCHEMAS
// ═══════════════════════════════════════════════════════════

export const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const studentRegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  dob: z.string().min(1, "Date of birth is required"),
});

export const studentLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ═══════════════════════════════════════════════════════════
// STUDENT BOOKING SCHEMAS
// ═══════════════════════════════════════════════════════════

export const createBookingSchema = z.object({
  preferredSlot: slotEnum,
  preferredDate: dateString,
  vehicleType: vehicleTypeEnum,
  trainingDuration: trainingDurationEnum,
  experienceLevel: experienceLevelEnum,
  lessonsCompleted: z.number().int().min(0).optional().default(0),
  failures: z.number().int().min(0).optional().default(0),
  examDate: z.string().optional(),
});

export const editBookingSchema = z.object({
  preferredSlot: slotEnum.optional(),
  preferredDate: dateString.optional(),
  vehicleType: vehicleTypeEnum.optional(),
  trainingDuration: trainingDurationEnum.optional(),
  experienceLevel: experienceLevelEnum.optional(),
  examDate: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════
// ADMIN BOOKING SCHEMAS
// ═══════════════════════════════════════════════════════════

export const updateBookingStatusSchema = z.object({
  status: bookingStatusEnum,
});

// ═══════════════════════════════════════════════════════════
// ADMIN LESSON SCHEMAS
// ═══════════════════════════════════════════════════════════

export const updateLessonSchema = z.object({
  slot: slotEnum.optional(),
  status: bookingStatusEnum.optional(),
  trainingDuration: trainingDurationEnum.optional(),
  instructorId: z.number().int().positive().optional(),
  vehicleId: z.number().int().positive().optional(),
});

export const completeLessonSchema = z.object({
  passed: z.boolean(),
  notes: z.string().nullable().optional(),
});

// ═══════════════════════════════════════════════════════════
// ADMIN INSTRUCTOR SCHEMAS
// ═══════════════════════════════════════════════════════════

export const addInstructorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  instructorLevel: instructorLevelEnum.optional().default("INTERMEDIATE"),
});

export const updateInstructorSchema = z.object({
  name: z.string().min(1).optional(),
  instructorLevel: instructorLevelEnum.optional(),
});

// ═══════════════════════════════════════════════════════════
// ADMIN VEHICLE SCHEMAS
// ═══════════════════════════════════════════════════════════

export const addVehicleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  type: vehicleTypeEnum,
});

export const updateVehicleSchema = z.object({
  name: z.string().min(1).optional(),
  vehicleNumber: z.string().min(1).optional(),
  type: vehicleTypeEnum.optional(),
});

// ═══════════════════════════════════════════════════════════
// ADMIN STUDENT SCHEMAS
// ═══════════════════════════════════════════════════════════

export const createStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  dob: z.string().min(1, "Date of birth is required"),
});

export const updateStudentSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  dob: z.string().min(1).optional(),
});

// ═══════════════════════════════════════════════════════════
// ADMIN PAYMENT SCHEMAS
// ═══════════════════════════════════════════════════════════

export const createPaymentSchema = z.object({
  studentId: z.union([z.number(), z.string().transform(Number)]),
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  bookingId: z.union([z.number(), z.string().transform(Number)]).optional(),
});
