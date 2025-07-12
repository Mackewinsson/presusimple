export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (message: string, statusCode: number = 500): CustomError => {
  return new CustomError(message, statusCode);
};

export const handleError = (error: any): AppError => {
  if (error instanceof CustomError) {
    return error;
  }

  // Handle Mongoose errors
  if (error.name === 'ValidationError') {
    return createError('Validation Error', 400);
  }

  if (error.name === 'CastError') {
    return createError('Invalid ID format', 400);
  }

  if (error.code === 11000) {
    return createError('Duplicate field value', 400);
  }

  // Handle Stripe errors
  if (error.type === 'StripeCardError') {
    return createError('Payment card error', 400);
  }

  if (error.type === 'StripeInvalidRequestError') {
    return createError('Invalid payment request', 400);
  }

  // Default error
  return createError('Internal server error', 500);
};

export const logError = (error: AppError, context?: string) => {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    isOperational: error.isOperational,
    context,
    timestamp: new Date().toISOString(),
  };

  // In production, you might want to send this to a logging service
  if (process.env.NODE_ENV === 'production') {
    console.error('Production Error:', errorLog);
    // TODO: Send to logging service (e.g., Sentry, LogRocket)
  } else {
    console.error('Development Error:', errorLog);
  }
}; 