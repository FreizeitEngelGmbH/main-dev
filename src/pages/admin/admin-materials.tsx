import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import AdminLayout from "./admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Download,
  Upload,
  Search,
  Plus,
  Trash2,
  Eye,
  BookOpen,
  CreditCard,
  Monitor,
  Gift,
  Share2,
  FileSpreadsheet,
  Loader2,
  Sparkles,
  FolderOpen,
  Tag,
  Calendar,
  Image as ImageIcon,
  Edit
} from "lucide-react";

type MaterialCategory = "flyer" | "broschueren" | "visitenkarten" | "tischaufsteller" | "welcome_box" | "social_media" | "vorlagen" | "alle";

const CATEGORIES: { id: MaterialCategory; label: string; icon: any; color: string }[] = [
  { id: "alle", label: "Alle Materialien", icon: FolderOpen, color: "bg-gray-100 text-gray-700" },
  { id: "flyer", label: "Flyer", icon: FileText, color: "bg-blue-100 text-blue-700" },
  { id: "broschueren", label: "Broschüren", icon: BookOpen, color: "bg-purple-100 text-purple-700" },
  { id: "visitenkarten", label: "Visitenkarten", icon: CreditCard, color: "bg-green-100 text-green-700" },
  { id: "tischaufsteller", label: "Tischaufsteller", icon: Monitor, color: "bg-orange-100 text-orange-700" },
  { id: "welcome_box", label: "Welcome Box", icon: Gift, color: "bg-pink-100 text-pink-700" },
  { id: "social_media", label: "Social Media", icon: Share2, color: "bg-cyan-100 text-cyan-700" },
  { id: "vorlagen", label: "Vorlagen", icon: FileSpreadsheet, color: "bg-amber-100 text-amber-700" },
];

interface MarketingMaterial {
  id: number;
  title: string;
  description: string | null;
  category: string;
  type: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileMimeType: string | null;
  isTemplate: boolean | null;
  customizable: boolean | null;
  customFields: any;
  tags: string[] | null;
  thumbnailUrl: string | null;
  uploadedBy: string | null;
  downloads: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export default function AdminMaterials() {
  const [activeCategory, setActiveCategory] = useState<MaterialCategory>("alle");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MarketingMaterial | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "flyer",
    type: "PDF",
    tags: "",
    isTemplate: false,
    customizable: false,
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: materials = [], isLoading } = useQuery<MarketingMaterial[]>({
    queryKey: ["/api/admin/materials", activeCategory !== "alle" ? activeCategory : undefined],
    queryFn: async () => {
      const url = activeCategory !== "alle"
        ? `/api/admin/materials?category=${activeCategory}`
        : "/api/admin/materials";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load materials");
      return res.json();
    },
  });

