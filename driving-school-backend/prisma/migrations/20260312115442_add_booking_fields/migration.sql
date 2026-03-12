/*
  Warnings:

  - The `availableSlots` column on the `Instructor` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `examDate` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `failures` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `lessonsCompleted` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `preferredSlots` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Student` table. All the data in the column will be lost.
  - The `availableSlots` column on the `Vehicle` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `experienceLevel` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trainingDuration` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `preferredSlot` on the `Booking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `vehicleType` on the `Booking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `trainingDuration` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `slot` on the `Lesson` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `Vehicle` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Slot" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'BIKE', 'SCOOTER');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "examDate" TIMESTAMP(3),
ADD COLUMN     "experienceLevel" "ExperienceLevel" NOT NULL,
ADD COLUMN     "failures" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trainingDuration" INTEGER NOT NULL,
DROP COLUMN "preferredSlot",
ADD COLUMN     "preferredSlot" "Slot" NOT NULL,
DROP COLUMN "vehicleType",
ADD COLUMN     "vehicleType" "VehicleType" NOT NULL;

-- AlterTable
ALTER TABLE "Instructor" DROP COLUMN "availableSlots",
ADD COLUMN     "availableSlots" "Slot"[];

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "trainingDuration" INTEGER NOT NULL,
DROP COLUMN "slot",
ADD COLUMN     "slot" "Slot" NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "createdAt",
DROP COLUMN "examDate",
DROP COLUMN "failures",
DROP COLUMN "lessonsCompleted",
DROP COLUMN "preferredSlots",
DROP COLUMN "status",
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Unknown';

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "type",
ADD COLUMN     "type" "VehicleType" NOT NULL,
DROP COLUMN "availableSlots",
ADD COLUMN     "availableSlots" "Slot"[];
