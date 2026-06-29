import { hasConflict, ConflictChecker } from '../conflictChecker';

describe('hasConflict', () => {
  it('should return false when no conflicts exist', () => {
    const existingLessons = [
      { date: '2024-06-10', slot: 'SLOT_1', instructorId: 1, vehicleId: 10 },
      { date: '2024-06-10', slot: 'SLOT_3', instructorId: 2, vehicleId: 20 },
    ];

    const result = hasConflict('2024-06-10', 'SLOT_6', 1, 10, existingLessons);

    expect(result).toBe(false);
  });

  it('should return true when instructor has a lesson at same slot', () => {
    const existingLessons = [
      { date: '2024-06-10', slot: 'SLOT_1', instructorId: 1, vehicleId: 10 },
    ];

    const result = hasConflict('2024-06-10', 'SLOT_1', 1, 20, existingLessons);

    expect(result).toBe(true);
  });

  it('should return true when vehicle has a lesson at same slot', () => {
    const existingLessons = [
      { date: '2024-06-10', slot: 'SLOT_1', instructorId: 1, vehicleId: 10 },
    ];

    const result = hasConflict('2024-06-10', 'SLOT_1', 2, 10, existingLessons);

    expect(result).toBe(true);
  });

  it('should return false when same instructor but different slot', () => {
    const existingLessons = [
      { date: '2024-06-10', slot: 'SLOT_1', instructorId: 1, vehicleId: 10 },
    ];

    const result = hasConflict('2024-06-10', 'SLOT_3', 1, 20, existingLessons);

    expect(result).toBe(false);
  });

  it('should return false when same vehicle but different slot', () => {
    const existingLessons = [
      { date: '2024-06-10', slot: 'SLOT_1', instructorId: 1, vehicleId: 10 },
    ];

    const result = hasConflict('2024-06-10', 'SLOT_6', 2, 10, existingLessons);

    expect(result).toBe(false);
  });

  it('should handle empty existing lessons', () => {
    const result = hasConflict('2024-06-10', 'SLOT_1', 1, 10, []);

    expect(result).toBe(false);
  });
});

describe('ConflictChecker', () => {
  it('should return false when no conflicts exist', () => {
    const checker = new ConflictChecker([
      { date: '2024-06-10', slot: 'SLOT_1', instructorId: 1, vehicleId: 10 },
      { date: '2024-06-10', slot: 'SLOT_3', instructorId: 2, vehicleId: 20 },
    ]);

    expect(checker.hasConflict('2024-06-10', 'SLOT_6', 1, 10)).toBe(false);
  });

  it('should detect instructor conflict', () => {
    const checker = new ConflictChecker([
      { date: '2024-06-10', slot: 'SLOT_1', instructorId: 1, vehicleId: 10 },
    ]);

    expect(checker.hasConflict('2024-06-10', 'SLOT_1', 1, 20)).toBe(true);
  });

  it('should detect vehicle conflict', () => {
    const checker = new ConflictChecker([
      { date: '2024-06-10', slot: 'SLOT_1', instructorId: 1, vehicleId: 10 },
    ]);

    expect(checker.hasConflict('2024-06-10', 'SLOT_1', 2, 10)).toBe(true);
  });

  it('should respect date boundaries', () => {
    const checker = new ConflictChecker([
      { date: '2024-06-10', slot: 'SLOT_1', instructorId: 1, vehicleId: 10 },
    ]);

    // Same instructor, same slot, but different date → no conflict
    expect(checker.hasConflict('2024-06-11', 'SLOT_1', 1, 20)).toBe(false);
  });

  it('should handle newly added lessons via .add()', () => {
    const checker = new ConflictChecker([]);
    expect(checker.hasConflict('2024-06-10', 'SLOT_1', 1, 10)).toBe(false);

    checker.add({ date: '2024-06-10', slot: 'SLOT_1', instructorId: 1, vehicleId: 10 });

    expect(checker.hasConflict('2024-06-10', 'SLOT_1', 1, 10)).toBe(true);
  });

  it('should handle empty checker', () => {
    const checker = new ConflictChecker([]);
    expect(checker.hasConflict('2024-06-10', 'SLOT_1', 1, 10)).toBe(false);
  });
});