import { useQuery } from "@tanstack/react-query";
import type { Experience } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Clock, Euro } from "lucide-react";
import { Link } from "wouter";

export default function SwimmingPoolsOverview() {
  const { data: experiences, isLoading } = useQuery<Experience[]>({
    queryKey: ["/api/experiences"],
  });

  const swimmingPools = experiences?.filter((exp: any) => 
    exp.category === 'swimming' || 
    exp.title?.toLowerCase().includes('schwimm') ||
    exp.title?.toLowerCase().includes('wasser') ||
    exp.title?.toLowerCase().includes('bad') ||
    exp.title?.toLowerCase().includes('pool')
  ) || [];

  const bochum = swimmingPools.filter((pool: any) => pool.city === 'Bochum');
  const dortmund = swimmingPools.filter((pool: any) => pool.city === 'Dortmund');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            FreizeitEngel Schwimmbäder
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Alle {swimmingPools.length} Schwimmbäder mit einheitlichem Shop-Buchungssystem
          </p>
          <div className="flex justify-center gap-4 mb-8">
            <Badge className="bg-blue-100 text-blue-800">
              {bochum.length} in Bochum
            </Badge>
            <Badge className="bg-green-100 text-green-800">
              {dortmund.length} in Dortmund
            </Badge>
          </div>
        </div>

        {/* Bochum Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            Bochum ({bochum.length} Schwimmbäder)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bochum.map((pool: any) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        </div>

        {/* Dortmund Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-green-600" />
            Dortmund ({dortmund.length} Schwimmbäder)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dortmund.map((pool: any) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        </div>

        <div className="text-center mt-12 p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Einheitliches Buchungssystem
          </h3>
          <p className="text-gray-600 mb-4">
            Alle Schwimmbäder verwenden jetzt das gleiche Shop-Style Buchungssystem mit:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="outline">Sofortige Preissichtbarkeit</Badge>
            <Badge variant="outline">Dynamische Angebote</Badge>
            <Badge variant="outline">QR-Code Tickets</Badge>
            <Badge variant="outline">Online-Zahlungen</Badge>
            <Badge variant="outline">Automatische Scroll-Navigation</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PoolCardProps {
  pool: any;
}

function PoolCard({ pool }: PoolCardProps) {
  const getPoolType = (title: string) => {
    if (title.includes('WasserWelten')) return 'Erlebnisbad';
    if (title.includes('Schwimmverein')) return 'Trainings-Pool';
    if (title.includes('Freibad')) return 'Freibad';
    if (title.includes('Hallenbad')) return 'Hallenbad';
    return 'Schwimmbad';
  };

  const getExpectedOffers = (title: string) => {
    const titleLower = title.toLowerCase();
    let count = 5; // Base offers
    
    if (titleLower.includes('wasserwelten')) count = 9; // Original detailed offers
    else if (titleLower.includes('schwimmverein')) count = 6; // +Training
    else if (titleLower.includes('querenburg') || titleLower.includes('höntrop') || titleLower.includes('nordbad')) count = 7; // +Sauna, +10er-Karte
    else if (titleLower.includes('hallen') && !titleLower.includes('frei')) count = 7; // +Abendkarte, +10er-Karte
    else if (titleLower.includes('frei')) count = 5; // Base offers only
    
    return count;
  };

  const poolType = getPoolType(pool.title);
  const offerCount = getExpectedOffers(pool.title);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge variant={poolType === 'Erlebnisbad' ? 'default' : 'secondary'}>
            {poolType}
          </Badge>
          <Badge variant="outline" className="text-xs">
            ID: {pool.id}
          </Badge>
        </div>
        <CardTitle className="text-lg leading-tight">
          {pool.title.replace(/^(Schwimmen & Entspannung bei |Schwimmen bei |Sport & Training bei |Wassererlebnis bei )/, '')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            {pool.city}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            {offerCount} Buchungsoptionen
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Euro className="h-4 w-4" />
            ab 2,00€ - 18,00€
          </div>
        </div>
        
        <Link href={`/experience/${pool.id}`}>
          <Button className="w-full">
            Shop-Buchung testen
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}