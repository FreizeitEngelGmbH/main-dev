import { registerMock } from "../mockEngine";
import { createStore } from "../crudStore";
import { usersSeed, daysAgo, daysFromNow } from "../data/core";
import { ProjectBoard, ProjectColumn, ProjectTask, ProjectTaskComment } from "@shared/schema";

const boards = createStore<ProjectBoard>([{ id: 1, name: "Produkt Roadmap Q3", description: "Zentrale Aufgabenliste", createdBy: 1, createdAt: daysAgo(60) }]);

const columns = createStore<ProjectColumn>([
  { id: 1, boardId: 1, name: "Offen", color: "#6366f1", position: 0 },
  { id: 2, boardId: 1, name: "In Arbeit", color: "#eab308", position: 1 },
  { id: 3, boardId: 1, name: "Erledigt", color: "#22c55e", position: 2 },
]);

const tasks = createStore<ProjectTask>([
  { id: 1, boardId: 1, columnId: 1, title: "Onboarding-Flow für neue Partner überarbeiten", description: null, priority: "high", assigneeId: 1, dueDate: daysFromNow(7), labels: ["Partner"], position: 0, createdBy: 1, createdAt: daysAgo(10), updatedAt: daysAgo(10) },
  { id: 2, boardId: 1, columnId: 2, title: "Stripe Connect Onboarding testen", description: null, priority: "medium", assigneeId: 1, dueDate: daysFromNow(3), labels: ["Payments"], position: 0, createdBy: 1, createdAt: daysAgo(8), updatedAt: daysAgo(2) },
  { id: 3, boardId: 1, columnId: 3, title: "Newsletter-Template Sommer", description: null, priority: "low", assigneeId: 1, dueDate: daysAgo(2), labels: ["Marketing"], position: 0, createdBy: 1, createdAt: daysAgo(15), updatedAt: daysAgo(3) },
]);

const comments = createStore<ProjectTaskComment>([{ id: 1, taskId: 2, userId: 1, content: "Testkarte funktioniert, warte auf Live-Freigabe.", createdAt: daysAgo(2) }]);

registerMock("GET", "/api/project/boards", () => boards.list());
registerMock("GET", "/api/project/boards/:id/columns", (p) => columns.list().filter((c) => c.boardId === Number(p.id)));
registerMock("GET", "/api/project/boards/:id/tasks", (p) => tasks.list().filter((t) => t.boardId === Number(p.id)));
registerMock("GET", "/api/project/users", () => usersSeed);
registerMock("GET", "/api/project/tasks/:id/comments", (p) => comments.list().filter((c) => c.taskId === Number(p.id)));

registerMock("POST", "/api/project/boards", (_p, _q, body) => boards.create({ createdBy: 1, createdAt: new Date().toISOString(), ...(body as object) } as Partial<ProjectBoard>));
registerMock("DELETE", "/api/project/boards/:id", (p) => { boards.remove(Number(p.id)); return { success: true }; });
registerMock("POST", "/api/project/tasks", (_p, _q, body) => tasks.create({ createdBy: 1, position: 0, priority: "medium", labels: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...(body as object) } as Partial<ProjectTask>));
registerMock("PATCH", "/api/project/tasks/:id", (p, _q, body) => tasks.update(Number(p.id), { ...(body as object), updatedAt: new Date().toISOString() } as never));
registerMock("DELETE", "/api/project/tasks/:id", (p) => { tasks.remove(Number(p.id)); return { success: true }; });
registerMock("POST", "/api/project/tasks/:id/comments", (p, _q, body) => comments.create({ taskId: Number(p.id), userId: 1, createdAt: new Date().toISOString(), ...(body as object) } as Partial<ProjectTaskComment>));
