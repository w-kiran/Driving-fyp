import { priorityScheduling } from '../scheduler';

describe('priorityScheduling', () => {
  it('should sort by preferredDate first (closer dates first), then by preferredSlot (MORNING > AFTERNOON > EVENING)', () => {
    const bookings = [
      { id: 1, preferredDate: '2024-06-15', preferredSlot: 'MORNING', examDate: null, status: 'PENDING' as const, failures: 0, lessonsCompleted: 0, trainingDuration: 60, studentId: 1 },
      { id: 2, preferredDate: '2024-06-10', preferredSlot: 'AFTERNOON', examDate: null, status: 'PENDING' as const, failures: 0, lessonsCompleted: 0, trainingDuration: 60, studentId: 2 },
      { id: 3, preferredDate: '2024-06-15', preferredSlot: 'AFTERNOON', examDate: null, status: 'PENDING' as const, failures: 0, lessonsCompleted: 0, trainingDuration: 60, studentId: 3 },
      { id: 4, preferredDate: '2024-06-15', preferredSlot: 'EVENING', examDate: null, status: 'PENDING' as const, failures: 0, lessonsCompleted: 0, trainingDuration: 60, studentId: 4 },
    ];

    const result = priorityScheduling(bookings);

    // June 10 is first (closer date)
    expect(result[0].id).toBe(2);
    // June 15 same date, sorted by slot: MORNING(id=1) > AFTERNOON(id=3) > EVENING(id=4)
    expect(result[1].id).toBe(1);
    expect(result[2].id).toBe(3);
    expect(result[3].id).toBe(4);
  });

  it('should sort by preferredSlot when preferredDate is the same', () => {
    const bookings = [
      { id: 1, preferredDate: '2024-06-10', preferredSlot: 'EVENING', examDate: null, status: 'PENDING' as const, failures: 0, lessonsCompleted: 0, trainingDuration: 60, studentId: 1 },
      { id: 2, preferredDate: '2024-06-10', preferredSlot: 'MORNING', examDate: null, status: 'PENDING' as const, failures: 0, lessonsCompleted: 0, trainingDuration: 60, studentId: 2 },
      { id: 3, preferredDate: '2024-06-10', preferredSlot: 'AFTERNOON', examDate: null, status: 'PENDING' as const, failures: 0, lessonsCompleted: 0, trainingDuration: 60, studentId: 3 },
    ];

    const result = priorityScheduling(bookings);

    expect(result[0].id).toBe(2); // MORNING first
    expect(result[1].id).toBe(3); // AFTERNOON second
    expect(result[2].id).toBe(1); // EVENING third
  });

  it('should use exam date as a tiebreaker when date and slot match', () => {
    const bookings = [
      { id: 1, preferredDate: '2024-06-15', preferredSlot: 'MORNING', examDate: new Date('2024-06-20'), status: 'PENDING' as const, failures: 0, lessonsCompleted: 0, trainingDuration: 60, studentId: 1 },
      { id: 2, preferredDate: '2024-06-10', preferredSlot: 'MORNING', examDate: new Date('2024-06-15'), status: 'PENDING' as const, failures: 0, lessonsCompleted: 0, trainingDuration: 60, studentId: 2 },
      { id: 3, preferredDate: '2024-06-15', preferredSlot: 'MORNING', examDate: new Date('2024-06-10'), status: 'PENDING' as const, failures: 0, lessonsCompleted: 0, trainingDuration: 60, studentId: 3 },
    ];

    const result = priorityScheduling(bookings);

    // June 10 is closer (id=2) first
    expect(result[0].id).toBe(2);
    // June 15 same date + same slot, sorted by exam date: June 10 (id=3) first, then June 20 (id=1)
    expect(result[1].id).toBe(3);
    expect(result[2].id).toBe(1);
  });

  it('should place students without exam date after those with exam date as final tiebreaker', () => {
    const bookings = [
      { id: 1, preferredDate: '2024-06-10', preferredSlot: 'MORNING', examDate: null, status: 'PENDING' as const, failures: 0, lessonsCompleted: 0, trainingDuration: 60, studentId: 1 },
      { id: 2, preferredDate: '2024-06-10', preferredSlot: 'MORNING', examDate: new Date('2024-06-15'), status: 'PENDING' as const, failures: 0, lessonsCompleted: 0, trainingDuration: 60, studentId: 2 },
    ];

    const result = priorityScheduling(bookings);

    expect(result[0].id).toBe(2); // With exam date first
    expect(result[1].id).toBe(1); // Without exam date last
  });

  it('should preserve student properties after sorting', () => {
    const bookings = [
      { id: 1, preferredDate: '2024-06-10', preferredSlot: 'EVENING', examDate: new Date('2024-06-15'), status: 'PENDING' as const, failures: 2, lessonsCompleted: 5, trainingDuration: 60, studentId: 1, extra: 'data' },
    ];

    const result = priorityScheduling(bookings);

    expect(result[0].extra).toBe('data');
    expect(result[0].preferredSlot).toBe('EVENING');
  });
});