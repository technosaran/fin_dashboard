import { isToday, getCurrentFY, formatDateForInput } from '@/lib/utils/date';

describe('isToday', () => {
  it('returns true for today', () => {
    expect(isToday(new Date())).toBe(true);
  });

  it('returns false for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isToday(yesterday)).toBe(false);
  });
});

describe('getCurrentFY', () => {
  it('returns a financial year string', () => {
    const fy = getCurrentFY();
    expect(fy).toMatch(/^FY \d{4}-\d{4}$/);
  });
});

describe('formatDateForInput', () => {
  it('formats date as YYYY-MM-DD', () => {
    const result = formatDateForInput('2024-06-15T00:00:00.000Z');
    expect(result).toBe('2024-06-15');
  });

  it('accepts Date objects', () => {
    const result = formatDateForInput(new Date('2024-01-01T00:00:00.000Z'));
    expect(result).toBe('2024-01-01');
  });
});
