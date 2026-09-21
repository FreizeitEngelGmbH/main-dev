import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import AdminLayout from "./admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  UserPlus,
  Building2,
  CalendarOff,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Clock,
  UserCheck,
  UserX,
  Calendar,
  Check,
  X,
  ChevronDown,
  Eye,
  AlertCircle,
} from "lucide-react";
import type { HrDepartment, HrEmployee, HrAbsence } from "@shared/schema";

const ACCENT = "#36C9C2";

const ABSENCE_TYPES = [
  { value: "urlaub", label: "Urlaub", color: "bg-blue-100 text-blue-700" },
  { value: "krankheit", label: "Krankheit", color: "bg-red-100 text-red-700" },
  { value: "homeoffice", label: "Home Office", color: "bg-purple-100 text-purple-700" },
  { value: "fortbildung", label: "Fortbildung", color: "bg-amber-100 text-amber-700" },
  { value: "elternzeit", label: "Elternzeit", color: "bg-pink-100 text-pink-700" },
  { value: "sonderurlaub", label: "Sonderurlaub", color: "bg-teal-100 text-teal-700" },
  { value: "unbezahlt", label: "Unbezahlter Urlaub", color: "bg-gray-100 text-gray-700" },
];

const STATUS_COLORS: Record<string, string> = {
  beantragt: "bg-yellow-100 text-yellow-700",
  genehmigt: "bg-green-100 text-green-700",
  abgelehnt: "bg-red-100 text-red-700",
};

const DEPT_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6"];

function getInitials(first: string, last: string) {
  return `${first[0] || ""}${last[0] || ""}`.toUpperCase();
}

function getAbsenceTypeInfo(type: string) {
  return ABSENCE_TYPES.find((t) => t.value === type) || { value: type, label: type, color: "bg-gray-100 text-gray-700" };
}

