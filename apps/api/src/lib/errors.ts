export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number,
    public readonly details: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorReply(err: unknown) {
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      body: {
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
        },
      },
    };
  }
  const message = err instanceof Error ? err.message : "Internal error";
  return {
    statusCode: 500,
    body: {
      error: {
        code: "INTERNAL_ERROR" as const,
        message,
        details: {},
      },
    },
  };
}
