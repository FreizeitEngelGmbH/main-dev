import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Hash,
  Send,
  Plus,
  MessageSquare,
  Users,
  Video,
  Phone,
  Search,
  Settings,
  Smile,
  Paperclip,
  MoreVertical,
  Calendar,
  Clock,
  MapPin,
  Link2,
  Trash2,
  Edit3,
  X,
  ChevronRight,
  Circle,
} from "lucide-react";
import type { ChatChannel, ChatMessage, ChatMeeting } from "@shared/schema";
import AdminLayout from "./admin-layout";

interface TeamUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  profileImage: string | null;
}

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: string | Date): string {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Heute";
  if (d.toDateString() === yesterday.toDateString()) return "Gestern";
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatMeetingTime(date: string | Date): string {
  return new Date(date).toLocaleString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function shouldShowDateSeparator(currentMsg: ChatMessage, prevMsg: ChatMessage | null): boolean {
  if (!prevMsg) return true;
  const curr = new Date(currentMsg.createdAt!).toDateString();
  const prev = new Date(prevMsg.createdAt!).toDateString();
  return curr !== prev;
}

export default function AdminChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeChannelId, setActiveChannelId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [showMeetings, setShowMeetings] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: "", description: "", startTime: "", endTime: "", location: "", meetingUrl: ""
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<number, string>>(new Map());

  const { data: channels = [] } = useQuery<ChatChannel[]>({
    queryKey: ["/api/chat/channels"],
  });

  const { data: teamUsers = [] } = useQuery<TeamUser[]>({
    queryKey: ["/api/chat/users"],
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery<ChatMessage[]>({
    queryKey: [`/api/chat/channels/${activeChannelId}/messages`],
    enabled: !!activeChannelId,
    refetchInterval: 5000,
  });

  const { data: meetings = [] } = useQuery<ChatMeeting[]>({
    queryKey: ["/api/chat/meetings"],
  });

  const activeChannel = channels.find(c => c.id === activeChannelId);

  useEffect(() => {
    if (channels.length > 0 && !activeChannelId) {
      setActiveChannelId(channels[0].id);
    }
  }, [channels, activeChannelId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!channels.length) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/chat`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "subscribe",
        channelIds: channels.map(c => c.id),
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "message:new") {
          queryClient.invalidateQueries({ queryKey: [`/api/chat/channels/${data.channelId}/messages`] });
        }
        if (data.type === "typing" && data.userId !== user?.id) {
          setTypingUsers(prev => {
            const next = new Map(prev);
            next.set(data.userId, data.username);
            setTimeout(() => {
              setTypingUsers(p => {
                const n = new Map(p);
                n.delete(data.userId);
                return n;
              });
            }, 3000);
            return next;
          });
        }
      } catch (e) {}
    };

    return () => {
      ws.close();
    };
  }, [channels.length]);

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!messageInput.trim() || !activeChannelId) return;
      await apiRequest("POST", `/api/chat/channels/${activeChannelId}/messages`, {
        content: messageInput.trim(),
      });
    },
    onSuccess: () => {
      setMessageInput("");
      refetchMessages();
    },
    onError: () => {
      toast({ title: "Fehler", description: "Nachricht konnte nicht gesendet werden", variant: "destructive" });
    },
  });

  const createChannel = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/chat/channels", {
        name: newChannelName,
        description: newChannelDesc,
        type: "channel",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/channels"] });
      setShowNewChannel(false);
      setNewChannelName("");
      setNewChannelDesc("");
      toast({ title: "Channel erstellt" });
    },
  });

  const deleteChannel = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/chat/channels/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/channels"] });
      setActiveChannelId(null);
      toast({ title: "Channel gel\u00F6scht" });
    },
  });

  const createMeeting = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/chat/meetings", {
        ...meetingForm,
        channelId: activeChannelId,
        startTime: new Date(meetingForm.startTime).toISOString(),
        endTime: new Date(meetingForm.endTime).toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/meetings"] });
      setShowNewMeeting(false);
      setMeetingForm({ title: "", description: "", startTime: "", endTime: "", location: "", meetingUrl: "" });
      toast({ title: "Meeting geplant" });
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage.mutate();
    }
  };

  const handleTyping = useCallback(() => {
    if (wsRef.current?.readyState === 1 && activeChannelId) {
      wsRef.current.send(JSON.stringify({
        type: "typing",
        channelId: activeChannelId,
        userId: user?.id,
        username: user?.fullName || user?.username,
      }));
    }
  }, [activeChannelId, user]);

  const getUserName = (userId: number): string => {
    const u = teamUsers.find(t => t.id === userId);
    return u?.fullName || u?.username || `User ${userId}`;
  };

  const filteredChannels = channels.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingMeetings = meetings.filter(m =>
    new Date(m.startTime) >= new Date() && m.status === "scheduled"
  ).slice(0, 5);

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-64px)] flex bg-gray-50">
        {/* Left Sidebar - Channels */}
        <div className="w-72 bg-gradient-to-b from-purple-900 to-purple-950 text-white flex flex-col">
          <div className="p-4 border-b border-purple-700/50">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Team Chat
            </h2>
            <p className="text-purple-300 text-xs mt-1">FreizeitEngel Kommunikation</p>
          </div>

          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-purple-400" />
              <Input
                placeholder="Channel suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-purple-800/50 border-purple-700 text-white placeholder:text-purple-400 h-8 text-sm"
              />
            </div>
          </div>

          <div className="px-3 py-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Channels</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 text-purple-400 hover:text-white hover:bg-purple-700"
              onClick={() => setShowNewChannel(true)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 px-2">
            {filteredChannels.filter(c => c.type === "channel").map(channel => (
              <button
                key={channel.id}
                onClick={() => setActiveChannelId(channel.id)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors mb-0.5 ${
                  activeChannelId === channel.id
                    ? "bg-purple-700 text-white"
                    : "text-purple-300 hover:bg-purple-800/50 hover:text-white"
                }`}
              >
                <Hash className="h-4 w-4 shrink-0" />
                <span className="truncate">{channel.name}</span>
              </button>
            ))}

            {filteredChannels.filter(c => c.type === "dm").length > 0 && (
              <>
                <div className="px-3 py-2 mt-3">
                  <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Direktnachrichten</span>
                </div>
                {filteredChannels.filter(c => c.type === "dm").map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannelId(channel.id)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors mb-0.5 ${
                      activeChannelId === channel.id
                        ? "bg-purple-700 text-white"
                        : "text-purple-300 hover:bg-purple-800/50 hover:text-white"
                    }`}
                  >
                    <Circle className="h-3 w-3 shrink-0 fill-green-400 text-green-400" />
                    <span className="truncate">{channel.name}</span>
                  </button>
                ))}
              </>
            )}
          </ScrollArea>

          <div className="p-3 border-t border-purple-700/50">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-purple-600 text-white text-xs">
                  {user?.fullName ? getInitials(user.fullName) : "ME"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.fullName || user?.username}</p>
                <p className="text-xs text-purple-400 flex items-center gap-1">
                  <Circle className="h-2 w-2 fill-green-400 text-green-400" />
                  Online
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeChannel ? (
            <>
              {/* Channel Header */}
              <div className="h-14 border-b bg-white px-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-900">{activeChannel.name}</h3>
                  {activeChannel.description && (
                    <span className="text-sm text-gray-500 hidden md:inline">| {activeChannel.description}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowMeetings(!showMeetings)}>
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowNewMeeting(true)}>
                    <Calendar className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    onClick={() => {
                      if (confirm("Channel wirklich l\u00F6schen?")) {
                        deleteChannel.mutate(activeChannel.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 px-4 py-2">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
                    <MessageSquare className="h-12 w-12 mb-3 opacity-50" />
                    <p className="text-lg font-medium">Noch keine Nachrichten</p>
                    <p className="text-sm">Starte die Unterhaltung in #{activeChannel.name}</p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {messages.map((msg, idx) => {
                      const prevMsg = idx > 0 ? messages[idx - 1] : null;
                      const showDate = shouldShowDateSeparator(msg, prevMsg);
                      const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId || showDate;
                      const senderName = getUserName(msg.senderId);

                      return (
                        <div key={msg.id}>
                          {showDate && (
                            <div className="flex items-center gap-3 my-4">
                              <div className="flex-1 h-px bg-gray-200" />
                              <span className="text-xs font-medium text-gray-500 px-2">
                                {formatDate(msg.createdAt!)}
                              </span>
                              <div className="flex-1 h-px bg-gray-200" />
                            </div>
                          )}
                          <div className={`group flex gap-3 px-2 py-1 rounded-lg hover:bg-gray-50 ${showAvatar ? "mt-3" : "mt-0"}`}>
                            <div className="w-9 shrink-0">
                              {showAvatar && (
                                <Avatar className="h-9 w-9">
                                  <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-medium">
                                    {getInitials(senderName)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              {showAvatar && (
                                <div className="flex items-baseline gap-2">
                                  <span className="font-semibold text-sm text-gray-900">{senderName}</span>
                                  <span className="text-xs text-gray-400">{formatTime(msg.createdAt!)}</span>
                                  {msg.isEdited && <span className="text-xs text-gray-400">(bearbeitet)</span>}
                                </div>
                              )}
                              <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{msg.content}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Typing Indicator */}
              {typingUsers.size > 0 && (
                <div className="px-6 py-1">
                  <p className="text-xs text-gray-500 italic">
                    {Array.from(typingUsers.values()).join(", ")} tippt...
                  </p>
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex items-end gap-2 bg-gray-50 rounded-xl border px-3 py-2">
                  <Textarea
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={`Nachricht an #${activeChannel.name}...`}
                    className="min-h-[40px] max-h-[120px] border-0 bg-transparent resize-none p-0 focus-visible:ring-0 text-sm"
                    rows={1}
                  />
                  <Button
                    size="sm"
                    onClick={() => sendMessage.mutate()}
                    disabled={!messageInput.trim() || sendMessage.isPending}
                    className="shrink-0 h-8 w-8 p-0 rounded-lg bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-xl font-medium text-gray-500">Willkommen im Team Chat</h3>
                <p className="text-sm mt-1">W\u00E4hle einen Channel aus, um loszulegen</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Meetings & Members */}
        {showMeetings && activeChannel && (
          <div className="w-80 bg-white border-l overflow-y-auto">
            <Tabs defaultValue="meetings" className="h-full">
              <div className="p-3 border-b">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">Details</h3>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowMeetings(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <TabsList className="w-full">
                  <TabsTrigger value="meetings" className="flex-1 text-xs">Meetings</TabsTrigger>
                  <TabsTrigger value="members" className="flex-1 text-xs">Mitglieder</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="meetings" className="p-3 space-y-3 mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowNewMeeting(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Meeting planen
                </Button>

                {upcomingMeetings.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Keine anstehenden Meetings</p>
                  </div>
                ) : (
                  upcomingMeetings.map(meeting => (
                    <Card key={meeting.id} className="shadow-sm">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">{meeting.title}</h4>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {meeting.status === "scheduled" ? "Geplant" : meeting.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {formatMeetingTime(meeting.startTime)}
                          </div>
                          {meeting.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3 w-3" />
                              {meeting.location}
                            </div>
                          )}
                          {meeting.meetingUrl && (
                            <div className="flex items-center gap-1.5">
                              <Link2 className="h-3 w-3" />
                              <a href={meeting.meetingUrl} target="_blank" rel="noopener" className="text-purple-600 hover:underline truncate">
                                Meeting beitreten
                              </a>
                            </div>
                          )}
                        </div>
                        {meeting.description && (
                          <p className="text-xs text-gray-600 border-t pt-2">{meeting.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="members" className="p-3 space-y-2 mt-0">
                <p className="text-xs text-gray-500 mb-3">
                  {teamUsers.length} Teammitglieder
                </p>
                {teamUsers.map(u => (
                  <div key={u.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                          {getInitials(u.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-green-400 text-green-400 border-2 border-white rounded-full" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{u.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{u.role === "admin" ? "Admin" : "Partner"}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* New Channel Dialog */}
      <Dialog open={showNewChannel} onOpenChange={setShowNewChannel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuen Channel erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Channel-Name</label>
              <Input
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="z.B. marketing, support, events"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Beschreibung (optional)</label>
              <Input
                value={newChannelDesc}
                onChange={(e) => setNewChannelDesc(e.target.value)}
                placeholder="Worum geht es in diesem Channel?"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewChannel(false)}>Abbrechen</Button>
            <Button
              onClick={() => createChannel.mutate()}
              disabled={!newChannelName.trim() || createChannel.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Meeting Dialog */}
      <Dialog open={showNewMeeting} onOpenChange={setShowNewMeeting}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Meeting planen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Titel</label>
              <Input
                value={meetingForm.title}
                onChange={(e) => setMeetingForm(f => ({ ...f, title: e.target.value }))}
                placeholder="z.B. Marketing-Besprechung"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Beschreibung (optional)</label>
              <Textarea
                value={meetingForm.description}
                onChange={(e) => setMeetingForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Agenda und Details..."
                className="mt-1"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Start</label>
                <Input
                  type="datetime-local"
                  value={meetingForm.startTime}
                  onChange={(e) => setMeetingForm(f => ({ ...f, startTime: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Ende</label>
                <Input
                  type="datetime-local"
                  value={meetingForm.endTime}
                  onChange={(e) => setMeetingForm(f => ({ ...f, endTime: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Ort (optional)</label>
              <Input
                value={meetingForm.location}
                onChange={(e) => setMeetingForm(f => ({ ...f, location: e.target.value }))}
                placeholder="z.B. B\u00FCro Hagen, Online"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Meeting-Link (optional)</label>
              <Input
                value={meetingForm.meetingUrl}
                onChange={(e) => setMeetingForm(f => ({ ...f, meetingUrl: e.target.value }))}
                placeholder="https://meet.google.com/..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewMeeting(false)}>Abbrechen</Button>
            <Button
              onClick={() => createMeeting.mutate()}
              disabled={!meetingForm.title.trim() || !meetingForm.startTime || !meetingForm.endTime || createMeeting.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Meeting planen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
