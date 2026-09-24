import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Heart, MessageCircle, PenSquare, ArrowLeft, Send,
  MapPin, Clock, Sparkles, TrendingUp, Users, Trash2,
  ChevronDown, Filter, X
} from "lucide-react";

const BLOG_CATEGORIES = [
  { value: "erfahrungsbericht", label: "Erfahrungsbericht", color: "bg-blue-100 text-blue-700" },
  { value: "tipp", label: "Tipp & Empfehlung", color: "bg-green-100 text-green-700" },
  { value: "frage", label: "Frage an die Community", color: "bg-yellow-100 text-yellow-700" },
  { value: "familienausflug", label: "Familienausflug", color: "bg-pink-100 text-pink-700" },
  { value: "geheimtipp", label: "Geheimtipp", color: "bg-purple-100 text-purple-700" },
  { value: "event", label: "Event & Veranstaltung", color: "bg-orange-100 text-orange-700" },
  { value: "diskussion", label: "Diskussion", color: "bg-gray-100 text-gray-700" },
];

function getCategoryStyle(cat: string) {
  return BLOG_CATEGORIES.find(c => c.value === cat)?.color || "bg-gray-100 text-gray-700";
}
function getCategoryLabel(cat: string) {
  return BLOG_CATEGORIES.find(c => c.value === cat)?.label || cat;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Gerade eben";
  if (mins < 60) return `vor ${mins} Min.`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
  return new Date(dateStr).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
}

function getInitials(name: string) {
  return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "??";
}

