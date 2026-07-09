export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY;
}

export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiApiKey());
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
}
