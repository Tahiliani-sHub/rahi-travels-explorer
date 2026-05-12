type EnvVars = {
  DUFFEL_API_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_PUBLISHABLE_KEY?: string;
  RESEND_API_KEY?: string;
  SENDER_EMAIL?: string;
};

type ValidatedEnv = {
  DUFFEL_API_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  RESEND_API_KEY: string;
  SENDER_EMAIL: string;
};

export function validateEnv(env: Record<string, string | undefined>): ValidatedEnv {
  const missing: string[] = [];

  const required: (keyof EnvVars)[] = [
    'DUFFEL_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'RESEND_API_KEY',
    'SENDER_EMAIL'
  ];

  for (const key of required) {
    if (!env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `Please configure them in wrangler.jsonc`
    );
  }

  return {
    DUFFEL_API_KEY: env.DUFFEL_API_KEY!,
    STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY!,
    STRIPE_PUBLISHABLE_KEY: env.STRIPE_PUBLISHABLE_KEY!,
    RESEND_API_KEY: env.RESEND_API_KEY!,
    SENDER_EMAIL: env.SENDER_EMAIL!
  };
}

export function getOptionalEnv(
  env: Record<string, string | undefined>
): Record<string, string | undefined> {
  return {
    NODE_ENV: env.NODE_ENV ?? 'production'
  };
}
