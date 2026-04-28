// Domain error classes mapped to HTTP problem-detail in plugins/error-handler.ts.

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly title: string,
    message?: string,
    public readonly type: string = 'about:blank',
  ) {
    super(message ?? title);
    this.name = new.target.name;
  }
}

export class NotFoundError extends HttpError {
  constructor(detail?: string) {
    super(404, 'Not Found', detail);
  }
}

export class ConflictError extends HttpError {
  constructor(detail?: string) {
    super(409, 'Conflict', detail);
  }
}

export class RateLimitError extends HttpError {
  constructor(detail?: string) {
    super(429, 'Too Many Requests', detail);
  }
}

export class PaymentRequiredError extends HttpError {
  constructor(detail?: string) {
    super(402, 'Payment Required', detail);
  }
}

export class ForbiddenError extends HttpError {
  constructor(detail?: string) {
    super(403, 'Forbidden', detail);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(detail?: string) {
    super(401, 'Unauthorized', detail);
  }
}

export class ValidationError extends HttpError {
  constructor(
    detail: string,
    public readonly issues: Array<{ path: Array<string | number>; message: string }> = [],
  ) {
    super(400, 'Bad Request', detail);
  }
}

export class BadRequestError extends HttpError {
  constructor(detail?: string) {
    super(400, 'Bad Request', detail);
  }
}
