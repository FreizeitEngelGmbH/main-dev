import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Layers, Settings, Edit } from "lucide-react";
import { apiRequest, queryClient } from "@/partner-demo/queryClient";

interface Resource {
  id: number;
  experienceId: number;
  partnerId: number;
  name: string;
  description: string | null;
  capacity: number;
  resourceType: string;
  isActive: boolean;
}

interface Experience {
  id: number;
  title: string;
}

export default function ResourceManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<string>("");
  const [newResource, setNewResource] = useState({
    name: "",
    description: "",
    capacity: 1,
    resourceType: "general"
  });

  const { data: resources = [], isLoading: loadingResources } = useQuery<Resource[]>({
    queryKey: ['/api/partner/resources'],
  });

  const { data: experiences = [] } = useQuery<Experience[]>({
    queryKey: ['/api/partner/experiences'],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/partner/resources', {
        experienceId: parseInt(selectedExperience),
        ...newResource
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partner/resources'] });
      setIsDialogOpen(false);
      setNewResource({ name: "", description: "", capacity: 1, resourceType: "general" });
      setSelectedExperience("");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/partner/resources/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partner/resources'] });
    }
  });

  const resourceTypes = [
    { value: "lane", label: "Bahn (Bowling, Kegeln)" },
    { value: "room", label: "Raum (Escape Room, VR)" },
    { value: "table", label: "Tisch (Billard, Dart)" },
    { value: "station", label: "Station (VR, Arcade)" },
    { value: "field", label: "Feld (Soccer, Padel)" },
    { value: "course", label: "Parcours (Minigolf, Klettern)" },
    { value: "general", label: "Allgemein" }
  ];

  const getExperienceName = (experienceId: number) => {
    const exp = experiences.find(e => e.id === experienceId);
    return exp?.title || `Erlebnis #${experienceId}`;
  };

  const groupedResources = resources.reduce((acc, resource) => {
    const expId = resource.experienceId;
    if (!acc[expId]) acc[expId] = [];
    acc[expId].push(resource);
    return acc;
  }, {} as Record<number, Resource[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Ressourcen-Management</h2>
          <p className="text-gray-600">Verwalten Sie Bahnen, Räume und andere buchbare Ressourcen</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Neue Ressource
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neue Ressource erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Erlebnis</Label>
                <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Erlebnis auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {experiences.map((exp) => (
                      <SelectItem key={exp.id} value={exp.id.toString()}>
                        {exp.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Name</Label>
                <Input
                  value={newResource.name}
                  onChange={(e) => setNewResource(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="z.B. Bahn 1, VR Station A"
                />
              </div>

              <div>
                <Label>Ressourcentyp</Label>
                <Select 
                  value={newResource.resourceType} 
                  onValueChange={(value) => setNewResource(prev => ({ ...prev, resourceType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Kapazität (max. Personen)</Label>
                <Input
                  type="number"
                  min={1}
                  value={newResource.capacity}
                  onChange={(e) => setNewResource(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
                />
              </div>

              <div>
                <Label>Beschreibung (optional)</Label>
                <Input
                  value={newResource.description}
                  onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Zusätzliche Infos zur Ressource"
                />
              </div>

              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => createMutation.mutate()}
                disabled={!selectedExperience || !newResource.name || createMutation.isPending}
              >
                {createMutation.isPending ? "Erstelle..." : "Ressource erstellen"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loadingResources ? (
        <div className="text-center py-8 text-gray-500">Lade Ressourcen...</div>
      ) : resources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Layers className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Ressourcen vorhanden</h3>
            <p className="text-gray-600 mb-4">
              Erstellen Sie Ressourcen wie Bahnen, Räume oder Tische für Ihre Erlebnisse.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Erste Ressource erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedResources).map(([expId, expResources]) => (
            <Card key={expId}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-purple-600" />
                  {getExperienceName(parseInt(expId))}
                  <span className="text-sm font-normal text-gray-500">
                    ({expResources.length} Ressource{expResources.length !== 1 ? 'n' : ''})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {expResources.map((resource) => (
                    <div 
                      key={resource.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${resource.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <div>
                          <div className="font-medium">{resource.name}</div>
                          <div className="text-sm text-gray-500">
                            {resourceTypes.find(t => t.value === resource.resourceType)?.label || resource.resourceType}
                            {' · '}
                            Max. {resource.capacity} Person{resource.capacity !== 1 ? 'en' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => deleteMutation.mutate(resource.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
