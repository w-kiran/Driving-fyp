import { hasConflict } from '../conflictChecker';

describe('hasConflict', () => {
  it('should return false when no conflicts exist', () => {
    const existingLessons = [
      { slot: 'MORNING', instructorId: 1, vehicleId: 10 },
      { slot: 'AFTERNOON', instructorId: 2, vehicleId: 20 },
    ];

    const result = hasConflict('EVENING', 1, 10, existingLessons);

    expect(result).toBe(false);
  });

  it('should return true when instructor has a lesson at same slot', () => {
    const existingLessons = [
      { slot: 'MORNING', instructorId: 1, vehicleId: 10 },
    ];

    const result = hasConflict('MORNING', 1, 20, existingLessons);

    expect(result).toBe(true);
  });

  it('should return true when vehicle has a lesson at same slot', () => {
    const existingLessons = [
      { slot: 'MORNING', instructorId: 1, vehicleId: 10 },
    ];

    const result = hasConflict('MORNING', 2, 10, existingLessons);

    expect(result).toBe(true);
  });

  it('should return false when same instructor but different slot', () => {
    const existingLessons = [
      { slot: 'MORNING', instructorId: 1, vehicleId: 10 },
    ];

    const result = hasConflict('AFTERNOON', 1, 20, existingLessons);

    expect(result).toBe(false);
  });

  it('should return false when same vehicle but different slot', () => {
    const existingLessons = [
      { slot: 'MORNING', instructorId: 1, vehicleId: 10 },
    ];

    const result = hasConflict('EVENING', 2, 10, existingLessons);

    expect(result).toBe(false);
  });

  it('should handle empty existing lessons', () => {
    const result = hasConflict('MORNING', 1, 10, []);

    expect(result).toBe(false);
  });
});