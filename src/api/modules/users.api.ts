import { authApi } from "@/api/modules/auth.api";

// No separate profile endpoint is verified in this checkout. The session user
// is therefore the authoritative profile contract until the backend supplies one.
export const usersApi = {
  currentProfile: authApi.currentUser,
} as const;

