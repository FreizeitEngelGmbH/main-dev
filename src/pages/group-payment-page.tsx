import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Sparkles, MapPin, Calendar as CalendarIcon, Clock, Users, ArrowLeft, CreditCard, CheckCircle2, AlertCircle, Heart, ShieldCheck, X } from "lucide-react";

export default function GroupPaymentPage() {
  const [, params] = useRoute("/gruppen/zahlen/:token");
  const [location, navigate] = useLocation();
  const token = params?.token || "";
  const { toast } = useToast();
  const [selected, setSelected] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const successFlag = urlParams?.get("success") === "1";
  const cancelledFlag = urlParams?.get("cancelled") === "1";
  const sessionId = urlParams?.get("session_id");

  const { data, isLoading, error, refetch } = useQuery<any>({
    queryKey: ["/api/group-payment/info", token],
    queryFn: async () => {
      const r = await fetch(`/api/group-payment/info/${token}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Fehler");
      return d;
    },
  });

  useEffect(() => {
    if (successFlag && sessionId && !verifyResult) {
      setVerifying(true);
      fetch(`/api/group-payment/verify/${sessionId}`)
        .then(r => r.json())
        .then(res => {
          setVerifyResult(res);
          setVerifying(false);
          if (res.paid) {
            toast({ title: "✅ Zahlung erfolgreich!", description: res.coveredCount > 0 ? `Dein Anteil + ${res.coveredCount} weitere Anteil(e) wurden bezahlt.` : "Dein Anteil ist beglichen." });
            refetch();
          } else {
            toast({ title: "Zahlung noch nicht bestätigt", description: "Bitte versuche es in wenigen Sekunden erneut.", variant: "destructive" });
          }
        })
        .catch(() => setVerifying(false));
    }
  }, [successFlag, sessionId]);

  const handlePay = async () => {
    setSubmitting(true);
    try {
      const r = await apiRequest("POST", "/api/group-payment/checkout", { token, alsoForMemberIds: selected });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      window.location.href = d.url;
    } catch (e: any) {
      toast({ title: "Zahlung fehlgeschlagen", description: e.message, variant: "destructive" });
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="max-w-2xl mx-auto p-6"><Skeleton className="h-96" /></div>;
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold mb-2">Zahlungslink ungültig</h2>
            <p className="text-gray-600 mb-4">Der Link ist abgelaufen oder ungültig. Wenn du Hilfe brauchst, melde dich bei uns.</p>
            <Link href="/gruppen"><Button>Zu den Gruppen</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { member, group, otherMembers, pricePerPerson } = data;
  const price = parseFloat(pricePerPerson);
  const eligibleOthers = otherMembers.filter((o: any) => o.paymentStatus !== "paid" && o.paymentStatus !== "covered");
  const totalShares = 1 + selected.length;
  const totalAmount = (price * totalShares).toFixed(2);
  const dateStr = new Date(group.activityDate).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const timeStr = new Date(group.activityDate).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

  const isPaid = member.paymentStatus === "paid" || member.paymentStatus === "covered";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50/30 py-6">
      <div className="max-w-2xl mx-auto px-4">
        <Link href={`/gruppen/${group.id}`}><Button variant="ghost" size="sm" className="mb-2 gap-1" data-testid="link-back-group"><ArrowLeft className="h-4 w-4" /> Zur Gruppe</Button></Link>

        {verifying && (
          <Card className="mb-4 border-blue-200 bg-blue-50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
              <span className="text-blue-900 font-medium">Zahlung wird bestätigt…</span>
            </CardContent>
          </Card>
        )}

        {cancelledFlag && (
          <Card className="mb-4 border-amber-200 bg-amber-50">
            <CardContent className="p-4 flex items-center gap-3">
              <X className="h-5 w-5 text-amber-700" />
              <span className="text-amber-900">Du hast die Zahlung abgebrochen. Du kannst es jederzeit erneut versuchen.</span>
            </CardContent>
          </Card>
        )}

        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4" />
              <Badge className="bg-white/20 text-white border-0 text-[10px]">MACH-MIT-GRUPPE BESTÄTIGT</Badge>
            </div>
            <h1 className="text-2xl font-black mb-2">{group.title}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-purple-100">
              <span className="flex items-center gap-1"><CalendarIcon className="h-4 w-4" /> {dateStr}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {timeStr} Uhr</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {group.city}</span>
            </div>
          </div>

          <CardContent className="p-6 space-y-4">
            {isPaid ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-emerald-700 mb-1">
                  {member.paymentStatus === "covered" ? "Dein Anteil wurde übernommen" : "Bezahlt – danke!"}
                </h2>
                <p className="text-sm text-gray-600">
                  {member.paymentStatus === "covered"
                    ? "Jemand aus deiner Gruppe hat deinen Anteil mit übernommen. Du musst nichts mehr tun."
                    : `Dein Anteil von ${member.amountPaid} € ist beglichen. Du erhältst die Bestätigung per E-Mail.`}
                </p>
                <Link href={`/gruppen/${group.id}`}><Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">Zur Gruppe</Button></Link>
              </div>
            ) : (
              <>
                <div className="bg-purple-50 border-l-4 border-purple-600 p-3 rounded-r-lg">
                  <p className="text-sm text-purple-900">
                    <strong>Hi {member.name}</strong> — die Gruppe ist komplett. Bitte zahle deinen Anteil sicher über FreizeitEngel, damit der Termin verbindlich ist.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Dein Anteil</div>
                      <div className="text-3xl font-black text-purple-700">{price.toFixed(2)} €</div>
                    </div>
                    <Badge variant="outline" className="capitalize">{group.category}</Badge>
                  </div>

                  {eligibleOthers.length > 0 && (
                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-pink-500" />
                        <Label className="text-sm font-semibold">Sammelzahlung – Anteile mit übernehmen</Label>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">Du gehst mit Freunden und willst direkt für sie mit zahlen? Wähle hier aus, für wen du den Anteil übernimmst – sie bekommen eine Zahlungsbestätigung statt einer Aufforderung.</p>
                      <div className="space-y-2">
                        {eligibleOthers.map((o: any) => (
                          <label key={o.id} className="flex items-center gap-3 p-2 rounded hover:bg-pink-50 cursor-pointer border" data-testid={`checkbox-cover-${o.id}`}>
                            <Checkbox
                              checked={selected.includes(o.id)}
                              onCheckedChange={(c) => setSelected(c ? [...selected, o.id] : selected.filter(x => x !== o.id))}
                              className="data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{o.name}</div>
                              <div className="text-[10px] text-gray-500">noch nicht bezahlt</div>
                            </div>
                            <div className="text-sm text-pink-600 font-semibold">+ {price.toFixed(2)} €</div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-3 mt-3 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Gesamt {totalShares > 1 && <span className="text-xs">({totalShares} Anteile)</span>}
                    </div>
                    <div className="text-2xl font-black text-gray-900">{totalAmount} €</div>
                  </div>
                </div>

                <Button
                  onClick={handlePay}
                  disabled={submitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-base font-bold gap-2"
                  data-testid="button-pay-now"
                >
                  <CreditCard className="h-5 w-5" />
                  {submitting ? "Zahlung wird gestartet…" : `${totalAmount} € sicher bezahlen`}
                </Button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500">
                  <ShieldCheck className="h-3 w-3" />
                  Zahlung sicher abgewickelt über Stripe · SSL-verschlüsselt
                </div>
              </>
            )}

            {otherMembers.length > 0 && (
              <div className="border-t pt-4 mt-2">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                  <Users className="h-3 w-3" /> Gruppen-Status ({otherMembers.length + 1} Mitglieder)
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-1.5 rounded bg-purple-50">
                    <span className="font-medium">{member.name} (du)</span>
                    {isPaid ? <Badge className="bg-emerald-600">Bezahlt</Badge> : <Badge variant="outline">Offen</Badge>}
                  </div>
                  {otherMembers.map((o: any) => (
                    <div key={o.id} className="flex items-center justify-between p-1.5 rounded">
                      <span>{o.name}</span>
                      {o.paymentStatus === "paid" ? <Badge className="bg-emerald-600">Bezahlt</Badge>
                        : o.paymentStatus === "covered" ? <Badge className="bg-pink-500">Übernommen</Badge>
                        : <Badge variant="outline">Offen</Badge>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Label(props: any) {
  return <label {...props} className={(props.className || "") + " text-sm font-medium leading-none"} />;
}
