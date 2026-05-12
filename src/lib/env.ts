type EnvVars = {
  DUFFEL_API_KEY?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RESEND_API_KEY?: string;
  SENDER_EMAIL?: string;
};

type ValidatedEnv = {
  DUFFEL_API_KEY?: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  RESEND_API_KEY?: string;
  SENDER_EMAIL?: string;
};

export function validateEnv(env: Record<string, string | undefined>): ValidatedEnv {
  const missing: string[] = [];

  // Only Razorpay keys are hard-required; Duffel and Resend fall back gracefully when absent
  const required: (keyof EnvVars)[] = [
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
  ];

  for (const key of required) {
    if (!env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `Please configure them in .env or wrangler.jsonc`
    );
  }

  return {
    DUFFEL_API_KEY: env.DUFFEL_API_KEY,
    RAZORPAY_KEY_ID: env.RAZORPAY_KEY_ID!,
    RAZORPAY_KEY_SECRET: env.RAZORPAY_KEY_SECRET!,
    RESEND_API_KEY: env.RESEND_API_KEY,
    SENDER_EMAIL: env.SENDER_EMAIL
  };
}

export function getOptionalEnv(
  env: Record<string, string | undefined>
): Record<string, string | undefined> {
  return {
    NODE_ENV: env.NODE_ENV ?? 'production'
  };
}
