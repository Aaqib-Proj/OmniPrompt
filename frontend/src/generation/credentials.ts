export const PLATFORM_KEY_STORAGE = "promptit_hf_api_key";

export class MissingCredentialsError extends Error {
  constructor() {
    super("Missing platform key");
    this.name = "MissingCredentialsError";
  }
}

export function getStoredPlatformKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PLATFORM_KEY_STORAGE) || null;
}

export function savePlatformCredentials(data: unknown): void {
  const { apiKey } = parseCredentialInput(data);
  if (typeof window !== "undefined") {
    localStorage.setItem(PLATFORM_KEY_STORAGE, apiKey);
  }
}

export function clearPlatformCredentials(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(PLATFORM_KEY_STORAGE);
  }
}

export async function hasPlatformCredentials(): Promise<boolean> {
  const localKey = getStoredPlatformKey();
  if (localKey) return true;

  // Check if backend has a configured server key
  try {
    const res = await fetch("/api/v1/higgsfield/config");
    if (res.ok) {
      const data = await res.json();
      return !!data.hasServerKey;
    }
  } catch {
    // ignore network errors
  }
  return false;
}

export function encodeCredentials(apiKey: string): string {
  return JSON.stringify({ apiKey });
}

export function decodeCredentials(raw: string | undefined): { apiKey: string } | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const apiKey = (parsed as { apiKey?: unknown }).apiKey;
    if (typeof apiKey !== "string" || !apiKey.trim()) return null;
    return { apiKey: requireIdAndSecret(apiKey.trim()) };
  } catch {
    return null;
  }
}

export function parseCredentialInput(data: unknown): { apiKey: string } {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Enter an API key");
  }
  const record = data as { apiKey?: unknown; api_key?: unknown };
  const apiKey = record.apiKey ?? record.api_key;
  if (typeof apiKey !== "string" || !apiKey.trim()) throw new Error("Enter an API key");
  return { apiKey: requireIdAndSecret(apiKey.trim()) };
}

export function toAuthorizationHeader(apiKey: string): string {
  return `Key ${requireIdAndSecret(apiKey)}`;
}

export function requireIdAndSecret(apiKey: string): string {
  const trimmed = apiKey.trim();
  const colon = trimmed.indexOf(":");
  if (colon <= 0 || colon === trimmed.length - 1) {
    throw new Error("API key must be id:secret");
  }
  return trimmed;
}
