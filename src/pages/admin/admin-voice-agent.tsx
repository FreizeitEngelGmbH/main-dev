import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import AdminLayout from "./admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Clock, PhoneCall, MessageSquare, CheckCircle2, AlertCircle, Database, Search, RefreshCw } from "lucide-react";

interface Callback {
  id: number;
  sessionId: string;
  topic: string;
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  preferredTime?: string;
  notes?: string;
  payload?: any;
  status: string;
  createdAt: string;
}

interface Conversation {
  id: number;
  sessionId: string;
  topic?: string;
  durationSeconds?: number;
  transcript?: { role: string; text: string; ts: number }[];
  toolCalls?: { name: string; args: any; result: any; ts: number }[];
  outcome?: string;
  startedAt: string;
  endedAt?: string;
}

interface Stats {
  totalCalls: number;
  avgDuration: number;
  openCallbacks: number;
  totalCallbacks: number;
  topicCounts: Record<string, number>;
}

const topicLabel: Record<string, string> = {
  birthday: "🎂 Kindergeburtstag",
  group: "👥 Gruppe",
  booking: "🎟️ Buchung",
  partner: "🏪 Partner",
  callback: "📞 Rückruf",
  general: "💬 Allgemein",
};

const statusColor: Record<string, string> = {
  new: "bg-amber-100 text-amber-800 border-amber-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  done: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function AdminVoiceAgent() {
  const stats = useQuery<Stats>({ queryKey: ["/api/admin/voice-agent/stats"] });
  const callbacks = useQuery<Callback[]>({ queryKey: ["/api/admin/voice-agent/callbacks"] });
  const convos = useQuery<Conversation[]>({ queryKey: ["/api/admin/voice-agent/conversations"] });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) =>
      apiRequest("PATCH", `/api/admin/voice-agent/callbacks/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/voice-agent/callbacks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/voice-agent/stats"] });
    },
  });

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,#6C2BD9,#3D1A78)" }}>
              <Phone className="h-5 w-5" />
            </span>
            Voice-Agent
          </h1>
          <p className="text-gray-600 mt-1">Browser-Voice-Widget · 5 MVP-Themen · OpenAI Realtime</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<PhoneCall className="h-5 w-5" />} label="Gespräche gesamt" value={stats.data?.totalCalls ?? "—"} />
          <StatCard icon={<Clock className="h-5 w-5" />} label="Ø Dauer" value={stats.data ? `${stats.data.avgDuration}s` : "—"} />
          <StatCard icon={<AlertCircle className="h-5 w-5" />} label="Offene Rückrufe" value={stats.data?.openCallbacks ?? "—"} highlight={!!stats.data?.openCallbacks} />
          <StatCard icon={<MessageSquare className="h-5 w-5" />} label="Anfragen gesamt" value={stats.data?.totalCallbacks ?? "—"} />
        </div>

        <Tabs defaultValue="callbacks">
          <TabsList>
            <TabsTrigger value="callbacks">Rückrufe & Anfragen ({callbacks.data?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="conversations">Gespräche ({convos.data?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="rag">Wissensbasis (RAG)</TabsTrigger>
          </TabsList>

          <TabsContent value="callbacks" className="space-y-3">
            {callbacks.isLoading && <p className="text-sm text-gray-500">Lade…</p>}
            {callbacks.data?.length === 0 && (
              <Card><CardContent className="p-8 text-center text-gray-500">Noch keine Anfragen über den Voice-Agent.</CardContent></Card>
            )}
            {callbacks.data?.map(cb => (
              <Card key={cb.id} className="border-l-4" style={{ borderLeftColor: "#6C2BD9" }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline">{topicLabel[cb.topic] || cb.topic}</Badge>
                        <Badge className={statusColor[cb.status] || ""}>{cb.status}</Badge>
                        <span className="text-xs text-gray-500">{new Date(cb.createdAt).toLocaleString("de-DE")}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {cb.name && <Field label="Name" value={cb.name} />}
                        {cb.phone && <Field label="Telefon" value={cb.phone} />}
                        {cb.email && <Field label="E-Mail" value={cb.email} />}
                        {cb.city && <Field label="Stadt" value={cb.city} />}
                        {cb.preferredTime && <Field label="Wunschzeit" value={cb.preferredTime} />}
                      </div>
                      {cb.notes && <p className="text-sm text-gray-700 mt-2 italic">„{cb.notes}"</p>}
                      {cb.payload && Object.keys(cb.payload).length > 0 && (
                        <pre className="text-xs bg-gray-50 rounded p-2 mt-2 overflow-x-auto">{JSON.stringify(cb.payload, null, 2)}</pre>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      {cb.status === "new" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: cb.id, status: "in_progress" })}>
                          In Bearbeitung
                        </Button>
                      )}
                      {cb.status !== "done" && (
                        <Button size="sm" onClick={() => updateStatus.mutate({ id: cb.id, status: "done" })} style={{ background: "#6C2BD9" }}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Erledigt
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="conversations" className="space-y-3">
            {convos.isLoading && <p className="text-sm text-gray-500">Lade…</p>}
            {convos.data?.length === 0 && (
              <Card><CardContent className="p-8 text-center text-gray-500">Noch keine Gespräche.</CardContent></Card>
            )}
            {convos.data?.map(c => (
              <Card key={c.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between flex-wrap gap-2">
                    <span>#{c.id} · {c.topic || "—"}</span>
                    <span className="text-xs font-normal text-gray-500">
                      {new Date(c.startedAt).toLocaleString("de-DE")} · {c.durationSeconds || 0}s
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(c.transcript || []).length === 0 && <p className="text-xs text-gray-400">Kein Transkript.</p>}
                  {(c.transcript || []).map((l, i) => (
                    <div key={i} className={`text-sm ${l.role === "user" ? "text-gray-900" : "text-[#6C2BD9]"}`}>
                      <span className="font-semibold text-xs uppercase mr-2">{l.role === "user" ? "Kunde" : "Engel"}:</span>
                      {l.text}
                    </div>
                  ))}
                  {(c.toolCalls || []).length > 0 && (
                    <details className="text-xs mt-2">
                      <summary className="cursor-pointer text-gray-500">Tool-Aufrufe ({c.toolCalls!.length})</summary>
                      <pre className="bg-gray-50 rounded p-2 mt-1 overflow-x-auto">{JSON.stringify(c.toolCalls, null, 2)}</pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="rag">
            <RagPanel />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

function RagPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const stats = useQuery<{ stats: { source_type: string; count: number }[]; job?: any }>({
    queryKey: ["/api/admin/voice-agent/rag/stats"],
    refetchInterval: (q) => (q.state.data?.job?.running ? 5000 : false),
  });
  const reindex = useMutation({
    mutationFn: async (onlyLive: boolean) =>
      apiRequest("POST", "/api/admin/voice-agent/rag/reindex", { onlyLivePartners: onlyLive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/voice-agent/rag/stats"] }),
  });
  const jobRunning = !!stats.data?.job?.running;
  const test = useMutation({
    mutationFn: async (q: string) => {
      const r = await apiRequest("POST", "/api/admin/voice-agent/rag/test", { query: q, k: 6 });
      return r.json();
    },
    onSuccess: (data: any) => setResults(data.results || []),
  });

  const labels: Record<string, string> = {
    static: "Firmen-Wissen", partner: "Partner", experience: "Angebote",
    kb: "Lexikon", blog: "Blog", group: "Mach-mit-Gruppen",
  };
  const total = (stats.data?.stats || []).reduce((s, x) => s + Number(x.count), 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" style={{ color: "#6C2BD9" }} /> Wissensbasis (RAG)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Der Engel durchsucht diese Wissensbasis per Bedeutungs-Suche (OpenAI Embeddings + pgvector).
            Insgesamt <strong>{total}</strong> Wissens-Bausteine.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {(stats.data?.stats || []).map(s => (
              <div key={s.source_type} className="p-3 rounded-lg border bg-gradient-to-br from-white to-purple-50">
                <p className="text-[10px] uppercase text-gray-500 tracking-wide">{labels[s.source_type] || s.source_type}</p>
                <p className="text-2xl font-bold" style={{ color: "#3D1A78" }}>{s.count}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => reindex.mutate(false)}
              disabled={reindex.isPending || jobRunning}
              style={{ background: "#6C2BD9" }}
              data-testid="button-reindex-all"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${jobRunning ? "animate-spin" : ""}`} />
              {jobRunning ? "Indiziere…" : "Komplett neu indizieren"}
            </Button>
            <Button
              variant="outline"
              onClick={() => reindex.mutate(true)}
              disabled={reindex.isPending || jobRunning}
              data-testid="button-reindex-live"
            >
              Nur Live-Partner indizieren
            </Button>
          </div>
          {jobRunning && (
            <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
              ⏳ Indizierung läuft im Hintergrund (kann mehrere Minuten dauern). Stand wird automatisch aktualisiert.
            </p>
          )}
          {!jobRunning && stats.data?.job?.result && (
            <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded">
              ✅ Letzte Indizierung erfolgreich: {JSON.stringify(stats.data.job.result)}
            </p>
          )}
          {!jobRunning && stats.data?.job?.error && (
            <p className="text-xs text-red-700 bg-red-50 p-2 rounded">
              ❌ Fehler: {stats.data.job.error}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4" /> Wissens-Suche testen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="z.B. Wie werde ich Partner? oder Trampolinhalle Köln Kindergeburtstag"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && query.trim() && test.mutate(query)}
              data-testid="input-rag-query"
            />
            <Button
              onClick={() => query.trim() && test.mutate(query)}
              disabled={test.isPending || !query.trim()}
              style={{ background: "#6C2BD9" }}
              data-testid="button-rag-search"
            >
              {test.isPending ? "…" : "Suchen"}
            </Button>
          </div>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="p-3 rounded-lg border bg-white">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px]">{labels[r.source_type] || r.source_type}</Badge>
                  <span className="font-semibold text-sm">{r.title}</span>
                  <span className="text-xs text-gray-400 ml-auto">
                    Score {Number(r.similarity || 0).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-700 whitespace-pre-wrap">{String(r.content || "").slice(0, 400)}</p>
              </div>
            ))}
            {results.length === 0 && !test.isPending && (
              <p className="text-xs text-gray-400 text-center py-4">Noch keine Suche durchgeführt.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: any; highlight?: boolean }) {
  return (
    <Card className={highlight ? "border-amber-400 bg-amber-50/50" : ""}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: highlight ? "#F59E0B" : "linear-gradient(135deg,#6C2BD9,#3D1A78)" }}>
            {icon}
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase text-gray-400 tracking-wide">{label}</p>
      <p className="truncate text-gray-900">{value}</p>
    </div>
  );
}
