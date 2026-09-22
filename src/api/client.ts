import { apiConfig, apiUrl } from "@/api/config";
import { ApiError, ApiValidationDetails } from "@/api/errors";
import type { HttpMethod } from "@/api/types";
import { notifyUnauthorized } from "@/api/sessionEvents";
import { mockFetch, type MockResponse } from "@/mocks/mockEngine";
import "@/mocks/registerAll";

type ApiResponse = Response | MockResponse;

export interface ApiRequestOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
}

function abortError(): DOMException {
  return new DOMException("The request was aborted", "AbortError");
}

function responseHeaders(response: ApiResponse): Record<string, string> | undefined {
  if (!(response instanceof Response)) return undefined;
  return Object.fromEntries(response.headers.entries());
}

async function parseBody(response: ApiResponse): Promise<unknown> {
  if (response.status === 204 || response.status === 205) return undefined;

  if (response instanceof Response) {
    const contentType = response.headers.get("content-type") ?? "";
    const text = await response.text();
    if (!text) return undefined;
    if (contentType.includes("json")) {
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }
    return text;
  }

  try {
    return await response.json();
  } catch {
    const text = await response.text();
    return text || undefined;
  }
}

function backendMessage(payload: unknown, status: number): string {
  if (typeof payload === "string" && payload.trim()) return payload;
  if (payload && typeof payload === "object") {
    const value = payload as Record<string, unknown>;
    if (typeof value.message === "string" && value.message.trim()) return value.message;
    if (typeof value.error === "string" && value.error.trim()) return value.error;
  }
  return `Request failed with status ${status}`;
}

function validationDetails(payload: unknown): ApiValidationDetails {
  if (!payload || typeof payload !== "object") return null;
  const value = payload as Record<string, unknown>;
  return (value.details ?? value.errors ?? value.fieldErrors ?? null) as ApiValidationDetails;
}

async function assertOk(response: ApiResponse, path: string): Promise<void> {
  if (response.ok) return;
  const payload = await parseBody(response);
  if (response.status === 401) notifyUnauthorized(path);
  throw new ApiError({
    status: response.status,
    message: backendMessage(payload, response.status),
    validationDetails: validationDetails(payload),
    responseInfo: {
      url: response instanceof Response ? response.url || apiUrl(path) : apiUrl(path),
      status: response.status,
      statusText: response instanceof Response ? response.statusText : undefined,
      headers: responseHeaders(response),
    },
    response: response instanceof Response ? response : undefined,
  });
}

async function raw<TBody = unknown>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<ApiResponse> {
  const method = options.method ?? "GET";
  if (options.signal?.aborted) throw abortError();

  let response: ApiResponse;
  if (apiConfig.useMockApi) {
    response = await mockFetch(method, path, options.body);
  } else {
    const hasBody = options.body !== undefined;
    const headers = new Headers(options.headers);
    if (hasBody && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    response = await fetch(apiUrl(path), {
      method,
      headers,
      body: hasBody ? JSON.stringify(options.body) : undefined,
      credentials: "include",
      signal: options.signal,
    });
  }

  if (options.signal?.aborted) throw abortError();
  await assertOk(response, path);
  return response;
}

async function request<TResponse, TBody = unknown>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TResponse> {
  const response = await raw(path, options);
  return (await parseBody(response)) as TResponse;
}

export const apiClient = { raw, request } as const;
