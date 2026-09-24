import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  CalendarDays, 
  Users, 
  Euro, 
  TrendingUp, 
  Eye, 
  MapPin, 
  Clock, 
  Layers, 
  Settings,
  Building2,
  Store,
  ExternalLink,
  Star,
  Ticket,
  BarChart3,
  Plus,
  Edit,
  QrCode,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Code2,
  Package,
  Inbox,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import ResourceManagement from "@/components/partner/ResourceManagement";
import BookingSettings from "@/components/partner/BookingSettings";
import PartnerProfileSettings from "@/components/partner/PartnerProfileSettings";
import ExperienceForm from "@/components/partner/ExperienceForm";
import AngebotEditor from "@/components/partner/AngebotEditor";
import SlotManagement from "@/components/partner/SlotManagement";
import GoogleCalendarConnect from "@/components/partner/GoogleCalendarConnect";
import StripeConnectCard from "@/components/partner/StripeConnectCard";
import ShopKonfiguration from "@/components/partner/ShopKonfiguration";
import WidgetEditor from "@/components/partner/WidgetEditor";

interface BookingWithDetails {
  id: number;
  customerName: string;
  customerEmail: string;
  experienceTitle: string;
  experienceId: number;
  bookingDate: string;
  numberOfPeople: number;
  totalPrice: number;
  status: string;
  notes?: string;
  createdAt: string;
}

interface PartnerStats {
  totalBookings: number;
  totalRevenue: number;
  monthlyBookings: number;
  monthlyRevenue: number;
  averageRating: number;
  totalExperiences: number;
}

interface PartnerProfile {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  location: string;
  category: string;
  description: string;
  website: string;
  logoUrl: string;
  logoBgColor: string;
  approved: boolean;
}

interface Settlement {
  id: string;
  month: string;
  bookings: {
    id: number;
    experienceTitle: string;
    customerName: string;
    date: string;
    numberOfPeople: number;
    totalPrice: number;
    commission: number;
    net: number;
    status: string;
  }[];
  totalRevenue: number;
  commission: number;
  netPayout: number;
  status: string;
}

