import { allocate } from '../allocator';
import { ConflictChecker } from '../conflictChecker';

describe('allocate', () => {
  const allDates = ['2024-06-10'];

  const instructors = [
    { id: 1, name: 'John', instructorLevel: 'INTERMEDIATE', availableSlots: ['MORNING', 'AFTERNOON'], dailyLessonCount: 0 },
    { id: 2, name: 'Jane', instructorLevel: 'SENIOR', availableSlots: ['MORNING', 'EVENING'], dailyLessonCount: 1 },
  ];

  const vehicles = [
    { id: 10, type: 'CAR', active: true },
    { id: 20, type: 'BIKE', active: true },
  ];

  it('should allocate to instructor matching student\'s exam date proximity (SENIOR for close exam)', () => {
    const student = {
      id: 1,
      preferredSlot: 'MORNING',
      preferredDate: '2024-06-10',
      examDate: new Date('2024-06-10'),
      status: 'PENDING' as const,
      failures: 0,
      lessonsCompleted: 0,
    };

    const result = allocate(student, allDates, instructors, vehicles, new ConflictChecker([]));

    // Close exam date → target SENIOR instructor. Jane(id=2) is SENIOR with MORNING slot.
    expect(result).not.toBeNull();
    expect(result!.instructor.id).toBe(2); // Jane (SENIOR) preferred over John (INTERMEDIATE)
  });

  it('should return a valid allocation when possible', () => {
    const student = {
      id: 1,
      preferredSlot: 'EVENING',
      preferredDate: '2024-06-10',
      examDate: new Date('2024-06-10'),
      status: 'PENDING' as const,
      failures: 0,
      lessonsCompleted: 0,
    };

    const result = allocate(student, allDates, instructors, vehicles, new ConflictChecker([]));

    // Jane has EVENING + vehicle 10 (CAR) has EVENING -> should work
    expect(result).not.toBeNull();
    expect(result!.slot).toBe('EVENING');
  });

  it('should shift to an available slot when preferred is unavailable', () => {
    const student = {
      id: 1,
      preferredSlot: 'EVENING',
      preferredDate: '2024-06-10',
      examDate: new Date('2024-06-10'),
      status: 'PENDING' as const,
      failures: 0,
      lessonsCompleted: 0,
    };

    const instructorsWithOne = [
      { id: 1, name: 'John', instructorLevel: 'INTERMEDIATE', availableSlots: ['MORNING'], dailyLessonCount: 0 },
    ];

    // Instructor only has MORNING, student wants EVENING → shifts to MORNING on same date
    const result = allocate(student, allDates, instructorsWithOne, vehicles, new ConflictChecker([]));

    expect(result).not.toBeNull();
    expect(result!.shifted).toBe(true);
    expect(result!.slot).toBe('MORNING');
  });

  it('should avoid conflicts with existing lessons', () => {
    const student = {
      id: 1,
      preferredSlot: 'MORNING',
      preferredDate: '2024-06-10',
      examDate: new Date('2024-06-10'),
      status: 'PENDING' as const,
      failures: 0,
      lessonsCompleted: 0,
    };

    const existingLessons = [
      { date: '2024-06-10', slot: 'MORNING', instructorId: 1, vehicleId: 10 },
    ];

    const result = allocate(student, allDates, instructors, vehicles, new ConflictChecker(existingLessons));

    expect(result).not.toBeNull();
    // Should use instructor 2 or vehicle 20 instead
    expect(result!.instructor.id).not.toBe(1);
  });

  it('should shift slot when instructor does not serve preferred slot', () => {
    const student = {
      id: 1,
      preferredSlot: 'MORNING',
      preferredDate: '2024-06-10',
      examDate: new Date('2024-06-10'),
      status: 'PENDING' as const,
      failures: 0,
      lessonsCompleted: 0,
    };

    const instructors = [
      { id: 1, name: 'John', instructorLevel: 'INTERMEDIATE', availableSlots: ['AFTERNOON'], dailyLessonCount: 0 },
    ];

    // Instructor only has AFTERNOON, student wants MORNING
    // Allocator shifts to AFTERNOON on same date
    const result = allocate(student, allDates, instructors, vehicles, new ConflictChecker([]));

    expect(result).not.toBeNull();
    expect(result!.shifted).toBe(true);
    expect(result!.slot).toBe('AFTERNOON');
  });

  it('should shift slot when no instructor serves the preferred slot', () => {
    const student = {
      id: 1,
      preferredSlot: 'MORNING',
      preferredDate: '2024-06-10',
      examDate: null, // No exam date → JUNIOR target level
      status: 'PENDING' as const,
      failures: 0,
      lessonsCompleted: 0,
    };

    const instructorsWithoutMorning = [
      { id: 1, name: 'John', instructorLevel: 'JUNIOR', availableSlots: ['AFTERNOON'], dailyLessonCount: 0 },
    ];

    // Instructor only has AFTERNOON, student wants MORNING
    // Allocator shifts to AFTERNOON on same date
    const result = allocate(student, allDates, instructorsWithoutMorning, vehicles, new ConflictChecker([]));

    expect(result).not.toBeNull();
    expect(result!.shifted).toBe(true);
    expect(result!.slot).toBe('AFTERNOON');
  });

  it('should shift to a different slot when preferred slot is taken', () => {
    const multiDates = ['2024-06-10', '2024-06-11', '2024-06-12'];

    // All instructors + vehicles are busy on 2024-06-10 MORNING
    const busy = [
      { date: '2024-06-10', slot: 'MORNING', instructorId: 1, vehicleId: 10 },
      { date: '2024-06-10', slot: 'MORNING', instructorId: 2, vehicleId: 20 },
    ];

    const student = {
      id: 1,
      preferredSlot: 'MORNING',
      preferredDate: '2024-06-10',
      examDate: new Date('2024-06-10'),
      status: 'PENDING' as const,
      failures: 0,
      lessonsCompleted: 0,
    };

    const result = allocate(student, multiDates, instructors, vehicles, new ConflictChecker(busy));

    // Only MORNING is blocked on 2024-06-10; allocator shifts to AFTERNOON on same date
    expect(result).not.toBeNull();
    expect(result!.shifted).toBe(true);
    expect(result!.date).toBe('2024-06-10'); // same date, shifted slot
    expect(result!.slot).not.toBe('MORNING');
  });
});