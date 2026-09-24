import { registerMock, MockApiError } from "../mockEngine";
import { createStore } from "../crudStore";
import { DmFolder, DmFile } from "@shared/schema";
import { daysAgo } from "../data/core";

const folders = createStore<DmFolder>([
  { id: 1, name: "Verträge", parentId: null, color: "#6366f1", icon: "folder", createdBy: "Admin", createdAt: daysAgo(100), updatedAt: daysAgo(100) },
  { id: 2, name: "Partner-Verträge 2025", parentId: 1, color: "#6366f1", icon: "folder", createdBy: "Admin", createdAt: daysAgo(60), updatedAt: daysAgo(60) },
  { id: 3, name: "Marketing", parentId: null, color: "#22c55e", icon: "folder", createdBy: "Admin", createdAt: daysAgo(90), updatedAt: daysAgo(90) },
]);

const files = createStore<DmFile>([
  { id: 1, name: "Partnervertrag_Bowlorado.pdf", folderId: 2, mimeType: "application/pdf", size: 245678, data: "", tags: ["Vertrag"], starred: true, description: null, uploadedBy: "Admin", createdAt: daysAgo(55), updatedAt: daysAgo(55) },
  { id: 2, name: "Mediakit_2025.pdf", folderId: 3, mimeType: "application/pdf", size: 1245678, data: "", tags: ["Marketing"], starred: false, description: null, uploadedBy: "Admin", createdAt: daysAgo(30), updatedAt: daysAgo(30) },
]);

function breadcrumbFor(folderId: number | null): DmFolder[] {
  const chain: DmFolder[] = [];
  let current = folderId != null ? folders.tryGet(folderId) : undefined;
  while (current) {
    chain.unshift(current);
    current = current.parentId != null ? folders.tryGet(current.parentId) : undefined;
  }
  return chain;
}

registerMock("GET", "/api/admin/documents/folders", (_p, q) => {
  const parentId = q.get("parentId");
  const target = parentId ? Number(parentId) : null;
  return folders.list().filter((f) => f.parentId === target);
});
registerMock("GET", "/api/admin/documents/files", (_p, q) => {
  const folderId = q.get("folderId");
  return files.list().filter((f) => f.folderId === (folderId ? Number(folderId) : null));
});
registerMock("GET", "/api/admin/documents/files/search", (_p, q) => {
  const term = (q.get("q") ?? "").toLowerCase();
  return files.list().filter((f) => f.name.toLowerCase().includes(term));
});
registerMock("GET", "/api/admin/documents/breadcrumb/:id", (p) => breadcrumbFor(Number(p.id)));
registerMock("GET", "/api/admin/documents/stats", () => ({
  totalFiles: files.list().length,
  totalFolders: folders.list().length,
  totalSize: files.list().reduce((s, f) => s + f.size, 0),
  starredCount: files.list().filter((f) => f.starred).length,
}));

registerMock("POST", "/api/admin/documents/folders", (_p, _q, body) => folders.create({ color: "#6366f1", icon: "folder", createdBy: "Admin", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...(body as object) } as Partial<DmFolder>));
registerMock("POST", "/api/admin/documents/files", (_p, _q, body) => files.create({ starred: false, uploadedBy: "Admin", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...(body as object) } as Partial<DmFile>));
registerMock("DELETE", "/api/admin/documents/files/:id", (p) => { files.remove(Number(p.id)); return { success: true }; });
registerMock("DELETE", "/api/admin/documents/folders/:id", (p) => { folders.remove(Number(p.id)); return { success: true }; });
registerMock("PATCH", "/api/admin/documents/files/:id", (p, _q, body) => files.update(Number(p.id), { ...(body as object), updatedAt: new Date().toISOString() } as never));
registerMock("PATCH", "/api/admin/documents/folders/:id", (p, _q, body) => folders.update(Number(p.id), { ...(body as object), updatedAt: new Date().toISOString() } as never));
