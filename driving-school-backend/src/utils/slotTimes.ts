// Slot time ranges — used for display purposes across the app

export const SLOT_TIMES: Record<string, { start: string; end: string }> = {
  MORNING: { start: "8:00 AM", end: "10:00 AM" },
  AFTERNOON: { start: "12:00 PM", end: "2:00 PM" },
  EVENING: { start: "4:00 PM", end: "6:00 PM" },
};

/**
 * Get a human-readable time range string for a slot.
 * Example: "MORNING" → "8:00 AM - 10:00 AM"
 */
export const getSlotTimeRange = (slot: string): string => {
  const times = SLOT_TIMES[slot];
  if (!times) return slot;
  return `${times.start} - ${times.end}`;
};
