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
  /**
   * Backend path that starts Google sign-in (e.g. /api/auth/google). Empty = Google sign-in is not
   * configured and the button shows an honest "not set up" message. The backend owns the whole
   * OAuth flow; the frontend only navigates here and handles the completion redirect.
   */
  googleAuthStartPath: import.meta.env.VITE_GOOGLE_AUTH_START_PATH ?? "",
};
