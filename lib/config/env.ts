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

  // Validate required environment variables
  const missingVars: string[] = [];

  if (!supabaseUrl) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!supabaseAnonKey) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}. ` +
      'Please check your .env.local file.'
    );
  }

  // TypeScript now knows these are defined due to the checks above
  return {
    supabase: {
      url: supabaseUrl as string,
      anonKey: supabaseAnonKey as string,
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
