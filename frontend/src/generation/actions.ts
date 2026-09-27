import { getModel, parseSettings } from "./catalog";
import type { GenerationPlane } from "./catalog/types";
import {
  getStoredPlatformKey,
  savePlatformCredentials,
  clearPlatformCredentials,
  hasPlatformCredentials,
} from "./credentials";
import type { StatusResult, QueuedGeneration } from "./platform";
import { toPlatform } from "./to-platform";

export { savePlatformCredentials, clearPlatformCredentials, hasPlatformCredentials };

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const key = getStoredPlatformKey();
  if (key) {
    headers["X-Higgsfield-Key"] = key;
  }
  const token = typeof window !== "undefined" ? localStorage.getItem("promptit_token") : null;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function submitGeneration(plane: GenerationPlane): Promise<QueuedGeneration> {
  const model = getModel(plane.model);
  const parsed: GenerationPlane = {
    ...plane,
    settings: parseSettings(model, plane.settings),
  };
  const { path, body } = toPlatform(parsed);

  const response = await fetch("/api/v1/higgsfield/generate", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ path, body }),
  });

  const payload = await response.json();
  if (!response.ok) {
    const errorMsg =
      payload?.detail ||
      payload?.error ||
      payload?.message ||
      `Generation request failed (${response.status})`;
    throw new Error(errorMsg);
  }

  return {
    status: payload.status || "queued",
    requestId: payload.requestId || payload.request_id,
    statusUrl: payload.statusUrl || payload.status_url || "",
    cancelUrl: payload.cancelUrl || payload.cancel_url || "",
  };
}

/** Every request in flight, answered in one round trip via PromptIT backend. */
export async function getGenerationStatuses(data: unknown): Promise<StatusResult[]> {
  const requestIds = parseRequestIds(data);
  const response = await fetch("/api/v1/higgsfield/status", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ requestIds }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || `Status request failed (${response.status})`);
  }

  return payload as StatusResult[];
}

function parseRequestIds(data: unknown): string[] {
  const payload = asObject(data, "Invalid status payload");
  const requestIds = payload.requestIds;
  if (!Array.isArray(requestIds) || requestIds.length === 0) {
    throw new Error("Invalid request ids");
  }
  return requestIds.map((requestId) => {
    if (typeof requestId !== "string" || !requestId) throw new Error("Invalid request id");
    return requestId;
  });
}

function asObject(data: unknown, message: string): Record<string, unknown> {
  if (data === null || typeof data !== "object" || Array.isArray(data)) throw new Error(message);
  return data as Record<string, unknown>;
}
