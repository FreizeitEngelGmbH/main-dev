import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BarChart3, Package, Calendar, Users, Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Experience, Booking, Partner } from "@shared/schema";

export default function PartnerDashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [deleteExperienceId, setDeleteExperienceId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: partner } = useQuery<Partner>({
    queryKey: ["/api/partners/me"],
  });

  const { data: experiences } = useQuery<Experience[]>({
    queryKey: ["/api/partners/experiences"],
    enabled: !!partner,
  });

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/partners/bookings"],
    enabled: !!partner,
  });

  // Redirect if user is not logged in or not a partner
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else if (user && user.role !== "partner" && !partner) {
      navigate("/partner");
    }
  }, [user, partner, navigate]);

  if (!user || !partner) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3">Lade Partner-Dashboard...</span>
      </div>
    );
  }

  const handleDeleteClick = (id: number) => {
    setDeleteExperienceId(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteExperienceId) {
      try {
        // Implementierung folgt
        toast({
          title: "Erlebnis gelöscht",
          description: "Das Erlebnis wurde erfolgreich gelöscht.",
        });
      } catch (error) {
        toast({
          title: "Fehler beim Löschen",
          description: "Das Erlebnis konnte nicht gelöscht werden.",
          variant: "destructive",
        });
      } finally {
        setShowDeleteDialog(false);
        setDeleteExperienceId(null);
      }
    }
  };

  // Filter experiences by search query
  const filteredExperiences = experiences?.filter(experience => 
    experience.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    experience.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    experience.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculations
  const totalExperiences = experiences?.length || 0;
  const activeExperiences = experiences?.filter(exp => exp.active)?.length || 0;
  const totalBookings = bookings?.length || 0;
  const totalRevenue = bookings?.reduce((sum, booking) => sum + booking.totalPrice, 0) || 0;
  const pendingBookings = bookings?.filter(booking => booking.status === "pending")?.length || 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Partner Dashboard</h1>
            <p className="text-gray-500">Willkommen zurück, {partner.companyName}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button onClick={() => navigate("/partner/experiences/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Neues Erlebnis
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Aktive Erlebnisse</p>
                  <h3 className="text-2xl font-bold mt-1">{activeExperiences}</h3>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Von insgesamt {totalExperiences} Erlebnissen</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Buchungen</p>
                  <h3 className="text-2xl font-bold mt-1">{totalBookings}</h3>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{pendingBookings} offene Anfragen</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Umsatz</p>
                  <h3 className="text-2xl font-bold mt-1">{totalRevenue.toFixed(2)} €</h3>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Gesamtumsatz über alle Buchungen</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Kunden</p>
                  <h3 className="text-2xl font-bold mt-1">{bookings?.length || 0}</h3>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Anzahl der Kundenbuchungen</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="experiences" className="space-y-6">
          <TabsList>
            <TabsTrigger value="experiences">Meine Erlebnisse</TabsTrigger>
            <TabsTrigger value="bookings">Buchungen</TabsTrigger>
          </TabsList>

          <TabsContent value="experiences" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>Erlebnisse verwalten</CardTitle>
                  <div className="w-full md:w-64">
                    <Input
                      placeholder="Suche nach Erlebnissen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <CardDescription>
                  Hier kannst du alle deine Erlebnisse verwalten, bearbeiten und neue hinzufügen.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(!experiences || experiences.length === 0) ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Keine Erlebnisse vorhanden</h3>
                    <p className="text-gray-500 mb-4 max-w-md mx-auto">
                      Du hast noch keine Erlebnisse angelegt. Erstelle dein erstes Erlebnis, um Kunden anzuziehen.
                    </p>
                    <Button onClick={() => navigate("/partner/experiences/new")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Erstes Erlebnis erstellen
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Standort</TableHead>
                          <TableHead>Preis</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredExperiences && filteredExperiences.map((experience) => (
                          <TableRow key={experience.id}>
                            <TableCell className="font-medium">{experience.title}</TableCell>
                            <TableCell>{experience.city}</TableCell>
                            <TableCell>{(experience.price).toFixed(2)} €</TableCell>
                            <TableCell>
                              {experience.active ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Aktiv
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                  Inaktiv
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => navigate(`/experience/${experience.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => navigate(`/partner/experiences/edit/${experience.id}`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteClick(experience.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buchungen & Anfragen</CardTitle>
                <CardDescription>
                  Verwalte aktuelle Buchungen und Anfragen für deine Erlebnisse.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(!bookings || bookings.length === 0) ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Keine Buchungen vorhanden</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Du hast noch keine Buchungen erhalten. Sobald Kunden deine Erlebnisse buchen, werden sie hier erscheinen.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Buchungs-ID</TableHead>
                          <TableHead>Erlebnis</TableHead>
                          <TableHead>Datum</TableHead>
                          <TableHead>Kunde</TableHead>
                          <TableHead>Personen</TableHead>
                          <TableHead>Preis</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking) => {
                          const experience = experiences?.find(e => e.id === booking.experienceId);
                          return (
                            <TableRow key={booking.id}>
                              <TableCell className="font-medium">#{booking.id}</TableCell>
                              <TableCell>{experience?.title || "Unbekannt"}</TableCell>
                              <TableCell>{new Date(booking.date).toLocaleDateString('de-DE')}</TableCell>
                              <TableCell>{booking.contactName}</TableCell>
                              <TableCell>{booking.participants}</TableCell>
                              <TableCell>{booking.totalPrice.toFixed(2)} €</TableCell>
                              <TableCell>
                                {booking.status === "confirmed" && (
                                  <Badge className="bg-green-50 text-green-700 border-green-200">
                                    Bestätigt
                                  </Badge>
                                )}
                                {booking.status === "pending" && (
                                  <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                    Ausstehend
                                  </Badge>
                                )}
                                {booking.status === "canceled" && (
                                  <Badge className="bg-red-50 text-red-700 border-red-200">
                                    Storniert
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/partner/bookings/${booking.id}`)}
                                >
                                  Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erlebnis löschen</DialogTitle>
            <DialogDescription>
              Bist du sicher, dass du dieses Erlebnis löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}