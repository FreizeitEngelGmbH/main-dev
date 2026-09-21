import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Users, Euro, Calendar, TrendingUp, Eye, ExternalLink, Building } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PartnerOverview {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  totalExperiences: number;
  totalBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageRating: number;
  status: 'active' | 'pending' | 'inactive';
  joinedDate: string;
}

interface PlatformStats {
  totalPartners: number;
  activePartners: number;
  pendingPartners: number;
  totalRevenue: number;
  platformCommission: number;
  totalBookings: number;
  averagePartnerRating: number;
}

export default function AdminPartnerOverview() {
  // Plattform-Übersichtsstatistiken
  const { data: platformStats, isLoading: isLoadingStats } = useQuery<PlatformStats>({
    queryKey: ["/api/admin/platform-stats"],
  });

  // Partner-Übersicht
  const { data: partners, isLoading: isLoadingPartners } = useQuery<PartnerOverview[]>({
    queryKey: ["/api/admin/partners-overview"],
  });

  // Neueste Buchungen aller Partner
  const { data: recentBookings, isLoading: isLoadingBookings } = useQuery<any[]>({
    queryKey: ["/api/admin/recent-bookings"],
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Partner-Übersicht</h1>
        <p className="mt-2 text-gray-600">
          Verwalten Sie alle Partner und deren Performance auf Ihrer Plattform
        </p>
      </div>

      {/* Plattform-Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Partner</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : platformStats?.totalPartners || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {platformStats?.activePartners || 0} aktiv, {platformStats?.pendingPartners || 0} ausstehend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plattform-Umsatz</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : `${(platformStats?.totalRevenue?.toFixed(2) || "0,00").replace('.', ',')}€`}
            </div>
            <p className="text-xs text-muted-foreground">
              {(platformStats?.platformCommission?.toFixed(2) || "0,00").replace('.', ',')}€ Provision
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Buchungen</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : platformStats?.totalBookings || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Alle Partner zusammen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø Partnerbewertung</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : `${platformStats?.averagePartnerRating?.toFixed(1) || "0.0"}⭐`}
            </div>
            <p className="text-xs text-muted-foreground">
              Durchschnitt aller Partner
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Partner-Details Tabs */}
      <Tabs defaultValue="partners" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="partners">Partner-Liste</TabsTrigger>
          <TabsTrigger value="bookings">Neueste Buchungen</TabsTrigger>
          <TabsTrigger value="analytics">Analysen</TabsTrigger>
        </TabsList>

        {/* Partner-Liste */}
        <TabsContent value="partners">
          <Card>
            <CardHeader>
              <CardTitle>Alle Partner</CardTitle>
              <CardDescription>
                Übersicht aller registrierten Partner und deren Performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPartners ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : partners && partners.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unternehmen</TableHead>
                      <TableHead>Kontakt</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Erlebnisse</TableHead>
                      <TableHead>Buchungen</TableHead>
                      <TableHead>Umsatz</TableHead>
                      <TableHead>Bewertung</TableHead>
                      <TableHead>Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{partner.companyName}</div>
                            <div className="text-sm text-gray-500">{partner.contactPerson}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{partner.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              partner.status === 'active' ? 'default' : 
                              partner.status === 'pending' ? 'secondary' : 'destructive'
                            }
                          >
                            {partner.status === 'active' ? 'Aktiv' : 
                             partner.status === 'pending' ? 'Ausstehend' : 'Inaktiv'}
                          </Badge>
                        </TableCell>
                        <TableCell>{partner.totalExperiences}</TableCell>
                        <TableCell>{partner.totalBookings}</TableCell>
                        <TableCell>{partner.totalRevenue.toFixed(2).replace('.', ',')}€</TableCell>
                        <TableCell>
                          {partner.averageRating > 0 ? `${partner.averageRating.toFixed(1)}⭐` : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/partners/${partner.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                              </Link>
                            </Button>
                            <Button size="sm" variant="ghost" asChild>
                              <a href={`/partner/dashboard?partnerId=${partner.id}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Noch keine Partner registriert.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Neueste Buchungen */}
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Neueste Buchungen</CardTitle>
              <CardDescription>
                Die aktuellsten Buchungen aller Partner
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBookings ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : recentBookings && recentBookings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum</TableHead>
                      <TableHead>Kunde</TableHead>
                      <TableHead>Erlebnis</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Betrag</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings.map((booking: any) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          {new Date(booking.createdAt).toLocaleDateString('de-DE')}
                        </TableCell>
                        <TableCell>{booking.customerName}</TableCell>
                        <TableCell>{booking.experienceName}</TableCell>
                        <TableCell>{booking.partnerName}</TableCell>
                        <TableCell>{booking.totalPrice.toFixed(2).replace('.', ',')}€</TableCell>
                        <TableCell>
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status === 'confirmed' ? 'Bestätigt' : 'Ausstehend'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Noch keine Buchungen vorhanden.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysen */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top-Performance Partner</CardTitle>
                <CardDescription>
                  Partner mit den höchsten Umsätzen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Analyse wird geladen...</p>
                  <p className="text-sm mt-1">Hier sehen Sie bald die Top-Partner.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Umsatz-Trend</CardTitle>
                <CardDescription>
                  Entwicklung der Plattform-Einnahmen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Euro className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Diagramm wird erstellt...</p>
                  <p className="text-sm mt-1">Hier sehen Sie bald Ihre Umsatz-Entwicklung.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}