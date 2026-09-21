import { Download, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useDemoData } from "../context/demo-data-context";
import { formatEUR } from "../lib/format";
import type { PayoutStatus } from "../mock-data/types";

const statusLabel: Record<PayoutStatus, { label: string; variant: "success" | "warning" | "secondary" }> = {
  paid: { label: "Ausgezahlt", variant: "success" },
  processing: { label: "In Bearbeitung", variant: "warning" },
  pending: { label: "Ausstehend", variant: "secondary" },
};

export default function Payouts() {
  const { payouts } = useDemoData();
  const totalPaid = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.netAmount, 0);
  const nextPayout = payouts.find((p) => p.status !== "paid");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Auszahlungen</h1>
        <p className="text-muted-foreground">Provisionsabrechnung und Auszahlungshistorie</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-success/10 text-success">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{formatEUR(totalPaid)}</div>
              <div className="text-sm text-muted-foreground">Bereits ausgezahlt (gesamt)</div>
            </div>
          </CardContent>
        </Card>
        {nextPayout && (
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{formatEUR(nextPayout.netAmount)}</div>
                <div className="text-sm text-muted-foreground">
                  Nächste Auszahlung · {nextPayout.period}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Abrechnungen</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Zeitraum</th>
                  <th className="px-4 py-3 font-medium">Buchungen</th>
                  <th className="px-4 py-3 font-medium">Brutto</th>
                  <th className="px-4 py-3 font-medium">Provision</th>
                  <th className="px-4 py-3 font-medium">Netto</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Beleg</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                    <td className="px-4 py-3 font-medium text-foreground">{p.period}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.bookingsCount}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatEUR(p.grossAmount)}</td>
                    <td className="px-4 py-3 text-muted-foreground">−{formatEUR(p.commission)}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">{formatEUR(p.netAmount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusLabel[p.status].variant}>{statusLabel[p.status].label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.status === "paid" && (
                        <Button size="sm" variant="outline">
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
