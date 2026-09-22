import { experiencesApi } from "@/api/modules/experiences.api";

export const categoriesApi = {
  list: experiencesApi.categories,
} as const;

