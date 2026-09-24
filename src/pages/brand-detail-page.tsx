import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { MapPin, Calendar, ArrowLeft, ExternalLink, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Experience } from "@shared/schema";
import { brands, Brand } from "@/data/brands";
import { ExperienceCard } from "@/components/ui/experience-card";

interface BrandDetailProps {
  id: string;
}

export default function BrandDetailPage({ id }: BrandDetailProps) {
  const [, navigate] = useLocation();

  // Finde die Markendetails aus den statischen Daten
  const brand = brands.find(b => b.id === id);

  // Holen aller Erlebnisse, um später nach Markenname zu filtern
  // In einer echten Anwendung würde man hier einen spezifischen Endpunkt verwenden
  const { data: experiences, isLoading: isLoadingExperiences } = useQuery<Experience[]>({
    queryKey: ["/api/experiences"],
  });

  // Wenn die Marke nicht gefunden wurde, zeige eine Fehlermeldung
  if (!brand) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-gray-900">Marke nicht gefunden</h2>
          <p className="mt-4 text-lg text-gray-600">
            Die gesuchte Marke existiert nicht oder wurde entfernt.
          </p>
          <Button onClick={() => navigate("/brands")} className="mt-6">
            Zurück zur Markenübersicht
          </Button>
        </div>
      </div>
    );
  }

  // Filter Erlebnisse nach Markennamen
  // In einer echten Anwendung würde diese Zuordnung über die API erfolgen
  const brandExperiences = experiences?.filter(exp => exp.title.includes(brand.name)) || [];

  return (
    <div className="bg-white min-h-screen pb-12">
      {/* Header Hero Section mit Markendetails */}
      <div className="relative bg-gray-900 text-white">
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <img
            src={brand.featuredImageUrl}
            alt={brand.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/60 to-gray-900/90"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14">
          <div className="flex flex-col items-center text-center">
            <Link href="/brands">
              <Button variant="ghost" size="sm" className="mb-8 text-white/80 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Alle Marken
              </Button>
            </Link>

            <div className={`h-24 w-24 rounded-full ${brand.logoColor} flex items-center justify-center mb-6`}>
              <div className="text-4xl">{brand.icon}</div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">{brand.name}</h1>
            <p className="text-xl text-white/80 max-w-3xl">{brand.description}</p>

            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {brand.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-white/10 hover:bg-white/15 text-white border-none">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hauptinhalt */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Linke Spalte mit Markeninformationen */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Über {brand.name}</h2>
            <div className="prose prose-lg max-w-none">
              <p className="whitespace-pre-line">{brand.longDescription}</p>
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Unsere Spezialitäten</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {brand.specialty.map(spec => (
                  <div key={spec} className="bg-gray-50 p-4 rounded-lg flex items-start">
                    <Tag className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rechte Spalte mit Kontaktinformationen */}
          <div>
            <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Kontaktinformationen</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Standort</p>
                    <p className="text-gray-600">{brand.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Gegründet</p>
                    <p className="text-gray-600">{brand.foundedYear}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <ExternalLink className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Website</p>
                    <a 
                      href={`https://${brand.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {brand.website}
                    </a>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Anzahl der Erlebnisse</span>
                <Badge>{brand.experienceCount}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Erlebnisse dieser Marke */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Erlebnisse von {brand.name}</h2>
          
          {isLoadingExperiences ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : brandExperiences.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {brandExperiences.map((experience) => (
                <ExperienceCard
                  key={experience.id}
                  id={experience.id}
                  title={experience.title}
                  shortDescription={experience.shortDescription}
                  location={experience.location}
                  city={experience.city}
                  price={experience.price}
                  imageUrl={experience.imageUrl || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400&q=80"}
                  rating={experience.rating || 0}
                  reviewCount={experience.reviewCount || 0}
                  featured={experience.featured ?? false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Keine Erlebnisse gefunden.</p>
              <p className="text-sm text-gray-400 mt-2">Schauen Sie später wieder vorbei für neue Angebote.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}