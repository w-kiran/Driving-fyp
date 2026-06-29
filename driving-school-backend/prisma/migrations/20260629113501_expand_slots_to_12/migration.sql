-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Slot" ADD VALUE 'SLOT_7';
ALTER TYPE "Slot" ADD VALUE 'SLOT_8';
ALTER TYPE "Slot" ADD VALUE 'SLOT_9';
ALTER TYPE "Slot" ADD VALUE 'SLOT_10';
ALTER TYPE "Slot" ADD VALUE 'SLOT_11';
ALTER TYPE "Slot" ADD VALUE 'SLOT_12';
