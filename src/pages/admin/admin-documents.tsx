import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import AdminLayout from "./admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Folder,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileIcon,
  Upload,
  Search,
  FolderPlus,
  MoreVertical,
  Download,
  Trash2,
  Star,
  StarOff,
  Pencil,
  ArrowLeft,
  Home,
  ChevronRight,
  Grid3X3,
  List,
  HardDrive,
  Files,
  FolderOpen,
  FileVideo,
  FileAudio,
  Archive,
  File,
  X,
  Move,
  Eye,
} from "lucide-react";
import type { DmFolder, DmFile } from "@shared/schema";

type FileWithoutData = Omit<DmFile, "data">;

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <FileImage className="w-8 h-8 text-green-500" />;
  if (mimeType.startsWith("video/")) return <FileVideo className="w-8 h-8 text-purple-500" />;
  if (mimeType.startsWith("audio/")) return <FileAudio className="w-8 h-8 text-pink-500" />;
  if (mimeType.includes("pdf")) return <FileText className="w-8 h-8 text-red-500" />;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv"))
    return <FileSpreadsheet className="w-8 h-8 text-emerald-600" />;
  if (mimeType.includes("word") || mimeType.includes("document"))
    return <FileText className="w-8 h-8 text-blue-600" />;
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return <FileIcon className="w-8 h-8 text-orange-500" />;
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar") || mimeType.includes("gz"))
    return <Archive className="w-8 h-8 text-yellow-600" />;
  return <File className="w-8 h-8 text-gray-500" />;
}

function getFileExtension(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toUpperCase() : "";
}

