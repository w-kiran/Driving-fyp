-- CreateEnum
CREATE TYPE "InstructorLevel" AS ENUM ('JUNIOR', 'INTERMEDIATE', 'SENIOR');

-- AlterTable
ALTER TABLE "Instructor" ADD COLUMN     "instructorLevel" "InstructorLevel" NOT NULL DEFAULT 'INTERMEDIATE';
