import { registerMock, MockApiError } from "./mockEngine";

/** A minimal in-memory table: list/get/create/update/remove, id auto-increment. State lives only for the browser tab's lifetime (resets on reload) — this is a demo data layer, not persistence. */
export function createStore<T extends { id: number }>(seed: T[]) {
  let items: T[] = [...seed];

  return {
    list(): T[] {
      return items;
    },
    get(id: number): T {
      const found = items.find((i) => i.id === id);
      if (!found) throw new MockApiError(`Not found: id ${id}`, 404);
      return found;
    },
    tryGet(id: number): T | undefined {
      return items.find((i) => i.id === id);
    },
    create(data: Partial<T>): T {
      const id = items.reduce((max, i) => Math.max(max, i.id), 0) + 1;
      const item = { id, ...data } as T;
      items = [...items, item];
      return item;
    },
    update(id: number, data: Partial<T>): T {
      let updated: T | undefined;
      items = items.map((i) => {
        if (i.id !== id) return i;
        updated = { ...i, ...data };
        return updated;
      });
      if (!updated) throw new MockApiError(`Not found: id ${id}`, 404);
      return updated;
    },
    remove(id: number): void {
      items = items.filter((i) => i.id !== id);
    },
  };
}

export type Store<T extends { id: number }> = ReturnType<typeof createStore<T>>;

/** Registers the standard GET list / GET one / POST / PATCH / PUT / DELETE routes for a collection in one call. Domain files add any non-standard routes (stats, aggregates, custom sub-paths) alongside this. */
export function registerCrud<T extends { id: number }>(basePath: string, seed: T[]): Store<T> {
  const store = createStore(seed);
  registerMock("GET", basePath, () => store.list());
  registerMock("GET", `${basePath}/:id`, (p) => store.get(Number(p.id)));
  registerMock("POST", basePath, (_p, _q, body) => store.create(body as Partial<T>));
  registerMock("PATCH", `${basePath}/:id`, (p, _q, body) => store.update(Number(p.id), body as Partial<T>));
  registerMock("PUT", `${basePath}/:id`, (p, _q, body) => store.update(Number(p.id), body as Partial<T>));
  registerMock("DELETE", `${basePath}/:id`, (p) => {
    store.remove(Number(p.id));
    return { success: true };
  });
  return store;
}
