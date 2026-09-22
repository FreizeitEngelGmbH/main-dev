export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export type QueryValue = string | number | boolean | null | undefined;

export function withQuery(path: string, query: object): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const suffix = params.toString();
  return suffix ? `${path}?${suffix}` : path;
}
