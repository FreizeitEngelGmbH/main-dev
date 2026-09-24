import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertExperienceSchema, Experience, Category, Partner } from "@shared/schema";

// Extended schema for the experience editor
const experienceFormSchema = insertExperienceSchema.extend({
  id: z.number().optional(),
  active: z.boolean().default(true),
  trending: z.boolean().default(false),
  recommended: z.boolean().default(false),
  featured: z.boolean().default(false),
});

type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

export default function ExperienceEditor() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch required data
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: partner } = useQuery<Partner>({
    queryKey: ["/api/partners/me"],
    enabled: !!user,
  });

  const { data: experience, isLoading: isLoadingExperience } = useQuery<Experience>({
    queryKey: [`/api/experiences/${id}`],
    enabled: isEditMode && !!id,
  });

  // Setup form with default values
  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      shortDescription: "",
      price: 0,
      location: "",
      city: "",
      postalCode: "",
      country: "Deutschland",
      partnerId: 0,
      categoryId: 0,
      imageUrl: "",
      active: true,
      trending: false,
      recommended: false,
      featured: false,
    },
  });

  // Update form when experience data is loaded
  useEffect(() => {
    if (experience && isEditMode) {
      form.reset({
        ...experience,
        // The stored record uses null for empty optional fields; the form expects undefined.
        duration: experience.duration ?? undefined,
        imageUrl: experience.imageUrl ?? undefined,
        maxParticipants: experience.maxParticipants ?? undefined,
        specialNotes: experience.specialNotes ?? undefined,
        instantBooking: experience.instantBooking ?? undefined,
        requiresApproval: experience.requiresApproval ?? undefined,
        active: !!experience.active,
        trending: !!experience.trending,
        recommended: !!experience.recommended,
        featured: !!experience.featured,
      });
    }
  }, [experience, form, isEditMode]);

  // Update partner ID when partner data is loaded
  useEffect(() => {
    if (partner && !isEditMode) {
      form.setValue("partnerId", partner.id);
    }
  }, [partner, form, isEditMode]);

  // Redirect if user is not a partner
  useEffect(() => {
    if (user && user.role !== "partner" && !partner) {
      navigate("/partner");
    }
  }, [user, partner, navigate]);

  // Create experience mutation
  const createMutation = useMutation({
    mutationFn: async (data: ExperienceFormValues) => {
      const response = await apiRequest("POST", "/api/experiences", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Erlebnis erstellt",
        description: "Dein Erlebnis wurde erfolgreich erstellt.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/partners/experiences"] });
      navigate("/partner/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler beim Erstellen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update experience mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ExperienceFormValues) => {
      const { id, ...updateData } = data;
      const response = await apiRequest("PATCH", `/api/experiences/${id}`, updateData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Erlebnis aktualisiert",
        description: "Dein Erlebnis wurde erfolgreich aktualisiert.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/partners/experiences"] });
      queryClient.invalidateQueries({ queryKey: [`/api/experiences/${id}`] });
      navigate("/partner/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler beim Aktualisieren",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExperienceFormValues) => {
    if (isEditMode) {
      updateMutation.mutate({ ...data, id: Number(id) });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEditMode && isLoadingExperience) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3">Lade Erlebnis...</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/partner/dashboard")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Erlebnis bearbeiten" : "Neues Erlebnis erstellen"}
            </h1>
            <p className="text-gray-500">
              {isEditMode
                ? "Bearbeite die Details deines Erlebnisses"
                : "Füge ein neues Erlebnis zu deinem Angebot hinzu"}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList>
                <TabsTrigger value="basic">Grundinfo</TabsTrigger>
                <TabsTrigger value="details">Details & Beschreibung</TabsTrigger>
                <TabsTrigger value="location">Standort</TabsTrigger>
                <TabsTrigger value="settings">Einstellungen</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle>Grundinformationen</CardTitle>
                    <CardDescription>
                      Die wichtigsten Informationen zu deinem Erlebnis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titel*</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="z.B. Kanufahrt auf der Spree" />
                          </FormControl>
                          <FormDescription>
                            Ein prägnanter, einladender Titel für dein Erlebnis
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shortDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kurzbeschreibung*</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Kurze Zusammenfassung deines Erlebnisses (max. 150 Zeichen)"
                              maxLength={150}
                              rows={2}
                            />
                          </FormControl>
                          <FormDescription>
                            Eine kurze Beschreibung, die in Übersichten angezeigt wird
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kategorie*</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(Number(value))}
                              defaultValue={field.value ? String(field.value) : undefined}
                              value={field.value ? String(field.value) : undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Wähle eine Kategorie" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories?.map((category) => (
                                  <SelectItem key={category.id} value={String(category.id)}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Wähle die passendste Kategorie für dein Erlebnis
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preis (€)*</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                step={0.01}
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Preis pro Person in Euro
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bild-URL</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://example.com/image.jpg"
                            />
                          </FormControl>
                          <FormDescription>
                            URL zu einem ansprechenden Bild deines Erlebnisses (später kannst du auch Bilder hochladen)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Details & Beschreibung</CardTitle>
                    <CardDescription>
                      Ausführliche Beschreibung und Details zu deinem Erlebnis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ausführliche Beschreibung*</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Beschreibe dein Erlebnis ausführlich..."
                              rows={8}
                            />
                          </FormControl>
                          <FormDescription>
                            Beschreibe ausführlich, was Teilnehmer erwartet, inkl. Ablauf, Besonderheiten und Highlights
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Location Tab */}
              <TabsContent value="location">
                <Card>
                  <CardHeader>
                    <CardTitle>Standort</CardTitle>
                    <CardDescription>
                      Wo findet dein Erlebnis statt?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse*</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="z.B. Hauptstraße 1"
                            />
                          </FormControl>
                          <FormDescription>
                            Die genaue Adresse oder der Treffpunkt
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PLZ*</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="z.B. 10115" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stadt*</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="z.B. Berlin" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Land*</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Wähle ein Land" />
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
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Einstellungen</CardTitle>
                    <CardDescription>
                      Weitere Einstellungen für dein Erlebnis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Aktiv</FormLabel>
                            <FormDescription>
                              Wenn aktiviert, wird dein Erlebnis auf der Plattform angezeigt
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />
                    
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Sichtbarkeit und Hervorhebung</h3>
                      <p className="text-sm text-gray-500">
                        Diese Einstellungen helfen, dein Erlebnis auf der Plattform hervorzuheben.
                        Hinweis: Nicht alle Optionen sind automatisch verfügbar, einige werden von unserem Team basierend
                        auf Qualität und Buchungsraten zugewiesen.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="trending"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Im Trend</FormLabel>
                              <FormDescription className="text-xs">
                                Zeigt ein "Im Trend" Badge an
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!isEditMode}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="recommended"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Empfohlen</FormLabel>
                              <FormDescription className="text-xs">
                                Zeigt ein "Empfehlung" Badge an
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!isEditMode}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="featured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Hervorgehoben</FormLabel>
                              <FormDescription className="text-xs">
                                Bewirbt dein Erlebnis in hervorgehobenen Bereichen
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!isEditMode}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/partner/dashboard")}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {isEditMode ? "Änderungen speichern" : "Erlebnis erstellen"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}