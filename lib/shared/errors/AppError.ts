export abstract class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public readonly fields?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'No autenticado') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} no encontrado`, 'NOT_FOUND', 404);
  }
}

export class InsufficientFundsError extends AppError {
  constructor() {
    super('Fondos insuficientes en el wallet', 'INSUFFICIENT_FUNDS', 400);
  }
}

export class BlockchainError extends AppError {
  constructor(message: string, public readonly txHash?: string) {
    super(message, 'BLOCKCHAIN_ERROR', 500);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 'DATABASE_ERROR', 500);
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super('Demasiadas solicitudes. Intenta de nuevo más tarde.', 'RATE_LIMIT', 429);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(`Error en servicio externo (${service}): ${message}`, 'EXTERNAL_SERVICE_ERROR', 502);
  }
}
