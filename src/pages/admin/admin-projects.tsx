import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "./admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  MoreVertical,
  Calendar,
  User,
  Flag,
  GripVertical,
  Kanban,
  ListTodo,
  Pencil,
  Trash2,
  MessageSquare,
  Send,
  ChevronDown,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Tag,
  X
} from "lucide-react";
import type { ProjectBoard, ProjectColumn, ProjectTask, ProjectTaskComment } from "@shared/schema";

type TeamUser = {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  profileImage: string | null;
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; icon: typeof Flag }> = {
  low: { label: "Niedrig", color: "bg-green-100 text-green-700 border-green-200", icon: Flag },
  medium: { label: "Mittel", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Flag },
  high: { label: "Hoch", color: "bg-orange-100 text-orange-700 border-orange-200", icon: Flag },
  urgent: { label: "Dringend", color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle },
};

const LABEL_COLORS = [
  { name: "Bug", color: "#ef4444" },
  { name: "Feature", color: "#3b82f6" },
  { name: "Verbesserung", color: "#8b5cf6" },
  { name: "Design", color: "#ec4899" },
  { name: "Marketing", color: "#f59e0b" },
  { name: "Partner", color: "#10b981" },
  { name: "Backend", color: "#6366f1" },
  { name: "Frontend", color: "#14b8a6" },
];

