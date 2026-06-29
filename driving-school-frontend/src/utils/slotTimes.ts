// Slot time ranges — used for display purposes across the app

export const SLOT_TIMES: Record<string, { start: string; end: string }> = {
  SLOT_1: { start: '8:00 AM', end: '9:00 AM' },
  SLOT_2: { start: '9:00 AM', end: '10:00 AM' },
  SLOT_3: { start: '10:00 AM', end: '11:00 AM' },
  SLOT_4: { start: '11:00 AM', end: '12:00 PM' },
  SLOT_5: { start: '12:00 PM', end: '1:00 PM' },
  SLOT_6: { start: '1:00 PM', end: '2:00 PM' },
  SLOT_7: { start: '2:00 PM', end: '3:00 PM' },
  SLOT_8: { start: '3:00 PM', end: '4:00 PM' },
  SLOT_9: { start: '4:00 PM', end: '5:00 PM' },
  SLOT_10: { start: '5:00 PM', end: '6:00 PM' },
  SLOT_11: { start: '6:00 PM', end: '7:00 PM' },
  SLOT_12: { start: '7:00 PM', end: '8:00 PM' },
}

/**
 * Get a human-readable time range string for a slot.
 * Example: "SLOT_1" → "8:00 AM - 10:00 AM"
 */
export const getSlotTimeRange = (slot: string): string => {
  const times = SLOT_TIMES[slot]
  if (!times) return slot
  return `${times.start} - ${times.end}`
}
