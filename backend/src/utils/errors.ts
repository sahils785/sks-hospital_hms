export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode?: string;

  constructor(message: string, statusCode: number, errorCode?: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, errorCode?: string) {
    super(message, 400, errorCode);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access', errorCode?: string) {
    super(message, 401, errorCode);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied', errorCode?: string) {
    super(message, 403, errorCode);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', errorCode?: string) {
    super(message, 404, errorCode);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, errorCode?: string) {
    super(message, 409, errorCode);
  }
}
