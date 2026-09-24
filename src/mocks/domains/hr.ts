import { registerMock } from "../mockEngine";
import { createStore } from "../crudStore";
import { HrDepartment, HrEmployee, HrAbsence } from "@shared/schema";
import { daysAgo } from "../data/core";

const departments = createStore<HrDepartment>([
  { id: 1, name: "Vertrieb", description: "Partneraquise & Sales", color: "#6366f1", headOfDepartment: "Admin", createdAt: daysAgo(300) },
  { id: 2, name: "Marketing", description: "Kampagnen & Content", color: "#22c55e", headOfDepartment: null, createdAt: daysAgo(300) },
  { id: 3, name: "Tech", description: "Plattform & Produkt", color: "#eab308", headOfDepartment: null, createdAt: daysAgo(300) },
]);

const employees = createStore<HrEmployee>([
  { id: 1, firstName: "Admin", lastName: "Team", email: "admin@freizeitengel.test", phone: null, position: "Geschäftsführung", departmentId: 3, employmentType: "Vollzeit", status: "aktiv", startDate: "2023-01-15", salary: null, weeklyHours: 40, vacationDays: 30, usedVacationDays: 8, profileImage: null, address: null, city: "Dortmund", zipCode: null, emergencyContact: null, emergencyPhone: null, notes: null, createdAt: daysAgo(400), updatedAt: daysAgo(10) },
  { id: 2, firstName: "Nina", lastName: "Fischer", email: "n.fischer@freizeitengel.test", phone: "+49 151 5551111", position: "Sales Managerin", departmentId: 1, employmentType: "Vollzeit", status: "aktiv", startDate: "2023-06-01", salary: null, weeklyHours: 40, vacationDays: 28, usedVacationDays: 12, profileImage: null, address: null, city: "Dortmund", zipCode: null, emergencyContact: null, emergencyPhone: null, notes: null, createdAt: daysAgo(300), updatedAt: daysAgo(5) },
  { id: 3, firstName: "David", lastName: "Roth", email: "d.roth@freizeitengel.test", phone: "+49 151 5552222", position: "Marketing Manager", departmentId: 2, employmentType: "Teilzeit", status: "aktiv", startDate: "2024-02-01", salary: null, weeklyHours: 24, vacationDays: 18, usedVacationDays: 4, profileImage: null, address: null, city: "Essen", zipCode: null, emergencyContact: null, emergencyPhone: null, notes: null, createdAt: daysAgo(200), updatedAt: daysAgo(2) },
]);

const absences = createStore<HrAbsence>([
  { id: 1, employeeId: 2, type: "Urlaub", startDate: "2025-08-04", endDate: "2025-08-15", days: 10, status: "genehmigt", reason: null, approvedBy: "Admin", createdAt: daysAgo(40) },
  { id: 2, employeeId: 3, type: "Krankheit", startDate: "2025-07-02", endDate: "2025-07-03", days: 2, status: "genehmigt", reason: null, approvedBy: "Admin", createdAt: daysAgo(70) },
  { id: 3, employeeId: 2, type: "Urlaub", startDate: "2025-09-22", endDate: "2025-09-26", days: 5, status: "beantragt", reason: null, approvedBy: null, createdAt: daysAgo(3) },
]);

registerMock("GET", "/api/admin/hr/stats", () => ({
  totalEmployees: employees.list().length,
  activeEmployees: employees.list().filter((e) => e.status === "aktiv").length,
  departments: departments.list().length,
  pendingAbsences: absences.list().filter((a) => a.status === "beantragt").length,
}));
registerMock("GET", "/api/admin/hr/employees", (_p, q) => {
  const search = q.get("q");
  if (!search) return employees.list();
  const term = search.toLowerCase();
  return employees.list().filter((e) => `${e.firstName} ${e.lastName}`.toLowerCase().includes(term));
});
registerMock("GET", "/api/admin/hr/departments", () => departments.list());
registerMock("GET", "/api/admin/hr/absences", () => absences.list());

registerMock("POST", "/api/admin/hr/employees", (_p, _q, body) => employees.create({ status: "aktiv", vacationDays: 30, usedVacationDays: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...(body as object) } as Partial<HrEmployee>));
registerMock("PATCH", "/api/admin/hr/employees/:id", (p, _q, body) => employees.update(Number(p.id), { ...(body as object), updatedAt: new Date().toISOString() } as never));
registerMock("DELETE", "/api/admin/hr/employees/:id", (p) => { employees.remove(Number(p.id)); return { success: true }; });
registerMock("POST", "/api/admin/hr/departments", (_p, _q, body) => departments.create({ createdAt: new Date().toISOString(), ...(body as object) } as Partial<HrDepartment>));
registerMock("PATCH", "/api/admin/hr/departments/:id", (p, _q, body) => departments.update(Number(p.id), body as never));
registerMock("DELETE", "/api/admin/hr/departments/:id", (p) => { departments.remove(Number(p.id)); return { success: true }; });
registerMock("POST", "/api/admin/hr/absences", (_p, _q, body) => absences.create({ status: "beantragt", createdAt: new Date().toISOString(), ...(body as object) } as Partial<HrAbsence>));
registerMock("PATCH", "/api/admin/hr/absences/:id", (p, _q, body) => absences.update(Number(p.id), body as never));
registerMock("DELETE", "/api/admin/hr/absences/:id", (p) => { absences.remove(Number(p.id)); return { success: true }; });
