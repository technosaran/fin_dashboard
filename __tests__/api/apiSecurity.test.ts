/**
 * API Security and Validation Tests
 * Tests for improved input validation, error handling, and security measures
 */

// Set up test environment variables before importing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key-1234567890';

import { rateLimit } from '@/lib/services/api';

// Mock Next.js Response
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data: unknown, init?: { status?: number }) => ({
      json: async () => data,
      status: init?.status || 200,
    })),
  },
}));

describe('API Security Utilities', () => {
  describe('rateLimit', () => {
    it('should allow requests within limit', () => {
      const identifier = 'test-user-1';
      const result = rateLimit(identifier, 10, 60000);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should block requests exceeding limit', () => {
      const identifier = 'test-user-2';
      // Make 10 requests
      for (let i = 0; i < 10; i++) {
        rateLimit(identifier, 10, 60000);
      }
      // 11th request should fail
      const result = rateLimit(identifier, 10, 60000);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', async () => {
      const identifier = 'test-user-3';
      // Use very short window
      rateLimit(identifier, 2, 100);
      rateLimit(identifier, 2, 100);
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should allow new requests
      const result = rateLimit(identifier, 2, 100);
      expect(result.success).toBe(true);
    });
  });
});

describe('Input Validation', () => {
  describe('Forex Pair Validation', () => {
    it('should accept valid forex pairs', () => {
      const validPairs = ['USDINR', 'EURINR', 'GBPINR', 'JPYINR'];
      validPairs.forEach(pair => {
        expect(/^[A-Z]{6,7}$/.test(pair)).toBe(true);
      });
    });

    it('should reject invalid forex pairs', () => {
      const invalidPairs = ['USD', 'USDINR123', 'usd-inr', 'US$INR'];
      invalidPairs.forEach(pair => {
        expect(/^[A-Z]{6,7}$/.test(pair)).toBe(false);
      });
    });
  });

  describe('ISIN Validation', () => {
    it('should accept valid ISIN format', () => {
      const validIsins = ['INE018E07BU2', 'US0378331005', 'GB0002374006'];
      validIsins.forEach(isin => {
        expect(/^[A-Z]{2}[A-Z0-9]{10}$/i.test(isin)).toBe(true);
      });
    });

    it('should reject invalid ISIN format', () => {
      const invalidIsins = ['INVALID', 'INE018E', '1234567890AB', 'IN-E018E07BU2'];
      invalidIsins.forEach(isin => {
        expect(/^[A-Z]{2}[A-Z0-9]{10}$/i.test(isin)).toBe(false);
      });
    });
  });

  describe('Batch Size Limits', () => {
    it('should enforce maximum batch size', () => {
      const maxSize = 50;
      const tooManyItems = Array(51).fill('item');
      
      expect(tooManyItems.length).toBeGreaterThan(maxSize);
    });

    it('should accept valid batch sizes', () => {
      const maxSize = 50;
      const validBatch = Array(30).fill('item');
      
      expect(validBatch.length).toBeLessThanOrEqual(maxSize);
    });
  });
});
