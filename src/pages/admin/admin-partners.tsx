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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Search, 
  MoreHorizontal, 
  Edit, 
  Mail, 
  UserCheck, 
  UserX,
  Phone, 
  MapPin,
  Loader2,
  Check,
  X,
  User,
  ExternalLink,
  Clock,
  Eye,
  Settings
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Partner, User as UserSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface PartnerWithUser extends Partner {
  user?: UserSchema;
}

// Partner update schema
const partnerUpdateSchema = z.object({
  companyName: z.string().min(1, "Unternehmensname wird benötigt"),
  contactPerson: z.string().min(1, "Ansprechpartner wird benötigt"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  phone: z.string().optional(),
  location: z.string().min(1, "Standort wird benötigt"),
  approved: z.boolean().default(false),
});

type PartnerUpdateValues = z.infer<typeof partnerUpdateSchema>;

export default function AdminPartners() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<"all" | "approved" | "pending">("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerWithUser | null>(null);
  
  // Fetch all partners
  const { data: partners, isLoading } = useQuery<PartnerWithUser[]>({
    queryKey: ["/api/admin/partners"],
  });
  
  // Update partner mutation
  const updatePartnerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PartnerUpdateValues> }) => {
      const res = await apiRequest("PUT", `/api/partners/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Partner aktualisiert",
        description: "Der Partner wurde erfolgreich aktualisiert.",
      });
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: `Partner konnte nicht aktualisiert werden: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Approve/Reject partner mutation
  const approvePartnerMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: number; approved: boolean }) => {
      const res = await apiRequest("PUT", `/api/partners/${id}`, { approved });
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.approved ? "Partner freigegeben" : "Partner abgelehnt",
        description: variables.approved 
          ? "Der Partner wurde erfolgreich freigegeben und kann nun Erlebnisse anbieten." 
          : "Der Partner wurde abgelehnt.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: `Aktion konnte nicht durchgeführt werden: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle partner approval/rejection
  const handleApprovalChange = (id: number, approved: boolean) => {
    approvePartnerMutation.mutate({ id, approved });
  };
  
  // Edit partner form
  const editForm = useForm<PartnerUpdateValues>({
    resolver: zodResolver(partnerUpdateSchema),
    defaultValues: {
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      location: "",
      approved: false,
    },
  });
  
  // Handle editing a partner
  const onEditSubmit = (data: PartnerUpdateValues) => {
    if (selectedPartner) {
      updatePartnerMutation.mutate({ id: selectedPartner.id, data });
    }
  };
  
  // Open edit dialog and populate form
  const handleEdit = (partner: PartnerWithUser) => {
    setSelectedPartner(partner);
    editForm.reset({
      companyName: partner.companyName,
      contactPerson: partner.contactPerson,
      email: partner.email,
      phone: partner.phone || "",
      location: partner.location,
      approved: partner.approved,
    });
    setIsEditDialogOpen(true);
  };
  
  // Format date
  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'PPP', { locale: de });
  };
  
  // Filter partners based on search query and approval status
  const filteredPartners = partners
    ? partners.filter(
        (partner) => {
          const matchesSearch = 
            partner.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            partner.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
            partner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            partner.location.toLowerCase().includes(searchQuery.toLowerCase());
          
          const matchesApproval = 
            approvalFilter === "all" ||
            (approvalFilter === "approved" && partner.approved) ||
            (approvalFilter === "pending" && !partner.approved);
          
          return matchesSearch && matchesApproval;
        }
      )
    : [];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Partner</h1>
          <p className="text-muted-foreground">
            Verwalte alle Erlebnisanbieter auf der Plattform
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Suche nach Partnern..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant={approvalFilter === "all" ? "default" : "outline"}
                className="w-28"
                onClick={() => setApprovalFilter("all")}
              >
                Alle
              </Button>
              <Button
                variant={approvalFilter === "approved" ? "default" : "outline"}
                className="w-28"
                onClick={() => setApprovalFilter("approved")}
              >
                Freigegeben
              </Button>
              <Button
                variant={approvalFilter === "pending" ? "default" : "outline"}
                className="w-28"
                onClick={() => setApprovalFilter("pending")}
              >
                Ausstehend
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredPartners.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Unternehmen</TableHead>
                    <TableHead>Ansprechpartner</TableHead>
                    <TableHead>Kontakt</TableHead>
                    <TableHead>Standort</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>{partner.id}</TableCell>
                      <TableCell className="font-medium">{partner.companyName}</TableCell>
                      <TableCell>{partner.contactPerson}</TableCell>
                      <TableCell>
                        <a href={`mailto:${partner.email}`} className="text-primary hover:underline flex items-center">
                          <Mail className="h-3.5 w-3.5 mr-1.5" />
                          <span className="truncate max-w-[150px]">{partner.email}</span>
                        </a>
                      </TableCell>
                      <TableCell>{partner.location}</TableCell>
                      <TableCell>
                        {partner.approved ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Check className="h-3 w-3 mr-1" /> Freigegeben
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            <Clock className="h-3 w-3 mr-1" /> Ausstehend
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(partner.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Menü öffnen</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/partners/${partner.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Vorschau (Shop)
                              </Link>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem asChild>
                              <a href={`/partners/${partner.id}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                In neuem Tab öffnen
                              </a>
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem onClick={() => handleEdit(partner)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Bearbeiten
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => window.location.href = `mailto:${partner.email}`}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              E-Mail senden
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {!partner.approved ? (
                              <DropdownMenuItem
                                onClick={() => handleApprovalChange(partner.id, true)}
                              >
                                <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                                Freigeben
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleApprovalChange(partner.id, false)}
                              >
                                <UserX className="h-4 w-4 mr-2 text-red-500" />
                                Freigabe entziehen
                              </DropdownMenuItem>
                            )}
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
              <p className="text-muted-foreground">Keine Partner gefunden.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Partner Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Partner bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeite die Informationen des Partners.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unternehmensname*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ansprechpartner*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Mail*</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefonnummer</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Optional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Standort*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="approved"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Freigegeben</FormLabel>
                      <FormDescription>
                        Partner kann Erlebnisse anbieten, wenn freigegeben
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button
                  type="submit"
                  disabled={updatePartnerMutation.isPending}
                >
                  {updatePartnerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird gespeichert...
                    </>
                  ) : (
                    "Speichern"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
