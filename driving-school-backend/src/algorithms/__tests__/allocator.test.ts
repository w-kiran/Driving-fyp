import { allocate } from '../allocator';
import { ConflictChecker } from '../conflictChecker';

describe('allocate', () => {
  const allDates = ['2024-06-10'];

  const instructors = [
    { id: 1, name: 'John', instructorLevel: 'INTERMEDIATE', available: true, dailyLessonCount: 0 },
    { id: 2, name: 'Jane', instructorLevel: 'SENIOR', available: true, dailyLessonCount: 1 },
  ];

  const vehicles = [
    { id: 10, name: 'Toyota Corolla', vehicleNumber: 'BA 1 PA 1234', type: 'CAR', active: true },
    { id: 20, name: 'Honda Hornet', vehicleNumber: 'BA 1 PA 2001', type: 'BIKE', active: true },
  ];

  it('should allocate to instructor matching student\'s exam date proximity (SENIOR for close exam)', () => {
    const student = {
      id: 1,
      preferredSlot: 'SLOT_1',
      preferredDate: '2024-06-10',
      examDate: new Date('2024-06-10'),
      status: 'PENDING' as const,
      failures: 0,
      lessonsCompleted: 0,
    };

    const result = allocate(student, allDates, instructors, vehicles, new ConflictChecker([]));

    // Close exam date → target SENIOR instructor. Jane(id=2) is SENIOR.
    expect(result).not.toBeNull();
    expect(result!.instructor.id).toBe(2); // Jane (SENIOR) preferred over John (INTERMEDIATE)
  });

  it('should return a valid allocation when possible', () => {
    const student = {
      id: 1,
      preferredSlot: 'SLOT_6',
      preferredDate: '2024-06-10',
      examDate: new Date('2024-06-10'),
      status: 'PENDING' as const,
      failures: 0,
      lessonsCompleted: 0,
    };

    const result = allocate(student, allDates, instructors, vehicles, new ConflictChecker([]));

    // Should find a valid allocation
    expect(result).not.toBeNull();
  });

  it('should skip unavailable instructors and allocate to a different one', () => {
    const student = {
      id: 1,
      preferredSlot: 'SLOT_1',
      preferredDate: '2024-06-10',
      examDate: new Date('2024-06-10'),
      status: 'PENDING' as const,
      failures: 0,
      lessonsCompleted: 0,
    };

    // When one instructor is unavailable, allocator should skip them
    const instructors = [
      { id: 1, name: 'John', instructorLevel: 'INTERMEDIATE', available: false, dailyLessonCount: 0 },
      { id: 2, name: 'Jane', instructorLevel: 'SENIOR', available: true, dailyLessonCount: 0 },
    ];

    const result = allocate(student, allDates, instructors, vehicles, new ConflictChecker([]));

    expect(result).not.toBeNull();
    // Should skip unavailable John and assign Jane instead
    expect(result!.instructor.id).toBe(2);
    expect(result!.instructor.name).toBe('Jane');
  });

  it('should avoid conflicts with existing lessons', () => {
    const student = {
      id: 1,
      preferredSlot: 'SLOT_1',
      preferredDate: '2024-06-10',
      examDate: new Date('2024-06-10'),
      status: 'PENDING' as const,
      failures: 0,
      lessonsCompleted: 0,
    };

    const existingLessons = [
      { date: '2024-06-10', slot: 'SLOT_1', instructorId: 1, vehicleId: 10 },
    ];

    const result = allocate(student, allDates, instructors, vehicles, new ConflictChecker(existingLessons));

    expect(result).not.toBeNull();
    // Should use instructor 2 or vehicle 20 instead
    expect(result!.instructor.id).not.toBe(1);
  });

  it('should shift to a different slot when preferred slot is taken', () => {
    const multiDates = ['2024-06-10', '2024-06-11', '2024-06-12'];

    // All instructors + vehicles are busy on 2024-06-10 SLOT_1
    const busy = [
      { date: '2024-06-10', slot: 'SLOT_1', instructorId: 1, vehicleId: 10 },
      { date: '2024-06-10', slot: 'SLOT_1', instructorId: 2, vehicleId: 20 },
    ];

    const multiInstructors = [
      { id: 1, name: 'John', instructorLevel: 'INTERMEDIATE', available: true, dailyLessonCount: 0 },
      { id: 2, name: 'Jane', instructorLevel: 'SENIOR', available: true, dailyLessonCount: 1 },
    ];

    const student = {
      id: 1,
      preferredSlot: 'SLOT_1',
      preferredDate: '2024-06-10',
      examDate: new Date('2024-06-10'),
      status: 'PENDING' as const,
      failures: 0,
      lessonsCompleted: 0,
    };

    const result = allocate(student, multiDates, multiInstructors, vehicles, new ConflictChecker(busy));

    // SLOT_1 is blocked on 2024-06-10; allocator shifts to another slot on same date
    expect(result).not.toBeNull();
    expect(result!.shifted).toBe(true);
    expect(result!.date).toBe('2024-06-10'); // same date, shifted slot
    expect(result!.slot).not.toBe('SLOT_1');
  });
});