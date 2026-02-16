/**
 * String utility functions
 */

/**
 * Sanitize user input to prevent XSS attacks
 * Uses comprehensive HTML entity encoding only (no regex-based tag removal)
 */
export function sanitizeString(input: string): string {
  if (!input) return '';

  // Escape all special HTML characters
  // This prevents any HTML from being interpreted
  const sanitized = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return sanitized.trim();
}

/**
 * Truncate string to specified length
 */
export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) return str;
  return str.substring(0, length).trim() + suffix;
}

/**
 * Capitalize first letter of each word
 */
export function capitalize(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Convert string to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Check if string is valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate stock symbol format
 */
export function isValidStockSymbol(symbol: string): boolean {
  // Allow alphanumeric, hyphens, and dots, 1-20 characters
  const symbolRegex = /^[A-Z0-9\-&.]{1,20}$/;
  return symbolRegex.test(symbol.toUpperCase());
}

/**
 * Validate mutual fund code (numbers only)
 */
export function isValidMFCode(code: string): boolean {
  const codeRegex = /^[0-9]{4,10}$/;
  return codeRegex.test(code);
}