export default function AdminDocuments() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ type: "folder" | "file"; id: number; name: string } | null>(null);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [moveTarget, setMoveTarget] = useState<{ type: "folder" | "file"; id: number } | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileWithoutData | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const foldersQuery = useQuery<DmFolder[]>({
    queryKey: ["/api/admin/documents/folders", currentFolderId],
    queryFn: async () => {
      const params = currentFolderId ? `?parentId=${currentFolderId}` : "";
      const res = await fetch(`/api/admin/documents/folders${params}`);
      return res.json();
    },
  });

  const filesQuery = useQuery<FileWithoutData[]>({
    queryKey: ["/api/admin/documents/files", currentFolderId],
    queryFn: async () => {
      const params = currentFolderId ? `?folderId=${currentFolderId}` : "";
      const res = await fetch(`/api/admin/documents/files${params}`);
      return res.json();
    },
    enabled: !isSearching,
  });

  const searchResultsQuery = useQuery<FileWithoutData[]>({
    queryKey: ["/api/admin/documents/files/search", searchQuery],
    queryFn: async () => {
      const res = await fetch(`/api/admin/documents/files/search?q=${encodeURIComponent(searchQuery)}`);
      return res.json();
    },
    enabled: isSearching && searchQuery.length > 0,
  });

  const breadcrumbQuery = useQuery<{ id: number; name: string }[]>({
    queryKey: ["/api/admin/documents/breadcrumb", currentFolderId],
    queryFn: async () => {
      if (!currentFolderId) return [];
      const res = await fetch(`/api/admin/documents/breadcrumb/${currentFolderId}`);
      return res.json();
    },
  });

  const statsQuery = useQuery({
    queryKey: ["/api/admin/documents/stats"],
  });

  const createFolderMutation = useMutation({
    mutationFn: async (data: { name: string; parentId: number | null }) => {
      return apiRequest("POST", "/api/admin/documents/folders", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents/folders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents/stats"] });
      setShowNewFolderDialog(false);
      setNewFolderName("");
      toast({ title: "Ordner erstellt" });
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (data: { name: string; folderId: number | null; mimeType: string; size: number; data: string }) => {
      return apiRequest("POST", "/api/admin/documents/files", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents/stats"] });
      toast({ title: "Datei hochgeladen" });
    },
    onError: (err: any) => {
      toast({ title: "Upload fehlgeschlagen", description: err.message, variant: "destructive" });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/documents/files/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents/stats"] });
      toast({ title: "Datei gelöscht" });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/documents/folders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents/folders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents/stats"] });
      toast({ title: "Ordner gelöscht" });
    },
  });

  const toggleStarMutation = useMutation({
    mutationFn: async ({ id, starred }: { id: number; starred: boolean }) => {
      return apiRequest("PATCH", `/api/admin/documents/files/${id}`, { starred });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents/stats"] });
    },
  });

  const renameMutation = useMutation({
    mutationFn: async ({ type, id, name }: { type: "folder" | "file"; id: number; name: string }) => {
      const endpoint = type === "folder" ? `/api/admin/documents/folders/${id}` : `/api/admin/documents/files/${id}`;
      return apiRequest("PATCH", endpoint, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents/folders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents/files"] });
      setShowRenameDialog(false);
      setRenameTarget(null);
      toast({ title: "Umbenannt" });
    },
  });

  const moveFileMutation = useMutation({
    mutationFn: async ({ type, id, targetFolderId }: { type: "folder" | "file"; id: number; targetFolderId: number | null }) => {
      const endpoint = type === "folder" ? `/api/admin/documents/folders/${id}` : `/api/admin/documents/files/${id}`;
      const body = type === "folder" ? { parentId: targetFolderId } : { folderId: targetFolderId };
      return apiRequest("PATCH", endpoint, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents/folders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents/files"] });
      setShowMoveDialog(false);
      setMoveTarget(null);
      toast({ title: "Verschoben" });
    },
  });

  const handleFileUpload = useCallback(async (fileList: FileList) => {
    const maxSize = 50 * 1024 * 1024;
    for (const file of Array.from(fileList)) {
      if (file.size > maxSize) {
        toast({ title: "Datei zu groß", description: `${file.name} ist größer als 50 MB`, variant: "destructive" });
        continue;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        uploadFileMutation.mutate({
          name: file.name,
          folderId: currentFolderId,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          data: base64,
        });
      };
      reader.readAsDataURL(file);
    }
  }, [currentFolderId, uploadFileMutation, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleDownload = async (fileId: number, fileName: string) => {
    const link = document.createElement("a");
    link.href = `/api/admin/documents/files/${fileId}/download`;
    link.download = fileName;
    link.click();
  };

  const navigateToFolder = (folderId: number | null) => {
    setCurrentFolderId(folderId);
    setIsSearching(false);
    setSearchQuery("");
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.length > 0) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  };

  const folders = foldersQuery.data || [];
  const files = isSearching ? (searchResultsQuery.data || []) : (filesQuery.data || []);
  const breadcrumb = breadcrumbQuery.data || [];
  const stats = statsQuery.data as any;

  const allRootFolders = useQuery<DmFolder[]>({
    queryKey: ["/api/admin/documents/folders", "all-root"],
    queryFn: async () => {
      const res = await fetch("/api/admin/documents/folders");
      return res.json();
    },
    enabled: showMoveDialog,
  });

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <HardDrive className="w-7 h-7" style={{ color: "#36C9C2" }} />
                Dokumentenmanagement
              </h1>
              <p className="text-sm text-gray-500 mt-1">Dateien und Ordner verwalten</p>
            </div>
            <div className="flex items-center gap-3">
              {stats && (
                <div className="hidden md:flex items-center gap-4 text-sm text-gray-500 mr-4">
                  <span className="flex items-center gap-1">
                    <Files className="w-4 h-4" /> {stats.totalFiles} Dateien
                  </span>
                  <span className="flex items-center gap-1">
                    <FolderOpen className="w-4 h-4" /> {stats.totalFolders} Ordner
                  </span>
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-4 h-4" /> {formatFileSize(stats.totalSize)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white border-b px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Dateien suchen..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 pr-8"
                />
                {searchQuery && (
                  <button onClick={() => handleSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-400"}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-gray-100 text-gray-900" : "text-gray-400"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewFolderDialog(true)}
              >
                <FolderPlus className="w-4 h-4 mr-1" />
                Neuer Ordner
              </Button>
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                style={{ backgroundColor: "#36C9C2" }}
                className="hover:opacity-90 text-white"
              >
                <Upload className="w-4 h-4 mr-1" />
                Hochladen
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white border-b px-6 py-2">
          <div className="flex items-center gap-1 text-sm">
            <button
              onClick={() => navigateToFolder(null)}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Stammverzeichnis</span>
            </button>
            {breadcrumb.map((item) => (
              <div key={item.id} className="flex items-center gap-1">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <button
                  onClick={() => navigateToFolder(item.id)}
                  className={`hover:text-gray-900 transition-colors ${
                    item.id === currentFolderId ? "text-gray-900 font-medium" : "text-gray-500"
                  }`}
                >
                  {item.name}
                </button>
              </div>
            ))}
            {isSearching && (
              <div className="flex items-center gap-1">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-medium">Suchergebnisse: "{searchQuery}"</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Area with Drag & Drop */}
        <div
          className={`p-6 min-h-[60vh] transition-colors ${isDragging ? "bg-blue-50 border-2 border-dashed border-blue-300" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="flex items-center justify-center h-48 text-blue-500">
              <div className="text-center">
                <Upload className="w-12 h-12 mx-auto mb-2" />
                <p className="text-lg font-medium">Dateien hier ablegen</p>
              </div>
            </div>
          )}

          {!isDragging && (
            <>
              {/* Back button when in subfolder */}
              {currentFolderId && !isSearching && (
                <button
                  onClick={() => {
                    const parentFolder = breadcrumb.length > 1 ? breadcrumb[breadcrumb.length - 2] : null;
                    navigateToFolder(parentFolder?.id || null);
                  }}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Zurück
                </button>
              )}

              {/* Folders Section */}
              {!isSearching && folders.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Ordner</h3>
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {folders.map((folder) => (
                        <Card
                          key={folder.id}
                          className="cursor-pointer hover:shadow-md transition-shadow group relative"
                          onDoubleClick={() => navigateToFolder(folder.id)}
                          onClick={() => navigateToFolder(folder.id)}
                        >
                          <CardContent className="p-4 flex flex-col items-center text-center">
                            <Folder className="w-12 h-12 mb-2" style={{ color: folder.color || "#6366f1" }} />
                            <span className="text-sm font-medium truncate w-full">{folder.name}</span>
                            <span className="text-xs text-gray-400 mt-1">
                              {folder.createdAt ? new Date(folder.createdAt).toLocaleDateString("de-DE") : ""}
                            </span>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenameTarget({ type: "folder", id: folder.id, name: folder.name }); setShowRenameDialog(true); }}>
                                    <Pencil className="w-4 h-4 mr-2" /> Umbenennen
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setMoveTarget({ type: "folder", id: folder.id }); setShowMoveDialog(true); }}>
                                    <Move className="w-4 h-4 mr-2" /> Verschieben
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); deleteFolderMutation.mutate(folder.id); }}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Löschen
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {folders.map((folder) => (
                        <div
                          key={folder.id}
                          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 cursor-pointer group"
                          onClick={() => navigateToFolder(folder.id)}
                        >
                          <Folder className="w-5 h-5 flex-shrink-0" style={{ color: folder.color || "#6366f1" }} />
                          <span className="flex-1 text-sm font-medium">{folder.name}</span>
                          <span className="text-xs text-gray-400">
                            {folder.createdAt ? new Date(folder.createdAt).toLocaleDateString("de-DE") : ""}
                          </span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenameTarget({ type: "folder", id: folder.id, name: folder.name }); setShowRenameDialog(true); }}>
                                  <Pencil className="w-4 h-4 mr-2" /> Umbenennen
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setMoveTarget({ type: "folder", id: folder.id }); setShowMoveDialog(true); }}>
                                  <Move className="w-4 h-4 mr-2" /> Verschieben
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); deleteFolderMutation.mutate(folder.id); }}>
                                  <Trash2 className="w-4 h-4 mr-2" /> Löschen
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Files Section */}
              {files.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    {isSearching ? `${files.length} Ergebnis${files.length !== 1 ? "se" : ""}` : "Dateien"}
                  </h3>
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {files.map((file) => (
                        <Card key={file.id} className="cursor-pointer hover:shadow-md transition-shadow group relative">
                          <CardContent className="p-4 flex flex-col items-center text-center">
                            {file.mimeType.startsWith("image/") ? (
                              <div className="w-12 h-12 mb-2 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                                <FileImage className="w-8 h-8 text-green-500" />
                              </div>
                            ) : (
                              <div className="mb-2">{getFileIcon(file.mimeType)}</div>
                            )}
                            <span className="text-sm font-medium truncate w-full" title={file.name}>{file.name}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[10px] px-1 py-0">{getFileExtension(file.name)}</Badge>
                              <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
                            </div>
                            {file.starred && (
                              <Star className="absolute top-2 left-2 w-4 h-4 text-yellow-400 fill-yellow-400" />
                            )}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => { setPreviewFile(file); setShowPreviewDialog(true); }}>
                                    <Eye className="w-4 h-4 mr-2" /> Vorschau
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownload(file.id, file.name)}>
                                    <Download className="w-4 h-4 mr-2" /> Herunterladen
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => toggleStarMutation.mutate({ id: file.id, starred: !file.starred })}>
                                    {file.starred ? <StarOff className="w-4 h-4 mr-2" /> : <Star className="w-4 h-4 mr-2" />}
                                    {file.starred ? "Stern entfernen" : "Markieren"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setRenameTarget({ type: "file", id: file.id, name: file.name }); setShowRenameDialog(true); }}>
                                    <Pencil className="w-4 h-4 mr-2" /> Umbenennen
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setMoveTarget({ type: "file", id: file.id }); setShowMoveDialog(true); }}>
                                    <Move className="w-4 h-4 mr-2" /> Verschieben
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600" onClick={() => deleteFileMutation.mutate(file.id)}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Löschen
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border">
                      <div className="grid grid-cols-[1fr_100px_120px_80px_40px] px-4 py-2 border-b text-xs font-semibold text-gray-400 uppercase">
                        <span>Name</span>
                        <span>Größe</span>
                        <span>Geändert</span>
                        <span>Typ</span>
                        <span></span>
                      </div>
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="grid grid-cols-[1fr_100px_120px_80px_40px] px-4 py-2 border-b last:border-0 hover:bg-gray-50 items-center group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex-shrink-0">{getFileIcon(file.mimeType)}</div>
                            <div className="min-w-0">
                              <span className="text-sm font-medium truncate block">{file.name}</span>
                              {file.tags && file.tags.length > 0 && (
                                <div className="flex gap-1 mt-0.5">
                                  {file.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0">{tag}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            {file.starred && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                          </div>
                          <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                          <span className="text-xs text-gray-500">
                            {file.updatedAt ? new Date(file.updatedAt).toLocaleDateString("de-DE") : ""}
                          </span>
                          <Badge variant="outline" className="text-[10px] px-1 py-0 w-fit">{getFileExtension(file.name)}</Badge>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setPreviewFile(file); setShowPreviewDialog(true); }}>
                                  <Eye className="w-4 h-4 mr-2" /> Vorschau
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownload(file.id, file.name)}>
                                  <Download className="w-4 h-4 mr-2" /> Herunterladen
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => toggleStarMutation.mutate({ id: file.id, starred: !file.starred })}>
                                  {file.starred ? <StarOff className="w-4 h-4 mr-2" /> : <Star className="w-4 h-4 mr-2" />}
                                  {file.starred ? "Stern entfernen" : "Markieren"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setRenameTarget({ type: "file", id: file.id, name: file.name }); setShowRenameDialog(true); }}>
                                  <Pencil className="w-4 h-4 mr-2" /> Umbenennen
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setMoveTarget({ type: "file", id: file.id }); setShowMoveDialog(true); }}>
                                  <Move className="w-4 h-4 mr-2" /> Verschieben
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => deleteFileMutation.mutate(file.id)}>
                                  <Trash2 className="w-4 h-4 mr-2" /> Löschen
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Empty state */}
              {!isSearching && folders.length === 0 && files.length === 0 && !foldersQuery.isLoading && !filesQuery.isLoading && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <FolderOpen className="w-16 h-16 mb-4" style={{ color: "#36C9C2" }} />
                  <h3 className="text-lg font-medium text-gray-600 mb-1">Dieser Ordner ist leer</h3>
                  <p className="text-sm mb-4">Erstelle einen Ordner oder lade Dateien hoch</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowNewFolderDialog(true)}>
                      <FolderPlus className="w-4 h-4 mr-1" />
                      Neuer Ordner
                    </Button>
                    <Button size="sm" onClick={() => fileInputRef.current?.click()} style={{ backgroundColor: "#36C9C2" }} className="text-white hover:opacity-90">
                      <Upload className="w-4 h-4 mr-1" />
                      Hochladen
                    </Button>
                  </div>
                </div>
              )}

              {isSearching && files.length === 0 && searchQuery && !searchResultsQuery.isLoading && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Search className="w-16 h-16 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-1">Keine Ergebnisse</h3>
                  <p className="text-sm">Keine Dateien für "{searchQuery}" gefunden</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* New Folder Dialog */}
        <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuer Ordner</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Ordnername"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && newFolderName && createFolderMutation.mutate({ name: newFolderName, parentId: currentFolderId })}
              autoFocus
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>Abbrechen</Button>
              <Button
                onClick={() => createFolderMutation.mutate({ name: newFolderName, parentId: currentFolderId })}
                disabled={!newFolderName}
                style={{ backgroundColor: "#36C9C2" }}
                className="text-white hover:opacity-90"
              >
                Erstellen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rename Dialog */}
        <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Umbenennen</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Neuer Name"
              value={renameTarget?.name || ""}
              onChange={(e) => renameTarget && setRenameTarget({ ...renameTarget, name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && renameTarget && renameMutation.mutate(renameTarget)}
              autoFocus
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRenameDialog(false)}>Abbrechen</Button>
              <Button
                onClick={() => renameTarget && renameMutation.mutate(renameTarget)}
                disabled={!renameTarget?.name}
                style={{ backgroundColor: "#36C9C2" }}
                className="text-white hover:opacity-90"
              >
                Speichern
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Move Dialog */}
        <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verschieben nach</DialogTitle>
            </DialogHeader>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              <button
                className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-gray-100 text-sm"
                onClick={() => moveTarget && moveFileMutation.mutate({ ...moveTarget, targetFolderId: null })}
              >
                <Home className="w-4 h-4 text-gray-400" />
                Stammverzeichnis
              </button>
              {(allRootFolders.data || []).filter(f => f.id !== moveTarget?.id).map((folder) => (
                <button
                  key={folder.id}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-gray-100 text-sm"
                  onClick={() => moveTarget && moveFileMutation.mutate({ ...moveTarget, targetFolderId: folder.id })}
                >
                  <Folder className="w-4 h-4" style={{ color: folder.color || "#6366f1" }} />
                  {folder.name}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {previewFile && getFileIcon(previewFile.mimeType)}
                {previewFile?.name}
              </DialogTitle>
            </DialogHeader>
            {previewFile && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Typ:</span>
                    <span className="ml-2">{previewFile.mimeType}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Größe:</span>
                    <span className="ml-2">{formatFileSize(previewFile.size)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Hochgeladen von:</span>
                    <span className="ml-2">{previewFile.uploadedBy}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Datum:</span>
                    <span className="ml-2">{previewFile.createdAt ? new Date(previewFile.createdAt).toLocaleDateString("de-DE") : ""}</span>
                  </div>
                </div>
                {previewFile.description && (
                  <div>
                    <span className="text-sm text-gray-500">Beschreibung:</span>
                    <p className="text-sm mt-1">{previewFile.description}</p>
                  </div>
                )}
                {previewFile.tags && previewFile.tags.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500">Tags:</span>
                    <div className="flex gap-1 mt-1">
                      {previewFile.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Separator />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleDownload(previewFile.id, previewFile.name)} style={{ backgroundColor: "#36C9C2" }} className="text-white hover:opacity-90">
                    <Download className="w-4 h-4 mr-1" />
                    Herunterladen
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleStarMutation.mutate({ id: previewFile.id, starred: !previewFile.starred })}>
                    {previewFile.starred ? <StarOff className="w-4 h-4 mr-1" /> : <Star className="w-4 h-4 mr-1" />}
                    {previewFile.starred ? "Stern entfernen" : "Markieren"}
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
