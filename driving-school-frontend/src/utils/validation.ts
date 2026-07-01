import { z } from 'zod'

// ─── Slot enum ───────────────────────────────────────────
const slotEnum = z.enum([
  'SLOT_1', 'SLOT_2', 'SLOT_3', 'SLOT_4',
  'SLOT_5', 'SLOT_6', 'SLOT_7', 'SLOT_8',
  'SLOT_9', 'SLOT_10', 'SLOT_11', 'SLOT_12',
])

// ─── Vehicle type enum ────────────────────────────────────
const vehicleTypeEnum = z.enum(['CAR', 'BIKE', 'SCOOTER'])

// ─── Experience level enum ────────────────────────────────
const experienceLevelEnum = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])

// ─── Instructor level enum ────────────────────────────────
const instructorLevelEnum = z.enum(['JUNIOR', 'INTERMEDIATE', 'SENIOR'])


// ═══════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
  role: z.enum(['STUDENT', 'ADMIN']),
})

// ═══════════════════════════════════════════════════════════
// REGISTER
// ═══════════════════════════════════════════════════════════
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .min(7, 'Phone number is too short'),
  address: z
    .string()
    .min(1, 'Address is required'),
  dob: z
    .string()
    .min(1, 'Date of birth is required'),
})

// ═══════════════════════════════════════════════════════════
// CREATE BOOKING (student)
// ═══════════════════════════════════════════════════════════
export const createBookingSchema = z.object({
  preferredSlot: slotEnum,
  preferredDate: z
    .string()
    .min(1, 'Please select a date'),
  vehicleType: vehicleTypeEnum,
  trainingDuration: z.union([z.literal(30), z.literal(60)]),
  experienceLevel: experienceLevelEnum,
  examDate: z.string().optional(),
})

// ═══════════════════════════════════════════════════════════
// EDIT BOOKING (student dashboard)
// ═══════════════════════════════════════════════════════════
export const editBookingSchema = z.object({
  preferredSlot: slotEnum,
  preferredDate: z
    .string()
    .min(1, 'Please select a date'),
  vehicleType: vehicleTypeEnum,
  trainingDuration: z.union([z.literal(30), z.literal(60)]),
  experienceLevel: experienceLevelEnum,
  examDate: z.string().optional(),
})

// ═══════════════════════════════════════════════════════════
// ADMIN: ADD / EDIT INSTRUCTOR
// ═══════════════════════════════════════════════════════════
export const instructorSchema = z.object({
  name: z
    .string()
    .min(1, 'Instructor name is required')
    .min(2, 'Name must be at least 2 characters'),
  instructorLevel: instructorLevelEnum,
})

// ═══════════════════════════════════════════════════════════
// ADMIN: ADD / EDIT VEHICLE
// ═══════════════════════════════════════════════════════════
export const vehicleSchema = z.object({
  name: z
    .string()
    .min(1, 'Vehicle name is required'),
  vehicleNumber: z
    .string()
    .min(1, 'Vehicle number is required'),
  type: vehicleTypeEnum,
})

// ═══════════════════════════════════════════════════════════
// ADMIN: EDIT LESSON
// ═══════════════════════════════════════════════════════════
export const editLessonSchema = z.object({
  slot: slotEnum,
  instructorId: z
    .number()
    .int()
    .positive('Please select an instructor'),
  vehicleId: z
    .number()
    .int()
    .positive('Please select a vehicle'),
  trainingDuration: z
    .number()
    .int()
    .min(30, 'Minimum duration is 30 minutes')
    .max(120, 'Maximum duration is 120 minutes'),
})
