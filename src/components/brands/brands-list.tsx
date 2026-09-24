import { Link } from "wouter";
import { ArrowRight, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandCard } from "./brand-card";
import { marketplacePartners } from "@/partner/data";
import { resolvePartnerRoute } from "@/lib/activity-route-resolver";

interface Partner {
  id: number;
  companyName: string;
  description: string;
  category: string;
  city: string;
  website?: string;
}

export function BrandsList() {
  // STATIC: the same partner list the home page uses, instead of GET /api/partners.
  const partners: Partner[] = marketplacePartners;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-800 sm:text-3xl">
            Unsere Partner
          </h2>
          <p className="mt-1 text-base text-gray-600">
            Entdecken Sie unsere Auswahl an vertrauenswürdigen Anbietern
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners?.map((partner) => (
          <BrandCard
            key={partner.id}
            id={partner.id.toString()}
            href={resolvePartnerRoute(partner.id, partner.category)}
            name={partner.companyName}
            description={partner.description}
            logoColor="bg-gradient-to-br from-purple-500 to-blue-500"
            icon={<Building className="h-6 w-6 text-white" />}
            experienceCount={0}
          />
        ))}
      </div>
    </div>
  );
}