  const seedMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/materials/seed"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/materials"] });
      toast({ title: "Vorlagen erstellt", description: "Alle Standard-Vorlagen wurden erfolgreich angelegt." });
    },
    onError: () => {
      toast({ title: "Fehler", description: "Vorlagen konnten nicht erstellt werden.", variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/admin/materials", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/materials"] });
      setShowUploadDialog(false);
      setUploadForm({ title: "", description: "", category: "flyer", type: "PDF", tags: "", isTemplate: false, customizable: false });
      setUploadFile(null);
      toast({ title: "Material erstellt", description: "Das Werbematerial wurde erfolgreich hochgeladen." });
    },
    onError: () => {
      toast({ title: "Fehler", description: "Material konnte nicht erstellt werden.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/materials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/materials"] });
      setShowDetailDialog(false);
      toast({ title: "Gelöscht", description: "Material wurde entfernt." });
    },
  });

  const handleUpload = async () => {
    let fileData: string | undefined;
    let fileName: string | undefined;
    let fileSize: number | undefined;
    let fileMimeType: string | undefined;

    if (uploadFile) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.readAsDataURL(uploadFile);
      });
      fileData = base64;
      fileName = uploadFile.name;
      fileSize = uploadFile.size;
      fileMimeType = uploadFile.type;
    }

    createMutation.mutate({
      title: uploadForm.title,
      description: uploadForm.description || null,
      category: uploadForm.category,
      type: uploadForm.type,
      tags: uploadForm.tags ? uploadForm.tags.split(",").map((t: string) => t.trim()) : [],
      isTemplate: uploadForm.isTemplate,
      customizable: uploadForm.customizable,
      uploadedBy: "Admin",
      fileData,
      fileName,
      fileSize,
      fileMimeType,
    });
  };

  const handleDownload = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/materials/${id}/download`, { credentials: "include" });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition");
      const fileName = disposition?.split('filename="')[1]?.replace('"', "") || "download";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/materials"] });
    } catch {
      toast({ title: "Fehler", description: "Download fehlgeschlagen.", variant: "destructive" });
    }
  };

  const handleDownloadHtml = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/materials/${id}/html`, { credentials: "include" });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition");
      const fileName = disposition?.split('filename="')[1]?.replace('"', "") || "vorlage.html";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/materials"] });
      toast({ title: "Download gestartet", description: "Die HTML-Vorlage wird heruntergeladen." });
    } catch {
      toast({ title: "Fehler", description: "Download fehlgeschlagen.", variant: "destructive" });
    }
  };

  const handlePreview = (material: MarketingMaterial) => {
    setSelectedMaterial(material);
    setShowPreviewDialog(true);
  };

  const filteredMaterials = materials.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.description?.toLowerCase().includes(q) ||
      m.tags?.some((t) => t.toLowerCase().includes(q)) ||
      m.type?.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: materials.length,
    templates: materials.filter((m) => m.isTemplate).length,
    uploaded: materials.filter((m) => !m.isTemplate).length,
    downloads: materials.reduce((sum, m) => sum + (m.downloads || 0), 0),
  };

  const getCategoryInfo = (cat: string) => CATEGORIES.find((c) => c.id === cat) || CATEGORIES[0];

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Werbematerialien</h1>
            <p className="text-muted-foreground">Verwalte Flyer, Broschüren, Visitenkarten und mehr für dein Team und Partner.</p>
          </div>
          <div className="flex gap-2">
            {materials.length === 0 && (
              <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
                {seedMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Vorlagen laden
              </Button>
            )}
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Material hinzufügen</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Neues Werbematerial</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Titel *</Label>
                    <Input value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} placeholder="z.B. FreizeitEngel Flyer - Sommer 2026" />
                  </div>
                  <div>
                    <Label>Beschreibung</Label>
                    <Textarea value={uploadForm.description} onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })} placeholder="Kurze Beschreibung des Materials..." rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Kategorie</Label>
                      <Select value={uploadForm.category} onValueChange={(v) => setUploadForm({ ...uploadForm, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.filter((c) => c.id !== "alle").map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Dateityp</Label>
                      <Select value={uploadForm.type} onValueChange={(v) => setUploadForm({ ...uploadForm, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PDF">PDF</SelectItem>
                          <SelectItem value="DOCX">DOCX</SelectItem>
                          <SelectItem value="PPTX">PPTX</SelectItem>
                          <SelectItem value="PNG">PNG</SelectItem>
                          <SelectItem value="JPG">JPG</SelectItem>
                          <SelectItem value="SVG">SVG</SelectItem>
                          <SelectItem value="ZIP">ZIP</SelectItem>
                          <SelectItem value="HTML">HTML</SelectItem>
                          <SelectItem value="Paket">Paket</SelectItem>
                          <SelectItem value="Vorlage">Vorlage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Tags (kommagetrennt)</Label>
                    <Input value={uploadForm.tags} onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })} placeholder="flyer, partner, sommer" />
                  </div>
                  <div>
                    <Label>Datei hochladen</Label>
                    <div
                      className="mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.pptx,.png,.jpg,.jpeg,.svg,.zip,.html"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      />
                      {uploadFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="font-medium">{uploadFile.name}</span>
                          <span className="text-sm text-muted-foreground">({formatFileSize(uploadFile.size)})</span>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Klicke oder ziehe eine Datei hierher</p>
                          <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, PPTX, PNG, JPG, SVG, ZIP (max. 50 MB)</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={uploadForm.isTemplate} onChange={(e) => setUploadForm({ ...uploadForm, isTemplate: e.target.checked })} className="rounded" />
                      <span className="text-sm">Als Vorlage markieren</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={uploadForm.customizable} onChange={(e) => setUploadForm({ ...uploadForm, customizable: e.target.checked })} className="rounded" />
                      <span className="text-sm">Anpassbar</span>
                    </label>
                  </div>
                  <Button className="w-full" onClick={handleUpload} disabled={!uploadForm.title || createMutation.isPending}>
                    {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    Material erstellen
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Gesamt</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold text-blue-600">{stats.templates}</div>
              <div className="text-sm text-muted-foreground">Vorlagen</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold text-green-600">{stats.uploaded}</div>
              <div className="text-sm text-muted-foreground">Eigene Dateien</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold text-purple-600">{stats.downloads}</div>
              <div className="text-sm text-muted-foreground">Downloads</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Material suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as MaterialCategory)}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id} className="gap-1.5">
                <cat.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredMaterials.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Keine Materialien gefunden</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {materials.length === 0
                      ? "Lade die Standard-Vorlagen oder füge eigene Materialien hinzu."
                      : "Versuche einen anderen Suchbegriff oder wechsle die Kategorie."}
                  </p>
                  {materials.length === 0 && (
                    <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Standard-Vorlagen laden
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMaterials.map((material) => {
                  const catInfo = getCategoryInfo(material.category);
                  return (
                    <Card key={material.id} className="hover:shadow-md transition-shadow group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">{material.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className={`text-xs ${catInfo.color}`}>
                                {catInfo.label}
                              </Badge>
                              {material.type && (
                                <Badge variant="outline" className="text-xs">{material.type}</Badge>
                              )}
                              {material.isTemplate && (
                                <Badge className="text-xs bg-blue-500">Vorlage</Badge>
                              )}
                              {material.customizable && (
                                <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                                  <Edit className="h-2.5 w-2.5 mr-1" />Anpassbar
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {material.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{material.description}</p>
                        )}
                        {material.tags && material.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {material.tags.slice(0, 4).map((tag, i) => (
                              <span key={i} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                                <Tag className="h-2.5 w-2.5" />{tag}
                              </span>
                            ))}
                            {material.tags.length > 4 && (
                              <span className="text-xs text-muted-foreground">+{material.tags.length - 4}</span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {material.createdAt ? new Date(material.createdAt).toLocaleDateString("de-DE") : "-"}
                          </span>
                          {material.fileName && (
                            <span>{formatFileSize(material.fileSize)}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" />{material.downloads || 0}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {material.isTemplate && (
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                              onClick={() => handlePreview(material)}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />Vorschau
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => { setSelectedMaterial(material); setShowDetailDialog(true); }}
                          >
                            <FileText className="h-3.5 w-3.5 mr-1" />Details
                          </Button>
                          {material.isTemplate && (
                            <Button variant="outline" size="sm" onClick={() => handleDownloadHtml(material.id)} title="HTML herunterladen">
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {material.fileName && !material.isTemplate && (
                            <Button size="sm" className="flex-1" onClick={() => handleDownload(material.id)}>
                              <Download className="h-3.5 w-3.5 mr-1" />Download
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          {selectedMaterial && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMaterial.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className={getCategoryInfo(selectedMaterial.category).color}>
                    {getCategoryInfo(selectedMaterial.category).label}
                  </Badge>
                  {selectedMaterial.type && <Badge variant="outline">{selectedMaterial.type}</Badge>}
                  {selectedMaterial.isTemplate && <Badge className="bg-blue-500">Vorlage</Badge>}
                  {selectedMaterial.customizable && (
                    <Badge variant="outline" className="border-green-300 text-green-700">Anpassbar</Badge>
                  )}
                </div>

                {selectedMaterial.description && (
                  <p className="text-sm text-muted-foreground">{selectedMaterial.description}</p>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Erstellt:</span>
                    <span className="ml-2 font-medium">
                      {selectedMaterial.createdAt ? new Date(selectedMaterial.createdAt).toLocaleDateString("de-DE") : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Erstellt von:</span>
                    <span className="ml-2 font-medium">{selectedMaterial.uploadedBy || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Downloads:</span>
                    <span className="ml-2 font-medium">{selectedMaterial.downloads || 0}</span>
                  </div>
                  {selectedMaterial.fileName && (
                    <div>
                      <span className="text-muted-foreground">Datei:</span>
                      <span className="ml-2 font-medium">{selectedMaterial.fileName} ({formatFileSize(selectedMaterial.fileSize)})</span>
                    </div>
                  )}
                </div>

                {selectedMaterial.tags && selectedMaterial.tags.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedMaterial.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMaterial.customFields && Object.keys(selectedMaterial.customFields).length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Anpassbare Felder:</span>
                    <div className="bg-muted rounded-lg p-3 space-y-1">
                      {Object.entries(selectedMaterial.customFields).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground font-mono text-xs">{key}</span>
                          <span className="text-muted-foreground">→</span>
                          <span>{typeof val === "string" ? (val || "(leer)") : JSON.stringify(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {selectedMaterial.isTemplate && (
                    <Button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600" onClick={() => { setShowDetailDialog(false); handlePreview(selectedMaterial); }}>
                      <Eye className="h-4 w-4 mr-2" />Vorschau
                    </Button>
                  )}
                  {selectedMaterial.isTemplate && (
                    <Button variant="outline" className="flex-1" onClick={() => handleDownloadHtml(selectedMaterial.id)}>
                      <Download className="h-4 w-4 mr-2" />HTML
                    </Button>
                  )}
                  {selectedMaterial.fileName && (
                    <Button className="flex-1" onClick={() => handleDownload(selectedMaterial.id)}>
                      <Download className="h-4 w-4 mr-2" />Datei
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      if (confirm("Material wirklich löschen?")) {
                        deleteMutation.mutate(selectedMaterial.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
          {selectedMaterial && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{selectedMaterial.title}</DialogTitle>
                  <div className="flex gap-2 mr-6">
                    <Button size="sm" variant="outline" onClick={() => handleDownloadHtml(selectedMaterial.id)}>
                      <Download className="h-3.5 w-3.5 mr-1" />HTML herunterladen
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      const previewUrl = `/api/admin/materials/${selectedMaterial.id}/preview`;
                      window.open(previewUrl, '_blank');
                    }}>
                      <Eye className="h-3.5 w-3.5 mr-1" />Neues Fenster
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              <div className="flex-1 overflow-hidden rounded-lg border bg-white">
                <iframe
                  src={`/api/admin/materials/${selectedMaterial.id}/preview`}
                  className="w-full h-full border-0"
                  title={`Vorschau: ${selectedMaterial.title}`}
                  sandbox="allow-same-origin"
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
