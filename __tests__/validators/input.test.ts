import { validateInteger } from '@/lib/validators/input';

describe('validateInteger', () => {
  it('accepts valid integers', () => {
    expect(validateInteger(5, 'count').isValid).toBe(true);
    expect(validateInteger('42', 'count').isValid).toBe(true);
    expect(validateInteger(0, 'count').isValid).toBe(true);
    expect(validateInteger(-3, 'count').isValid).toBe(true);
  });

  it('rejects decimal numbers', () => {
    expect(validateInteger(5.9, 'count').isValid).toBe(false);
    expect(validateInteger(3.14, 'count').isValid).toBe(false);
  });

  it('rejects decimal strings', () => {
    expect(validateInteger('5.9', 'count').isValid).toBe(false);
    expect(validateInteger('3.14', 'count').isValid).toBe(false);
  });

  it('rejects non-numeric strings', () => {
    expect(validateInteger('abc', 'count').isValid).toBe(false);
    expect(validateInteger('12abc', 'count').isValid).toBe(false);
  });
});
