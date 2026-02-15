/**
 * Environment variable validation and configuration
 * Ensures all required environment variables are present at runtime
 */

interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  app: {
    url: string;
    nodeEnv: string;
  };
}

function validateEnv(): EnvironmentConfig {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Skip validation in test environment if using test values
  const isTest = nodeEnv === 'test';
  
  // Validate required environment variables (skip in test with test values)
  const missingVars: string[] = [];

  if (!supabaseUrl && !isTest) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!supabaseAnonKey && !isTest) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}. ` +
      'Please check your .env.local file.'
    );
  }

  // TypeScript now knows these are defined due to the checks above
  // In test environment, provide defaults if missing
  return {
    supabase: {
      url: isTest && !supabaseUrl ? 'https://test.supabase.co' : supabaseUrl as string,
      anonKey: isTest && !supabaseAnonKey ? 'test-key-1234567890' : supabaseAnonKey as string,
    },
    app: {
      url: appUrl,
      nodeEnv,
    },
  };
}

export const env = validateEnv();
export const isDevelopment = env.app.nodeEnv === 'development';
export const isProduction = env.app.nodeEnv === 'production';
