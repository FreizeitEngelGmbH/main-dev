import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Download, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface NewsletterSubscriber {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
}

export default function AdminNewsletterPage() {
  const { data: subscribers = [], isLoading } = useQuery<NewsletterSubscriber[]>({
    queryKey: ["/api/newsletter/signups"]
  });

  const downloadCSV = () => {
    const csvContent = [
      ["Name", "E-Mail", "Anmeldedatum"],
      ...subscribers.map(sub => [
        sub.name || "",
        sub.email,
        format(new Date(sub.createdAt), "dd.MM.yyyy HH:mm", { locale: de })
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `newsletter-abonnenten-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Newsletter Verwaltung</h1>
          <p className="text-gray-600">Verwalten Sie alle Newsletter-Abonnenten von FreizeitEngel</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamt Abonnenten</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscribers.length}</div>
              <p className="text-xs text-muted-foreground">
                +{subscribers.filter(sub => 
                  new Date(sub.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length} diese Woche
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Neueste Anmeldung</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscribers.length > 0 
                  ? format(new Date(Math.max(...subscribers.map(s => new Date(s.createdAt).getTime()))), "dd.MM.yyyy")
                  : "Keine"
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Letzte Newsletter-Anmeldung
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mit Namen</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscribers.filter(sub => sub.name).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Abonnenten mit vollständigen Daten
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subscribers Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Newsletter Abonnenten</CardTitle>
                <CardDescription>
                  Alle E-Mail-Adressen, die sich für den FreizeitEngel Newsletter angemeldet haben
                </CardDescription>
              </div>
              <Button onClick={downloadCSV} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                CSV Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {subscribers.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Noch keine Abonnenten</h3>
                <p className="text-gray-500">
                  Sobald sich jemand für den Newsletter anmeldet, erscheinen die Daten hier.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>E-Mail Adresse</TableHead>
                    <TableHead>Anmeldedatum</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">
                        {subscriber.name || (
                          <span className="text-gray-400 italic">Nicht angegeben</span>
                        )}
                      </TableCell>
                      <TableCell>{subscriber.email}</TableCell>
                      <TableCell>
                        {format(new Date(subscriber.createdAt), "dd.MM.yyyy 'um' HH:mm", { locale: de })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Aktiv
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}