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

  // Skip validation in test environment and during build phase
  const isTest = nodeEnv === 'test';
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

  // Validate required environment variables (skip in test/build)
  const missingVars: string[] = [];

  if (!supabaseUrl && !isTest && !isBuild) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!supabaseAnonKey && !isTest && !isBuild) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}. ` +
        'Please check your .env.local file.'
    );
  }

  // Provide placeholder values during build/test when env vars are not set
  const needsFallback = isTest || isBuild;

  return {
    supabase: {
      url: supabaseUrl ?? (needsFallback ? 'https://placeholder.supabase.co' : ''),
      anonKey: supabaseAnonKey ?? (needsFallback ? 'placeholder-key' : ''),
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
