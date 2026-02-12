import {
  sanitizeString,
  truncate,
  capitalize,
  toKebabCase,
  isValidEmail,
  isValidStockSymbol,
  isValidMFCode,
} from '@/lib/utils/string';

describe('sanitizeString', () => {
  it('escapes HTML entities', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
    );
  });

  it('returns empty string for falsy input', () => {
    expect(sanitizeString('')).toBe('');
  });

  it('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });
});

describe('truncate', () => {
  it('truncates long strings', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('does not truncate short strings', () => {
    expect(truncate('Hi', 10)).toBe('Hi');
  });
});

describe('capitalize', () => {
  it('capitalizes first letter of each word', () => {
    expect(capitalize('hello world')).toBe('Hello World');
    expect(capitalize('UPPER CASE')).toBe('Upper Case');
  });
});

describe('toKebabCase', () => {
  it('converts to kebab case', () => {
    expect(toKebabCase('Hello World')).toBe('hello-world');
    expect(toKebabCase('Some String!')).toBe('some-string');
  });
});

describe('isValidEmail', () => {
  it('validates correct emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test@domain.co.in')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
  });
});

describe('isValidStockSymbol', () => {
  it('validates correct symbols', () => {
    expect(isValidStockSymbol('RELIANCE')).toBe(true);
    expect(isValidStockSymbol('TCS.NS')).toBe(true);
    expect(isValidStockSymbol('M&M')).toBe(true);
  });

  it('rejects invalid symbols', () => {
    expect(isValidStockSymbol('')).toBe(false);
    expect(isValidStockSymbol('a'.repeat(21))).toBe(false);
  });
});

describe('isValidMFCode', () => {
  it('validates correct MF codes', () => {
    expect(isValidMFCode('119551')).toBe(true);
    expect(isValidMFCode('1234')).toBe(true);
  });

  it('rejects invalid codes', () => {
    expect(isValidMFCode('abc')).toBe(false);
    expect(isValidMFCode('12')).toBe(false);
  });
});
