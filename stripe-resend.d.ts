declare module 'stripe' {
  export interface PaymentIntentCreateParams {
    amount: number;
    currency: string;
    metadata?: Record<string, string>;
    description?: string;
    receipt_email?: string;
  }

  export interface PaymentIntent {
    id: string;
    client_secret: string;
    amount: number;
    currency: string;
    status: string;
    metadata?: Record<string, string>;
  }

  export interface StripeConfig {
    apiKey: string;
  }

  class Stripe {
    constructor(apiKey: string);
    paymentIntents: {
      create(params: PaymentIntentCreateParams): Promise<PaymentIntent>;
      retrieve(id: string): Promise<PaymentIntent>;
    };
  }

  export default Stripe;
}

declare module 'resend' {
  export interface EmailParams {
    from: string;
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
  }

  export interface EmailResponse {
    id: string;
    from: string;
    to: string;
    created_at: string;
  }

  export interface ResendConfig {
    apiKey: string;
  }

  class Resend {
    constructor(apiKey?: string);
    emails: {
      send(params: EmailParams): Promise<EmailResponse>;
    };
  }

  export default Resend;
}
