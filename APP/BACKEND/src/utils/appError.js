
export class AppError extends Error {
  constructor(message, statusCode = 500, code = "APP_ERROR", details = undefined) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    if (details !== undefined) this.details = details;

    // Keeps the stack trace pointing at the caller, not this constructor
    Error.captureStackTrace?.(this, this.constructor);
  }

  // Shortcuts so call sites stay short and consistent
  static badRequest(message = "Bad request.", code = "BAD_REQUEST", details) {
    return new AppError(message, 400, code, details);
  }

  static unauthorized(message = "Authentication required.", code = "UNAUTHORIZED") {
    return new AppError(message, 401, code);
  }

  static forbidden(message = "You lack permission to perform this action.", code = "FORBIDDEN") {
    return new AppError(message, 403, code);
  }

  static notFound(message = "Resource not found.", code = "RESOURCE_NOT_FOUND") {
    return new AppError(message, 404, code);
  }

  static conflict(message = "Resource already exists.", code = "CONFLICT") {
    return new AppError(message, 409, code);
  }

  static tooManyRequests(message = "Too many requests.", code = "TOO_MANY_REQUESTS") {
    return new AppError(message, 429, code);
  }
}