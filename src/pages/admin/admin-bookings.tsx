import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2,
  Search, 
  MoreHorizontal, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download
} from "lucide-react";
import { Booking, Experience, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { QRCode } from "@/components/ui/qr-code";

interface BookingWithDetails extends Booking {
  experience: Experience;
  user?: User;
}

export default function AdminBookings() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  // Fetch all bookings
  const { data: bookings, isLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings"],
  });
  
  // Update booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/bookings/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Status aktualisiert",
        description: "Der Buchungsstatus wurde erfolgreich aktualisiert.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setDetailsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: `Status konnte nicht aktualisiert werden: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Format date
  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'PPP', { locale: de });
  };
  
  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="h-3 w-3 mr-1" /> Ausstehend</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" /> Bestätigt</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" /> Storniert</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><CheckCircle2 className="h-3 w-3 mr-1" /> Abgeschlossen</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> {status}</Badge>;
    }
  };
  
  // Update booking status
  const handleStatusChange = (status: string) => {
    if (selectedBooking) {
      updateBookingStatusMutation.mutate({ id: selectedBooking.id, status });
    }
  };
  
  // Generate a CSV export of bookings
  const handleExportCSV = () => {
    if (!bookings || bookings.length === 0) {
      toast({
        title: "Export fehlgeschlagen",
        description: "Es sind keine Buchungen zum Exportieren vorhanden.",
        variant: "destructive",
      });
      return;
    }
    
    // Create CSV header
    const header = [
      "ID",
      "Erlebnis",
      "Datum",
      "Preis",
      "Teilnehmer",
      "Status",
      "Kontaktname",
      "Kontakt-Email",
      "Erstelldatum"
    ].join(",");
    
    // Create CSV rows
    const rows = bookings.map(booking => [
      booking.id,
      `"${booking.experience.title.replace(/"/g, '""')}"`,
      formatDate(booking.date),
      booking.totalPrice.toFixed(2),
      booking.participants,
      booking.status,
      `"${booking.contactName.replace(/"/g, '""')}"`,
      booking.contactEmail,
      formatDate(booking.createdAt)
    ].join(","));
    
    // Combine header and rows
    const csv = [header, ...rows].join("\n");
    
    // Create download link
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bookings-export-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export erfolgreich",
      description: "Die Buchungsdaten wurden als CSV-Datei exportiert.",
    });
  };
  
  // Filter bookings based on search query and status
  const filteredBookings = bookings
    ? bookings.filter(
        (booking) => {
          const matchesSearch = 
            booking.experience.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.contactEmail.toLowerCase().includes(searchQuery.toLowerCase());
          
          const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
          
          return matchesSearch && matchesStatus;
        }
      )
    : [];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buchungen</h1>
          <p className="text-muted-foreground">
            Verwalte alle Buchungen auf der Plattform
          </p>
        </div>
        <Button
          className="mt-4 sm:mt-0"
          variant="outline"
          onClick={handleExportCSV}
        >
          <Download className="h-4 w-4 mr-2" />
          CSV exportieren
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Suche nach Buchungen..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="pending">Ausstehend</SelectItem>
                <SelectItem value="confirmed">Bestätigt</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
                <SelectItem value="cancelled">Storniert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Erlebnis</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Teilnehmer</TableHead>
                    <TableHead>Preis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.id}</TableCell>
                      <TableCell>
                        <div className="font-medium max-w-[200px] truncate" title={booking.experience.title}>
                          {booking.experience.title}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(booking.date)}</TableCell>
                      <TableCell>{booking.contactName}</TableCell>
                      <TableCell>{booking.participants}</TableCell>
                      <TableCell>{booking.totalPrice.toFixed(2)} €</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Menü öffnen</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedBooking(booking);
                                setDetailsDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Details anzeigen
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedBooking(booking);
                                handleStatusChange("confirmed");
                              }}
                              disabled={booking.status === "confirmed" || booking.status === "cancelled" || booking.status === "completed"}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                              Bestätigen
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedBooking(booking);
                                handleStatusChange("completed");
                              }}
                              disabled={booking.status === "completed" || booking.status === "cancelled"}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2 text-blue-500" />
                              Als abgeschlossen markieren
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedBooking(booking);
                                handleStatusChange("cancelled");
                              }}
                              disabled={booking.status === "cancelled" || booking.status === "completed"}
                              className="text-red-600"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Stornieren
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Keine Buchungen gefunden.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Booking Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle>Buchungsdetails #{selectedBooking.id}</DialogTitle>
                <DialogDescription>
                  Detaillierte Informationen zur ausgewählten Buchung
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Erlebnis</h3>
                      <p className="text-gray-700">{selectedBooking.experience.title}</p>
                      <p className="text-sm text-gray-500 mt-1">ID: {selectedBooking.experience.id}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Buchungsdetails</h3>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Datum:</dt>
                          <dd className="font-medium">{formatDate(selectedBooking.date)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Teilnehmer:</dt>
                          <dd className="font-medium">{selectedBooking.participants}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Preis pro Person:</dt>
                          <dd className="font-medium">{(selectedBooking.experience.price).toFixed(2)} €</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Gesamtpreis:</dt>
                          <dd className="font-medium">{selectedBooking.totalPrice.toFixed(2)} €</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Status:</dt>
                          <dd>{getStatusBadge(selectedBooking.status)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Erstellt am:</dt>
                          <dd className="font-medium">{formatDate(selectedBooking.createdAt)}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Kontaktdaten</h3>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Name:</dt>
                          <dd className="font-medium">{selectedBooking.contactName}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">E-Mail:</dt>
                          <dd className="font-medium">{selectedBooking.contactEmail}</dd>
                        </div>
                        {selectedBooking.message && (
                          <div className="pt-2">
                            <dt className="text-gray-500 mb-1">Nachricht:</dt>
                            <dd className="font-medium text-sm bg-gray-50 p-3 rounded-md">{selectedBooking.message}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg mb-4">Ticket QR-Code</h3>
                    <div className="flex flex-col items-center">
                      <QRCode 
                        value={selectedBooking.qrCode || `booking-${selectedBooking.id}`}
                        size={200}
                        className="mb-4"
                      />
                      <p className="text-xs text-gray-500 mb-6">
                        Ticket-ID: {selectedBooking.qrCode || `booking-${selectedBooking.id}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <h3 className="font-semibold text-lg mb-3">Status ändern</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300"
                        onClick={() => handleStatusChange("confirmed")}
                        disabled={selectedBooking.status === "confirmed" || selectedBooking.status === "cancelled" || selectedBooking.status === "completed" || updateBookingStatusMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Bestätigen
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300"
                        onClick={() => handleStatusChange("completed")}
                        disabled={selectedBooking.status === "completed" || selectedBooking.status === "cancelled" || updateBookingStatusMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Abgeschlossen
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300"
                        onClick={() => handleStatusChange("pending")}
                        disabled={selectedBooking.status === "pending" || selectedBooking.status === "cancelled" || selectedBooking.status === "completed" || updateBookingStatusMutation.isPending}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Ausstehend
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300"
                        onClick={() => handleStatusChange("cancelled")}
                        disabled={selectedBooking.status === "cancelled" || selectedBooking.status === "completed" || updateBookingStatusMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Stornieren
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDetailsDialogOpen(false)}
                >
                  Schließen
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