const AVATAR_COLORS = [
  "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500",
  "bg-orange-500", "bg-teal-500", "bg-indigo-500", "bg-red-500"
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function CommunityBlogPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("alle");
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newCity, setNewCity] = useState("");
  const [commentText, setCommentText] = useState("");

  const { data: posts = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/blog/posts", selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "alle") params.set("category", selectedCategory);
      const res = await fetch(`/api/blog/posts?${params}`);
      return res.json();
    },
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery<any[]>({
    queryKey: ["/api/blog/posts", selectedPost?.id, "comments"],
    queryFn: async () => {
      const res = await fetch(`/api/blog/posts/${selectedPost.id}/comments`);
      return res.json();
    },
    enabled: !!selectedPost,
  });

  const { data: likedData } = useQuery<{ liked: boolean }>({
    queryKey: ["/api/blog/posts", selectedPost?.id, "liked"],
    queryFn: async () => {
      const res = await fetch(`/api/blog/posts/${selectedPost.id}/liked`);
      return res.json();
    },
    enabled: !!selectedPost && !!user,
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/blog/posts", {
        title: newTitle,
        content: newContent,
        category: newCategory,
        city: newCity || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      setShowCreateDialog(false);
      setNewTitle("");
      setNewContent("");
      setNewCategory("");
      setNewCity("");
      toast({ title: "Beitrag veröffentlicht!" });
    },
    onError: (err: any) => {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/blog/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      setSelectedPost(null);
      toast({ title: "Beitrag gelöscht" });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("POST", `/api/blog/posts/${id}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts", selectedPost?.id, "liked"] });
      if (selectedPost) {
        queryClient.invalidateQueries({ queryKey: ["/api/blog/posts", selectedPost.id] });
      }
    },
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/blog/posts/${selectedPost.id}/comments`, {
        content: commentText,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts", selectedPost?.id, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      setCommentText("");
      toast({ title: "Kommentar hinzugefügt!" });
    },
  });

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button
            onClick={() => setSelectedPost(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Community
          </button>

          <Card className="mb-6 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <Avatar className={`w-10 h-10 ${getAvatarColor(selectedPost.author_name)}`}>
                  <AvatarFallback className="text-white text-sm font-semibold">
                    {getInitials(selectedPost.author_name || selectedPost.author_username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">
                      {selectedPost.author_name || selectedPost.author_username}
                    </span>
                    <Badge variant="outline" className={`text-xs ${getCategoryStyle(selectedPost.category)}`}>
                      {getCategoryLabel(selectedPost.category)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(selectedPost.created_at)}
                    </span>
                    {selectedPost.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {selectedPost.city}
                      </span>
                    )}
                  </div>
                </div>
                {(user?.id === selectedPost.user_id || user?.role === "admin") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePostMutation.mutate(selectedPost.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-3">{selectedPost.title}</h1>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedPost.content}</p>

              {selectedPost.image_url && (
                <img
                  src={selectedPost.image_url}
                  alt={selectedPost.title}
                  className="w-full rounded-lg mt-4 max-h-96 object-cover"
                />
              )}

              <div className="flex items-center gap-4 mt-6 pt-4 border-t">
                <button
                  onClick={() => user ? likeMutation.mutate(selectedPost.id) : toast({ title: "Bitte einloggen", variant: "destructive" })}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${
                    likedData?.liked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${likedData?.liked ? "fill-red-500" : ""}`} />
                  <span>{selectedPost.likes}</span>
                </button>
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <MessageCircle className="w-5 h-5" />
                  {selectedPost.comment_count} Kommentare
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Kommentare ({selectedPost.comment_count})
            </h3>

            {commentsLoading ? (
              <div className="text-center py-8 text-gray-400">Lade Kommentare...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Noch keine Kommentare. Sei der Erste!
              </div>
            ) : (
              comments.map((comment: any) => (
                <Card key={comment.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className={`w-8 h-8 ${getAvatarColor(comment.author_name)}`}>
                        <AvatarFallback className="text-white text-xs font-semibold">
                          {getInitials(comment.author_name || comment.author_username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-900">
                            {comment.author_name || comment.author_username}
                          </span>
                          <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
                        </div>
                        <p className="text-gray-700 text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {user ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className={`w-8 h-8 ${getAvatarColor(user.fullName || user.username)}`}>
                    <AvatarFallback className="text-white text-xs font-semibold">
                      {getInitials(user.fullName || user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Schreibe einen Kommentar..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && commentText.trim() && commentMutation.mutate()}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => commentMutation.mutate()}
                      disabled={!commentText.trim() || commentMutation.isPending}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              <button onClick={() => navigate("/auth")} className="text-emerald-600 font-medium hover:underline">
                Einloggen
              </button>{" "}
              um zu kommentieren
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => navigate("/")} className="text-white/70 hover:text-white text-sm flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Startseite
            </button>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-8 h-8" />
            <h1 className="text-3xl font-bold">FreizeitEngel Community</h1>
          </div>
          <p className="text-white/80 text-lg max-w-2xl">
            Teile deine Erlebnisse, entdecke Geheimtipps und tausche dich mit anderen Freizeitbegeisterten aus.
          </p>

          <div className="flex items-center gap-6 mt-8">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-300" />
              <span className="text-sm">{posts.length} Beiträge</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-sm">Aktive Community</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("alle")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === "alle"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border"
              }`}
            >
              Alle
            </button>
            {BLOG_CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.value
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-100 border"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {user ? (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2 shrink-0">
                  <PenSquare className="w-4 h-4" />
                  Beitrag schreiben
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Neuen Beitrag erstellen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <Input
                    placeholder="Titel deines Beitrags"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOG_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Stadt (optional)"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                  />
                  <Textarea
                    placeholder="Was möchtest du mit der Community teilen?"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={6}
                  />
                  <Button
                    onClick={() => createPostMutation.mutate()}
                    disabled={!newTitle.trim() || !newContent.trim() || !newCategory || createPostMutation.isPending}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    {createPostMutation.isPending ? "Wird veröffentlicht..." : "Veröffentlichen"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button onClick={() => navigate("/auth")} variant="outline" className="gap-2 shrink-0">
              <PenSquare className="w-4 h-4" />
              Einloggen & schreiben
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="border-0 shadow-sm animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-5 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Noch keine Beiträge</h3>
              <p className="text-gray-500 mb-4">Sei der Erste, der einen Beitrag in der Community schreibt!</p>
              {user && (
                <Button onClick={() => setShowCreateDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
                  Ersten Beitrag schreiben
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <Card
                key={post.id}
                className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setSelectedPost(post)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar className={`w-10 h-10 ${getAvatarColor(post.author_name)} shrink-0`}>
                      <AvatarFallback className="text-white text-sm font-semibold">
                        {getInitials(post.author_name || post.author_username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {post.author_name || post.author_username}
                        </span>
                        <Badge variant="outline" className={`text-xs ${getCategoryStyle(post.category)}`}>
                          {getCategoryLabel(post.category)}
                        </Badge>
                        {post.pinned && (
                          <Badge className="bg-amber-100 text-amber-700 text-xs">Angepinnt</Badge>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors mb-1.5 line-clamp-1">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">{post.content}</p>

                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(post.created_at)}
                        </span>
                        {post.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {post.city}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Heart className={`w-3 h-3 ${post.likes > 0 ? "text-red-400" : ""}`} />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {post.comment_count}
                        </span>
                      </div>
                    </div>

                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt=""
                        className="w-20 h-20 rounded-lg object-cover shrink-0 hidden sm:block"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
