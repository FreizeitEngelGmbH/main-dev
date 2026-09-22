/**
 * Central environment/runtime config. This is the one place that decides
 * whether the app talks to the in-memory mock API or a real backend.
 *
 * Real API mode is the default. Set VITE_API_BASE_URL only for a separate API
 * origin. Legacy content mocks and temporary in-memory role logins are explicit
 * opt-in with VITE_USE_MOCK_API=true.
 */
export const env = {
  useMockApi: import.meta.env.VITE_USE_MOCK_API === "true",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
};