function SettlementsTab() {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const { data: settlements, isLoading } = useQuery<Settlement[]>({
    queryKey: ["/api/partner/settlements"],
  });

  const handleCsvDownload = (monthId: string) => {
    // STATIC: real file opens a real CSV export API route here. No backend
    // exists in this static build, so avoid attempting that navigation at all.
    void monthId;
    window.alert("CSV-Export ist noch nicht verfügbar.");
  };

  const handleFullCsvDownload = () => {
    if (!settlements || settlements.length === 0) return;
    const allBookings = settlements.flatMap(s => 
      s.bookings.map(b => ({
        ...b,
        settlementMonth: s.month,
        settlementStatus: s.status,
      }))
    );

    const bom = '\uFEFF';
    const header = 'Abrechnungsmonat;Buchungs-Nr;Erlebnis;Kunde;Datum;Personen;Brutto (EUR);Provision 11% (EUR);Netto (EUR);Abrechnungsstatus\n';
    const rows = allBookings.map(b => {
      const dateStr = new Date(b.date).toLocaleDateString('de-DE');
      return `${b.settlementMonth};${b.id};${b.experienceTitle};${b.customerName};${dateStr};${b.numberOfPeople};${b.totalPrice.toFixed(2).replace('.', ',')};${b.commission.toFixed(2).replace('.', ',')};${b.net.toFixed(2).replace('.', ',')};${b.settlementStatus}`;
    }).join('\n');

    const blob = new Blob([bom + header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Abrechnungsarchiv_Gesamt.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-12 text-center text-gray-500">
          Lade Abrechnungen...
        </CardContent>
      </Card>
    );
  }

  const totalOpen = settlements?.filter(s => s.status === "offen").reduce((sum, s) => sum + s.netPayout, 0) || 0;
  const totalPaid = settlements?.filter(s => s.status === "bezahlt").reduce((sum, s) => sum + s.netPayout, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Abrechnungen gesamt</p>
                <p className="text-2xl font-bold">{settlements?.length || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Offen</p>
                <p className="text-2xl font-bold text-amber-600">{totalOpen.toFixed(2).replace('.', ',')} €</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Bezahlt</p>
                <p className="text-2xl font-bold text-green-600">{totalPaid.toFixed(2).replace('.', ',')} €</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Abrechnungsarchiv
              </CardTitle>
              <CardDescription>
                Monatliche Abrechnungen mit Buchungsdetails und CSV-Export
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleFullCsvDownload} disabled={!settlements?.length}>
              <Download className="w-4 h-4 mr-2" />
              Gesamt-CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!settlements || settlements.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Noch keine Abrechnungen vorhanden</p>
              <p className="text-sm mt-1">Abrechnungen werden automatisch aus bestätigten Buchungen erstellt</p>
            </div>
          ) : (
            <div className="space-y-3">
              {settlements.map((settlement) => (
                <div key={settlement.id} className="border rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedMonth(expandedMonth === settlement.id ? null : settlement.id)}
                  >
                    <div className="flex items-center gap-4">
                      {expandedMonth === settlement.id ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{settlement.month}</p>
                        <p className="text-sm text-gray-500">{settlement.bookings.length} Buchungen</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Brutto</p>
                        <p className="font-medium">{settlement.totalRevenue.toFixed(2).replace('.', ',')} €</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Provision</p>
                        <p className="font-medium text-red-500">-{settlement.commission.toFixed(2).replace('.', ',')} €</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Netto</p>
                        <p className="font-bold text-green-600">{settlement.netPayout.toFixed(2).replace('.', ',')} €</p>
                      </div>
                      {settlement.status === "bezahlt" ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Bezahlt
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Offen
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleCsvDownload(settlement.id); }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {expandedMonth === settlement.id && (
                    <div className="border-t bg-gray-50 p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-500 border-b">
                              <th className="pb-2 font-medium">Nr.</th>
                              <th className="pb-2 font-medium">Erlebnis</th>
                              <th className="pb-2 font-medium">Kunde</th>
                              <th className="pb-2 font-medium">Datum</th>
                              <th className="pb-2 font-medium text-center">Pers.</th>
                              <th className="pb-2 font-medium text-right">Brutto</th>
                              <th className="pb-2 font-medium text-right">Provision</th>
                              <th className="pb-2 font-medium text-right">Netto</th>
                            </tr>
                          </thead>
                          <tbody>
                            {settlement.bookings.map((booking) => (
                              <tr key={booking.id} className="border-b border-gray-100 last:border-0">
                                <td className="py-2 text-gray-600">#{booking.id}</td>
                                <td className="py-2 font-medium">{booking.experienceTitle}</td>
                                <td className="py-2 text-gray-600">{booking.customerName}</td>
                                <td className="py-2 text-gray-600">
                                  {new Date(booking.date).toLocaleDateString('de-DE')}
                                </td>
                                <td className="py-2 text-center">{booking.numberOfPeople}</td>
                                <td className="py-2 text-right">{booking.totalPrice.toFixed(2).replace('.', ',')} €</td>
                                <td className="py-2 text-right text-red-500">-{booking.commission.toFixed(2).replace('.', ',')} €</td>
                                <td className="py-2 text-right font-medium text-green-600">{booking.net.toFixed(2).replace('.', ',')} €</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 font-bold">
                              <td className="pt-3" colSpan={5}>Summe</td>
                              <td className="pt-3 text-right">{settlement.totalRevenue.toFixed(2).replace('.', ',')} €</td>
                              <td className="pt-3 text-right text-red-500">-{settlement.commission.toFixed(2).replace('.', ',')} €</td>
                              <td className="pt-3 text-right text-green-600">{settlement.netPayout.toFixed(2).replace('.', ',')} €</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PartnerCommissionInvoices />
    </div>
  );
}

interface PartnerCommInvoice {
  id: number;
  invoiceNumber: string;
  periodMonth: number;
  periodYear: number;
  bookingCount: number;
  grossRevenue: number;
  commissionRate: number;
  commissionNet: number;
  commissionTax: number;
  commissionGross: number;
  status: string;
  issueDate: string | null;
  dueDate: string | null;
  paidDate: string | null;
}

const invoiceMonthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

function PartnerCommissionInvoices() {
  const { data: invoices, isLoading } = useQuery<PartnerCommInvoice[]>({
    queryKey: ["/api/partner/commission-invoices"],
  });

  const fmt = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          Provisionsrechnungen von FreizeitEngel
        </CardTitle>
        <CardDescription>
          Monatliche Provisionsrechnungen (11% + MwSt.) für vermittelte Buchungen
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Lade Rechnungen...</div>
        ) : !invoices || invoices.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Noch keine Provisionsrechnungen vorhanden</p>
            <p className="text-sm mt-1">Rechnungen werden monatlich von FreizeitEngel erstellt</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{inv.invoiceNumber}</p>
                    <p className="text-sm text-gray-500">
                      {invoiceMonthNames[inv.periodMonth - 1]} {inv.periodYear} · {inv.bookingCount} Buchungen
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Rechnungsbetrag</p>
                      <p className="font-bold text-purple-700">{fmt(inv.commissionGross)}€</p>
                      <p className="text-xs text-gray-400">({fmt(inv.commissionNet)}€ + {fmt(inv.commissionTax)}€ MwSt.)</p>
                    </div>
                    {inv.status === "bezahlt" ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Bezahlt
                      </Badge>
                    ) : inv.status === "versendet" ? (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                        <FileText className="w-3 h-3 mr-1" />
                        Versendet
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Offen
                      </Badge>
                    )}
                  </div>
                </div>
                {inv.dueDate && inv.status !== "bezahlt" && (
                  <p className="text-xs text-gray-400 mt-2">
                    Fällig am: {new Date(inv.dueDate).toLocaleDateString("de-DE")}
                  </p>
                )}
                {inv.paidDate && (
                  <p className="text-xs text-green-600 mt-2">
                    Bezahlt am: {new Date(inv.paidDate).toLocaleDateString("de-DE")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PartnerDashboard() {
  const { user } = useAuth();
  const [isExperienceFormOpen, setIsExperienceFormOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<any>(null);
  const [showAngebotEditor, setShowAngebotEditor] = useState(false);
  const [angebotEditorExperience, setAngebotEditorExperience] = useState<any>(null);
  const [viewingBooking, setViewingBooking] = useState<BookingWithDetails | null>(null);

  const { data: profile, isLoading: isLoadingProfile } = useQuery<PartnerProfile>({
    queryKey: ["/api/partner/profile"],
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery<PartnerStats>({
    queryKey: ["/api/partner/stats"],
  });

  const { data: bookings, isLoading: isLoadingBookings } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/partner/bookings"],
  });

  const { data: experiences, isLoading: isLoadingExperiences } = useQuery({
    queryKey: ["/api/partner/experiences"],
  });

  const { data: settlements, isLoading: isLoadingSettlements } = useQuery<Settlement[]>({
    queryKey: ["/api/partner/settlements"],
  });

  if (!user || user.role !== "partner") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Zugriff verweigert</h2>
          <p className="mt-2 text-gray-600">Sie benötigen Partner-Berechtigung für diese Seite.</p>
        </div>
      </div>
    );
  }

  const colorMap: Record<string, string> = {
    black: "#000000",
    white: "#ffffff",
    blue: "#3b82f6",
    red: "#ef4444",
    green: "#22c55e",
    purple: "#8b5cf6",
    orange: "#f97316",
    gray: "#6b7280",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Partner Header mit Logo */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div 
              className="w-20 h-20 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ backgroundColor: colorMap[profile?.logoBgColor || 'black'] || '#000000' }}
            >
              {profile?.logoUrl ? (
                <img 
                  src={profile.logoUrl} 
                  alt={profile.companyName} 
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <Building2 className="w-10 h-10 text-white opacity-70" />
              )}
            </div>
            
            {/* Firmeninfo */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {isLoadingProfile ? "Lade..." : profile?.companyName || "Partner-Dashboard"}
                </h1>
                {profile?.approved ? (
                  <Badge className="bg-green-500 hover:bg-green-600">
                    <Star className="w-3 h-3 mr-1" />
                    Verifiziert
                  </Badge>
                ) : (
                  <Badge variant="secondary">Ausstehend</Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-purple-200 text-sm">
                {profile?.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.city}
                  </span>
                )}
                {profile?.category && (
                  <span className="flex items-center gap-1">
                    <Layers className="w-4 h-4" />
                    {profile.category}
                  </span>
                )}
                {profile?.id && (
                  <Link href={`/partners/${profile.id}`}>
                    <span
                      className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors"
                      data-testid="link-my-shop"
                    >
                      <Store className="w-4 h-4" />
                      Mein Shop
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="hidden md:flex flex-wrap gap-2">
              <Link href="/partner/inquiries">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Inbox className="w-4 h-4 mr-2" />
                  Anfragen
                </Button>
              </Link>
              <Link href="/partner/group-activities">
                <Button size="sm" className="bg-pink-600 hover:bg-pink-700" data-testid="button-partner-groups">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Mach-mit-Gruppen
                </Button>
              </Link>
              <Link href="/partner/scanner">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <QrCode className="w-4 h-4 mr-2" />
                  QR-Scanner
                </Button>
              </Link>
              <Link href={`/partners/${profile?.id}`}>
                <Button variant="secondary" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Shop ansehen
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistik-Karten */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Buchungen</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoadingStats ? "..." : stats?.totalBookings || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Ticket className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Umsatz</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoadingStats ? "..." : `${stats?.totalRevenue?.toFixed(0) || "0"}€`}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Euro className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Diesen Monat</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoadingStats ? "..." : stats?.monthlyBookings || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Angebote</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoadingStats ? "..." : stats?.totalExperiences || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Layers className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settlement Preview */}
        {(() => {
          const now = new Date();
          const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          const currentSettlement = settlements?.find(s => s.id === currentMonthKey);
          const lastSettlement = settlements?.find(s => s.id !== currentMonthKey);
          const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
          const dayOfMonth = now.getDate();
          const monthProgress = Math.round((dayOfMonth / daysInMonth) * 100);
          const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

          return (
            <Card className="border-0 shadow-sm mb-8 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Abrechnungsvorschau – {monthNames[now.getMonth()]} {now.getFullYear()}</CardTitle>
                        <CardDescription>Laufende Monatsabrechnung · Auszahlung am 15. des Folgemonats</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-white border-purple-200 text-purple-700">
                      <Clock className="w-3 h-3 mr-1" />
                      Tag {dayOfMonth} von {daysInMonth}
                    </Badge>
                  </div>
                </CardHeader>
              </div>
              <CardContent className="pt-5">
                {isLoadingSettlements ? (
                  <div className="flex items-center justify-center py-6 text-gray-400">Lade Abrechnungsdaten...</div>
                ) : (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white border rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Buchungen</p>
                        <p className="text-2xl font-bold text-gray-900">{currentSettlement?.bookings.length || 0}</p>
                        {lastSettlement && (
                          <p className="text-xs text-gray-400 mt-1">Vormonat: {lastSettlement.bookings.length}</p>
                        )}
                      </div>
                      <div className="bg-white border rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Bruttoumsatz</p>
                        <p className="text-2xl font-bold text-gray-900">{(currentSettlement?.totalRevenue || 0).toFixed(2).replace('.', ',')} €</p>
                        {lastSettlement && (
                          <p className="text-xs text-gray-400 mt-1">Vormonat: {lastSettlement.totalRevenue.toFixed(2).replace('.', ',')} €</p>
                        )}
                      </div>
                      <div className="bg-white border rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Provision (11%)</p>
                        <p className="text-2xl font-bold text-red-500">-{(currentSettlement?.commission || 0).toFixed(2).replace('.', ',')} €</p>
                      </div>
                      <div className="bg-white border border-green-200 rounded-xl p-4 bg-green-50">
                        <p className="text-xs text-green-600 uppercase tracking-wide mb-1 font-medium">Netto-Auszahlung</p>
                        <p className="text-2xl font-bold text-green-600">{(currentSettlement?.netPayout || 0).toFixed(2).replace('.', ',')} €</p>
                        <p className="text-xs text-green-500 mt-1">Auszahlung: 15.{String(now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2).padStart(2, '0')}.{now.getMonth() + 2 > 12 ? now.getFullYear() + 1 : now.getFullYear()}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Monatsfortschritt</span>
                        <span className="text-sm font-medium text-purple-600">{monthProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${monthProgress}%` }}
                        />
                      </div>
                    </div>

                    {currentSettlement && currentSettlement.bookings.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Letzte Buchungen diesen Monat</p>
                        <div className="space-y-2">
                          {currentSettlement.bookings.slice(0, 3).map((b) => (
                            <div key={b.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2 px-3 bg-gray-50 rounded-lg text-sm">
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 min-w-0">
                                <span className="text-gray-400 text-xs">#{b.id}</span>
                                <span className="font-medium text-gray-800">{b.experienceTitle}</span>
                                <span className="text-gray-400">·</span>
                                <span className="text-gray-500">{b.customerName}</span>
                              </div>
                              <div className="flex items-center gap-3 ml-auto shrink-0">
                                <span className="text-gray-500">{new Date(b.date).toLocaleDateString('de-DE')}</span>
                                <span className="font-semibold text-green-600">{b.net.toFixed(2).replace('.', ',')} €</span>
                              </div>
                            </div>
                          ))}
                          {currentSettlement.bookings.length > 3 && (
                            <p className="text-xs text-gray-400 text-center pt-1">
                              +{currentSettlement.bookings.length - 3} weitere Buchungen · Details im Tab "Abrechnungen"
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {(!currentSettlement || currentSettlement.bookings.length === 0) && (
                      <div className="text-center py-4 text-gray-400 text-sm">
                        <Euro className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        Noch keine Buchungen in diesem Monat
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}

        {/* Stripe Connect Onboarding */}
        <div className="mb-6">
          <StripeConnectCard />
        </div>

        {/* Tabs für verschiedene Bereiche */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="bg-white border shadow-sm p-1 h-auto flex-wrap">
            <TabsTrigger value="bookings" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              <Ticket className="w-4 h-4 mr-2" />
              Buchungen
            </TabsTrigger>
            <TabsTrigger value="angebote" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              <Package className="w-4 h-4 mr-2" />
              Angebotsverwaltung
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              <Users className="w-4 h-4 mr-2" />
              Ressourcen
            </TabsTrigger>
            <TabsTrigger value="slots" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              <CalendarDays className="w-4 h-4 mr-2" />
              Zeitslots
            </TabsTrigger>
            <TabsTrigger value="shop" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              <Store className="w-4 h-4 mr-2" />
              Shop
            </TabsTrigger>
            <TabsTrigger value="widget" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              <Code2 className="w-4 h-4 mr-2" />
              Widget
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              <Building2 className="w-4 h-4 mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              <Settings className="w-4 h-4 mr-2" />
              Einstellungen
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              Statistiken
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              <FileText className="w-4 h-4 mr-2" />
              Abrechnungen
            </TabsTrigger>
          </TabsList>

          {/* Buchungen Tab */}
          <TabsContent value="bookings">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Aktuelle Buchungen</CardTitle>
                <CardDescription>
                  Übersicht über alle eingehenden Buchungen für Ihre Erlebnisse
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingBookings ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : bookings && bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{booking.experienceTitle}</h3>
                              <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                                {booking.status === 'confirmed' ? 'Bestätigt' : 'Ausstehend'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{booking.customerName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CalendarDays className="h-4 w-4" />
                                <span>{format(new Date(booking.bookingDate), 'dd.MM.yyyy', { locale: de })}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{booking.numberOfPeople} Personen</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Euro className="h-4 w-4" />
                                <span>{booking.totalPrice.toFixed(2)}€</span>
                              </div>
                            </div>

                            {booking.notes && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                <strong>Notizen:</strong> {booking.notes}
                              </div>
                            )}
                          </div>
                          
                          <div className="ml-4 flex flex-col gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setViewingBooking(booking)} data-testid={`button-view-booking-${booking.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Ansehen
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Ticket className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Noch keine Buchungen</p>
                    <p className="text-sm mt-1">Buchungen werden hier angezeigt, sobald Kunden buchen.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Angebotsverwaltung Tab */}
          <TabsContent value="angebote">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-purple-600" />
                      Angebotsverwaltung
                    </CardTitle>
                    <CardDescription>
                      Verwalten Sie Ihre Angebote mit dem erweiterten Multi-Step-Editor (Tickets, Gültigkeit, Öffnungszeiten)
                    </CardDescription>
                  </div>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      setAngebotEditorExperience(null);
                      setShowAngebotEditor(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Neues Angebot
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingExperiences ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse h-16 bg-gray-200 rounded-lg" />
                    ))}
                  </div>
                ) : experiences && Array.isArray(experiences) && experiences.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b">
                      <div className="col-span-1">Bild</div>
                      <div className="col-span-3">Angebot</div>
                      <div className="col-span-2">Kategorie</div>
                      <div className="col-span-2">Preis</div>
                      <div className="col-span-1">Status</div>
                      <div className="col-span-3 text-right">Aktionen</div>
                    </div>
                    {experiences.map((exp: any) => (
                      <div key={exp.id} className="grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-lg hover:bg-gray-50 border transition-colors">
                        <div className="col-span-1">
                          {exp.imageUrl ? (
                            <img src={exp.imageUrl} alt={exp.title} className="w-12 h-12 rounded-lg object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Layers className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="col-span-3">
                          <p className="font-medium text-gray-900 truncate">{exp.title}</p>
                          <p className="text-xs text-gray-500 truncate">{exp.shortDescription || exp.location}</p>
                        </div>
                        <div className="col-span-2">
                          <Badge variant="outline" className="text-xs">{exp.categoryName || `Kat. ${exp.categoryId}`}</Badge>
                        </div>
                        <div className="col-span-2">
                          <span className="font-semibold text-purple-700">{exp.price > 0 ? `${Number(exp.price).toFixed(2).replace('.', ',')}€` : 'Kostenlos'}</span>
                        </div>
                        <div className="col-span-1">
                          <Badge variant={exp.active !== false ? 'default' : 'secondary'} className="text-xs">
                            {exp.active !== false ? 'Aktiv' : 'Inaktiv'}
                          </Badge>
                        </div>
                        <div className="col-span-3 flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAngebotEditorExperience(exp);
                              setShowAngebotEditor(true);
                            }}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editor
                          </Button>
                          <Link href={`/partners/${profile?.id}`}>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Noch keine Angebote</p>
                    <p className="text-sm mt-1">Erstellen Sie Ihr erstes Angebot mit dem Multi-Step-Editor</p>
                    <Button 
                      className="mt-4 bg-purple-600 hover:bg-purple-700"
                      onClick={() => {
                        setAngebotEditorExperience(null);
                        setShowAngebotEditor(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Erstes Angebot erstellen
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ressourcen Tab */}
          <TabsContent value="resources">
            <ResourceManagement />
          </TabsContent>

          {/* Zeitslots Tab */}
          <TabsContent value="slots">
            <div className="space-y-6">
              <GoogleCalendarConnect />
              <SlotManagement />
            </div>
          </TabsContent>

          {/* Shop konfigurieren Tab */}
          <TabsContent value="shop">
            <ShopKonfiguration />
          </TabsContent>

          {/* Widget Editor Tab */}
          <TabsContent value="widget">
            <WidgetEditor />
          </TabsContent>

          {/* Profil Tab */}
          <TabsContent value="profile">
            <PartnerProfileSettings />
          </TabsContent>

          {/* Einstellungen Tab */}
          <TabsContent value="settings">
            <BookingSettings />
          </TabsContent>

          {/* Statistiken Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Umsatz-Entwicklung
                  </CardTitle>
                  <CardDescription>
                    Ihre Einnahmen der letzten Monate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Dieser Monat</span>
                      <span className="text-xl font-bold text-green-600">
                        {stats?.monthlyRevenue?.toFixed(2) || "0.00"}€
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Gesamt</span>
                      <span className="text-xl font-bold text-purple-600">
                        {stats?.totalRevenue?.toFixed(2) || "0.00"}€
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Durchschn. Buchungswert</span>
                      <span className="text-xl font-bold text-blue-600">
                        {stats?.totalBookings ? (stats.totalRevenue / stats.totalBookings).toFixed(2) : "0.00"}€
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Performance-Übersicht
                  </CardTitle>
                  <CardDescription>
                    Ihre wichtigsten Kennzahlen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Buchungen gesamt</span>
                      <span className="text-xl font-bold">{stats?.totalBookings || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Aktive Erlebnisse</span>
                      <span className="text-xl font-bold">{stats?.totalExperiences || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Durchschn. Bewertung</span>
                      <span className="text-xl font-bold flex items-center gap-1">
                        {stats?.averageRating?.toFixed(1) || "0.0"}
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Abrechnungen Tab */}
          <TabsContent value="billing">
            <SettlementsTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Experience Form Dialog */}
      <ExperienceForm 
        experience={editingExperience}
        isOpen={isExperienceFormOpen}
        onClose={() => {
          setIsExperienceFormOpen(false);
          setEditingExperience(null);
        }}
      />

      {/* Regiondo-style Multi-Step Angebot Editor */}
      {showAngebotEditor && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <AngebotEditor
            experience={angebotEditorExperience}
            onClose={() => {
              setShowAngebotEditor(false);
              setAngebotEditorExperience(null);
            }}
          />
        </div>
      )}

      {/* Buchungsdetails Dialog */}
      <Dialog open={!!viewingBooking} onOpenChange={(open) => !open && setViewingBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buchungsdetails</DialogTitle>
          </DialogHeader>
          {viewingBooking && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{viewingBooking.experienceTitle}</h3>
                <Badge variant={viewingBooking.status === 'confirmed' ? 'default' : 'secondary'}>
                  {viewingBooking.status === 'confirmed' ? 'Bestätigt' : 'Ausstehend'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Kunde</p>
                  <p className="font-medium">{viewingBooking.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-500">E-Mail</p>
                  <p className="font-medium">{viewingBooking.customerEmail}</p>
                </div>
                <div>
                  <p className="text-gray-500">Datum</p>
                  <p className="font-medium">{format(new Date(viewingBooking.bookingDate), 'dd.MM.yyyy', { locale: de })}</p>
                </div>
                <div>
                  <p className="text-gray-500">Personen</p>
                  <p className="font-medium">{viewingBooking.numberOfPeople}</p>
                </div>
                <div>
                  <p className="text-gray-500">Gesamtpreis</p>
                  <p className="font-medium">{viewingBooking.totalPrice.toFixed(2)}€</p>
                </div>
                <div>
                  <p className="text-gray-500">Buchungs-Nr.</p>
                  <p className="font-medium">#{viewingBooking.id}</p>
                </div>
              </div>
              {viewingBooking.notes && (
                <div className="p-3 bg-gray-50 rounded text-sm">
                  <strong>Notizen:</strong> {viewingBooking.notes}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}