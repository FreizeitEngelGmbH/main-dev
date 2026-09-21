import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  LineChart,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUp,
  ArrowDown,
  Users,
  Calendar,
  Package,
  Euro,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart as RechartsLineChart, Line } from "recharts";

interface StatsData {
  totalExperiences: number;
  totalBookings: number;
  totalPartners: number;
  totalUsers: number;
  totalRevenue: number;
  bookingsByStatus: {
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  };
}

// Sample data for charts
const revenueData = [
  { name: "Jan", revenue: 2400 },
  { name: "Feb", revenue: 1398 },
  { name: "Mär", revenue: 9800 },
  { name: "Apr", revenue: 3908 },
  { name: "Mai", revenue: 4800 },
  { name: "Jun", revenue: 3800 },
  { name: "Jul", revenue: 4300 },
];

export default function AdminDashboard() {
  // Fetch admin stats
  const { data: stats, isLoading, isError, error } = useQuery<StatsData>({
    queryKey: ["/api/admin/stats"],
  });

  // Prepare the data for the bookings chart
  const bookingsChartData = stats
    ? [
        { name: "Ausstehend", value: stats.bookingsByStatus.pending },
        { name: "Bestätigt", value: stats.bookingsByStatus.confirmed },
        { name: "Abgeschlossen", value: stats.bookingsByStatus.completed },
        { name: "Storniert", value: stats.bookingsByStatus.cancelled },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg">Dashboard-Daten werden geladen...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-red-500">
        <AlertCircle className="h-10 w-10 mb-4" />
        <p className="text-lg">Fehler beim Laden der Dashboard-Daten</p>
        <p className="text-sm">{(error as Error)?.message || "Unbekannter Fehler"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Überblick über die Plattform-Statistiken und Aktivitäten
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Überblick</TabsTrigger>
          <TabsTrigger value="analytics">Statistiken</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Erlebnisse
                      </p>
                      <h3 className="text-2xl font-bold">{stats?.totalExperiences}</h3>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center text-sm text-green-500 font-medium">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    12%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Buchungen
                      </p>
                      <h3 className="text-2xl font-bold">{stats?.totalBookings}</h3>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center text-sm text-green-500 font-medium">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    18%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Partner
                      </p>
                      <h3 className="text-2xl font-bold">{stats?.totalPartners}</h3>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center text-sm text-green-500 font-medium">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    7%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Euro className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Umsatz
                      </p>
                      <h3 className="text-2xl font-bold">{stats?.totalRevenue.toFixed(2)} €</h3>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center text-sm text-red-500 font-medium">
                    <ArrowDown className="h-4 w-4 mr-1" />
                    3%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Buchungen nach Status</CardTitle>
              <CardDescription>
                Übersicht über alle Buchungen nach ihrem aktuellen Status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={bookingsChartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0073e6" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Umsatzentwicklung</CardTitle>
              <CardDescription>Monatlicher Umsatz der Plattform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={revenueData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} €`, "Umsatz"]} />
                    <Line type="monotone" dataKey="revenue" stroke="#0073e6" activeDot={{ r: 8 }} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* User Stats */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Nutzerstatistiken</CardTitle>
                <CardDescription>Anzahl der registrierten Nutzer auf der Plattform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Gesamt</p>
                    <p className="text-xl font-bold">{stats?.totalUsers}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Partner</p>
                    <p className="text-xl font-bold">{stats?.totalPartners}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Nutzer/Partner Verhältnis</p>
                    <p className="text-xl font-bold">
                      {stats && stats.totalPartners > 0
                        ? (stats.totalUsers / stats.totalPartners).toFixed(2)
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Buchungsstatistiken</CardTitle>
                <CardDescription>Detaillierte Aufschlüsselung der Buchungen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Gesamt</p>
                    <p className="text-xl font-bold">{stats?.totalBookings}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Ausstehend</p>
                    <p className="text-xl font-bold">{stats?.bookingsByStatus.pending}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Bestätigt</p>
                    <p className="text-xl font-bold">{stats?.bookingsByStatus.confirmed}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Abgeschlossen</p>
                    <p className="text-xl font-bold">{stats?.bookingsByStatus.completed}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Storniert</p>
                    <p className="text-xl font-bold">{stats?.bookingsByStatus.cancelled}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
