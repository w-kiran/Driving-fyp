import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Helper: get a random item from an array
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

// Helper: random int between min and max (inclusive)
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper: get a date N days from now as "YYYY-MM-DD" string
const dateNDaysFromNow = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0] ?? d.toISOString().substring(0, 10);
};

// Helper: random date between dayMin and dayMax from now
const randomFutureDate = (dayMin: number, dayMax: number): string => {
  return dateNDaysFromNow(randInt(dayMin, dayMax));
};

const SLOTS = ["MORNING", "AFTERNOON", "EVENING"] as const;
const VEHICLE_TYPES = ["CAR", "BIKE", "SCOOTER"] as const;
const EXPERIENCE_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
const PAYMENT_METHODS = ["CREDIT_CARD", "CASH", "ONLINE", "DEBIT_CARD"] as const;

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.payment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.student.deleteMany();
  await prisma.instructor.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  const studentPassword = await bcrypt.hash("password123", 10);
  const adminPassword = await bcrypt.hash("admin@gmail.com", 10);

  // ============================================================
  // 1. USERS + STUDENTS
  // ============================================================

  // Admin
  await prisma.user.create({
    data: { name: "Super Admin", email: "admin@gmail.com", password: adminPassword, role: "ADMIN" },
  });

  // Student users (30 students)
  const studentNames = [
    "Aarav Sharma", "Sita Thapa", "Ram Bahadur", "Gita Poudel", "Hari Prasad",
    "Sunita Gurung", "Bikash Rai", "Anita Magar", "Deepak Tamang", "Pooja Shrestha",
    "Kiran Lama", "Nisha Adhikari", "Sanjay Karki", "Mina Bhandari", "Rajan Joshi",
    "Sarita Dahal", "Prakash Neupane", "Kamala Bhattarai", "Dipesh Ghimire", "Rina Khadka",
    "Suresh Acharya", "Laxmi Subedi", "Bijay Basnet", "Sangita Maharjan", "Ashok Thapa",
    "Srijana Sapkota", "Nabin K.C.", "Manisha Gurung", "Roshan Shrestha", "Puja Timilsina",
  ];

  const studentUsers = [];
  for (let i = 0; i < studentNames.length; i++) {
    const user = await prisma.user.create({
      data: {
        name: studentNames[i]!,
        email: `student${i + 1}@example.com`,
        password: studentPassword,
        role: "STUDENT",
      },
    });
    studentUsers.push(user);
  }

  // Student profiles
  const addresses = [
    "Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur", "Biratnagar",
    "Birgunj", "Dharan", "Hetauda", "Janakpur", "Butwal",
  ];

  const students = [];
  for (const user of studentUsers) {
    const student = await prisma.student.create({
      data: {
        name: user.name,
        address: `${pick(addresses)}, Nepal`,
        dob: new Date(randInt(1995, 2004), randInt(0, 11), randInt(1, 28)),
        phone: `98${randInt(10000000, 99999999)}`,
        userId: user.id,
      },
    });
    students.push(student);
  }

  console.log(`Seeded ${students.length} students`);

  // ============================================================
  // 2. INSTRUCTORS (3 junior, 3 intermediate, 5 senior = 11)
  // ============================================================

  const juniorNames = ["Junior - Ramesh K.", "Junior - Bikash M.", "Junior - Suman T."];
  const intermediateNames = ["Mid - Deepak S.", "Mid - Prakash N.", "Mid - Rajan J."];
  const seniorNames = [
    "Senior - Hari B.", "Senior - Bijay R.", "Senior - Ashok G.",
    "Senior - Nabin A.", "Senior - Suresh D.",
  ];

  const instructors = [];
  const allInstructorNames = [...juniorNames, ...intermediateNames, ...seniorNames];

  for (const name of allInstructorNames) {
    const isInSenior = seniorNames.includes(name);
    const isInJunior = juniorNames.includes(name);

    const instructorLevel = isInSenior
      ? "SENIOR"
      : isInJunior
        ? "JUNIOR"
        : "INTERMEDIATE";

    const instructor = await prisma.instructor.create({
      data: {
        name,
        available: true,
        dailyLessonCount: 0,
        instructorLevel: instructorLevel as "JUNIOR" | "INTERMEDIATE" | "SENIOR",
      },
    });
    instructors.push(instructor);
  }

  console.log(`Seeded ${instructors.length} instructors`);

  // ============================================================
  // 3. VEHICLES (5-10 bikes, 5-10 scooters, 3-5 cars)
  // ============================================================

  const vehicles = [];

  // Cars (4)
  const carNames = ["Toyota Corolla", "Honda Civic", "Suzuki Swift", "Hyundai i10"];
  const carNumbers = ["BA 1 PA 1234", "BA 2 PA 5678", "BA 3 PA 9012", "BA 4 PA 3456"];
  for (let i = 0; i < 4; i++) {
    const v = await prisma.vehicle.create({
      data: {
        name: carNames[i]!,
        vehicleNumber: carNumbers[i]!,
        type: "CAR",
        active: true,
      },
    });
    vehicles.push(v);
  }

  // Bikes (7)
  const bikeNames = ["Honda Hornet", "Bajaj Pulsar", "TVS Apache", "Yamaha FZ", "Hero Xtreme", "Suzuki Gixxer", "KTM Duke"];
  const bikeNumbers = ["BA 1 PA 2001", "BA 2 PA 2002", "BA 3 PA 2003", "BA 4 PA 2004", "BA 5 PA 2005", "BA 6 PA 2006", "BA 7 PA 2007"];
  for (let i = 0; i < 7; i++) {
    const v = await prisma.vehicle.create({
      data: {
        name: bikeNames[i]!,
        vehicleNumber: bikeNumbers[i]!,
        type: "BIKE",
        active: i <= 5, // 1 inactive for testing
      },
    });
    vehicles.push(v);
  }

  // Scooters (6)
  const scooterNames = ["Honda Activa", "TVS Jupiter", "Suzuki Access", "Yamaha Fascino", "Hero Pleasure", "Ather 450X"];
  const scooterNumbers = ["BA 1 PA 3001", "BA 2 PA 3002", "BA 3 PA 3003", "BA 4 PA 3004", "BA 5 PA 3005", "BA 6 PA 3006"];
  for (let i = 0; i < 6; i++) {
    const v = await prisma.vehicle.create({
      data: {
        name: scooterNames[i]!,
        vehicleNumber: scooterNumbers[i]!,
        type: "SCOOTER",
        active: true,
      },
    });
    vehicles.push(v);
  }

  console.log(`Seeded ${vehicles.length} vehicles (${vehicles.filter(v => v.type === "CAR").length} cars, ${vehicles.filter(v => v.type === "BIKE").length} bikes, ${vehicles.filter(v => v.type === "SCOOTER").length} scooters)`);

  // ============================================================
  // 4. BOOKINGS (200+ with random dates from tomorrow)
  // ============================================================

  const bookings = [];
  const totalBookings = 250;
  const tomorrow = dateNDaysFromNow(1);

  for (let i = 0; i < totalBookings; i++) {
    const student = pick(students);
    const vehicleType = pick([...VEHICLE_TYPES]);
    const slot = pick([...SLOTS]);
    const experience = pick([...EXPERIENCE_LEVELS]);
    const duration = pick([30, 60]);

    // Heavy bias toward tomorrow: ~60% tomorrow, rest spread across next 7 days
    const prefDate = Math.random() < 0.6 ? tomorrow : randomFutureDate(2, 7);

    // Some students have exam dates (closer = higher priority)
    const hasExam = Math.random() > 0.4; // 60% have exam dates
    const examDate = hasExam
      ? new Date(Date.now() + randInt(7, 30) * 24 * 60 * 60 * 1000)
      : null;

    const booking = await prisma.booking.create({
      data: {
        studentId: student.id,
        preferredSlot: slot,
        preferredDate: prefDate,
        vehicleType,
        trainingDuration: duration,
        experienceLevel: experience,
        examDate,
        failures: randInt(0, 3),
        lessonsCompleted: 0,
        status: "PENDING",
      },
    });
    bookings.push(booking);
  }

  console.log(`Seeded ${bookings.length} bookings`);

  // ============================================================
  // 5. LESSONS (some completed, for variety)
  // ============================================================

  // Create a few completed lessons from past dates
  for (let i = 0; i < 15; i++) {
    const student = pick(students);
    const instructor = pick(instructors);
    const vehicle = pick(vehicles.filter(v => v.active));
    const slot = pick([...SLOTS]);
    const pastDate = dateNDaysFromNow(randInt(-10, -1));

    await prisma.lesson.create({
      data: {
        status: "COMPLETED",
        scheduledDate: pastDate,
        studentId: student.id,
        instructorId: instructor.id,
        vehicleId: vehicle.id,
        slot,
        trainingDuration: pick([30, 60]),
        notes: Math.random() > 0.5 ? "Good progress on basic controls" : null,
      },
    });
  }

  console.log("Seeded 15 completed lessons");

  // ============================================================
  // 6. PAYMENTS (some for variety)
  // ============================================================

  for (let i = 0; i < 20; i++) {
    const student = pick(students);
    const amount = pick([100, 150, 175, 200, 250]);
    const status = pick(["PENDING", "COMPLETED", "COMPLETED", "COMPLETED"] as const); // 75% completed

    await prisma.payment.create({
      data: {
        studentId: student.id,
        amount,
        currency: "USD",
        status: status as "PENDING" | "COMPLETED",
        paymentMethod: pick([...PAYMENT_METHODS]),
        transactionId: status === "COMPLETED" ? `TXN-${randInt(100000, 999999)}` : null,
      },
    });
  }

  console.log("Seeded 20 payments");

  // ============================================================
  // 7. NOTIFICATIONS (welcome notifications for all students)
  // ============================================================

  for (const user of studentUsers) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "SYSTEM",
        title: "Welcome to DriveSmart!",
        message: "Your account has been created. Book your first driving lesson to get started!",
      },
    });
  }

  console.log(`Seeded ${studentUsers.length} notifications`);
  console.log("\nSeed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
