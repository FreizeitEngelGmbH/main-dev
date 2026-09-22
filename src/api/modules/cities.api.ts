import { experiencesApi } from "@/api/modules/experiences.api";

export const citiesApi = {
  list: experiencesApi.cities,
} as const;

