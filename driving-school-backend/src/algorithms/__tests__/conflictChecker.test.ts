import { hasConflict, ConflictChecker } from '../conflictChecker';

describe('hasConflict', () => {
  it('should return false when no conflicts exist', () => {
    const existingLessons = [
      { date: '2024-06-10', slot: 'MORNING', instructorId: 1, vehicleId: 10 },
      { date: '2024-06-10', slot: 'AFTERNOON', instructorId: 2, vehicleId: 20 },
    ];

    const result = hasConflict('2024-06-10', 'EVENING', 1, 10, existingLessons);

    expect(result).toBe(false);
  });

  it('should return true when instructor has a lesson at same slot', () => {
    const existingLessons = [
      { date: '2024-06-10', slot: 'MORNING', instructorId: 1, vehicleId: 10 },
    ];

    const result = hasConflict('2024-06-10', 'MORNING', 1, 20, existingLessons);

    expect(result).toBe(true);
  });

  it('should return true when vehicle has a lesson at same slot', () => {
    const existingLessons = [
      { date: '2024-06-10', slot: 'MORNING', instructorId: 1, vehicleId: 10 },
    ];

    const result = hasConflict('2024-06-10', 'MORNING', 2, 10, existingLessons);

    expect(result).toBe(true);
  });

  it('should return false when same instructor but different slot', () => {
    const existingLessons = [
      { date: '2024-06-10', slot: 'MORNING', instructorId: 1, vehicleId: 10 },
    ];

    const result = hasConflict('2024-06-10', 'AFTERNOON', 1, 20, existingLessons);

    expect(result).toBe(false);
  });

  it('should return false when same vehicle but different slot', () => {
    const existingLessons = [
      { date: '2024-06-10', slot: 'MORNING', instructorId: 1, vehicleId: 10 },
    ];

    const result = hasConflict('2024-06-10', 'EVENING', 2, 10, existingLessons);

    expect(result).toBe(false);
  });

  it('should handle empty existing lessons', () => {
    const result = hasConflict('2024-06-10', 'MORNING', 1, 10, []);

    expect(result).toBe(false);
  });
});

describe('ConflictChecker', () => {
  it('should return false when no conflicts exist', () => {
    const checker = new ConflictChecker([
      { date: '2024-06-10', slot: 'MORNING', instructorId: 1, vehicleId: 10 },
      { date: '2024-06-10', slot: 'AFTERNOON', instructorId: 2, vehicleId: 20 },
    ]);

    expect(checker.hasConflict('2024-06-10', 'EVENING', 1, 10)).toBe(false);
  });

  it('should detect instructor conflict', () => {
    const checker = new ConflictChecker([
      { date: '2024-06-10', slot: 'MORNING', instructorId: 1, vehicleId: 10 },
    ]);

    expect(checker.hasConflict('2024-06-10', 'MORNING', 1, 20)).toBe(true);
  });

  it('should detect vehicle conflict', () => {
    const checker = new ConflictChecker([
      { date: '2024-06-10', slot: 'MORNING', instructorId: 1, vehicleId: 10 },
    ]);

    expect(checker.hasConflict('2024-06-10', 'MORNING', 2, 10)).toBe(true);
  });

  it('should respect date boundaries', () => {
    const checker = new ConflictChecker([
      { date: '2024-06-10', slot: 'MORNING', instructorId: 1, vehicleId: 10 },
    ]);

    // Same instructor, same slot, but different date → no conflict
    expect(checker.hasConflict('2024-06-11', 'MORNING', 1, 20)).toBe(false);
  });

  it('should handle newly added lessons via .add()', () => {
    const checker = new ConflictChecker([]);
    expect(checker.hasConflict('2024-06-10', 'MORNING', 1, 10)).toBe(false);

    checker.add({ date: '2024-06-10', slot: 'MORNING', instructorId: 1, vehicleId: 10 });

    expect(checker.hasConflict('2024-06-10', 'MORNING', 1, 10)).toBe(true);
  });

  it('should handle empty checker', () => {
    const checker = new ConflictChecker([]);
    expect(checker.hasConflict('2024-06-10', 'MORNING', 1, 10)).toBe(false);
  });
});