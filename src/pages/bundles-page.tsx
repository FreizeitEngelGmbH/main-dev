import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Calendar, CheckCircle2, Gift, MapPin, Sparkles } from "lucide-react";

type Bundle = {
  id: number;
  slug: string;
  city: string;
  title: string;
  tagline: string | null;
  hero_image_url: string | null;
  num_activities: number;
  num_surprises: number;
  price_per_person: string;
  duration_weeks: number;
};

function formatEUR(s: string) {
  const n = parseFloat(s);
  return isNaN(n) ? s : n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

function BundleCard({ b }: { b: Bundle }) {
  return (
    <Link href={`/bundles/${b.slug}`}>
      <Card className="overflow-hidden cursor-pointer group hover:shadow-xl transition-shadow border-2 border-transparent hover:border-[#6C2BD9]/40 h-full flex flex-col" data-testid={`card-bundle-${b.slug}`}>
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#6C2BD9] to-[#3D1A78]">
          {b.hero_image_url && (
            <img src={b.hero_image_url} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            <Badge className="bg-white/95 text-[#3D1A78] border-0 font-bold gap-1"><MapPin className="h-3 w-3" />{b.city}</Badge>
            <Badge className="bg-[#FFC83D] text-[#3D1A78] border-0 font-bold gap-1"><Gift className="h-3 w-3" />Stadt-Paket</Badge>
          </div>
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h3 className="text-xl font-black drop-shadow">{b.title}</h3>
            {b.tagline && <p className="text-sm text-white/90 mt-0.5 line-clamp-2">{b.tagline}</p>}
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="grid grid-cols-3 gap-2 text-center mb-4">
            <div className="bg-purple-50 rounded-lg py-2">
              <div className="text-lg font-black text-[#6C2BD9]">{b.num_activities}</div>
              <div className="text-[10px] text-gray-600 leading-tight">Aktivitäten</div>
            </div>
            <div className="bg-amber-50 rounded-lg py-2">
              <div className="text-lg font-black text-amber-600 flex items-center justify-center gap-0.5"><Sparkles className="h-3.5 w-3.5" />{b.num_surprises}</div>
              <div className="text-[10px] text-gray-600 leading-tight">Überraschung</div>
            </div>
            <div className="bg-gray-50 rounded-lg py-2">
              <div className="text-lg font-black text-gray-800">{b.duration_weeks}</div>
              <div className="text-[10px] text-gray-600 leading-tight">Wochen</div>
            </div>
          </div>
          <div className="mt-auto flex items-end justify-between">
            <div>
              <div className="text-xs text-gray-500">ab</div>
              <div className="text-2xl font-black text-[#3D1A78]">{formatEUR(b.price_per_person)}</div>
              <div className="text-xs text-gray-500">pro Person</div>
            </div>
            <Button className="bg-[#6C2BD9] hover:bg-[#3D1A78] text-white font-bold rounded-full px-4 gap-1" data-testid={`button-bundle-${b.slug}`}>
              Ansehen <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function BundlesListPage() {
  const { data: bundles, isLoading } = useQuery<Bundle[]>({ queryKey: ["/api/bundles"] });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 to-white">
      <div className="bg-gradient-to-br from-[#3D1A78] via-[#6C2BD9] to-[#A78BFA] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur text-white text-[11px] font-bold px-3 py-1 rounded-full mb-3">
            <Gift className="h-3 w-3" /> NEU: STADT-PAKETE
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">Erlebnis-Bundles je Stadt</h1>
          <p className="text-white/90 mt-3 max-w-2xl text-base md:text-lg">
            Wir kuratieren euch <strong>7 Aktivitäten + 1 Überraschung</strong> – Termine, Reservierungen
            und Sammelzahlung übernehmen wir. Ihr genießt nur. Perfekt für Teams, Geburtstage und Freundeskreise.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/90">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" />Wir planen alle Termine</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" />Sammelzahlung & Rechnung</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" />Überraschungs-Aktivität inklusive</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Card key={i} className="h-96 animate-pulse bg-gray-100" />)}
          </div>
        ) : !bundles?.length ? (
          <Card className="p-10 text-center text-gray-500">Aktuell sind keine Bundles online.</Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map(b => <BundleCard key={b.id} b={b} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// STATIC: the source POSTs the inquiry to /api/bundles/:slug/inquiry. This build
// keeps the same form but explains that inquiries cannot be sent yet.
function InquiryDialog({ bundle }: { bundle: Bundle }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", participants: "4", preferredStart: "", message: "" });
  const { toast } = useToast();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-[#6C2BD9] hover:bg-[#3D1A78] text-white font-bold rounded-full px-6 gap-2 shadow-lg" data-testid="button-inquire-bundle">
          Bundle anfragen <ArrowRight className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{bundle.title} anfragen</DialogTitle>
          <DialogDescription>Wir planen euch alle Aktivitäten – Termine, Reservierungen und Sammelzahlung. Antwort innerhalb von 24 Stunden.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); toast({ title: "Nicht verfügbar", description: "Bundle-Anfragen können in dieser Version noch nicht gesendet werden." }); }} className="space-y-3">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input id="name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} data-testid="input-bundle-name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="email">E-Mail *</Label>
              <Input id="email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} data-testid="input-bundle-email" />
            </div>
            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} data-testid="input-bundle-phone" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="participants">Teilnehmer *</Label>
              <Input id="participants" type="number" min={1} required value={form.participants} onChange={e => setForm({ ...form, participants: e.target.value })} data-testid="input-bundle-participants" />
            </div>
            <div>
              <Label htmlFor="start">Wunsch-Start</Label>
              <Input id="start" type="month" value={form.preferredStart} onChange={e => setForm({ ...form, preferredStart: e.target.value })} data-testid="input-bundle-start" />
            </div>
          </div>
          <div>
            <Label htmlFor="message">Nachricht (optional)</Label>
            <Textarea id="message" rows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Anlass, Wochentag-Wünsche, etc." data-testid="input-bundle-message" />
          </div>
          <Button type="submit" className="w-full bg-[#6C2BD9] hover:bg-[#3D1A78]" data-testid="button-submit-bundle">
            Anfrage senden
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Bundle detail (`/bundles/:slug`), adapted from the source app's BundleDetailPage.
 * STATIC: reads the bundle from the same `/api/bundles` list query the list page
 * uses (no extra endpoint). The list has no per-station items, participant range
 * or description, so those parts are left out and the stations are announced
 * honestly as not yet available.
 */
export function BundleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: bundles, isLoading } = useQuery<Bundle[]>({ queryKey: ["/api/bundles"] });
  const bundle = bundles?.find((b) => b.slug === slug);

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">Lädt…</div>;
  if (!bundle) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">
        <p>Bundle nicht gefunden.</p>
        <Link href="/bundles"><Button variant="outline" className="mt-4">Alle Bundles</Button></Link>
      </div>
    );
  }

  const totalActivities = bundle.num_activities + bundle.num_surprises;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <Link href="/bundles">
          <Button variant="ghost" size="sm" className="gap-1" data-testid="button-back-bundles">
            <ArrowLeft className="h-4 w-4" /> Alle Bundles
          </Button>
        </Link>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-6">
        <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-[#3D1A78] to-[#6C2BD9]">
          {bundle.hero_image_url && (
            <img src={bundle.hero_image_url} alt={bundle.title} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end text-white">
            <div className="flex gap-1.5 flex-wrap mb-3">
              <Badge className="bg-white/95 text-[#3D1A78] border-0 font-bold gap-1"><MapPin className="h-3 w-3" />{bundle.city}</Badge>
              <Badge className="bg-[#FFC83D] text-[#3D1A78] border-0 font-bold gap-1"><Gift className="h-3 w-3" />Stadt-Paket</Badge>
              <Badge className="bg-white/20 border-0 text-white backdrop-blur">{totalActivities} Aktivitäten in {bundle.duration_weeks} Wochen</Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-black drop-shadow-lg">{bundle.title}</h1>
            {bundle.tagline && <p className="text-white/90 mt-2 text-base md:text-lg max-w-3xl">{bundle.tagline}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mt-6">
          <div>
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">Eure Aktivitäten</h2>
                <p className="text-sm text-gray-600">Termine planen wir gemeinsam mit euch</p>
              </div>
            </div>
            <Card className="p-5 border-dashed" data-testid="bundle-stations-unavailable">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-[#6C2BD9] mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700">
                  Die einzelnen Stationen dieses Pakets ({bundle.num_activities} Aktivitäten + {bundle.num_surprises} Überraschung) sind in dieser Version noch nicht verfügbar.
                </p>
              </div>
            </Card>
          </div>

          <div className="lg:sticky lg:top-20 self-start">
            <Card className="p-5 border-2 border-[#6C2BD9]/30">
              <div className="text-xs text-gray-500">ab</div>
              <div className="text-4xl font-black text-[#3D1A78]">{formatEUR(bundle.price_per_person)}</div>
              <div className="text-sm text-gray-500 mb-4">pro Person</div>

              <div className="space-y-2 text-sm mb-5 border-t border-b py-4">
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[#6C2BD9]" /><span className="text-gray-700">{bundle.duration_weeks} Wochen Laufzeit</span></div>
                <div className="flex items-center gap-2"><Gift className="h-4 w-4 text-[#FFC83D]" /><span className="text-gray-700">{bundle.num_activities} fixe + {bundle.num_surprises} Überraschung</span></div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#6C2BD9]" /><span className="text-gray-700">Komplett in {bundle.city}</span></div>
              </div>

              <ul className="space-y-2 text-sm text-gray-700 mb-5">
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#6C2BD9] shrink-0 mt-0.5" />Wir planen alle Termine für euch</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#6C2BD9] shrink-0 mt-0.5" />Sammelzahlung & Rechnungskauf</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#6C2BD9] shrink-0 mt-0.5" />Persönlicher Event-Berater</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#6C2BD9] shrink-0 mt-0.5" />Stornierung bis 7 Tage vorher</li>
              </ul>

              <InquiryDialog bundle={bundle} />
              <div className="text-[11px] text-gray-500 text-center mt-2">Unverbindliche Anfrage · Antwort &lt; 24 h</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
