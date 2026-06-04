-- Step 1: Add columns as nullable with defaults for existing rows
ALTER TABLE "Vehicle" ADD COLUMN "name" TEXT NOT NULL DEFAULT 'Vehicle';
ALTER TABLE "Vehicle" ADD COLUMN "vehicleNumber" TEXT NOT NULL DEFAULT 'TEMP-0000';

-- Step 2: Backfill existing rows with meaningful values
UPDATE "Vehicle" SET
  "name" = CASE
    WHEN "type" = 'CAR' THEN 'Car #' || "id"
    WHEN "type" = 'BIKE' THEN 'Bike #' || "id"
    WHEN "type" = 'SCOOTER' THEN 'Scooter #' || "id"
  END,
  "vehicleNumber" = CASE
    WHEN "type" = 'CAR' THEN 'CAR-' || LPAD("id"::text, 4, '0')
    WHEN "type" = 'BIKE' THEN 'BIKE-' || LPAD("id"::text, 4, '0')
    WHEN "type" = 'SCOOTER' THEN 'SCO-' || LPAD("id"::text, 4, '0')
  END;

-- Step 3: Remove defaults so new rows must provide values
ALTER TABLE "Vehicle" ALTER COLUMN "name" DROP DEFAULT;
ALTER TABLE "Vehicle" ALTER COLUMN "vehicleNumber" DROP DEFAULT;

-- Step 4: Add unique constraint on vehicleNumber
CREATE UNIQUE INDEX "Vehicle_vehicleNumber_key" ON "Vehicle"("vehicleNumber");
