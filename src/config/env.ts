/**
 * Central environment/runtime config. This is the one place that decides
 * whether the app talks to the in-memory mock API or a real backend.
 *
 * To connect the real FreizeitEngel backend later: set
 * `VITE_USE_MOCK_API=false` and `VITE_API_BASE_URL` in a `.env` file, then
 * (per-domain, as each one is ready) delete that domain's mock
 * registration import in `src/mocks/registerAll.ts`. No admin page
 * component needs to change — see README.md.
 */
export const env = {
  useMockApi: (import.meta.env.VITE_USE_MOCK_API ?? "true") !== "false",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
};
