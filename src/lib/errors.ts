export type ApiError = {
  code: string;
  message: string;
  status: number;
  details?: any;
};

export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: any;

  constructor(code: string, message: string, status: number = 500, details?: any) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const ErrorCodes = {
  INVALID_INPUT: 'INVALID_INPUT',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  BOOKING_ERROR: 'BOOKING_ERROR'
};

export function createErrorResponse(error: AppError): Response {
  return new Response(
    JSON.stringify({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details })
      }
    }),
    {
      status: error.status,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    }
  );
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(
      ErrorCodes.INTERNAL_ERROR,
      error.message,
      500
    );
  }

  return new AppError(
    ErrorCodes.INTERNAL_ERROR,
    'An unexpected error occurred',
    500
  );
}
