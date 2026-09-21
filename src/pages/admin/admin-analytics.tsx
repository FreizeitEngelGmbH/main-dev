import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3, TrendingUp, Users, ShoppingCart, DollarSign, Eye, Target,
  ArrowUpRight, ArrowDownRight, Star, Award, Activity, Percent, Package
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalBookings: number;
    monthlyBookings: number;
    weeklyBookings: number;
    totalRevenue: number;
    monthlyRevenue: number;
    avgOrderValue: number;
    conversionRate: number;
    cancellationRate: number;
    totalPartners: number;
    activePartners: number;
    totalExperiences: number;
    totalReviews: number;
  };
  topPartnersByBookings: PartnerRank[];
  topPartnersByRevenue: PartnerRank[];
  topPartnersByRating: PartnerRank[];
  categoryDistribution: { name: string; count: number }[];
  monthlyTrends: { month: string; bookings: number; revenue: number }[];
}

interface PartnerRank {
  partnerId: number;
  companyName: string;
  bookings: number;
  revenue: number;
  avgRating: number;
  reviewCount: number;
  experienceCount: number;
}

function MetricCard({ title, value, subtitle, icon: Icon, trend, trendValue, color = "text-primary" }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(subtitle || trendValue) && (
          <div className="flex items-center gap-1 mt-1">
            {trend === "up" && <ArrowUpRight className="h-3 w-3 text-green-600" />}
            {trend === "down" && <ArrowDownRight className="h-3 w-3 text-red-500" />}
            <p className={`text-xs ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
              {trendValue || subtitle}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BarSimple({ value, max, color = "bg-primary" }: { value: number; max: number; color?: string }) {
  const width = max > 0 ? Math.max((value / max) * 100, 2) : 0;
  return (
    <div className="w-full bg-muted rounded-full h-2.5">
      <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${width}%` }} />
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics"],
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded"></div>)}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const { overview } = data;
  const maxBookings = Math.max(...data.topPartnersByBookings.map(p => p.bookings), 1);
  const maxRevenue = Math.max(...data.topPartnersByRevenue.map(p => p.revenue), 1);
  const maxTrendBookings = Math.max(...data.monthlyTrends.map(t => t.bookings), 1);
  const maxTrendRevenue = Math.max(...data.monthlyTrends.map(t => t.revenue), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monitoring & Analytics</h1>
        <p className="text-muted-foreground mt-1">Plattform-Performance, Traffic-Kennzahlen und Partner-Rankings</p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Buchungen gesamt" value={overview.totalBookings} subtitle={`${overview.monthlyBookings} diesen Monat`} icon={ShoppingCart} color="text-blue-600" />
        <MetricCard title="Umsatz gesamt" value={`${overview.totalRevenue.toLocaleString("de-DE")}€`} subtitle={`${overview.monthlyRevenue.toLocaleString("de-DE")}€ monatlich`} icon={DollarSign} color="text-green-600" />
        <MetricCard title="Warenkorbwert" value={`${overview.avgOrderValue.toFixed(2)}€`} subtitle="Durchschnitt pro Buchung" icon={Target} color="text-purple-600" />
        <MetricCard title="Conversion Rate" value={`${overview.conversionRate}%`} trend={overview.conversionRate > 50 ? "up" : "down"} trendValue={`${overview.cancellationRate}% Abbruchrate`} icon={Percent} color="text-orange-600" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Partner" value={overview.totalPartners} subtitle={`${overview.activePartners} aktiv`} icon={Users} color="text-indigo-600" />
        <MetricCard title="Erlebnisse" value={overview.totalExperiences} subtitle="Auf der Plattform" icon={Package} color="text-teal-600" />
        <MetricCard title="Bewertungen" value={overview.totalReviews} subtitle="Von Kunden" icon={Star} color="text-yellow-600" />
        <MetricCard title="Abbruchrate" value={`${overview.cancellationRate}%`} trend={overview.cancellationRate < 20 ? "up" : "down"} trendValue={overview.cancellationRate < 20 ? "Im Zielbereich" : "Optimierung nötig"} icon={Activity} color="text-red-500" />
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monatliche Entwicklung (letzte 6 Monate)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-medium mb-3">Buchungen</h4>
              <div className="space-y-3">
                {data.monthlyTrends.map((trend) => (
                  <div key={trend.month} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{trend.month}</span>
                      <span className="font-medium">{trend.bookings}</span>
                    </div>
                    <BarSimple value={trend.bookings} max={maxTrendBookings} color="bg-blue-500" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Umsatz</h4>
              <div className="space-y-3">
                {data.monthlyTrends.map((trend) => (
                  <div key={trend.month} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{trend.month}</span>
                      <span className="font-medium">{trend.revenue.toLocaleString("de-DE")}€</span>
                    </div>
                    <BarSimple value={trend.revenue} max={maxTrendRevenue} color="bg-green-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partner Rankings */}
      <Tabs defaultValue="bookings" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Partner-Rankings (Werbeflächen)
            </h2>
            <p className="text-sm text-muted-foreground">Top-Partner nach verschiedenen Kriterien – ideal für Werbeplatzierungen</p>
          </div>
        </div>
        <TabsList>
          <TabsTrigger value="bookings">Nach Buchungen</TabsTrigger>
          <TabsTrigger value="revenue">Nach Umsatz</TabsTrigger>
          <TabsTrigger value="rating">Nach Bewertung</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Partner nach Buchungen</CardTitle>
              <CardDescription>Die meistgebuchten Partner – höchste Sichtbarkeit und Reichweite</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topPartnersByBookings.map((partner, i) => (
                  <div key={partner.partnerId} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${i < 3 ? "bg-yellow-100 text-yellow-700" : "bg-muted text-muted-foreground"}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{partner.companyName}</span>
                        {i < 3 && <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">Top {i + 1}</Badge>}
                      </div>
                      <BarSimple value={partner.bookings} max={maxBookings} color={i < 3 ? "bg-yellow-500" : "bg-blue-500"} />
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-sm">{partner.bookings}</div>
                      <div className="text-xs text-muted-foreground">Buchungen</div>
                    </div>
                    <div className="text-right shrink-0 hidden md:block">
                      <div className="text-sm">{partner.revenue.toLocaleString("de-DE")}€</div>
                      <div className="text-xs text-muted-foreground">Umsatz</div>
                    </div>
                    <div className="text-right shrink-0 hidden md:block">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        {partner.avgRating || "–"}
                      </div>
                      <div className="text-xs text-muted-foreground">{partner.reviewCount} Bew.</div>
                    </div>
                  </div>
                ))}
                {data.topPartnersByBookings.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">Noch keine Buchungsdaten verfügbar</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Partner nach Umsatz</CardTitle>
              <CardDescription>Die umsatzstärksten Partner – Premium-Werbeflächen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topPartnersByRevenue.map((partner, i) => (
                  <div key={partner.partnerId} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${i < 3 ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{partner.companyName}</span>
                        {i < 3 && <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Top {i + 1}</Badge>}
                      </div>
                      <BarSimple value={partner.revenue} max={maxRevenue} color={i < 3 ? "bg-green-500" : "bg-blue-500"} />
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-sm">{partner.revenue.toLocaleString("de-DE")}€</div>
                      <div className="text-xs text-muted-foreground">Umsatz</div>
                    </div>
                    <div className="text-right shrink-0 hidden md:block">
                      <div className="text-sm">{partner.bookings}</div>
                      <div className="text-xs text-muted-foreground">Buchungen</div>
                    </div>
                    <div className="text-right shrink-0 hidden md:block">
                      <div className="text-sm">{partner.experienceCount}</div>
                      <div className="text-xs text-muted-foreground">Erlebnisse</div>
                    </div>
                  </div>
                ))}
                {data.topPartnersByRevenue.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">Noch keine Umsatzdaten verfügbar</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rating">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Partner nach Bewertung</CardTitle>
              <CardDescription>Die bestbewerteten Partner – Qualitäts-Werbeflächen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topPartnersByRating.map((partner, i) => (
                  <div key={partner.partnerId} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${i < 3 ? "bg-purple-100 text-purple-700" : "bg-muted text-muted-foreground"}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{partner.companyName}</span>
                        {i < 3 && <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">Top {i + 1}</Badge>}
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, si) => (
                          <Star key={si} className={`h-3.5 w-3.5 ${si < Math.round(partner.avgRating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                        ))}
                        <span className="text-sm font-medium ml-1">{partner.avgRating}</span>
                        <span className="text-xs text-muted-foreground">({partner.reviewCount} Bewertungen)</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 hidden md:block">
                      <div className="text-sm">{partner.bookings}</div>
                      <div className="text-xs text-muted-foreground">Buchungen</div>
                    </div>
                    <div className="text-right shrink-0 hidden md:block">
                      <div className="text-sm">{partner.revenue.toLocaleString("de-DE")}€</div>
                      <div className="text-xs text-muted-foreground">Umsatz</div>
                    </div>
                  </div>
                ))}
                {data.topPartnersByRating.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">Noch keine Bewertungen verfügbar</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Kategorie-Verteilung
          </CardTitle>
          <CardDescription>Erlebnisse nach Aktivitätskategorie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.categoryDistribution.slice(0, 15).map((cat) => {
              const maxCat = data.categoryDistribution[0]?.count || 1;
              return (
                <div key={cat.name} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="truncate capitalize">{cat.name}</span>
                      <span className="font-medium shrink-0 ml-2">{cat.count}</span>
                    </div>
                    <BarSimple value={cat.count} max={maxCat} color="bg-indigo-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
