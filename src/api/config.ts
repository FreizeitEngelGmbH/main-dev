import { env } from "@/config/env";

const API_PATH_PREFIX = "/api/";

export const apiConfig = {
  baseUrl: env.apiBaseUrl.replace(/\/$/, ""),
  useMockApi: env.useMockApi,
} as const;

export function apiUrl(path: string): string {
  if (!path.startsWith(API_PATH_PREFIX) && path !== "/api") {
    throw new Error(`API paths must start with /api: ${path}`);
  }
  return `${apiConfig.baseUrl}${path}`;
}

