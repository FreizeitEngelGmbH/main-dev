/** Dashboard each role lands on after login and is bounced back to from the other role's routes. */
export function homeForRole(role: string | null | undefined): string {
  if (role === "admin") return "/admin";
  if (role === "partner") return "/partner";
  // Customer accounts have no dashboard in this static build.
  return "/";
}
