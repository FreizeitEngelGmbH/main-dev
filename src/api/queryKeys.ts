export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    user: ["auth", "user"] as const,
  },
  users: {
    all: ["users"] as const,
    profile: ["users", "profile"] as const,
  },
  experiences: {
    all: ["experiences"] as const,
    list: (filters?: Record<string, unknown>) => ["experiences", "list", filters ?? {}] as const,
    detail: (id: number) => ["experiences", "detail", id] as const,
  },
  categories: {
    all: ["categories"] as const,
  },
  cities: {
    all: ["cities"] as const,
  },
  availability: {
    all: ["availability"] as const,
    forExperience: (experienceId: number, date?: string) =>
      ["availability", experienceId, date ?? null] as const,
  },
  bookings: {
    all: ["bookings"] as const,
    detail: (id: number) => ["bookings", id] as const,
  },
  favorites: {
    all: ["favorites"] as const,
    check: (experienceId: number) => ["favorites", experienceId, "check"] as const,
  },
  partner: {
    all: ["partner"] as const,
    profile: ["partner", "profile"] as const,
    dashboard: ["partner", "dashboard"] as const,
    experiences: ["partner", "experiences"] as const,
    bookings: ["partner", "bookings"] as const,
  },
  admin: {
    all: ["admin"] as const,
    dashboard: ["admin", "dashboard"] as const,
    partners: ["admin", "partners"] as const,
  },
} as const;

