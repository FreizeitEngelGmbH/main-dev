import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import AdminLayout from "./admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  Trash2,
  Eye,
  Edit,
  Loader2,
  Sparkles,
  BookOpen,
  FileText,
  ArrowLeft,
  Monitor,
  CreditCard,
  Users,
  Settings,
  Shield,
  ChevronDown,
  Tag,
  FolderOpen
} from "lucide-react";
import type { KbCategory, KbArticle } from "@shared/schema";

const ICON_MAP: Record<string, any> = {
  Monitor, CreditCard, Users, Sparkles, Settings, Shield, FileText, BookOpen, FolderOpen
};

function getIcon(name: string) {
  return ICON_MAP[name] || FileText;
}

export default function AdminKnowledgeBase() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<KbCategory | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<KbArticle | null>(null);
  const [showArticleDialog, setShowArticleDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KbArticle | null>(null);
  const [editingCategory, setEditingCategory] = useState<KbCategory | null>(null);
  const [articleForm, setArticleForm] = useState({ title: "", slug: "", content: "", excerpt: "", tags: "" });
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "", icon: "FileText", description: "" });
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const { data: categories = [], isLoading: catsLoading } = useQuery<KbCategory[]>({
    queryKey: ["/api/admin/kb/categories"],
  });

  const { data: allArticles = [], isLoading: articlesLoading } = useQuery<KbArticle[]>({
    queryKey: ["/api/admin/kb/articles"],
  });

  const { data: searchResults = [] } = useQuery<KbArticle[]>({
    queryKey: ["/api/admin/kb/articles", { search: searchQuery }],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const res = await fetch(`/api/admin/kb/articles?search=${encodeURIComponent(searchQuery)}`, { credentials: "include" });
      return res.json();
    },
    enabled: searchQuery.trim().length > 0,
  });

  const seedMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/kb/seed"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kb/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kb/articles"] });
      toast({ title: "Wissensdatenbank befüllt" });
    },
  });

  const createArticleMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/kb/articles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kb/articles"] });
      setShowArticleDialog(false);
      toast({ title: "Artikel erstellt" });
    },
  });

  const updateArticleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/admin/kb/articles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kb/articles"] });
      setShowArticleDialog(false);
      setSelectedArticle(null);
      toast({ title: "Artikel aktualisiert" });
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/kb/articles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kb/articles"] });
      setSelectedArticle(null);
      toast({ title: "Artikel gelöscht" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/kb/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kb/categories"] });
      setShowCategoryDialog(false);
      toast({ title: "Kategorie erstellt" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/admin/kb/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kb/categories"] });
      setShowCategoryDialog(false);
      toast({ title: "Kategorie aktualisiert" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/kb/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kb/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kb/articles"] });
      toast({ title: "Kategorie gelöscht" });
    },
  });

  const getArticlesForCategory = (catId: number) => allArticles.filter((a) => a.categoryId === catId);

  const toggleCategoryExpanded = (catId: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const openNewArticle = (categoryId?: number) => {
    setEditingArticle(null);
    setArticleForm({ title: "", slug: "", content: "", excerpt: "", tags: "" });
    if (categoryId) {
      setSelectedCategory(categories.find((c) => c.id === categoryId) || null);
    }
    setShowArticleDialog(true);
  };

  const openEditArticle = (article: KbArticle) => {
    setEditingArticle(article);
    setArticleForm({
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt || "",
      tags: article.tags?.join(", ") || "",
    });
    setShowArticleDialog(true);
  };

  const openNewCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", slug: "", icon: "FileText", description: "" });
    setShowCategoryDialog(true);
  };

  const openEditCategory = (cat: KbCategory) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || "FileText",
      description: cat.description || "",
    });
    setShowCategoryDialog(true);
  };

  const handleSaveArticle = () => {
    const tags = articleForm.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const slug = articleForm.slug || articleForm.title.toLowerCase().replace(/[^a-z0-9äöü]+/g, "-").replace(/(^-|-$)/g, "");
    const payload = {
      ...articleForm,
      slug,
      tags,
      categoryId: selectedCategory?.id || editingArticle?.categoryId,
      published: true,
    };
    if (editingArticle) {
      updateArticleMutation.mutate({ id: editingArticle.id, data: payload });
    } else {
      createArticleMutation.mutate(payload);
    }
  };

  const handleSaveCategory = () => {
    const slug = categoryForm.slug || categoryForm.name.toLowerCase().replace(/[^a-z0-9äöü]+/g, "-").replace(/(^-|-$)/g, "");
    const payload = { ...categoryForm, slug };
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: payload });
    } else {
      createCategoryMutation.mutate(payload);
    }
  };

  const displayArticles = searchQuery.trim() ? searchResults : [];
  const isLoading = catsLoading || articlesLoading;
  const totalArticles = allArticles.length;

  if (selectedArticle) {
    const cat = categories.find((c) => c.id === selectedArticle.categoryId);
    return (
      <AdminLayout>
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => setSelectedArticle(null)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />Zurück
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-2">
              {cat && <Badge variant="secondary">{cat.name}</Badge>}
              {selectedArticle.tags?.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
            <h1 className="text-3xl font-bold mb-2">{selectedArticle.title}</h1>
            {selectedArticle.excerpt && <p className="text-muted-foreground">{selectedArticle.excerpt}</p>}
          </div>
          <Card>
            <CardContent className="pt-6 prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                __html: selectedArticle.content
                  .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
                  .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
                  .replace(/^\d+\. (.*$)/gim, '<div class="flex gap-2 ml-4"><span class="text-muted-foreground">•</span><span>$1</span></div>')
                  .replace(/^- (.*$)/gim, '<div class="flex gap-2 ml-4"><span class="text-muted-foreground">•</span><span>$1</span></div>')
                  .replace(/\n\n/g, '<br/><br/>')
              }} />
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => openEditArticle(selectedArticle)}>
              <Edit className="h-4 w-4 mr-2" />Bearbeiten
            </Button>
            <Button variant="destructive" onClick={() => {
              if (confirm("Artikel wirklich löschen?")) deleteArticleMutation.mutate(selectedArticle.id);
            }}>
              <Trash2 className="h-4 w-4 mr-2" />Löschen
            </Button>
          </div>
        </div>

        <Dialog open={showArticleDialog} onOpenChange={setShowArticleDialog}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingArticle ? "Artikel bearbeiten" : "Neuer Artikel"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Titel</Label>
                <Input value={articleForm.title} onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })} />
              </div>
              <div>
                <Label>URL-Slug (optional)</Label>
                <Input value={articleForm.slug} onChange={(e) => setArticleForm({ ...articleForm, slug: e.target.value })} placeholder="wird-automatisch-generiert" />
              </div>
              <div>
                <Label>Kurzbeschreibung</Label>
                <Input value={articleForm.excerpt} onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })} />
              </div>
              <div>
                <Label>Inhalt (Markdown)</Label>
                <Textarea rows={12} value={articleForm.content} onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })} />
              </div>
              <div>
                <Label>Tags (kommagetrennt)</Label>
                <Input value={articleForm.tags} onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })} placeholder="z.B. Anleitung, Start, Hilfe" />
              </div>
              <Button onClick={handleSaveArticle} disabled={!articleForm.title || !articleForm.content} className="w-full">
                {editingArticle ? "Aktualisieren" : "Erstellen"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="rounded-xl p-8 text-white text-center" style={{ background: 'linear-gradient(to right, #36C9C2, #2DB5AF)' }}>
          <h1 className="text-3xl font-bold mb-2">Wissensdatenbank</h1>
          <p className="mb-6" style={{ color: '#d0f5f3' }}>Kompendium für FreizeitEngel</p>
          <div className="max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-10 bg-white text-gray-900 border-0"
                placeholder="Artikel durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="secondary" className="bg-gray-800 text-white hover:bg-gray-700" onClick={() => setSearchQuery(searchQuery)}>
              Suchen
            </Button>
          </div>
        </div>

        {searchQuery.trim() && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Suchergebnisse ({displayArticles.length})</h2>
              <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>Suche zurücksetzen</Button>
            </div>
            {displayArticles.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Keine Artikel gefunden für "{searchQuery}"</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {displayArticles.map((article) => {
                  const cat = categories.find((c) => c.id === article.categoryId);
                  return (
                    <Card key={article.id} className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setSelectedArticle(article)}>
                      <CardContent className="py-3 flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{article.title}</span>
                          {cat && <Badge variant="secondary" className="ml-2 text-xs">{cat.name}</Badge>}
                        </div>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!searchQuery.trim() && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Kompendium</h2>
                <p className="text-sm text-muted-foreground">{categories.length} Kategorien · {totalArticles} Artikel</p>
              </div>
              <div className="flex gap-2">
                {categories.length === 0 && (
                  <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
                    <Sparkles className="h-4 w-4 mr-2" />Standard-Inhalte laden
                  </Button>
                )}
                <Button variant="outline" onClick={openNewCategory}>
                  <Plus className="h-4 w-4 mr-2" />Kategorie
                </Button>
                <Button onClick={() => openNewArticle()}>
                  <Plus className="h-4 w-4 mr-2" />Artikel
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : categories.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <BookOpen className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Wissensdatenbank ist leer</h3>
                  <p className="text-muted-foreground text-center mb-4">Laden Sie die Standard-Inhalte oder erstellen Sie eigene Kategorien und Artikel.</p>
                  <Button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {seedMutation.isPending ? "Wird geladen..." : "Standard-Inhalte laden"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => {
                  const catArticles = getArticlesForCategory(cat.id);
                  const isExpanded = expandedCategories.has(cat.id);
                  const Icon = getIcon(cat.icon || "FileText");
                  const displayCount = isExpanded ? catArticles.length : Math.min(catArticles.length, 8);

                  return (
                    <Card key={cat.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5" style={{ color: '#36C9C2' }} />
                            <CardTitle className="text-base">{cat.name}</CardTitle>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditCategory(cat)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => {
                              if (confirm(`Kategorie "${cat.name}" und alle ${catArticles.length} Artikel löschen?`)) deleteCategoryMutation.mutate(cat.id);
                            }}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-1">
                          {catArticles.slice(0, displayCount).map((article) => (
                            <div
                              key={article.id}
                              className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted cursor-pointer group"
                              onClick={() => setSelectedArticle(article)}
                            >
                              <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm truncate flex-1">{article.title}</span>
                              <Eye className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 flex-shrink-0" />
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          {catArticles.length > 8 && (
                            <button
                              className="text-sm font-medium flex items-center gap-1" style={{ color: '#36C9C2' }}
                              onClick={() => toggleCategoryExpanded(cat.id)}
                            >
                              {isExpanded ? "Weniger anzeigen" : `Alle Artikel anzeigen (${catArticles.length})`}
                              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            </button>
                          )}
                          {catArticles.length <= 8 && (
                            <span className="text-xs text-muted-foreground">{catArticles.length} Artikel</span>
                          )}
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openNewArticle(cat.id)}>
                            <Plus className="h-3 w-3 mr-1" />Neuer Artikel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={showArticleDialog} onOpenChange={setShowArticleDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArticle ? "Artikel bearbeiten" : "Neuer Artikel"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!editingArticle && (
              <div>
                <Label>Kategorie</Label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={selectedCategory?.id || ""}
                  onChange={(e) => setSelectedCategory(categories.find((c) => c.id === parseInt(e.target.value)) || null)}
                >
                  <option value="">Kategorie wählen...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <Label>Titel</Label>
              <Input value={articleForm.title} onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })} />
            </div>
            <div>
              <Label>URL-Slug (optional)</Label>
              <Input value={articleForm.slug} onChange={(e) => setArticleForm({ ...articleForm, slug: e.target.value })} placeholder="wird-automatisch-generiert" />
            </div>
            <div>
              <Label>Kurzbeschreibung</Label>
              <Input value={articleForm.excerpt} onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })} />
            </div>
            <div>
              <Label>Inhalt (Markdown)</Label>
              <Textarea rows={12} value={articleForm.content} onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })} />
            </div>
            <div>
              <Label>Tags (kommagetrennt)</Label>
              <Input value={articleForm.tags} onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })} placeholder="z.B. Anleitung, Start, Hilfe" />
            </div>
            <Button
              onClick={handleSaveArticle}
              disabled={!articleForm.title || !articleForm.content || (!editingArticle && !selectedCategory)}
              className="w-full"
            >
              {editingArticle ? "Aktualisieren" : "Erstellen"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Kategorie bearbeiten" : "Neue Kategorie"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} />
            </div>
            <div>
              <Label>URL-Slug (optional)</Label>
              <Input value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} placeholder="wird-automatisch-generiert" />
            </div>
            <div>
              <Label>Icon</Label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
              >
                {Object.keys(ICON_MAP).map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Beschreibung</Label>
              <Input value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
            </div>
            <Button onClick={handleSaveCategory} disabled={!categoryForm.name} className="w-full">
              {editingCategory ? "Aktualisieren" : "Erstellen"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
