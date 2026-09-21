import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Inbox, Send, Star, Trash2, Mail, MailOpen, PenSquare,
  Search, RefreshCw, Archive, StarOff, ChevronLeft
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface InboxMessage {
  id: number;
  fromEmail: string;
  fromName: string | null;
  toEmail: string;
  subject: string;
  body: string;
  isRead: boolean;
  isStarred: boolean;
  folder: string;
  relatedType: string | null;
  relatedId: number | null;
  createdAt: string;
}

export default function AdminInboxPage() {
  const { toast } = useToast();
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState({
    fromEmail: "",
    fromName: "",
    toEmail: "info@freizeitplus.com",
    subject: "",
    body: "",
    folder: "draft",
  });

  const { data: messages = [], isLoading } = useQuery<InboxMessage[]>({
    queryKey: ["/api/admin/inbox"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/inbox", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inbox"] });
      setComposeOpen(false);
      setNewMessage({ fromEmail: "", fromName: "", toEmail: "info@freizeitplus.com", subject: "", body: "", folder: "draft" });
      toast({ title: "Nachricht gespeichert" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PATCH", `/api/admin/inbox/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inbox"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/inbox/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inbox"] });
      setSelectedMessage(null);
      toast({ title: "Nachricht gelöscht" });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/admin/inbox/${id}/send`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inbox"] });
      setSelectedMessage(null);
      toast({ title: "Nachricht gesendet" });
    },
    onError: () => {
      toast({ title: "Fehler", description: "Nachricht konnte nicht gesendet werden.", variant: "destructive" });
    },
  });

  const openMessage = (msg: InboxMessage) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      updateMutation.mutate({ id: msg.id, data: { isRead: true } });
    }
  };

  const toggleStar = (msg: InboxMessage, e: React.MouseEvent) => {
    e.stopPropagation();
    updateMutation.mutate({ id: msg.id, data: { isStarred: !msg.isStarred } });
  };

  const archiveMessage = (msg: InboxMessage) => {
    updateMutation.mutate({ id: msg.id, data: { folder: "archive" } });
    setSelectedMessage(null);
    toast({ title: "Nachricht archiviert" });
  };

  const saveAndSendDraft = () => {
    if (!newMessage.fromEmail || !newMessage.subject || !newMessage.body) {
      toast({ title: "Fehlende Angaben", variant: "destructive" });
      return;
    }
    createMutation.mutate({ ...newMessage, folder: "sent", isRead: true });
  };

  const saveDraft = () => {
    if (!newMessage.subject) {
      toast({ title: "Betreff fehlt", variant: "destructive" });
      return;
    }
    createMutation.mutate({ ...newMessage, folder: "draft", fromEmail: newMessage.fromEmail || "info@freizeitplus.com" });
  };

  const folders = [
    { id: "inbox", label: "Posteingang", icon: Inbox },
    { id: "starred", label: "Markiert", icon: Star },
    { id: "sent", label: "Gesendet", icon: Send },
    { id: "draft", label: "Entwürfe", icon: PenSquare },
    { id: "archive", label: "Archiv", icon: Archive },
  ];

  const filteredMessages = messages.filter(msg => {
    if (activeFolder === "starred") return msg.isStarred;
    return msg.folder === activeFolder;
  }).filter(msg => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return msg.subject.toLowerCase().includes(q) ||
      msg.fromEmail.toLowerCase().includes(q) ||
      (msg.fromName || "").toLowerCase().includes(q) ||
      msg.body.toLowerCase().includes(q);
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = messages.filter(m => m.folder === "inbox" && !m.isRead).length;
  const draftCount = messages.filter(m => m.folder === "draft").length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-[600px] bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Postfach</h1>
          <p className="text-muted-foreground mt-1">Nachrichten verwalten – vorbereitet für info@freizeitplus.com</p>
        </div>
        <Button onClick={() => setComposeOpen(true)} className="flex items-center gap-2">
          <PenSquare className="h-4 w-4" />
          Neue Nachricht
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" style={{ minHeight: "600px" }}>
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {folders.map(folder => {
                  const Icon = folder.icon;
                  const count = folder.id === "inbox" ? unreadCount :
                    folder.id === "draft" ? draftCount :
                      folder.id === "starred" ? messages.filter(m => m.isStarred).length :
                        messages.filter(m => m.folder === folder.id).length;
                  return (
                    <button
                      key={folder.id}
                      onClick={() => { setActiveFolder(folder.id); setSelectedMessage(null); }}
                      className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm transition-colors ${activeFolder === folder.id ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{folder.label}</span>
                      {count > 0 && (
                        <Badge variant={activeFolder === folder.id ? "secondary" : "outline"} className="text-xs">
                          {count}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Message List or Detail */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            {selectedMessage ? (
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedMessage(null)}>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Zurück
                    </Button>
                    <div className="flex-1" />
                    <Button variant="ghost" size="icon" onClick={() => toggleStar(selectedMessage, {} as any)}>
                      <Star className={`h-4 w-4 ${selectedMessage.isStarred ? "fill-yellow-400 text-yellow-400" : ""}`} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => archiveMessage(selectedMessage)}>
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(selectedMessage.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {selectedMessage.folder === "draft" && (
                      <Button size="sm" onClick={() => sendMutation.mutate(selectedMessage.id)} disabled={sendMutation.isPending}>
                        <Send className="h-4 w-4 mr-1" />
                        Senden
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <h2 className="text-xl font-semibold mb-2">{selectedMessage.subject}</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <span className="font-medium text-foreground">
                      {selectedMessage.fromName || selectedMessage.fromEmail}
                    </span>
                    <span>&lt;{selectedMessage.fromEmail}&gt;</span>
                    <span className="ml-auto">
                      {format(new Date(selectedMessage.createdAt), "dd. MMMM yyyy, HH:mm", { locale: de })}
                    </span>
                  </div>
                  <Separator className="mb-4" />
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {selectedMessage.body}
                  </div>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">
                      {folders.find(f => f.id === activeFolder)?.label}
                    </CardTitle>
                    <div className="flex-1">
                      <div className="relative max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Nachrichten durchsuchen..."
                          className="pl-9 h-9"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/inbox"] })}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="p-0">
                  {filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Mail className="h-12 w-12 text-muted-foreground/30 mb-4" />
                      <h3 className="font-medium text-muted-foreground mb-1">Keine Nachrichten</h3>
                      <p className="text-sm text-muted-foreground/70">
                        {activeFolder === "inbox" ? "Ihr Posteingang ist leer." : `Keine Nachrichten in ${folders.find(f => f.id === activeFolder)?.label}.`}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredMessages.map(msg => (
                        <div
                          key={msg.id}
                          onClick={() => openMessage(msg)}
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${!msg.isRead ? "bg-blue-50/50" : ""}`}
                        >
                          <button onClick={(e) => toggleStar(msg, e)} className="shrink-0">
                            <Star className={`h-4 w-4 ${msg.isStarred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40 hover:text-yellow-400"}`} />
                          </button>
                          <div className="shrink-0">
                            {msg.isRead ? (
                              <MailOpen className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Mail className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm truncate ${!msg.isRead ? "font-semibold" : ""}`}>
                                {msg.fromName || msg.fromEmail}
                              </span>
                              <span className="text-xs text-muted-foreground ml-auto shrink-0">
                                {format(new Date(msg.createdAt), "dd.MM.yy HH:mm", { locale: de })}
                              </span>
                            </div>
                            <div className={`text-sm truncate ${!msg.isRead ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                              {msg.subject}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {msg.body.substring(0, 100)}...
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Neue Nachricht verfassen</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">An (E-Mail)</Label>
                <Input placeholder="empfaenger@email.de" value={newMessage.fromEmail} onChange={(e) => setNewMessage({ ...newMessage, fromEmail: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Empfängername</Label>
                <Input placeholder="Max Mustermann" value={newMessage.fromName} onChange={(e) => setNewMessage({ ...newMessage, fromName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Betreff</Label>
              <Input placeholder="Betreffzeile eingeben..." value={newMessage.subject} onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nachricht</Label>
              <Textarea placeholder="Ihre Nachricht..." rows={10} value={newMessage.body} onChange={(e) => setNewMessage({ ...newMessage, body: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={saveDraft}>
              <PenSquare className="h-4 w-4 mr-1" />
              Als Entwurf
            </Button>
            <Button onClick={saveAndSendDraft} disabled={createMutation.isPending}>
              <Send className="h-4 w-4 mr-1" />
              {createMutation.isPending ? "Senden..." : "Senden"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