export default function AdminHR() {
  const { toast } = useToast();
  const [tab, setTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [showDeptDialog, setShowDeptDialog] = useState(false);
  const [showAbsenceDialog, setShowAbsenceDialog] = useState(false);
  const [showEmployeeDetail, setShowEmployeeDetail] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<HrEmployee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Partial<HrEmployee> | null>(null);
  const [editingDept, setEditingDept] = useState<Partial<HrDepartment> | null>(null);
  const [editingAbsence, setEditingAbsence] = useState<Partial<HrAbsence> | null>(null);
  const [filterDept, setFilterDept] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const statsQuery = useQuery({ queryKey: ["/api/admin/hr/stats"] });
  const employeesQuery = useQuery<HrEmployee[]>({ queryKey: ["/api/admin/hr/employees"] });
  const departmentsQuery = useQuery<HrDepartment[]>({ queryKey: ["/api/admin/hr/departments"] });
  const absencesQuery = useQuery<HrAbsence[]>({ queryKey: ["/api/admin/hr/absences"] });

  const stats = statsQuery.data as any;
  const employees = employeesQuery.data || [];
  const departments = departmentsQuery.data || [];
  const absences = absencesQuery.data || [];

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      !searchQuery ||
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDept === "all" || String(emp.departmentId) === filterDept;
    const matchesStatus = filterStatus === "all" || emp.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const getDeptName = (deptId: number | null) => {
    if (!deptId) return "—";
    const dept = departments.find((d) => d.id === deptId);
    return dept?.name || "—";
  };

  const getDeptColor = (deptId: number | null) => {
    if (!deptId) return "#999";
    const dept = departments.find((d) => d.id === deptId);
    return dept?.color || "#6366f1";
  };

  const getEmployeeName = (empId: number) => {
    const emp = employees.find((e) => e.id === empId);
    return emp ? `${emp.firstName} ${emp.lastName}` : `#${empId}`;
  };

  // Mutations
  const createEmployeeMut = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/admin/hr/employees", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hr/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hr/stats"] });
      setShowEmployeeDialog(false);
      setEditingEmployee(null);
      toast({ title: "Teammitglied erstellt" });
    },
  });

  const updateEmployeeMut = useMutation({
    mutationFn: async ({ id, ...data }: any) => apiRequest("PATCH", `/api/admin/hr/employees/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hr/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hr/stats"] });
      setShowEmployeeDialog(false);
      setEditingEmployee(null);
      toast({ title: "Teammitglied aktualisiert" });
    },
  });

  const deleteEmployeeMut = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/hr/employees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hr/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hr/stats"] });
      toast({ title: "Teammitglied gelöscht" });
    },
  });

  const createDeptMut = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/admin/hr/departments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hr/departments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hr/stats"] });
      setShowDeptDialog(false);
      setEditingDept(null);
      toast({ title: "Abteilung erstellt" });
    },
  });

  const updateDeptMut = useMutation({
    mutationFn: async ({ id, ...data }: any) => apiRequest("PATCH", `/api/admin/hr/departments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hr/departments"] });
      setShowDeptDialog(false);
      setEditingDept(null);
      toast({ title: "Abteilung aktualisiert" });
    },
  });

  const deleteDeptMut = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/hr/departments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hr/departments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hr/stats"] });
      toast({ title: "Abteilung gelöscht" });
    },
  });

  const createAbsenceMut = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/admin/hr/absences", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hr/absences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hr/stats"] });
      setShowAbsenceDialog(false);
      setEditingAbsence(null);
      toast({ title: "Abwesenheit eingetragen" });
    },
  });

  const updateAbsenceMut = useMutation({
    mutationFn: async ({ id, ...data }: any) => apiRequest("PATCH", `/api/admin/hr/absences/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hr/absences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hr/stats"] });
      toast({ title: "Abwesenheit aktualisiert" });
    },
  });

  const deleteAbsenceMut = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/hr/absences/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hr/absences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hr/stats"] });
      toast({ title: "Abwesenheit gelöscht" });
    },
  });

  const handleSaveEmployee = () => {
    if (!editingEmployee) return;
    if (editingEmployee.id) {
      updateEmployeeMut.mutate(editingEmployee);
    } else {
      createEmployeeMut.mutate(editingEmployee);
    }
  };

  const handleSaveDept = () => {
    if (!editingDept) return;
    if (editingDept.id) {
      updateDeptMut.mutate(editingDept);
    } else {
      createDeptMut.mutate(editingDept);
    }
  };

  const handleSaveAbsence = () => {
    if (!editingAbsence) return;
    if (editingAbsence.id) {
      updateAbsenceMut.mutate(editingAbsence);
    } else {
      createAbsenceMut.mutate(editingAbsence);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-7 h-7" style={{ color: ACCENT }} />
                Personalmanagement
              </h1>
              <p className="text-sm text-gray-500 mt-1">Team, Abteilungen und Abwesenheiten verwalten</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="employees">Team</TabsTrigger>
              <TabsTrigger value="departments">Abteilungen</TabsTrigger>
              <TabsTrigger value="absences">Abwesenheiten</TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: `${ACCENT}20` }}>
                        <Users className="w-6 h-6" style={{ color: ACCENT }} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats?.totalEmployees || 0}</p>
                        <p className="text-sm text-gray-500">Teammitglieder gesamt</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-green-50">
                        <UserCheck className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats?.activeEmployees || 0}</p>
                        <p className="text-sm text-gray-500">Aktive Teammitglieder</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-indigo-50">
                        <Building2 className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats?.departments || 0}</p>
                        <p className="text-sm text-gray-500">Abteilungen</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-yellow-50">
                        <AlertCircle className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats?.pendingAbsences || 0}</p>
                        <p className="text-sm text-gray-500">Offene Anträge</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Department Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Team nach Abteilung</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {departments.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">Noch keine Abteilungen angelegt</p>
                    ) : (
                      <div className="space-y-3">
                        {departments.map((dept) => {
                          const count = employees.filter((e) => e.departmentId === dept.id).length;
                          const pct = employees.length > 0 ? (count / employees.length) * 100 : 0;
                          return (
                            <div key={dept.id}>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color || "#6366f1" }} />
                                  <span className="font-medium">{dept.name}</span>
                                </div>
                                <span className="text-gray-500">{count} Teammitglieder</span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: dept.color || "#6366f1" }} />
                              </div>
                            </div>
                          );
                        })}
                        {employees.filter((e) => !e.departmentId).length > 0 && (
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gray-300" />
                                <span className="font-medium">Ohne Abteilung</span>
                              </div>
                              <span className="text-gray-500">{employees.filter((e) => !e.departmentId).length}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-gray-300" style={{ width: `${(employees.filter((e) => !e.departmentId).length / Math.max(employees.length, 1)) * 100}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Aktuelle Abwesenheiten</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {absences.filter((a) => a.status === "beantragt").length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">Keine offenen Anträge</p>
                    ) : (
                      <div className="space-y-2">
                        {absences
                          .filter((a) => a.status === "beantragt")
                          .slice(0, 5)
                          .map((a) => {
                            const typeInfo = getAbsenceTypeInfo(a.type);
                            return (
                              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                <div>
                                  <p className="text-sm font-medium">{getEmployeeName(a.employeeId)}</p>
                                  <p className="text-xs text-gray-500">{a.startDate} — {a.endDate}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                                  <div className="flex gap-1">
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600" onClick={() => updateAbsenceMut.mutate({ id: a.id, status: "genehmigt" })}>
                                      <Check className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600" onClick={() => updateAbsenceMut.mutate({ id: a.id, status: "abgelehnt" })}>
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* EMPLOYEES TAB */}
            <TabsContent value="employees">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Teammitglied suchen..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                  </div>
                  <Select value={filterDept} onValueChange={setFilterDept}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Abteilung" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Abteilungen</SelectItem>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Status</SelectItem>
                      <SelectItem value="aktiv">Aktiv</SelectItem>
                      <SelectItem value="inaktiv">Inaktiv</SelectItem>
                      <SelectItem value="probezeit">Probezeit</SelectItem>
                      <SelectItem value="gekündigt">Gekündigt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => { setEditingEmployee({ employmentType: "Vollzeit", status: "aktiv", weeklyHours: 40, vacationDays: 30, usedVacationDays: 0 }); setShowEmployeeDialog(true); }}
                  style={{ backgroundColor: ACCENT }}
                  className="text-white hover:opacity-90"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Neues Teammitglied
                </Button>
              </div>

              {filteredEmployees.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Users className="w-16 h-16 mx-auto mb-3" style={{ color: ACCENT }} />
                  <h3 className="text-lg font-medium text-gray-600">Keine Teammitglieder gefunden</h3>
                  <p className="text-sm mt-1">Erstelle dein erstes Teammitglied</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border">
                  <div className="grid grid-cols-[1fr_150px_150px_100px_100px_40px] px-4 py-2 border-b text-xs font-semibold text-gray-400 uppercase">
                    <span>Name</span>
                    <span>Position</span>
                    <span>Abteilung</span>
                    <span>Status</span>
                    <span>Art</span>
                    <span></span>
                  </div>
                  {filteredEmployees.map((emp) => (
                    <div key={emp.id} className="grid grid-cols-[1fr_150px_150px_100px_100px_40px] px-4 py-3 border-b last:border-0 hover:bg-gray-50 items-center group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0" style={{ backgroundColor: getDeptColor(emp.departmentId) }}>
                          {getInitials(emp.firstName, emp.lastName)}
                        </div>
                        <div className="min-w-0">
                          <button className="text-sm font-medium hover:underline" onClick={() => { setSelectedEmployee(emp); setShowEmployeeDetail(true); }}>
                            {emp.firstName} {emp.lastName}
                          </button>
                          <p className="text-xs text-gray-400 truncate">{emp.email}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 truncate">{emp.position}</span>
                      <span className="text-sm text-gray-600 truncate">{getDeptName(emp.departmentId)}</span>
                      <Badge variant="outline" className={
                        emp.status === "aktiv" ? "bg-green-50 text-green-700 border-green-200" :
                        emp.status === "inaktiv" ? "bg-gray-100 text-gray-600" :
                        emp.status === "probezeit" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-red-50 text-red-700 border-red-200"
                      }>
                        {emp.status}
                      </Badge>
                      <span className="text-xs text-gray-500">{emp.employmentType}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedEmployee(emp); setShowEmployeeDetail(true); }}>
                            <Eye className="w-4 h-4 mr-2" /> Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setEditingEmployee(emp); setShowEmployeeDialog(true); }}>
                            <Pencil className="w-4 h-4 mr-2" /> Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => deleteEmployeeMut.mutate(emp.id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* DEPARTMENTS TAB */}
            <TabsContent value="departments">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Abteilungen</h3>
                <Button
                  onClick={() => { setEditingDept({ color: DEPT_COLORS[Math.floor(Math.random() * DEPT_COLORS.length)] }); setShowDeptDialog(true); }}
                  style={{ backgroundColor: ACCENT }}
                  className="text-white hover:opacity-90"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Neue Abteilung
                </Button>
              </div>

              {departments.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Building2 className="w-16 h-16 mx-auto mb-3" style={{ color: ACCENT }} />
                  <h3 className="text-lg font-medium text-gray-600">Keine Abteilungen</h3>
                  <p className="text-sm mt-1">Erstelle deine erste Abteilung</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map((dept) => {
                    const empCount = employees.filter((e) => e.departmentId === dept.id).length;
                    return (
                      <Card key={dept.id} className="group relative">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${dept.color || "#6366f1"}20` }}>
                              <Building2 className="w-5 h-5" style={{ color: dept.color || "#6366f1" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold">{dept.name}</h4>
                              {dept.description && <p className="text-sm text-gray-500 mt-1">{dept.description}</p>}
                              <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {empCount} Teammitglieder</span>
                                {dept.headOfDepartment && <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> {dept.headOfDepartment}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setEditingDept(dept); setShowDeptDialog(true); }}>
                                  <Pencil className="w-4 h-4 mr-2" /> Bearbeiten
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => deleteDeptMut.mutate(dept.id)}>
                                  <Trash2 className="w-4 h-4 mr-2" /> Löschen
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ABSENCES TAB */}
            <TabsContent value="absences">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Abwesenheiten & Urlaubsanträge</h3>
                <Button
                  onClick={() => { setEditingAbsence({ type: "urlaub", status: "beantragt", days: 1 }); setShowAbsenceDialog(true); }}
                  style={{ backgroundColor: ACCENT }}
                  className="text-white hover:opacity-90"
                >
                  <CalendarOff className="w-4 h-4 mr-1" />
                  Neue Abwesenheit
                </Button>
              </div>

              {absences.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <CalendarOff className="w-16 h-16 mx-auto mb-3" style={{ color: ACCENT }} />
                  <h3 className="text-lg font-medium text-gray-600">Keine Abwesenheiten</h3>
                  <p className="text-sm mt-1">Trage die erste Abwesenheit ein</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border">
                  <div className="grid grid-cols-[1fr_120px_120px_80px_100px_100px_60px] px-4 py-2 border-b text-xs font-semibold text-gray-400 uppercase">
                    <span>Teammitglied</span>
                    <span>Von</span>
                    <span>Bis</span>
                    <span>Tage</span>
                    <span>Typ</span>
                    <span>Status</span>
                    <span></span>
                  </div>
                  {absences.map((a) => {
                    const typeInfo = getAbsenceTypeInfo(a.type);
                    return (
                      <div key={a.id} className="grid grid-cols-[1fr_120px_120px_80px_100px_100px_60px] px-4 py-3 border-b last:border-0 hover:bg-gray-50 items-center group">
                        <span className="text-sm font-medium">{getEmployeeName(a.employeeId)}</span>
                        <span className="text-sm text-gray-600">{a.startDate}</span>
                        <span className="text-sm text-gray-600">{a.endDate}</span>
                        <span className="text-sm text-gray-600">{a.days}</span>
                        <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                        <Badge className={STATUS_COLORS[a.status || "beantragt"] || "bg-gray-100 text-gray-700"}>{a.status}</Badge>
                        <div className="flex gap-1">
                          {a.status === "beantragt" && (
                            <>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600" onClick={() => updateAbsenceMut.mutate({ id: a.id, status: "genehmigt" })}>
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600" onClick={() => updateAbsenceMut.mutate({ id: a.id, status: "abgelehnt" })}>
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditingAbsence(a); setShowAbsenceDialog(true); }}>
                                <Pencil className="w-4 h-4 mr-2" /> Bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => deleteAbsenceMut.mutate(a.id)}>
                                <Trash2 className="w-4 h-4 mr-2" /> Löschen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Employee Create/Edit Dialog */}
        <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEmployee?.id ? "Teammitglied bearbeiten" : "Neues Teammitglied"}</DialogTitle>
            </DialogHeader>
            {editingEmployee && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Vorname *</label>
                    <Input value={editingEmployee.firstName || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, firstName: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nachname *</label>
                    <Input value={editingEmployee.lastName || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">E-Mail *</label>
                    <Input type="email" value={editingEmployee.email || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Telefon</label>
                    <Input value={editingEmployee.phone || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Position *</label>
                    <Input value={editingEmployee.position || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, position: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Abteilung</label>
                    <Select value={editingEmployee.departmentId ? String(editingEmployee.departmentId) : "none"} onValueChange={(v) => setEditingEmployee({ ...editingEmployee, departmentId: v === "none" ? null : Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Keine</SelectItem>
                        {departments.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Beschäftigungsart</label>
                    <Select value={editingEmployee.employmentType || "Vollzeit"} onValueChange={(v) => setEditingEmployee({ ...editingEmployee, employmentType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vollzeit">Vollzeit</SelectItem>
                        <SelectItem value="Teilzeit">Teilzeit</SelectItem>
                        <SelectItem value="Minijob">Minijob</SelectItem>
                        <SelectItem value="Werkstudent">Werkstudent</SelectItem>
                        <SelectItem value="Praktikant">Praktikant</SelectItem>
                        <SelectItem value="Freelancer">Freelancer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Status</label>
                    <Select value={editingEmployee.status || "aktiv"} onValueChange={(v) => setEditingEmployee({ ...editingEmployee, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aktiv">Aktiv</SelectItem>
                        <SelectItem value="inaktiv">Inaktiv</SelectItem>
                        <SelectItem value="probezeit">Probezeit</SelectItem>
                        <SelectItem value="gekündigt">Gekündigt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Eintrittsdatum</label>
                    <Input type="date" value={editingEmployee.startDate || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, startDate: e.target.value })} />
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Wochenstunden</label>
                    <Input type="number" value={editingEmployee.weeklyHours || 40} onChange={(e) => setEditingEmployee({ ...editingEmployee, weeklyHours: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Urlaubstage/Jahr</label>
                    <Input type="number" value={editingEmployee.vacationDays || 30} onChange={(e) => setEditingEmployee({ ...editingEmployee, vacationDays: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Gehalt (EUR/Monat)</label>
                    <Input type="number" value={editingEmployee.salary || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, salary: Number(e.target.value) })} />
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Adresse</label>
                    <Input value={editingEmployee.address || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, address: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">PLZ</label>
                    <Input value={editingEmployee.zipCode || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, zipCode: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Stadt</label>
                    <Input value={editingEmployee.city || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, city: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Notfallkontakt</label>
                    <Input value={editingEmployee.emergencyContact || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, emergencyContact: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Notfall-Telefon</label>
                    <Input value={editingEmployee.emergencyPhone || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, emergencyPhone: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Notizen</label>
                  <Textarea value={editingEmployee.notes || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, notes: e.target.value })} rows={2} />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowEmployeeDialog(false); setEditingEmployee(null); }}>Abbrechen</Button>
              <Button
                onClick={handleSaveEmployee}
                disabled={!editingEmployee?.firstName || !editingEmployee?.lastName || !editingEmployee?.email || !editingEmployee?.position}
                style={{ backgroundColor: ACCENT }}
                className="text-white hover:opacity-90"
              >
                {editingEmployee?.id ? "Speichern" : "Erstellen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Department Create/Edit Dialog */}
        <Dialog open={showDeptDialog} onOpenChange={setShowDeptDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDept?.id ? "Abteilung bearbeiten" : "Neue Abteilung"}</DialogTitle>
            </DialogHeader>
            {editingDept && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Name *</label>
                  <Input value={editingDept.name || ""} onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Beschreibung</label>
                  <Textarea value={editingDept.description || ""} onChange={(e) => setEditingDept({ ...editingDept, description: e.target.value })} rows={2} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Abteilungsleiter</label>
                  <Input value={editingDept.headOfDepartment || ""} onChange={(e) => setEditingDept({ ...editingDept, headOfDepartment: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Farbe</label>
                  <div className="flex gap-2 flex-wrap">
                    {DEPT_COLORS.map((c) => (
                      <button
                        key={c}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${editingDept.color === c ? "border-gray-900 scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setEditingDept({ ...editingDept, color: c })}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowDeptDialog(false); setEditingDept(null); }}>Abbrechen</Button>
              <Button
                onClick={handleSaveDept}
                disabled={!editingDept?.name}
                style={{ backgroundColor: ACCENT }}
                className="text-white hover:opacity-90"
              >
                {editingDept?.id ? "Speichern" : "Erstellen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Absence Create/Edit Dialog */}
        <Dialog open={showAbsenceDialog} onOpenChange={setShowAbsenceDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAbsence?.id ? "Abwesenheit bearbeiten" : "Neue Abwesenheit"}</DialogTitle>
            </DialogHeader>
            {editingAbsence && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Teammitglied *</label>
                  <Select value={editingAbsence.employeeId ? String(editingAbsence.employeeId) : ""} onValueChange={(v) => setEditingAbsence({ ...editingAbsence, employeeId: Number(v) })}>
                    <SelectTrigger><SelectValue placeholder="Teammitglied wählen" /></SelectTrigger>
                    <SelectContent>
                      {employees.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Typ *</label>
                  <Select value={editingAbsence.type || "urlaub"} onValueChange={(v) => setEditingAbsence({ ...editingAbsence, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ABSENCE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Von *</label>
                    <Input type="date" value={editingAbsence.startDate || ""} onChange={(e) => setEditingAbsence({ ...editingAbsence, startDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Bis *</label>
                    <Input type="date" value={editingAbsence.endDate || ""} onChange={(e) => setEditingAbsence({ ...editingAbsence, endDate: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Arbeitstage</label>
                  <Input type="number" step="0.5" value={editingAbsence.days || 1} onChange={(e) => setEditingAbsence({ ...editingAbsence, days: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Grund / Bemerkung</label>
                  <Textarea value={editingAbsence.reason || ""} onChange={(e) => setEditingAbsence({ ...editingAbsence, reason: e.target.value })} rows={2} />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowAbsenceDialog(false); setEditingAbsence(null); }}>Abbrechen</Button>
              <Button
                onClick={handleSaveAbsence}
                disabled={!editingAbsence?.employeeId || !editingAbsence?.startDate || !editingAbsence?.endDate}
                style={{ backgroundColor: ACCENT }}
                className="text-white hover:opacity-90"
              >
                {editingAbsence?.id ? "Speichern" : "Eintragen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Employee Detail Dialog */}
        <Dialog open={showEmployeeDetail} onOpenChange={setShowEmployeeDetail}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Teammitglied-Details</DialogTitle>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: getDeptColor(selectedEmployee.departmentId) }}>
                    {getInitials(selectedEmployee.firstName, selectedEmployee.lastName)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                    <p className="text-gray-500">{selectedEmployee.position}</p>
                    <Badge variant="outline" className={
                      selectedEmployee.status === "aktiv" ? "bg-green-50 text-green-700 border-green-200 mt-1" :
                      "bg-gray-100 text-gray-600 mt-1"
                    }>
                      {selectedEmployee.status}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" /> {selectedEmployee.email}
                  </div>
                  {selectedEmployee.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" /> {selectedEmployee.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="w-4 h-4" /> {getDeptName(selectedEmployee.departmentId)}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-4 h-4" /> {selectedEmployee.employmentType}
                  </div>
                  {selectedEmployee.startDate && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" /> Seit {selectedEmployee.startDate}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" /> {selectedEmployee.weeklyHours}h/Woche
                  </div>
                  {selectedEmployee.city && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" /> {selectedEmployee.zipCode} {selectedEmployee.city}
                    </div>
                  )}
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Urlaubstage</span>
                    <p className="font-medium">{(selectedEmployee.vacationDays || 30) - (selectedEmployee.usedVacationDays || 0)} von {selectedEmployee.vacationDays || 30} verbleibend</p>
                  </div>
                  {selectedEmployee.salary && (
                    <div>
                      <span className="text-gray-400">Gehalt</span>
                      <p className="font-medium">{selectedEmployee.salary.toLocaleString("de-DE")} EUR/Monat</p>
                    </div>
                  )}
                </div>
                {selectedEmployee.emergencyContact && (
                  <>
                    <Separator />
                    <div className="text-sm">
                      <span className="text-gray-400">Notfallkontakt</span>
                      <p className="font-medium">{selectedEmployee.emergencyContact} {selectedEmployee.emergencyPhone && `(${selectedEmployee.emergencyPhone})`}</p>
                    </div>
                  </>
                )}
                {selectedEmployee.notes && (
                  <>
                    <Separator />
                    <div className="text-sm">
                      <span className="text-gray-400">Notizen</span>
                      <p className="mt-1">{selectedEmployee.notes}</p>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { setShowEmployeeDetail(false); setEditingEmployee(selectedEmployee); setShowEmployeeDialog(true); }} style={{ backgroundColor: ACCENT }} className="text-white hover:opacity-90">
                    <Pencil className="w-4 h-4 mr-1" /> Bearbeiten
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
