import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bot, MessageSquare, Clock, CheckCircle, AlertTriangle, Star, User, ChevronRight, Search, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { queryClient } from "@/lib/queryClient";
import type { SupportConversation, SupportMessage } from "@shared/schema";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  active: { label: "Aktiv", color: "bg-blue-100 text-blue-700", icon: MessageSquare },
  escalated: { label: "Eskaliert", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  closed: { label: "Geschlossen", color: "bg-gray-100 text-gray-600", icon: CheckCircle },
};

const categoryLabels: Record<string, string> = {
  buchung: "Buchung",
  stornierung: "Stornierung",
  zahlung: "Zahlung",
  empfehlung: "Empfehlung",
  beschwerde: "Beschwerde",
  allgemein: "Allgemein",
};

export default function AdminSupport() {
  const [selectedConvo, setSelectedConvo] = useState<SupportConversation | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  const { data: conversations = [], isLoading } = useQuery<SupportConversation[]>({
    queryKey: ["/api/admin/support/conversations"],
  });

  const { data: messages = [] } = useQuery<SupportMessage[]>({
    queryKey: ["/api/admin/support/conversations", selectedConvo?.id, "messages"],
    enabled: !!selectedConvo,
  });

  const filtered = conversations.filter(c => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (search && !c.summary?.toLowerCase().includes(search.toLowerCase()) && !c.category?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeCount = conversations.filter(c => c.status === "active").length;
  const escalatedCount = conversations.filter(c => c.status === "escalated").length;
  const closedCount = conversations.filter(c => c.status === "closed").length;
  const avgSat = conversations.filter(c => c.satisfaction).reduce((sum, c) => sum + (c.satisfaction || 0), 0) / (conversations.filter(c => c.satisfaction).length || 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">KI-Kundenservice</h1>
            <p className="text-gray-500 text-sm">Alle Kundengespräche mit dem AI-Assistenten</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/support/conversations"] })}
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Aktualisieren
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">Gespräche gesamt</div>
            <div className="text-2xl font-black text-gray-900">{conversations.length}</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">Aktiv</div>
            <div className="text-2xl font-black text-blue-600">{activeCount}</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">Eskaliert</div>
            <div className="text-2xl font-black text-red-600">{escalatedCount}</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">Zufriedenheit</div>
            <div className="flex items-center gap-1">
              <div className="text-2xl font-black text-amber-500">{avgSat > 0 ? avgSat.toFixed(1) : "–"}</div>
              <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Suche..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-300"
            />
          </div>
          {["all", "active", "escalated", "closed"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${filterStatus === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {s === "all" ? "Alle" : statusConfig[s]?.label || s}
            </button>
          ))}
        </div>

        {/* Conversations List */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Laden...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bot className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-400">Noch keine Gespräche</h3>
            <p className="text-gray-400 text-sm mt-1">Kundengespräche erscheinen hier automatisch</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(convo => {
              const sc = statusConfig[convo.status] || statusConfig.active;
              const StatusIcon = sc.icon;
              return (
                <button
                  key={convo.id}
                  onClick={() => setSelectedConvo(convo)}
                  className="w-full bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md hover:border-gray-200 transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <StatusIcon className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-gray-900 truncate">
                        {convo.summary || `Gespräch #${convo.id}`}
                      </span>
                      <Badge className={`text-[10px] ${sc.color}`}>{sc.label}</Badge>
                      {convo.category && (
                        <Badge variant="outline" className="text-[10px]">{categoryLabels[convo.category] || convo.category}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{convo.createdAt ? new Date(convo.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}</span>
                      {convo.satisfaction && (
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          {convo.satisfaction}/5
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </button>
              );
            })}
          </div>
        )}

        {/* Conversation Detail Dialog */}
        <Dialog open={!!selectedConvo} onOpenChange={() => setSelectedConvo(null)}>
          <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col p-0 gap-0 rounded-2xl">
            <DialogHeader className="px-5 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
              <DialogTitle className="text-white font-bold">
                Gespräch #{selectedConvo?.id}
                {selectedConvo?.category && (
                  <Badge className="ml-2 bg-white/20 text-white text-xs">{categoryLabels[selectedConvo.category] || selectedConvo.category}</Badge>
                )}
              </DialogTitle>
              <p className="text-white/70 text-xs">
                {selectedConvo?.createdAt ? new Date(selectedConvo.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
              </p>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50/50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-md"
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <span className={`text-[10px] mt-0.5 block ${msg.role === "user" ? "text-white/60" : "text-gray-400"}`}>
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="h-3 w-3 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">Keine Nachrichten vorhanden</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
