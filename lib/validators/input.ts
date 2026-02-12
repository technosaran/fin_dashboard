/**
 * Input validation functions for API security
 * Prevents XSS, injection, and other security vulnerabilities
 */

import { isValidEmail, isValidMFCode } from '../utils/string';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  if (!isValidEmail(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  return { isValid: true };
}

/**
 * Validate stock search query
 */
export function validateStockQuery(query: string): ValidationResult {
  if (!query || query.trim() === '') {
    return { isValid: false, error: 'Search query is required' };
  }

  if (query.length < 1 || query.length > 50) {
    return { isValid: false, error: 'Query must be between 1 and 50 characters' };
  }

  // Allow alphanumeric, spaces, hyphens, ampersands, and dots
  if (!/^[A-Za-z0-9\s\-&.]+$/.test(query)) {
    return { isValid: false, error: 'Invalid characters in search query' };
  }

  return { isValid: true };
}

/**
 * Validate mutual fund code
 */
export function validateMFCode(code: string): ValidationResult {
  if (!code || code.trim() === '') {
    return { isValid: false, error: 'Mutual fund code is required' };
  }

  if (!isValidMFCode(code)) {
    return { isValid: false, error: 'Invalid mutual fund code format (4-10 digits)' };
  }

  return { isValid: true };
}

/**
 * Validate amount (positive number)
 */
export function validateAmount(amount: number | string, min: number = 0): ValidationResult {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }

  if (num < min) {
    return { isValid: false, error: `Amount must be at least ${min}` };
  }

  if (num > 1e12) {
    return { isValid: false, error: 'Amount exceeds maximum allowed value' };
  }

  return { isValid: true };
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function validateDate(date: string): ValidationResult {
  if (!date || date.trim() === '') {
    return { isValid: false, error: 'Date is required' };
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return { isValid: false, error: 'Invalid date format (use YYYY-MM-DD)' };
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return { isValid: false, error: 'Invalid date' };
  }

  return { isValid: true };
}

/**
 * Sanitize and validate string input
 */
export function validateString(
  input: string,
  fieldName: string,
  minLength: number = 1,
  maxLength: number = 255
): ValidationResult {
  if (!input || input.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const trimmed = input.trim();

  if (trimmed.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  if (trimmed.length > maxLength) {
    return { isValid: false, error: `${fieldName} must not exceed ${maxLength} characters` };
  }

  return { isValid: true };
}

/**
 * Validate integer
 */
export function validateInteger(value: number | string, fieldName: string): ValidationResult {
  const num = typeof value === 'string' ? Number(value) : value;

  if (isNaN(num) || !Number.isInteger(num)) {
    return { isValid: false, error: `${fieldName} must be a valid integer` };
  }

  return { isValid: true };
}
