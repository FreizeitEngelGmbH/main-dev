import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Search, Building2, Users, Phone, Mail, Calendar, MessageSquare, Plus, FileText, Clock, Tag, ArrowUpDown, Filter, ChevronDown, ChevronUp, Star, Activity } from "lucide-react";

const pipelineColors: Record<string, string> = {
  lead: "bg-gray-100 text-gray-800",
  kontaktiert: "bg-blue-100 text-blue-800",
  verhandlung: "bg-yellow-100 text-yellow-800",
  aktiv: "bg-green-100 text-green-800",
  inaktiv: "bg-red-100 text-red-800",
};

const pipelineLabels: Record<string, string> = {
  lead: "Lead",
  kontaktiert: "Kontaktiert",
  verhandlung: "Verhandlung",
  aktiv: "Aktiv",
  inaktiv: "Inaktiv",
};

const contractLabels: Record<string, string> = {
  kein_vertrag: "Kein Vertrag",
  entwurf: "Entwurf",
  gesendet: "Gesendet",
  unterschrieben: "Unterschrieben",
  gekuendigt: "Gekündigt",
};

const contractColors: Record<string, string> = {
  kein_vertrag: "bg-gray-100 text-gray-600",
  entwurf: "bg-yellow-100 text-yellow-700",
  gesendet: "bg-blue-100 text-blue-700",
  unterschrieben: "bg-green-100 text-green-700",
  gekuendigt: "bg-red-100 text-red-700",
};

const segmentLabels: Record<string, string> = {
  neu: "Neu",
  regular: "Regular",
  vip: "VIP",
  inaktiv: "Inaktiv",
};

const segmentColors: Record<string, string> = {
  neu: "bg-blue-100 text-blue-800",
  regular: "bg-gray-100 text-gray-800",
  vip: "bg-purple-100 text-purple-800",
  inaktiv: "bg-red-100 text-red-800",
};

const priorityColors: Record<string, string> = {
  niedrig: "bg-gray-100 text-gray-600",
  mittel: "bg-yellow-100 text-yellow-700",
  hoch: "bg-red-100 text-red-700",
};

const activityTypeLabels: Record<string, string> = {
  call: "Anruf",
  email: "E-Mail",
  meeting: "Meeting",
  note: "Notiz",
  status_change: "Status-Änderung",
  contract: "Vertrag",
};

