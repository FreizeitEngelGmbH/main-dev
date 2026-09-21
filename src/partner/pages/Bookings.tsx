import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { useDemoData } from "../context/demo-data-context";
import { formatEUR, formatDateDE } from "../lib/format";
import type { BookingStatus } from "../mock-data/types";

const statusLabel: Record<BookingStatus, { label: string; variant: "success" | "warning" | "secondary" | "destructive" }> = {
  confirmed: { label: "Bestätigt", variant: "success" },
  pending: { label: "Ausstehend", variant: "warning" },
  completed: { label: "Abgeschlossen", variant: "secondary" },
  cancelled: { label: "Storniert", variant: "destructive" },
};

export default function Bookings() {
  const { bookings, updateBookingStatus } = useDemoData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = bookings.filter((b) => {
    const matchesQuery =
      b.customerName.toLowerCase().includes(query.toLowerCase()) ||
      b.experienceTitle.toLowerCase().includes(query.toLowerCase()) ||
      b.bookingReference.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Buchungen</h1>
        <p className="text-muted-foreground">{bookings.length} Buchungen insgesamt</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Nach Kunde, Erlebnis oder Buchungsnummer suchen…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-56">
          <option value="all">Alle Status</option>
          <option value="pending">Ausstehend</option>
          <option value="confirmed">Bestätigt</option>
          <option value="completed">Abgeschlossen</option>
          <option value="cancelled">Storniert</option>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Kunde</th>
                  <th className="px-4 py-3 font-medium">Erlebnis</th>
                  <th className="px-4 py-3 font-medium">Termin</th>
                  <th className="px-4 py-3 font-medium">Pers.</th>
                  <th className="px-4 py-3 font-medium">Preis</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{b.customerName}</div>
                      <div className="text-xs text-muted-foreground">{b.bookingReference}</div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{b.experienceTitle}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateDE(b.date)}, {b.time}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{b.participants}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{formatEUR(b.totalPrice)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusLabel[b.status].variant}>{statusLabel[b.status].label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {b.status === "pending" && (
                        <Button size="sm" onClick={() => updateBookingStatus(b.id, "confirmed")}>
                          Bestätigen
                        </Button>
                      )}
                      {b.status === "confirmed" && (
                        <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, "completed")}>
                          Abschließen
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      Keine Buchungen gefunden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
