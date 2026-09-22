import { apiClient } from "@/api/client";
import { parseAuthUser, type LoginRequest, type RegisterRequest } from "@/auth/auth.types";

export const authApi = {
  currentUser: (signal?: AbortSignal) =>
    apiClient.request<unknown>("/api/user", { signal }).then(parseAuthUser),

  login: (credentials: LoginRequest, signal?: AbortSignal) =>
    apiClient.request<unknown, LoginRequest>("/api/login", {
      method: "POST",
      body: credentials,
      signal,
    }),

  register: (data: RegisterRequest, signal?: AbortSignal) =>
    apiClient.request<unknown, RegisterRequest>("/api/register", {
      method: "POST",
      body: data,
      signal,
    }),

  logout: (signal?: AbortSignal) =>
    apiClient.request<void>("/api/logout", { method: "POST", signal }),
} as const;
