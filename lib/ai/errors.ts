export type AIServiceErrorCode =
  | "auth"
  | "rate_limit"
  | "timeout"
  | "unavailable"
  | "parse";

export class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly code: AIServiceErrorCode
  ) {
    super(message);
    this.name = "AIServiceError";
  }
}

export function mapGeminiError(error: unknown): AIServiceError {
  if (error instanceof AIServiceError) {
    return error;
  }

  const message =
    error instanceof Error ? error.message : "Unknown AI service error";

  if (message.includes("401") || message.toLowerCase().includes("api key")) {
    return new AIServiceError(message, "auth");
  }
  if (message.includes("429") || message.toLowerCase().includes("quota")) {
    return new AIServiceError(message, "rate_limit");
  }
  if (message.toLowerCase().includes("timeout")) {
    return new AIServiceError(message, "timeout");
  }

  return new AIServiceError(message, "unavailable");
}
