/**
 * Logger security tests
 * Ensures sensitive data is not leaked through console in production
 */

// Set up test environment variables before importing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key-1234567890';

describe('Logger Security', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
    jest.resetModules();
  });

  it('should not output to console.warn in production', async () => {
    process.env.NODE_ENV = 'production';
    jest.resetModules();
    const { logWarn } = await import('@/lib/utils/logger');

    logWarn('test warning', { status: 429 });

    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should not output to console.error in production', async () => {
    process.env.NODE_ENV = 'production';
    jest.resetModules();
    const { logError } = await import('@/lib/utils/logger');

    logError('test error', new Error('internal details'), { userId: '123' });

    expect(console.error).not.toHaveBeenCalled();
  });

  it('should not output to console.log in production', async () => {
    process.env.NODE_ENV = 'production';
    jest.resetModules();
    const { logInfo } = await import('@/lib/utils/logger');

    logInfo('test info', { data: 'sensitive' });

    expect(console.log).not.toHaveBeenCalled();
  });

  it('should not output to console.debug in production', async () => {
    process.env.NODE_ENV = 'production';
    jest.resetModules();
    const { logDebug } = await import('@/lib/utils/logger');

    logDebug('test debug', { internal: 'data' });

    expect(console.debug).not.toHaveBeenCalled();
  });

  it('should redact sensitive keys in context when logging in development', async () => {
    process.env.NODE_ENV = 'development';
    jest.resetModules();
    const { logInfo } = await import('@/lib/utils/logger');

    logInfo('login attempt', {
      email: 'user@test.com',
      password: 'secret123',
      token: 'abc-xyz',
      authorization: 'Bearer token',
    });

    expect(console.log).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        email: 'user@test.com',
        password: '[REDACTED]',
        token: '[REDACTED]',
        authorization: '[REDACTED]',
      })
    );
  });
});
