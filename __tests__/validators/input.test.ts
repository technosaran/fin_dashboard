import { validateInteger, validateISIN, validateFnoSymbol } from '@/lib/validators/input';

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

describe('validateISIN', () => {
  it('accepts valid ISIN formats', () => {
    expect(validateISIN('US0378331005').isValid).toBe(true); // Apple Inc.
    expect(validateISIN('GB0002374006').isValid).toBe(true); // BBC
    expect(validateISIN('INE002A01018').isValid).toBe(true); // Reliance
  });

  it('accepts empty ISIN (optional field)', () => {
    expect(validateISIN('').isValid).toBe(true);
    expect(validateISIN('   ').isValid).toBe(true);
  });

  it('rejects ISIN with incorrect length', () => {
    expect(validateISIN('US037833100').isValid).toBe(false); // 11 chars
    expect(validateISIN('US03783310055').isValid).toBe(false); // 13 chars
  });

  it('rejects ISIN without valid country code', () => {
    expect(validateISIN('1S0378331005').isValid).toBe(false); // starts with number
    expect(validateISIN('U10378331005').isValid).toBe(false); // second char is number
  });

  it('rejects ISIN with invalid characters', () => {
    expect(validateISIN('US037833@005').isValid).toBe(false); // special char
    expect(validateISIN('US 378331005').isValid).toBe(false); // space
  });
});

describe('validateFnoSymbol', () => {
  it('accepts valid F&O symbols', () => {
    expect(validateFnoSymbol('NIFTY').isValid).toBe(true);
    expect(validateFnoSymbol('BANKNIFTY').isValid).toBe(true);
    expect(validateFnoSymbol('RELIANCE-FUT').isValid).toBe(true);
    expect(validateFnoSymbol('TCS_CALL').isValid).toBe(true);
  });

  it('rejects empty symbols', () => {
    expect(validateFnoSymbol('').isValid).toBe(false);
    expect(validateFnoSymbol('   ').isValid).toBe(false);
  });

  it('rejects symbols that are too short or too long', () => {
    expect(validateFnoSymbol('A').isValid).toBe(false); // too short
    expect(validateFnoSymbol('A'.repeat(51)).isValid).toBe(false); // too long
  });

  it('rejects symbols with invalid characters', () => {
    expect(validateFnoSymbol('NIFTY@50').isValid).toBe(false);
    expect(validateFnoSymbol('BANK.NIFTY').isValid).toBe(false);
  });
});
