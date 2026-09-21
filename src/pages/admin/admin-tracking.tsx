import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { QRCode } from "@/components/ui/qr-code";
import { Link2, Plus, Copy, Trash2, QrCode, BarChart3, MousePointerClick, Users, Calendar, ExternalLink, Download } from "lucide-react";

type TLink = {
  id: number; name: string; slug: string; targetUrl: string;
  campaign: string | null; notes: string | null;
  clicks: number; uniqueClicks: number;
  lastClickAt: string | null; createdAt: string;
};

function shortUrl(slug: string) {
  return `${window.location.origin}/t/${slug}`;
}

function CreateDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", targetUrl: "", campaign: "", notes: "" });

  const create = useMutation({
    mutationFn: async () => {
      const slug = form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 30) || Math.random().toString(36).slice(2, 8);
      const r = await apiRequest("POST", "/api/admin/tracking-links", { ...form, slug });
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tracking-links"] });
      toast({ title: "Link erstellt" });
      setOpen(false);
      setForm({ name: "", slug: "", targetUrl: "", campaign: "", notes: "" });
    },
    onError: (e: any) => toast({ title: "Fehler", description: e.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-new-link" className="gap-2"><Plus className="h-4 w-4" /> Neuer Tracking-Link</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Neuer Tracking-Link</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Name (intern)</Label>
            <Input data-testid="input-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="z.B. Newsletter Mai – Bowling-Aktion" />
          </div>
          <div>
            <Label>Ziel-URL</Label>
            <Input data-testid="input-target" value={form.targetUrl} onChange={(e) => setForm({ ...form, targetUrl: e.target.value })} placeholder="https://freizeitengel.com/erlebnis/..." />
          </div>
          <div>
            <Label>Kurz-Slug (optional)</Label>
            <Input data-testid="input-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.replace(/[^a-zA-Z0-9_-]/g, "") })} placeholder="z.B. mai-bowling" />
          </div>
          <div>
            <Label>Kampagne (optional)</Label>
            <Input data-testid="input-campaign" value={form.campaign} onChange={(e) => setForm({ ...form, campaign: e.target.value })} placeholder="z.B. Newsletter Mai 2026" />
          </div>
          <div>
            <Label>Notizen</Label>
            <Textarea data-testid="input-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button data-testid="button-create" onClick={() => create.mutate()} disabled={!form.name || !form.targetUrl || create.isPending}>
            {create.isPending ? "Erstelle…" : "Erstellen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LinkDetail({ link, onClose }: { link: TLink; onClose: () => void }) {
  const { data: daily } = useQuery<Array<{ date: string; clicks: number }>>({ queryKey: ["/api/admin/tracking-links", link.id, "daily"] });
  const { data: clicks } = useQuery<Array<any>>({ queryKey: ["/api/admin/tracking-links", link.id, "clicks"] });
  const max = Math.max(1, ...(daily || []).map(d => d.clicks));
  const url = shortUrl(link.slug);

  const downloadQr = () => {
    const canvas = document.querySelector(`#qr-detail-${link.id} canvas`) as HTMLCanvasElement | null;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `qr-${link.slug}.png`;
    a.click();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{link.name}</DialogTitle></DialogHeader>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div id={`qr-detail-${link.id}`} className="bg-white p-4 rounded-lg border inline-block">
              <QRCode value={url} size={220} />
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" className="gap-1" onClick={downloadQr}><Download className="h-3.5 w-3.5" /> QR herunterladen</Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => { navigator.clipboard.writeText(url); }}><Copy className="h-3.5 w-3.5" /> URL kopieren</Button>
            </div>
            <div className="mt-3 text-xs text-gray-500 break-all">
              <div><strong>Kurz-URL:</strong> {url}</div>
              <div className="mt-1"><strong>Ziel:</strong> {link.targetUrl}</div>
              {link.campaign && <div className="mt-1"><strong>Kampagne:</strong> {link.campaign}</div>}
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-gray-500">Klicks gesamt</div>
                <div className="text-2xl font-black text-purple-700">{link.clicks}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-gray-500">Eindeutige Klicks</div>
                <div className="text-2xl font-black text-emerald-600">{link.uniqueClicks}</div>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-2">Klicks der letzten 30 Tage</div>
              <div className="flex items-end gap-1 h-32 border rounded-lg p-2 bg-gray-50">
                {(daily || []).length === 0 && <div className="text-xs text-gray-400 m-auto">Noch keine Daten</div>}
                {(daily || []).map(d => (
                  <div key={d.date} className="flex-1 flex flex-col items-center justify-end" title={`${d.date}: ${d.clicks}`}>
                    <div className="w-full bg-purple-500 rounded-t" style={{ height: `${(d.clicks / max) * 100}%`, minHeight: 2 }} />
                    <div className="text-[8px] text-gray-400 mt-1 rotate-45 origin-top-left">{d.date.slice(5)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-xs font-semibold text-gray-700 mb-2">Letzte Klicks</div>
          <div className="border rounded-lg max-h-48 overflow-y-auto">
            {(clicks || []).length === 0 ? (
              <div className="p-4 text-xs text-gray-400 text-center">Noch keine Klicks</div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-left">
                  <tr><th className="p-2">Zeit</th><th className="p-2">Eindeutig</th><th className="p-2">Referrer</th><th className="p-2">User-Agent</th></tr>
                </thead>
                <tbody>
                  {(clicks || []).map((c: any) => (
                    <tr key={c.id} className="border-t">
                      <td className="p-2">{new Date(c.clickedAt).toLocaleString("de-DE")}</td>
                      <td className="p-2">{c.isUnique ? <Badge className="bg-emerald-100 text-emerald-800">neu</Badge> : "–"}</td>
                      <td className="p-2 max-w-[150px] truncate">{c.referrer || "–"}</td>
                      <td className="p-2 max-w-[200px] truncate text-gray-500">{c.userAgent || "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminTracking() {
  const { toast } = useToast();
  const [selected, setSelected] = useState<TLink | null>(null);
  const { data: links, isLoading } = useQuery<TLink[]>({ queryKey: ["/api/admin/tracking-links"] });

  const del = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/tracking-links/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/tracking-links"] }); toast({ title: "Link gelöscht" }); },
  });

  const totalClicks = (links || []).reduce((s, l) => s + l.clicks, 0);
  const totalUnique = (links || []).reduce((s, l) => s + l.uniqueClicks, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Link2 className="h-7 w-7 text-purple-700" /> Link- & QR-Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">Erstelle kurze Links und QR-Codes für E-Mail-Kampagnen und verfolge Klicks in Echtzeit.</p>
        </div>
        <CreateDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><Link2 className="h-8 w-8 text-purple-600" /><div><div className="text-2xl font-black">{links?.length || 0}</div><div className="text-xs text-gray-500">Aktive Links</div></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><MousePointerClick className="h-8 w-8 text-blue-600" /><div><div className="text-2xl font-black">{totalClicks}</div><div className="text-xs text-gray-500">Klicks gesamt</div></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><Users className="h-8 w-8 text-emerald-600" /><div><div className="text-2xl font-black">{totalUnique}</div><div className="text-xs text-gray-500">Eindeutige Klicks</div></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Alle Links</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : (links || []).length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <Link2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Noch keine Tracking-Links. Erstelle deinen ersten Link für deine Mail-Kampagne!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(links || []).map(l => (
                <div key={l.id} data-testid={`row-link-${l.id}`} className="border rounded-lg p-3 hover:bg-gray-50 flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-semibold text-sm">{l.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><code className="bg-gray-100 px-1.5 py-0.5 rounded">{shortUrl(l.slug)}</code></div>
                    {l.campaign && <Badge variant="outline" className="mt-1 text-[10px]">{l.campaign}</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center"><div className="font-bold text-purple-700">{l.clicks}</div><div className="text-[10px] text-gray-500">Klicks</div></div>
                    <div className="text-center"><div className="font-bold text-emerald-600">{l.uniqueClicks}</div><div className="text-[10px] text-gray-500">Unique</div></div>
                    <div className="text-center min-w-[80px]"><div className="text-xs text-gray-700">{l.lastClickAt ? new Date(l.lastClickAt).toLocaleDateString("de-DE") : "–"}</div><div className="text-[10px] text-gray-500">letzter Klick</div></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" data-testid={`button-copy-${l.id}`} onClick={() => { navigator.clipboard.writeText(shortUrl(l.slug)); toast({ title: "Kopiert" }); }}><Copy className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" data-testid={`button-detail-${l.id}`} onClick={() => setSelected(l)}><QrCode className="h-4 w-4" /></Button>
                    <a href={l.targetUrl} target="_blank" rel="noreferrer"><Button size="sm" variant="ghost"><ExternalLink className="h-4 w-4" /></Button></a>
                    <Button size="sm" variant="ghost" className="text-red-600" data-testid={`button-delete-${l.id}`} onClick={() => { if (confirm(`Link "${l.name}" löschen?`)) del.mutate(l.id); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selected && <LinkDetail link={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
