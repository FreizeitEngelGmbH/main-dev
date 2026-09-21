import { registerMock } from "../mockEngine";
import { createStore } from "../crudStore";
import { bookingsSeed, experiencesSeed } from "../data/core";

const store = createStore(bookingsSeed);

registerMock("GET", "/api/bookings", () =>
  store.list().map((b) => ({ ...b, experience: experiencesSeed.find((e) => e.id === b.experienceId) }))
);
registerMock("PUT", "/api/bookings/:id/status", (p, _q, body) => {
  const { status } = (body ?? {}) as { status: string };
  return store.update(Number(p.id), { status });
});
