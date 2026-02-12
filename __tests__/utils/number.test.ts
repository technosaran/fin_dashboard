import {
  calculatePercentage,
  calculatePercentageChange,
  roundTo,
  clamp,
  inRange,
  safeParseNumber,
  formatCompactNumber,
} from '@/lib/utils/number';

describe('calculatePercentage', () => {
  it('calculates percentage correctly', () => {
    expect(calculatePercentage(25, 100)).toBe(25);
    expect(calculatePercentage(1, 3)).toBeCloseTo(33.33, 1);
  });

  it('returns 0 when total is 0', () => {
    expect(calculatePercentage(10, 0)).toBe(0);
  });
});

describe('calculatePercentageChange', () => {
  it('calculates percentage change', () => {
    expect(calculatePercentageChange(100, 150)).toBe(50);
    expect(calculatePercentageChange(200, 100)).toBe(-50);
  });

  it('handles zero old value', () => {
    expect(calculatePercentageChange(0, 100)).toBe(100);
    expect(calculatePercentageChange(0, 0)).toBe(0);
  });
});

describe('roundTo', () => {
  it('rounds to specified decimal places', () => {
    expect(roundTo(3.14159, 2)).toBe(3.14);
    expect(roundTo(3.14159, 0)).toBe(3);
    expect(roundTo(3.145, 2)).toBe(3.15);
  });
});

describe('clamp', () => {
  it('clamps within range', () => {
    expect(clamp(5, 1, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe('inRange', () => {
  it('checks if number is in range', () => {
    expect(inRange(5, 1, 10)).toBe(true);
    expect(inRange(0, 1, 10)).toBe(false);
    expect(inRange(10, 1, 10)).toBe(true);
  });
});

describe('safeParseNumber', () => {
  it('parses valid numbers', () => {
    expect(safeParseNumber('42')).toBe(42);
    expect(safeParseNumber('3.14')).toBe(3.14);
    expect(safeParseNumber(99)).toBe(99);
  });

  it('returns default for invalid input', () => {
    expect(safeParseNumber('abc')).toBe(0);
    expect(safeParseNumber('abc', 10)).toBe(10);
  });
});

describe('formatCompactNumber', () => {
  it('formats numbers with K/M/B suffixes', () => {
    expect(formatCompactNumber(500)).toBe('500');
    expect(formatCompactNumber(1500)).toBe('1.5K');
    expect(formatCompactNumber(1500000)).toBe('1.5M');
    expect(formatCompactNumber(2500000000)).toBe('2.5B');
  });
});
