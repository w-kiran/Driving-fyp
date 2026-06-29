-- Replace availableSlots (Slot[]) with available (Boolean) on Instructor
ALTER TABLE "Instructor" DROP COLUMN "availableSlots",
ADD COLUMN     "available" BOOLEAN NOT NULL DEFAULT true;
