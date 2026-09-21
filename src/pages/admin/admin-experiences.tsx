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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  PlusCircle, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  AlertTriangle, 
  Eye, 
  Loader2,
  Check,
  X
} from "lucide-react";
import { Experience, Category, insertExperienceSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Create a schema for experience filtering and form
const experienceFormSchema = insertExperienceSchema.extend({
  id: z.number().optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

export default function AdminExperiences() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);

  // Fetch all experiences
  const { data: experiences, isLoading: isLoadingExperiences } = useQuery<Experience[]>({
    queryKey: ["/api/experiences"],
  });

  // Fetch all categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Create experience mutation
  const createExperienceMutation = useMutation({
    mutationFn: async (data: ExperienceFormValues) => {
      const res = await apiRequest("POST", "/api/experiences", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Erlebnis erstellt",
        description: "Das Erlebnis wurde erfolgreich erstellt.",
      });
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/experiences"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: `Erlebnis konnte nicht erstellt werden: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update experience mutation
  const updateExperienceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ExperienceFormValues> }) => {
      const res = await apiRequest("PUT", `/api/experiences/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Erlebnis aktualisiert",
        description: "Das Erlebnis wurde erfolgreich aktualisiert.",
      });
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/experiences"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: `Erlebnis konnte nicht aktualisiert werden: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete experience mutation
  const deleteExperienceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/experiences/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Erlebnis gelöscht",
        description: "Das Erlebnis wurde erfolgreich gelöscht.",
      });
      setDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/experiences"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: `Erlebnis konnte nicht gelöscht werden: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Add Experience Form
  const addForm = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      shortDescription: "",
      location: "",
      city: "",
      postalCode: "",
      country: "Deutschland",
      price: 0,
      imageUrl: "",
      categoryId: 0,
      partnerId: 0,
      featured: false,
      active: true,
    },
  });

  // Edit Experience Form
  const editForm = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      shortDescription: "",
      location: "",
      city: "",
      postalCode: "",
      country: "Deutschland",
      price: 0,
      imageUrl: "",
      categoryId: 0,
      partnerId: 0,
      featured: false,
      active: true,
    },
  });

  // Handle adding a new experience
  const onAddSubmit = (data: ExperienceFormValues) => {
    createExperienceMutation.mutate(data);
  };

  // Handle editing an experience
  const onEditSubmit = (data: ExperienceFormValues) => {
    if (selectedExperience) {
      updateExperienceMutation.mutate({ id: selectedExperience.id, data });
    }
  };

  // Handle deleting an experience
  const handleDelete = () => {
    if (selectedExperience) {
      deleteExperienceMutation.mutate(selectedExperience.id);
    }
  };

  // Open edit dialog and populate form
  const handleEdit = (experience: Experience) => {
    setSelectedExperience(experience);
    editForm.reset({
      title: experience.title,
      description: experience.description,
      shortDescription: experience.shortDescription,
      location: experience.location,
      city: experience.city,
      postalCode: experience.postalCode,
      country: experience.country,
      price: experience.price,
      imageUrl: experience.imageUrl || "",
      categoryId: experience.categoryId,
      partnerId: experience.partnerId,
      featured: experience.featured,
      active: experience.active,
    });
    setIsEditDialogOpen(true);
  };

  // Filter experiences based on search query
  const filteredExperiences = experiences
    ? experiences.filter(
        (experience) =>
          experience.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          experience.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          experience.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          experience.postalCode.includes(searchQuery)
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Erlebnisse</h1>
          <p className="text-muted-foreground">
            Verwalte alle Erlebnisse auf der Plattform
          </p>
        </div>
        <Button
          className="mt-4 sm:mt-0"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Erlebnis hinzufügen
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Suche nach Erlebnissen..."
                  className="pl-8 w-full sm:max-w-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingExperiences ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredExperiences.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Titel</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Preis</TableHead>
                    <TableHead>Standort</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExperiences.map((experience) => {
                    const category = categories?.find((c) => c.id === experience.categoryId);
                    return (
                      <TableRow key={experience.id}>
                        <TableCell>{experience.id}</TableCell>
                        <TableCell>
                          <div className="font-medium max-w-[200px] truncate" title={experience.title}>
                            {experience.title}
                          </div>
                        </TableCell>
                        <TableCell>{category?.name || "-"}</TableCell>
                        <TableCell>{(experience.price).toFixed(2)} €</TableCell>
                        <TableCell>{experience.city}</TableCell>
                        <TableCell>
                          {experience.active ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Check className="h-3 w-3 mr-1" /> Aktiv
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              <X className="h-3 w-3 mr-1" /> Inaktiv
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {experience.featured ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              Featured
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
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
                                onClick={() => window.open(`/experience/${experience.id}`, "_blank")}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ansehen
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(experience)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedExperience(experience);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Löschen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Keine Erlebnisse gefunden.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Experience Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Neues Erlebnis hinzufügen</DialogTitle>
            <DialogDescription>
              Fülle das Formular aus, um ein neues Erlebnis zu erstellen.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-6">
              <FormField
                control={addForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titel*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kurzbeschreibung*</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vollständige Beschreibung*</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={addForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standort/Adresse*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stadt*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PLZ*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={addForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Land*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Land auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Deutschland">Deutschland</SelectItem>
                          <SelectItem value="Österreich">Österreich</SelectItem>
                          <SelectItem value="Schweiz">Schweiz</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategorie*</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Kategorie auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingCategories ? (
                            <div className="flex justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : (
                            categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="partnerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner-ID*</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={addForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preis (€)*</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bild-URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>Direkte URL zu einem Bild</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex flex-col justify-center space-y-4">
                  <FormField
                    control={addForm.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Featured</FormLabel>
                          <FormDescription>
                            Auf der Startseite hervorgehoben
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Aktiv</FormLabel>
                          <FormDescription>
                            Öffentlich sichtbar und buchbar
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button
                  type="submit"
                  disabled={createExperienceMutation.isPending}
                >
                  {createExperienceMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird gespeichert...
                    </>
                  ) : (
                    "Erlebnis hinzufügen"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Experience Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Erlebnis bearbeiten</DialogTitle>
            <DialogDescription>
              Ändere die Details dieses Erlebnisses.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titel*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kurzbeschreibung*</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vollständige Beschreibung*</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standort/Adresse*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stadt*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PLZ*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Land*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Land auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Deutschland">Deutschland</SelectItem>
                          <SelectItem value="Österreich">Österreich</SelectItem>
                          <SelectItem value="Schweiz">Schweiz</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategorie*</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Kategorie auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingCategories ? (
                            <div className="flex justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : (
                            categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="partnerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner-ID*</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preis (€)*</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bild-URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>Direkte URL zu einem Bild</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex flex-col justify-center space-y-4">
                  <FormField
                    control={editForm.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Featured</FormLabel>
                          <FormDescription>
                            Auf der Startseite hervorgehoben
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Aktiv</FormLabel>
                          <FormDescription>
                            Öffentlich sichtbar und buchbar
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button
                  type="submit"
                  disabled={updateExperienceMutation.isPending}
                >
                  {updateExperienceMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird gespeichert...
                    </>
                  ) : (
                    "Änderungen speichern"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Erlebnis löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Bist du sicher, dass du das Erlebnis "{selectedExperience?.title}" löschen möchtest? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteExperienceMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gelöscht...
                </>
              ) : (
                "Löschen"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
