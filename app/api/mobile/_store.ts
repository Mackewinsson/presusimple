// app/api/mobile/_store.ts
// In production replace this with Redis/Upstash (with TTL).

export type CodeEntry = { sub: string; email?: string; exp: number };
const codes = new Map<string, CodeEntry>();

export const CodesStore = {
  set: (code: string, entry: CodeEntry) => codes.set(code, entry),
  get: (code: string) => codes.get(code),
  del: (code: string) => codes.delete(code),
  has: (code: string) => codes.has(code),
};
