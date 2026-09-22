import type { User, Role } from "@shared/schema";
import { insertUserSchema } from "@shared/schema";
import type { z } from "zod";
import { z as zod } from "zod";

export type AuthUser = Omit<User, "password" | "role"> & { role: Role };

export interface LoginRequest {
  username: string;
  password: string;
}

// The checked-in shared schema mirrors the backend registration fields.
export type RegisterRequest = z.infer<typeof insertUserSchema>;

export const authUserSchema = zod.object({
  id: zod.number(),
  username: zod.string(),
  email: zod.string(),
  fullName: zod.string(),
  profileImage: zod.string().nullable(),
  role: zod.enum(["user", "partner", "admin"]),
  createdAt: zod.union([zod.string(), zod.date()]).nullable(),
});

export function parseAuthUser(value: unknown): AuthUser {
  return authUserSchema.parse(value);
}