export default function AdminProjects() {
  const { toast } = useToast();
  const [selectedBoard, setSelectedBoard] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState<ProjectTask | null>(null);
  const [createBoardName, setCreateBoardName] = useState("");
  const [createBoardDesc, setCreateBoardDesc] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    assigneeId: "",
    dueDate: "",
    labels: [] as string[],
    columnId: 0,
  });

  const { data: boards = [], isLoading: boardsLoading } = useQuery<ProjectBoard[]>({
    queryKey: ["/api/project/boards"],
  });

  const { data: columns = [] } = useQuery<ProjectColumn[]>({
    queryKey: ["/api/project/boards", selectedBoard, "columns"],
    queryFn: () => fetch(`/api/project/boards/${selectedBoard}/columns`, { credentials: "include" }).then(r => r.json()),
    enabled: !!selectedBoard,
  });

  const { data: tasks = [] } = useQuery<ProjectTask[]>({
    queryKey: ["/api/project/boards", selectedBoard, "tasks"],
    queryFn: () => fetch(`/api/project/boards/${selectedBoard}/tasks`, { credentials: "include" }).then(r => r.json()),
    enabled: !!selectedBoard,
  });

  const { data: teamUsers = [] } = useQuery<TeamUser[]>({
    queryKey: ["/api/project/users"],
  });

  const createBoardMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      apiRequest("POST", "/api/project/boards", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project/boards"] });
      setShowCreateBoard(false);
      setCreateBoardName("");
      setCreateBoardDesc("");
      toast({ title: "Board erstellt" });
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/project/boards/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project/boards"] });
      setSelectedBoard(null);
      toast({ title: "Board gelöscht" });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/project/tasks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project/boards", selectedBoard, "tasks"] });
      setShowCreateTask(false);
      setNewTask({ title: "", description: "", priority: "medium", assigneeId: "", dueDate: "", labels: [], columnId: 0 });
      toast({ title: "Aufgabe erstellt" });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PATCH", `/api/project/tasks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project/boards", selectedBoard, "tasks"] });
      toast({ title: "Aufgabe aktualisiert" });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/project/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project/boards", selectedBoard, "tasks"] });
      setShowTaskDetail(null);
      toast({ title: "Aufgabe gelöscht" });
    },
  });

  const filteredTasks = tasks.filter(task => {
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !(task.description || "").toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterPriority !== "all" && task.priority !== filterPriority) return false;
    if (filterAssignee !== "all" && String(task.assigneeId) !== filterAssignee) return false;
    return true;
  });

  const getUserName = (userId: number | null) => {
    if (!userId) return "Nicht zugewiesen";
    const user = teamUsers.find(u => u.id === userId);
    return user?.fullName || user?.username || "Unbekannt";
  };

  const getUserInitials = (userId: number | null) => {
    const name = getUserName(userId);
    if (name === "Nicht zugewiesen") return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  useEffect(() => {
    if (!selectedBoard && boards.length > 0 && !boardsLoading) {
      setSelectedBoard(boards[0].id);
    }
  }, [boards, boardsLoading, selectedBoard]);

  return (
    <AdminLayout>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
          <div className="flex items-center gap-4">
            <FolderKanban className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Projektmanagement</h1>
              <p className="text-sm text-muted-foreground">Kanban Board & Aufgabenverwaltung</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedBoard && (
              <>
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "kanban" | "list")}>
                  <TabsList className="h-9">
                    <TabsTrigger value="kanban" className="gap-1.5 text-xs">
                      <Kanban className="h-3.5 w-3.5" />
                      Kanban
                    </TabsTrigger>
                    <TabsTrigger value="list" className="gap-1.5 text-xs">
                      <ListTodo className="h-3.5 w-3.5" />
                      Liste
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="default" size="sm" onClick={() => {
                  if (columns.length > 0) {
                    setNewTask(prev => ({ ...prev, columnId: columns[0].id }));
                  }
                  setShowCreateTask(true);
                }}>
                  <Plus className="h-4 w-4 mr-1" />
                  Aufgabe
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Board selector + filter bar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Select value={selectedBoard?.toString() || ""} onValueChange={(v) => setSelectedBoard(parseInt(v))}>
              <SelectTrigger className="w-[200px] h-8 text-sm">
                <SelectValue placeholder="Board wählen..." />
              </SelectTrigger>
              <SelectContent>
                {boards.map(board => (
                  <SelectItem key={board.id} value={board.id.toString()}>
                    {board.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={showCreateBoard} onOpenChange={setShowCreateBoard}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neues Board erstellen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Board Name" value={createBoardName} onChange={e => setCreateBoardName(e.target.value)} />
                  <Textarea placeholder="Beschreibung (optional)" value={createBoardDesc} onChange={e => setCreateBoardDesc(e.target.value)} />
                </div>
                <DialogFooter>
                  <Button onClick={() => createBoardMutation.mutate({ name: createBoardName, description: createBoardDesc })} disabled={!createBoardName.trim()}>
                    Erstellen
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {selectedBoard && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="text-red-600" onClick={() => deleteBoardMutation.mutate(selectedBoard)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Board löschen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2 flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Aufgaben suchen..." className="pl-8 h-8 w-[200px] text-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[140px] h-8 text-sm">
                <Filter className="h-3 w-3 mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Prioritäten</SelectItem>
                <SelectItem value="urgent">Dringend</SelectItem>
                <SelectItem value="high">Hoch</SelectItem>
                <SelectItem value="medium">Mittel</SelectItem>
                <SelectItem value="low">Niedrig</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
              <SelectTrigger className="w-[160px] h-8 text-sm">
                <User className="h-3 w-3 mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Mitarbeiter</SelectItem>
                {teamUsers.map(user => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.fullName || user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-muted-foreground">
            {filteredTasks.length} Aufgaben
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          {!selectedBoard ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <FolderKanban className="h-16 w-16 mx-auto text-muted-foreground/40" />
                <div>
                  <h2 className="text-lg font-semibold">Kein Board vorhanden</h2>
                  <p className="text-sm text-muted-foreground mt-1">Erstelle dein erstes Projektboard, um loszulegen.</p>
                </div>
                <Button onClick={() => setShowCreateBoard(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erstes Board erstellen
                </Button>
              </div>
            </div>
          ) : viewMode === "kanban" ? (
            <KanbanView
              columns={columns}
              tasks={filteredTasks}
              teamUsers={teamUsers}
              onMoveTask={(taskId, columnId) => updateTaskMutation.mutate({ id: taskId, data: { columnId } })}
              onOpenTask={setShowTaskDetail}
              getUserName={getUserName}
              getUserInitials={getUserInitials}
            />
          ) : (
            <ListView
              columns={columns}
              tasks={filteredTasks}
              teamUsers={teamUsers}
              onMoveTask={(taskId, columnId) => updateTaskMutation.mutate({ id: taskId, data: { columnId } })}
              onOpenTask={setShowTaskDetail}
              getUserName={getUserName}
              getUserInitials={getUserInitials}
            />
          )}
        </div>

        {/* Create Task Dialog */}
        <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Neue Aufgabe erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Titel der Aufgabe" value={newTask.title} onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))} />
              <Textarea placeholder="Beschreibung..." rows={3} value={newTask.description} onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Priorität</label>
                  <Select value={newTask.priority} onValueChange={v => setNewTask(prev => ({ ...prev, priority: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Niedrig</SelectItem>
                      <SelectItem value="medium">Mittel</SelectItem>
                      <SelectItem value="high">Hoch</SelectItem>
                      <SelectItem value="urgent">Dringend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Zuweisen an</label>
                  <Select value={newTask.assigneeId} onValueChange={v => setNewTask(prev => ({ ...prev, assigneeId: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mitarbeiter wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamUsers.map(u => (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          {u.fullName || u.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Fälligkeitsdatum</label>
                  <Input type="date" value={newTask.dueDate} onChange={e => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Spalte</label>
                  <Select value={newTask.columnId.toString()} onValueChange={v => setNewTask(prev => ({ ...prev, columnId: parseInt(v) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map(col => (
                        <SelectItem key={col.id} value={col.id.toString()}>
                          {col.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Labels</label>
                <div className="flex flex-wrap gap-1.5">
                  {LABEL_COLORS.map(label => (
                    <button
                      key={label.name}
                      type="button"
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                        newTask.labels.includes(label.name) ? "ring-2 ring-offset-1 ring-primary" : "opacity-70 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: label.color + "20", color: label.color, borderColor: label.color + "40" }}
                      onClick={() => {
                        setNewTask(prev => ({
                          ...prev,
                          labels: prev.labels.includes(label.name)
                            ? prev.labels.filter(l => l !== label.name)
                            : [...prev.labels, label.name],
                        }));
                      }}
                    >
                      {label.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateTask(false)}>Abbrechen</Button>
              <Button
                disabled={!newTask.title.trim() || !newTask.columnId}
                onClick={() => {
                  createTaskMutation.mutate({
                    boardId: selectedBoard,
                    columnId: newTask.columnId,
                    title: newTask.title,
                    description: newTask.description || null,
                    priority: newTask.priority,
                    assigneeId: newTask.assigneeId ? parseInt(newTask.assigneeId) : null,
                    dueDate: newTask.dueDate || null,
                    labels: newTask.labels.length > 0 ? newTask.labels : null,
                    position: filteredTasks.filter(t => t.columnId === newTask.columnId).length,
                  });
                }}
              >
                Erstellen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Task Detail Dialog */}
        {showTaskDetail && (
          <TaskDetailDialog
            task={showTaskDetail}
            columns={columns}
            teamUsers={teamUsers}
            getUserName={getUserName}
            getUserInitials={getUserInitials}
            onClose={() => setShowTaskDetail(null)}
            onUpdate={(id, data) => {
              updateTaskMutation.mutate({ id, data });
              setShowTaskDetail(prev => prev ? { ...prev, ...data } : null);
            }}
            onDelete={(id) => deleteTaskMutation.mutate(id)}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function KanbanView({
  columns,
  tasks,
  teamUsers,
  onMoveTask,
  onOpenTask,
  getUserName,
  getUserInitials,
}: {
  columns: ProjectColumn[];
  tasks: ProjectTask[];
  teamUsers: TeamUser[];
  onMoveTask: (taskId: number, columnId: number) => void;
  onOpenTask: (task: ProjectTask) => void;
  getUserName: (id: number | null) => string;
  getUserInitials: (id: number | null) => string;
}) {
  const [draggedTask, setDraggedTask] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);

  return (
    <div className="flex gap-4 p-6 h-full overflow-x-auto">
      {columns.map(column => {
        const columnTasks = tasks.filter(t => t.columnId === column.id);
        return (
          <div
            key={column.id}
            className={`flex flex-col min-w-[300px] max-w-[340px] w-full rounded-xl transition-all ${
              dragOverColumn === column.id ? "ring-2 ring-primary bg-primary/5" : "bg-muted/40"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOverColumn(column.id); }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={() => {
              if (draggedTask) onMoveTask(draggedTask, column.id);
              setDraggedTask(null);
              setDragOverColumn(null);
            }}
          >
            {/* Column header */}
            <div className="flex items-center gap-2 px-4 py-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color || "#6366f1" }} />
              <span className="font-semibold text-sm">{column.name}</span>
              <Badge variant="secondary" className="ml-auto text-xs h-5 px-1.5">
                {columnTasks.length}
              </Badge>
            </div>

            {/* Task cards */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
              {columnTasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDraggedTask(task.id)}
                  onDragEnd={() => { setDraggedTask(null); setDragOverColumn(null); }}
                  onClick={() => onOpenTask(task)}
                  className={`bg-background rounded-lg border p-3 cursor-pointer hover:shadow-md transition-all group ${
                    draggedTask === task.id ? "opacity-50 rotate-2 scale-95" : ""
                  }`}
                >
                  {/* Labels */}
                  {task.labels && task.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {task.labels.map(label => {
                        const labelConfig = LABEL_COLORS.find(l => l.name === label);
                        return (
                          <span
                            key={label}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{
                              backgroundColor: (labelConfig?.color || "#6366f1") + "20",
                              color: labelConfig?.color || "#6366f1",
                            }}
                          >
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <p className="text-sm font-medium leading-snug">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${PRIORITY_CONFIG[task.priority]?.color || ""}`}>
                      {PRIORITY_CONFIG[task.priority]?.label || task.priority}
                    </Badge>
                    {task.dueDate && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(task.dueDate).toLocaleDateString("de-DE", { day: "2-digit", month: "short" })}
                      </span>
                    )}
                    <div className="ml-auto">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {getUserInitials(task.assigneeId)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({
  columns,
  tasks,
  teamUsers,
  onMoveTask,
  onOpenTask,
  getUserName,
  getUserInitials,
}: {
  columns: ProjectColumn[];
  tasks: ProjectTask[];
  teamUsers: TeamUser[];
  onMoveTask: (taskId: number, columnId: number) => void;
  onOpenTask: (task: ProjectTask) => void;
  getUserName: (id: number | null) => string;
  getUserInitials: (id: number | null) => string;
}) {
  const getColumnName = (colId: number) => columns.find(c => c.id === colId)?.name || "";
  const getColumnColor = (colId: number) => columns.find(c => c.id === colId)?.color || "#6366f1";

  return (
    <div className="p-6 overflow-auto h-full">
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 text-xs text-muted-foreground">
              <th className="text-left font-medium px-4 py-3 w-[40%]">Aufgabe</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-left font-medium px-4 py-3">Priorität</th>
              <th className="text-left font-medium px-4 py-3">Zugewiesen</th>
              <th className="text-left font-medium px-4 py-3">Fällig</th>
              <th className="text-left font-medium px-4 py-3">Labels</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr
                key={task.id}
                className="border-t hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => onOpenTask(task)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`h-4 w-4 flex-shrink-0 ${
                        getColumnName(task.columnId) === "Erledigt" ? "text-green-500" : "text-muted-foreground/40"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{task.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={task.columnId.toString()}
                    onValueChange={(v) => { onMoveTask(task.id, parseInt(v)); }}
                  >
                    <SelectTrigger className="h-7 w-[140px] text-xs" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColumnColor(task.columnId) }} />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map(col => (
                        <SelectItem key={col.id} value={col.id.toString()}>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color || "#6366f1" }} />
                            {col.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={`text-xs ${PRIORITY_CONFIG[task.priority]?.color || ""}`}>
                    {PRIORITY_CONFIG[task.priority]?.label || task.priority}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {getUserInitials(task.assigneeId)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{getUserName(task.assigneeId)}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {task.dueDate ? (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(task.dueDate).toLocaleDateString("de-DE")}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {task.labels?.map(label => {
                      const cfg = LABEL_COLORS.find(l => l.name === label);
                      return (
                        <span
                          key={label}
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{ backgroundColor: (cfg?.color || "#6366f1") + "20", color: cfg?.color || "#6366f1" }}
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                  Keine Aufgaben vorhanden. Erstelle eine neue Aufgabe, um loszulegen.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TaskDetailDialog({
  task,
  columns,
  teamUsers,
  getUserName,
  getUserInitials,
  onClose,
  onUpdate,
  onDelete,
}: {
  task: ProjectTask;
  columns: ProjectColumn[];
  teamUsers: TeamUser[];
  getUserName: (id: number | null) => string;
  getUserInitials: (id: number | null) => string;
  onClose: () => void;
  onUpdate: (id: number, data: any) => void;
  onDelete: (id: number) => void;
}) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || "");
  const [commentText, setCommentText] = useState("");

  const { data: comments = [], isLoading: commentsLoading } = useQuery<ProjectTaskComment[]>({
    queryKey: ["/api/project/tasks", task.id, "comments"],
    queryFn: () => fetch(`/api/project/tasks/${task.id}/comments`, { credentials: "include" }).then(r => r.json()),
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) =>
      apiRequest("POST", `/api/project/tasks/${task.id}/comments`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project/tasks", task.id, "comments"] });
      setCommentText("");
    },
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="text-lg font-semibold" />
                  <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} placeholder="Beschreibung..." />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => {
                      onUpdate(task.id, { title: editTitle, description: editDesc || null });
                      setIsEditing(false);
                    }}>Speichern</Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Abbrechen</Button>
                  </div>
                </div>
              ) : (
                <>
                  <DialogTitle className="text-lg">{task.title}</DialogTitle>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-1 ml-4">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => onDelete(task.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mt-4">
          {/* Status */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Status</label>
            <Select value={task.columnId.toString()} onValueChange={v => onUpdate(task.id, { columnId: parseInt(v) })}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {columns.map(col => (
                  <SelectItem key={col.id} value={col.id.toString()}>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color || "#6366f1" }} />
                      {col.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Priorität</label>
            <Select value={task.priority} onValueChange={v => onUpdate(task.id, { priority: v })}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Niedrig</SelectItem>
                <SelectItem value="medium">Mittel</SelectItem>
                <SelectItem value="high">Hoch</SelectItem>
                <SelectItem value="urgent">Dringend</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignee */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Zugewiesen an</label>
            <Select
              value={task.assigneeId?.toString() || "unassigned"}
              onValueChange={v => onUpdate(task.id, { assigneeId: v === "unassigned" ? null : parseInt(v) })}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Nicht zugewiesen</SelectItem>
                {teamUsers.map(u => (
                  <SelectItem key={u.id} value={u.id.toString()}>
                    {u.fullName || u.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          {/* Due date */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Fälligkeitsdatum</label>
            <Input
              type="date"
              className="h-8 text-sm"
              value={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
              onChange={e => onUpdate(task.id, { dueDate: e.target.value || null })}
            />
          </div>
          {/* Created */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Erstellt am</label>
            <div className="text-sm text-muted-foreground h-8 flex items-center">
              {task.createdAt ? new Date(task.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" }) : "-"}
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="mt-2">
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Labels</label>
          <div className="flex flex-wrap gap-1.5">
            {LABEL_COLORS.map(label => (
              <button
                key={label.name}
                type="button"
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  task.labels?.includes(label.name) ? "ring-2 ring-offset-1 ring-primary" : "opacity-60 hover:opacity-100"
                }`}
                style={{ backgroundColor: label.color + "20", color: label.color, borderColor: label.color + "40" }}
                onClick={() => {
                  const currentLabels = task.labels || [];
                  const newLabels = currentLabels.includes(label.name)
                    ? currentLabels.filter(l => l !== label.name)
                    : [...currentLabels, label.name];
                  onUpdate(task.id, { labels: newLabels.length > 0 ? newLabels : null });
                }}
              >
                {label.name}
              </button>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Comments */}
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <MessageSquare className="h-4 w-4" />
            Kommentare ({comments.length})
          </h3>

          <div className="space-y-3 max-h-[200px] overflow-y-auto mb-3">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-2">
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {getUserInitials(comment.userId)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-muted/50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{getUserName(comment.userId)}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString("de-DE") : ""}
                    </span>
                  </div>
                  <p className="text-sm mt-0.5">{comment.content}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Noch keine Kommentare</p>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Kommentar schreiben..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && commentText.trim()) {
                  addCommentMutation.mutate(commentText.trim());
                }
              }}
            />
            <Button
              size="sm"
              disabled={!commentText.trim() || addCommentMutation.isPending}
              onClick={() => addCommentMutation.mutate(commentText.trim())}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}