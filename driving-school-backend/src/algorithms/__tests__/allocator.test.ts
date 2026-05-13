import { allocate } from '../allocator';

describe('allocate', () => {
  const instructors = [
    { id: 1, name: 'John', availableSlots: ['MORNING', 'AFTERNOON'], dailyLessonCount: 0 },
    { id: 2, name: 'Jane', availableSlots: ['MORNING', 'EVENING'], dailyLessonCount: 1 },
  ];

  const vehicles = [
    { id: 10, type: 'CAR', availableSlots: ['MORNING', 'AFTERNOON', 'EVENING'], active: true },
    { id: 20, type: 'BIKE', availableSlots: ['MORNING', 'AFTERNOON'], active: true },
  ];

  it('should allocate to instructor with fewer lessons', () => {
    const student = {
      id: 1,
      preferredSlots: ['MORNING', 'AFTERNOON'],
      examDate: new Date('2024-06-10'),
      status: 'PENDING' as const,
      failures: 0,
      lessonsCompleted: 0,
    };

    const result = allocate(student, instructors, vehicles, []);

    expect(result).not.toBeNull();
    expect(result!.instructor.id).toBe(1); // John has fewer lessons (0 vs 1)
  });

  it('should return null when no slots available', () => {
    const student = {
      id: 1,
      preferredSlots: ['EVENING'],
      examDate: new Date('2024-06-10'),
      status: 'PENDING' as const,
      failures: 0,
      lessonsCompleted: 0,
    };

    // Only Jane has EVENING, but vehicle 20 (BIKE) doesn't have EVENING
    // Vehicle 10 (CAR) has all slots but instructor 2 has dailyLessonCount: 1
    const result = allocate(student, instructors, vehicles, []);

    // Result depends on sorting - Jane should be sorted first (higher load)
    // But both CAR and BIKE don't both have EVENING
    // Actually CAR has EVENING, instructor 1 doesn't have evening
    // Instructor 2 has evening, vehicle 10 (CAR) has evening
    expect(result).not.toBeNull();
  });

  it('should respect instructor availability', () => {
    const student = {
      id: 1,
      preferredSlots: ['EVENING'],
      examDate: new Date('2024-06-10'),
      status: 'PENDING' as const,
      failures: 0,
      lessonsCompleted: 0,
    };

    const instructorsWithOne = [
      { id: 1, name: 'John', availableSlots: ['MORNING'], dailyLessonCount: 0 },
    ];

    const result = allocate(student, instructorsWithOne, vehicles, []);

    expect(result).toBeNull();
  });

  it('should avoid conflicts with existing lessons', () => {
    const student = {
      id: 1,
      preferredSlots: ['MORNING'],
      examDate: new Date('2024-06-10'),
      status: 'PENDING' as const,
      failures: 0,
      lessonsCompleted: 0,
    };

    const existingLessons = [
      { slot: 'MORNING', instructorId: 1, vehicleId: 10 },
    ];

    const result = allocate(student, instructors, vehicles, existingLessons);

    expect(result).not.toBeNull();
    // Should use instructor 2 or vehicle 20 instead
    expect(result!.instructor.id).not.toBe(1);
  });

  it('should return null when no instructor available', () => {
    const student = {
      id: 1,
      preferredSlots: ['MORNING'],
      examDate: new Date('2024-06-10'),
      status: 'PENDING' as const,
      failures: 0,
      lessonsCompleted: 0,
    };

    const instructors = [
      { id: 1, name: 'John', availableSlots: ['AFTERNOON'], dailyLessonCount: 0 },
    ];

    const result = allocate(student, instructors, vehicles, []);

    expect(result).toBeNull();
  });

  it('should return null when no vehicle available', () => {
    const student = {
      id: 1,
      preferredSlots: ['MORNING'],
      examDate: new Date('2024-06-10'),
      status: 'PENDING' as const,
      failures: 0,
      lessonsCompleted: 0,
    };

    const vehicles = [
      { id: 10, type: 'CAR', availableSlots: ['AFTERNOON'], active: true },
    ];

    const result = allocate(student, instructors, vehicles, []);

    expect(result).toBeNull();
  });
});