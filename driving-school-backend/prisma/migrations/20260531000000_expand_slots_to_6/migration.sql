-- Create new enum type with 6 slot values
CREATE TYPE "Slot_new" AS ENUM ('SLOT_1', 'SLOT_2', 'SLOT_3', 'SLOT_4', 'SLOT_5', 'SLOT_6');

-- Alter Booking.preferredSlot
ALTER TABLE "Booking" ALTER COLUMN "preferredSlot" TYPE "Slot_new" USING (
  CASE "preferredSlot"
    WHEN 'MORNING' THEN 'SLOT_1'::"Slot_new"
    WHEN 'AFTERNOON' THEN 'SLOT_3'::"Slot_new"
    WHEN 'EVENING' THEN 'SLOT_5'::"Slot_new"
  END
);

-- Alter Lesson.slot
ALTER TABLE "Lesson" ALTER COLUMN "slot" TYPE "Slot_new" USING (
  CASE "slot"
    WHEN 'MORNING' THEN 'SLOT_1'::"Slot_new"
    WHEN 'AFTERNOON' THEN 'SLOT_3'::"Slot_new"
    WHEN 'EVENING' THEN 'SLOT_5'::"Slot_new"
  END
);

-- Drop old enum and rename new one
DROP TYPE "Slot";
ALTER TYPE "Slot_new" RENAME TO "Slot";
