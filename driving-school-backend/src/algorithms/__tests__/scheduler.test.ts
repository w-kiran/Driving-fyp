import { priorityScheduling } from '../scheduler';

describe('priorityScheduling', () => {
  it('should sort students by exam date (earliest first)', () => {
    const students = [
      { id: 1, preferredSlots: ['MORNING'], examDate: new Date('2024-06-15'), status: 'PENDING' as const, failures: 0, lessonsCompleted: 0 },
      { id: 2, preferredSlots: ['MORNING'], examDate: new Date('2024-06-10'), status: 'PENDING' as const, failures: 0, lessonsCompleted: 0 },
      { id: 3, preferredSlots: ['MORNING'], examDate: new Date('2024-06-20'), status: 'PENDING' as const, failures: 0, lessonsCompleted: 0 },
    ];

    const result = priorityScheduling(students);

    expect(result[0].id).toBe(2); // June 10
    expect(result[1].id).toBe(1); // June 15
    expect(result[2].id).toBe(3); // June 20
  });

  it('should place students without exam date at the end', () => {
    const students = [
      { id: 1, preferredSlots: ['MORNING'], examDate: null, status: 'PENDING' as const, failures: 0, lessonsCompleted: 0 },
      { id: 2, preferredSlots: ['MORNING'], examDate: new Date('2024-06-10'), status: 'PENDING' as const, failures: 0, lessonsCompleted: 0 },
    ];

    const result = priorityScheduling(students);

    expect(result[0].id).toBe(2); // With exam date first
    expect(result[1].id).toBe(1); // Without exam date last
  });

  it('should preserve student properties after sorting', () => {
    const students = [
      { id: 1, preferredSlots: ['EVENING'], examDate: new Date('2024-06-10'), status: 'PENDING' as const, failures: 2, lessonsCompleted: 5, extra: 'data' },
    ];

    const result = priorityScheduling(students);

    expect(result[0].extra).toBe('data');
    expect(result[0].preferredSlots).toEqual(['EVENING']);
  });
});