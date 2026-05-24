import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data (order matters for FK constraints)
  await prisma.payment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.student.deleteMany();
  await prisma.instructor.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // --- Users ---
  const adminPassword = await bcrypt.hash("admin123", 10);
  const studentPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: { name: "Super Admin", email: "admin@gmail.com", password: adminPassword, role: "ADMIN" },
  });

  const user1 = await prisma.user.create({
    data: { name: "John Doe", email: "john@example.com", password: studentPassword, role: "STUDENT" },
  });

  const user2 = await prisma.user.create({
    data: { name: "Jane Smith", email: "jane@example.com", password: studentPassword, role: "STUDENT" },
  });

  console.log("Seeded Users");

  // --- Students ---
  const student1 = await prisma.student.create({
    data: {
      name: "John Doe",
      address: "123 Main Street, Kathmandu",
      dob: new Date("2000-05-15"),
      phone: "9841234567",
      userId: user1.id,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      name: "Jane Smith",
      address: "456 Lakeside Road, Pokhara",
      dob: new Date("1999-08-22"),
      phone: "9851234567",
      userId: user2.id,
    },
  });

  console.log("Seeded Students");

  // --- Instructors ---
  const instructor1 = await prisma.instructor.create({
    data: {
      name: "Ram Bahadur",
      availableSlots: ["MORNING", "AFTERNOON"],
      dailyLessonCount: 2,
    },
  });

  const instructor2 = await prisma.instructor.create({
    data: {
      name: "Sita Thapa",
      availableSlots: ["AFTERNOON", "EVENING"],
      dailyLessonCount: 2,
    },
  });

  console.log("Seeded Instructors");

  // --- Vehicles ---
  const vehicle1 = await prisma.vehicle.create({
    data: { type: "CAR", availableSlots: ["MORNING", "AFTERNOON"], active: true },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: { type: "BIKE", availableSlots: ["MORNING", "AFTERNOON"], active: true },
  });

  const vehicle3 = await prisma.vehicle.create({
    data: { type: "SCOOTER", availableSlots: ["MORNING", "AFTERNOON", "EVENING"], active: false },
  });

  console.log("Seeded Vehicles");

  // --- Bookings ---
  const booking1 = await prisma.booking.create({
    data: {
      studentId: student1.id,
      preferredSlot: "MORNING",
      preferredDate: "2026-06-10",
      vehicleType: "CAR",
      trainingDuration: 60,
      experienceLevel: "BEGINNER",
      status: "PENDING",
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      studentId: student2.id,
      preferredSlot: "AFTERNOON",
      preferredDate: "2026-06-11",
      vehicleType: "CAR",
      trainingDuration: 90,
      experienceLevel: "INTERMEDIATE",
      status: "SCHEDULED",
      examDate: new Date("2026-07-15"),
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      studentId: student1.id,
      preferredSlot: "EVENING",
      preferredDate: "2026-05-20",
      vehicleType: "BIKE",
      trainingDuration: 45,
      experienceLevel: "ADVANCED",
      status: "COMPLETED",
      lessonsCompleted: 3,
      failures: 1,
    },
  });

  console.log("Seeded Bookings");

  // --- Lessons ---
  await prisma.lesson.create({
    data: {
      status: "SCHEDULED",
      studentId: student2.id,
      instructorId: instructor2.id,
      vehicleId: vehicle1.id,
      slot: "AFTERNOON",
      trainingDuration: 90,
    },
  });

  await prisma.lesson.create({
    data: {
      status: "COMPLETED",
      studentId: student1.id,
      instructorId: instructor1.id,
      vehicleId: vehicle2.id,
      slot: "MORNING",
      trainingDuration: 45,
      notes: "First practical lesson - good progress on basic controls",
    },
  });

  console.log("Seeded Lessons");

  // --- Payments ---
  await prisma.payment.create({
    data: {
      studentId: student1.id,
      bookingId: booking1.id,
      amount: 150.0,
      currency: "USD",
      status: "PENDING",
      paymentMethod: "CREDIT_CARD",
    },
  });

  await prisma.payment.create({
    data: {
      studentId: student2.id,
      bookingId: booking2.id,
      amount: 200.0,
      currency: "USD",
      status: "COMPLETED",
      paymentMethod: "CASH",
      transactionId: "TXN-A1B2C3D4",
    },
  });

  await prisma.payment.create({
    data: {
      studentId: student1.id,
      bookingId: booking3.id,
      amount: 175.0,
      currency: "USD",
      status: "COMPLETED",
      paymentMethod: "ONLINE",
      transactionId: "TXN-E5F6G7H8",
    },
  });

  console.log("Seeded Payments");

  // --- Notifications ---
  await prisma.notification.create({
    data: {
      userId: user1.id,
      type: "SYSTEM",
      title: "Welcome to DriveSmart!",
      message: "Your account has been created successfully. Start by booking your first lesson.",
    },
  });

  await prisma.notification.create({
    data: {
      userId: user2.id,
      type: "PAYMENT",
      title: "Payment Received",
      message: "Your payment of $200.00 has been processed successfully. Transaction ID: TXN-A1B2C3D4",
    },
  });

  await prisma.notification.create({
    data: {
      userId: user1.id,
      type: "SYSTEM",
      title: "Booking Confirmed",
      message: "Your booking for CAR training on 2026-06-10 has been received and is pending approval.",
    },
  });

  await prisma.notification.create({
    data: {
      userId: user2.id,
      type: "SYSTEM",
      title: "Lesson Scheduled",
      message: "Your lesson has been scheduled with instructor Sita Thapa for the afternoon slot.",
      read: true,
    },
  });

  console.log("Seeded Notifications");
  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