function formatDate(date: string | null | undefined): string {
  if (!date) return "–";
  return new Date(date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDateTime(date: string | null | undefined): string {
  if (!date) return "–";
  return new Date(date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminCRM() {
  const { toast } = useToast();
  const [partnerSearch, setPartnerSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [pipelineFilter, setPipelineFilter] = useState("all");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [partnerDetailOpen, setPartnerDetailOpen] = useState(false);
  const [customerDetailOpen, setCustomerDetailOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newActivityType, setNewActivityType] = useState("note");
  const [newActivitySummary, setNewActivitySummary] = useState("");

  const { data: crmPartners = [], isLoading: partnersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/crm/partners"],
  });

  const { data: crmCustomers = [], isLoading: customersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/crm/customers"],
  });

  const { data: partnerNotes = [] } = useQuery<any[]>({
    queryKey: [`/api/admin/crm/notes/partner/${selectedPartner?.partnerId}`],
    enabled: !!selectedPartner,
  });

  const { data: partnerActivities = [] } = useQuery<any[]>({
    queryKey: [`/api/admin/crm/activities/partner/${selectedPartner?.partnerId}`],
    enabled: !!selectedPartner,
  });

  const { data: customerNotes = [] } = useQuery<any[]>({
    queryKey: [`/api/admin/crm/notes/customer/${selectedCustomer?.id}`],
    enabled: !!selectedCustomer,
  });

  const { data: customerActivities = [] } = useQuery<any[]>({
    queryKey: [`/api/admin/crm/activities/customer/${selectedCustomer?.id}`],
    enabled: !!selectedCustomer,
  });

  const updatePartnerCrmMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PUT", `/api/admin/crm/partners/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/crm/partners"] });
      toast({ title: "Partner CRM aktualisiert" });
    },
  });

  const updateCustomerCrmMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PUT", `/api/admin/crm/customers/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/crm/customers"] });
      toast({ title: "Kunden CRM aktualisiert" });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/crm/notes", data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/crm/notes/${variables.entityType}/${variables.entityId}`] });
      setNewNote("");
      toast({ title: "Notiz hinzugefügt" });
    },
  });

  const addActivityMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/crm/activities", data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/crm/activities/${variables.entityType}/${variables.entityId}`] });
      setNewActivitySummary("");
      toast({ title: "Aktivität hinzugefügt" });
    },
  });

  const filteredPartners = crmPartners.filter((p: any) => {
    const matchesSearch = !partnerSearch || 
      p.companyName?.toLowerCase().includes(partnerSearch.toLowerCase()) ||
      p.contactPerson?.toLowerCase().includes(partnerSearch.toLowerCase()) ||
      p.city?.toLowerCase().includes(partnerSearch.toLowerCase()) ||
      p.email?.toLowerCase().includes(partnerSearch.toLowerCase());
    const matchesPipeline = pipelineFilter === "all" || (p.pipelineStatus || "lead") === pipelineFilter;
    return matchesSearch && matchesPipeline;
  });

  const filteredCustomers = crmCustomers.filter((c: any) => {
    const matchesSearch = !customerSearch ||
      c.fullName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.username?.toLowerCase().includes(customerSearch.toLowerCase());
    const matchesSegment = segmentFilter === "all" || (c.segment || "neu") === segmentFilter;
    return matchesSearch && matchesSegment;
  });

  const pipelineCounts = {
    lead: crmPartners.filter((p: any) => (p.pipelineStatus || "lead") === "lead").length,
    kontaktiert: crmPartners.filter((p: any) => p.pipelineStatus === "kontaktiert").length,
    verhandlung: crmPartners.filter((p: any) => p.pipelineStatus === "verhandlung").length,
    aktiv: crmPartners.filter((p: any) => p.pipelineStatus === "aktiv").length,
    inaktiv: crmPartners.filter((p: any) => p.pipelineStatus === "inaktiv").length,
  };

  const openPartnerDetail = (partner: any) => {
    setSelectedPartner(partner);
    setPartnerDetailOpen(true);
    setNewNote("");
    setNewActivitySummary("");
  };

  const openCustomerDetail = (customer: any) => {
    setSelectedCustomer(customer);
    setCustomerDetailOpen(true);
    setNewNote("");
    setNewActivitySummary("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CRM System</h1>
        <p className="text-muted-foreground mt-1">Partner- und Kundenverwaltung</p>
      </div>

      <Tabs defaultValue="partners" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="partners" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Partner ({crmPartners.length})
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Kunden ({crmCustomers.length})
          </TabsTrigger>
        </TabsList>

        {/* Partner CRM Tab */}
        <TabsContent value="partners" className="space-y-6">
          {/* Pipeline Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(pipelineLabels).map(([key, label]) => (
              <Card
                key={key}
                className={`cursor-pointer transition-all ${pipelineFilter === key ? "ring-2 ring-primary" : "hover:shadow-md"}`}
                onClick={() => setPipelineFilter(pipelineFilter === key ? "all" : key)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{pipelineCounts[key as keyof typeof pipelineCounts]}</div>
                  <Badge className={`mt-1 ${pipelineColors[key]}`}>{label}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search & Filter */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-grow max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Suche nach Partner, Stadt, E-Mail..."
                    className="pl-8"
                    value={partnerSearch}
                    onChange={(e) => setPartnerSearch(e.target.value)}
                  />
                </div>
                {pipelineFilter !== "all" && (
                  <Button variant="outline" size="sm" onClick={() => setPipelineFilter("all")}>
                    Filter zurücksetzen
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {partnersLoading ? (
                <div className="text-center py-8 text-muted-foreground">Laden...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Firma</TableHead>
                        <TableHead>Kontaktperson</TableHead>
                        <TableHead>Stadt</TableHead>
                        <TableHead>Pipeline</TableHead>
                        <TableHead>Vertrag</TableHead>
                        <TableHead>Priorität</TableHead>
                        <TableHead>Letzter Kontakt</TableHead>
                        <TableHead>Nächstes Follow-up</TableHead>
                        <TableHead>Aktion</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPartners.map((partner: any) => (
                        <TableRow key={partner.partnerId} className="cursor-pointer hover:bg-muted/50" onClick={() => openPartnerDetail(partner)}>
                          <TableCell className="font-medium">{partner.companyName}</TableCell>
                          <TableCell>{partner.contactPerson || "–"}</TableCell>
                          <TableCell>{partner.city}</TableCell>
                          <TableCell>
                            <Badge className={pipelineColors[partner.pipelineStatus || "lead"]}>
                              {pipelineLabels[partner.pipelineStatus || "lead"]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={contractColors[partner.contractStatus || "kein_vertrag"]}>
                              {contractLabels[partner.contractStatus || "kein_vertrag"]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={priorityColors[partner.priority || "mittel"]}>
                              {(partner.priority || "mittel").charAt(0).toUpperCase() + (partner.priority || "mittel").slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{formatDate(partner.lastContactAt)}</TableCell>
                          <TableCell className="text-sm">{formatDate(partner.nextFollowUpAt)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openPartnerDetail(partner); }}>
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredPartners.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            Keine Partner gefunden
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer CRM Tab */}
        <TabsContent value="customers" className="space-y-6">
          {/* Segment Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(segmentLabels).map(([key, label]) => {
              const count = crmCustomers.filter((c: any) => (c.segment || "neu") === key).length;
              return (
                <Card
                  key={key}
                  className={`cursor-pointer transition-all ${segmentFilter === key ? "ring-2 ring-primary" : "hover:shadow-md"}`}
                  onClick={() => setSegmentFilter(segmentFilter === key ? "all" : key)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{count}</div>
                    <Badge className={`mt-1 ${segmentColors[key]}`}>{label}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Search */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-grow max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Suche nach Kunde, E-Mail..."
                    className="pl-8"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                </div>
                {segmentFilter !== "all" && (
                  <Button variant="outline" size="sm" onClick={() => setSegmentFilter("all")}>
                    Filter zurücksetzen
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {customersLoading ? (
                <div className="text-center py-8 text-muted-foreground">Laden...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>E-Mail</TableHead>
                        <TableHead>Segment</TableHead>
                        <TableHead>Buchungen</TableHead>
                        <TableHead>Gesamtumsatz</TableHead>
                        <TableHead>Letzte Aktivität</TableHead>
                        <TableHead>Registriert</TableHead>
                        <TableHead>Aktion</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer: any) => (
                        <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openCustomerDetail(customer)}>
                          <TableCell className="font-medium">{customer.fullName || customer.username}</TableCell>
                          <TableCell className="text-sm">{customer.email}</TableCell>
                          <TableCell>
                            <Badge className={segmentColors[customer.segment || "neu"]}>
                              {segmentLabels[customer.segment || "neu"]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{customer.bookingCount || 0}</TableCell>
                          <TableCell>{Number(customer.totalSpend || 0).toFixed(2)} €</TableCell>
                          <TableCell className="text-sm">{formatDate(customer.lastActivityAt)}</TableCell>
                          <TableCell className="text-sm">{formatDate(customer.createdAt)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openCustomerDetail(customer); }}>
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredCustomers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            Keine Kunden gefunden
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Partner Detail Dialog */}
      <Dialog open={partnerDetailOpen} onOpenChange={setPartnerDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedPartner?.companyName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPartner && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {selectedPartner.email || "–"}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {selectedPartner.phone || "–"}
                </div>
              </div>

              <Separator />

              {/* CRM Status */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Pipeline-Status</label>
                  <Select
                    value={selectedPartner.pipelineStatus || "lead"}
                    onValueChange={(value) => {
                      updatePartnerCrmMutation.mutate({ id: selectedPartner.partnerId, data: { pipelineStatus: value } });
                      setSelectedPartner({ ...selectedPartner, pipelineStatus: value });
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(pipelineLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Vertragsstatus</label>
                  <Select
                    value={selectedPartner.contractStatus || "kein_vertrag"}
                    onValueChange={(value) => {
                      updatePartnerCrmMutation.mutate({ id: selectedPartner.partnerId, data: { contractStatus: value } });
                      setSelectedPartner({ ...selectedPartner, contractStatus: value });
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(contractLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Priorität</label>
                  <Select
                    value={selectedPartner.priority || "mittel"}
                    onValueChange={(value) => {
                      updatePartnerCrmMutation.mutate({ id: selectedPartner.partnerId, data: { priority: value } });
                      setSelectedPartner({ ...selectedPartner, priority: value });
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="niedrig">Niedrig</SelectItem>
                      <SelectItem value="mittel">Mittel</SelectItem>
                      <SelectItem value="hoch">Hoch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nächstes Follow-up</label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={selectedPartner.nextFollowUpAt ? new Date(selectedPartner.nextFollowUpAt).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value).toISOString() : null;
                      updatePartnerCrmMutation.mutate({ id: selectedPartner.partnerId, data: { nextFollowUpAt: date } });
                      setSelectedPartner({ ...selectedPartner, nextFollowUpAt: date });
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Letzter Kontakt</label>
                  <div className="mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const now = new Date().toISOString();
                        updatePartnerCrmMutation.mutate({ id: selectedPartner.partnerId, data: { lastContactAt: now } });
                        setSelectedPartner({ ...selectedPartner, lastContactAt: now });
                      }}
                    >
                      <Clock className="h-3 w-3 mr-1" /> Jetzt markieren
                    </Button>
                    <span className="ml-2 text-sm text-muted-foreground">{formatDateTime(selectedPartner.lastContactAt)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Add Activity */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-1"><Activity className="h-4 w-4" /> Aktivität hinzufügen</h3>
                <div className="flex gap-2">
                  <Select value={newActivityType} onValueChange={setNewActivityType}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(activityTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Zusammenfassung..."
                    value={newActivitySummary}
                    onChange={(e) => setNewActivitySummary(e.target.value)}
                    className="flex-grow"
                  />
                  <Button
                    size="sm"
                    disabled={!newActivitySummary.trim() || addActivityMutation.isPending}
                    onClick={() => addActivityMutation.mutate({
                      entityType: "partner",
                      entityId: selectedPartner.partnerId,
                      activityType: newActivityType,
                      summary: newActivitySummary,
                    })}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Activity Log */}
              {partnerActivities.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Aktivitäten</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {partnerActivities.map((a: any) => (
                      <div key={a.id} className="flex items-start gap-2 text-sm p-2 bg-muted/50 rounded">
                        <Badge variant="outline" className="text-xs shrink-0">{activityTypeLabels[a.activityType] || a.activityType}</Badge>
                        <span className="flex-grow">{a.summary}</span>
                        <span className="text-muted-foreground text-xs shrink-0">{formatDateTime(a.occurredAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Notes */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-1"><MessageSquare className="h-4 w-4" /> Notiz hinzufügen</h3>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Notiz eingeben..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-[60px]"
                  />
                  <Button
                    size="sm"
                    className="self-end"
                    disabled={!newNote.trim() || addNoteMutation.isPending}
                    onClick={() => addNoteMutation.mutate({
                      entityType: "partner",
                      entityId: selectedPartner.partnerId,
                      note: newNote,
                    })}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Speichern
                  </Button>
                </div>
              </div>

              {partnerNotes.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {partnerNotes.map((n: any) => (
                    <div key={n.id} className="p-3 bg-muted/50 rounded text-sm">
                      <p>{n.note}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDateTime(n.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Customer Detail Dialog */}
      <Dialog open={customerDetailOpen} onOpenChange={setCustomerDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {selectedCustomer?.fullName || selectedCustomer?.username}
            </DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {selectedCustomer.email}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Registriert: {formatDate(selectedCustomer.createdAt)}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{selectedCustomer.bookingCount || 0}</div>
                    <p className="text-sm text-muted-foreground">Buchungen</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{Number(selectedCustomer.totalSpend || 0).toFixed(2)} €</div>
                    <p className="text-sm text-muted-foreground">Gesamtumsatz</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{formatDate(selectedCustomer.lastActivityAt)}</div>
                    <p className="text-sm text-muted-foreground">Letzte Aktivität</p>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Segment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kundensegment</label>
                  <Select
                    value={selectedCustomer.segment || "neu"}
                    onValueChange={(value) => {
                      updateCustomerCrmMutation.mutate({ id: selectedCustomer.id, data: { segment: value } });
                      setSelectedCustomer({ ...selectedCustomer, segment: value });
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(segmentLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tags</label>
                  <Input
                    className="mt-1"
                    placeholder="z.B. Familie, Stammdkunde"
                    value={selectedCustomer.tags || ""}
                    onChange={(e) => setSelectedCustomer({ ...selectedCustomer, tags: e.target.value })}
                    onBlur={() => {
                      if (selectedCustomer.tags !== undefined) {
                        updateCustomerCrmMutation.mutate({ id: selectedCustomer.id, data: { tags: selectedCustomer.tags } });
                      }
                    }}
                  />
                </div>
              </div>

              <Separator />

              {/* Add Activity */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-1"><Activity className="h-4 w-4" /> Aktivität hinzufügen</h3>
                <div className="flex gap-2">
                  <Select value={newActivityType} onValueChange={setNewActivityType}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(activityTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Zusammenfassung..."
                    value={newActivitySummary}
                    onChange={(e) => setNewActivitySummary(e.target.value)}
                    className="flex-grow"
                  />
                  <Button
                    size="sm"
                    disabled={!newActivitySummary.trim() || addActivityMutation.isPending}
                    onClick={() => addActivityMutation.mutate({
                      entityType: "customer",
                      entityId: selectedCustomer.id,
                      activityType: newActivityType,
                      summary: newActivitySummary,
                    })}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {customerActivities.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Aktivitäten</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {customerActivities.map((a: any) => (
                      <div key={a.id} className="flex items-start gap-2 text-sm p-2 bg-muted/50 rounded">
                        <Badge variant="outline" className="text-xs shrink-0">{activityTypeLabels[a.activityType] || a.activityType}</Badge>
                        <span className="flex-grow">{a.summary}</span>
                        <span className="text-muted-foreground text-xs shrink-0">{formatDateTime(a.occurredAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Notes */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-1"><MessageSquare className="h-4 w-4" /> Notiz hinzufügen</h3>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Notiz eingeben..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-[60px]"
                  />
                  <Button
                    size="sm"
                    className="self-end"
                    disabled={!newNote.trim() || addNoteMutation.isPending}
                    onClick={() => addNoteMutation.mutate({
                      entityType: "customer",
                      entityId: selectedCustomer.id,
                      note: newNote,
                    })}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Speichern
                  </Button>
                </div>
              </div>

              {customerNotes.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {customerNotes.map((n: any) => (
                    <div key={n.id} className="p-3 bg-muted/50 rounded text-sm">
                      <p>{n.note}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDateTime(n.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
