import { useQuery } from "@tanstack/react-query";
import type { Experience } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Clock, Euro } from "lucide-react";
import { Link } from "wouter";

export default function BowlingOverview() {
  const { data: experiences, isLoading } = useQuery<Experience[]>({
    queryKey: ["/api/experiences"],
  });

  const bowlingCenters = experiences?.filter((exp: any) => 
    exp.category === 'bowling' ||
    exp.title?.toLowerCase().includes('bowling') ||
    exp.title?.toLowerCase().includes('bowltreff') ||
    exp.title?.toLowerCase().includes('bowlorado')
  ) || [];

  const bochum = bowlingCenters.filter((center: any) => center.city === 'Bochum');
  const dortmund = bowlingCenters.filter((center: any) => center.city === 'Dortmund');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎳 FreizeitEngel Bowling Centers
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Alle {bowlingCenters.length} Bowling-Center mit Bahnen-Reservierung und Zeitslot-Buchung
          </p>
          <div className="flex justify-center gap-4 mb-8">
            <Badge className="bg-orange-100 text-orange-800">
              {bochum.length} in Bochum
            </Badge>
            <Badge className="bg-red-100 text-red-800">
              {dortmund.length} in Dortmund
            </Badge>
          </div>
        </div>

        {/* Bochum Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-orange-600" />
            Bochum ({bochum.length} Bowling-Center)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bochum.map((center: any) => (
              <BowlingCard key={center.id} center={center} />
            ))}
          </div>
        </div>

        {/* Dortmund Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-red-600" />
            Dortmund ({dortmund.length} Bowling-Center)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dortmund.map((center: any) => (
              <BowlingCard key={center.id} center={center} />
            ))}
          </div>
        </div>

        <div className="text-center mt-12 p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Bowling-spezifisches Buchungssystem
          </h3>
          <p className="text-gray-600 mb-4">
            Alle Bowling-Center nutzen unser spezielles Bahnen-Reservierungssystem mit:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="outline">Bahnen-Reservierung</Badge>
            <Badge variant="outline">Zeitslot-Buchung</Badge>
            <Badge variant="outline">Peak/Off-Peak Preise</Badge>
            <Badge variant="outline">Schuhverleih separat</Badge>
            <Badge variant="outline">Gruppen-Pakete</Badge>
            <Badge variant="outline">Kindergeburtstage</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BowlingCardProps {
  center: any;
}

function BowlingCard({ center }: BowlingCardProps) {
  const getCenterType = (title: string) => {
    if (title.includes('Bowlorado')) return 'Premium Center';
    if (title.includes('BOWLTREFF')) return 'Sport Center';
    if (title.includes('Bowling Treff')) return 'Family Center';
    return 'Bowling Center';
  };

  const getExpectedOffers = (title: string) => {
    const titleLower = title.toLowerCase();
    let count = 5; // Base offers
    
    if (titleLower.includes('bowlorado') || titleLower.includes('bochum')) count = 6; // +Kindergeburtstag
    if (titleLower.includes('dortmund') || titleLower.includes('bowltreff')) count = 6; // +Black Light
    
    return count;
  };

  const centerType = getCenterType(center.title);
  const offerCount = getExpectedOffers(center.title);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge variant={centerType === 'Premium Center' ? 'default' : 'secondary'}>
            {centerType}
          </Badge>
          <Badge variant="outline" className="text-xs">
            ID: {center.id}
          </Badge>
        </div>
        <CardTitle className="text-lg leading-tight">
          {center.title.replace(/^(Bowling-Spaß bei |Bowling bei |Bowling )/, '')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            {center.city}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="h-4 w-4 text-orange-600 font-bold text-xs">🎳</div>
            {offerCount} Buchungsoptionen
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Euro className="h-4 w-4" />
            ab 1,90€ - 20,40€ pro Person
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            Pro Person Abrechnung
          </div>
        </div>
        
        <Link href={`/experience/${center.id}`}>
          <Button className="w-full bg-orange-600 hover:bg-orange-700">
            Bahnen-Reservierung testen
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}