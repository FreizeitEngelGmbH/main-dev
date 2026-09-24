import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BrandCardProps {
  id: string;
  /** STATIC: link target; partners without a shop page resolve like the home page's partner cards. */
  href: string;
  name: string;
  description: string;
  logoColor: string;
  icon: React.ReactNode;
  experienceCount?: number;
}

export function BrandCard({ id, href, name, description, logoColor, icon, experienceCount = 0 }: BrandCardProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden transition-all hover:shadow-md">
      <div className="p-6">
        <div className="flex items-start">
          <div className={`${logoColor} rounded-lg p-3 mr-4`}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
            {experienceCount > 0 && (
              <Badge variant="outline" className="mb-2">
                {experienceCount} Erlebnisse
              </Badge>
            )}
          </div>
        </div>
        
        <p className="mt-3 text-gray-600 text-sm line-clamp-3">
          {description}
        </p>
        
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
          <Link href={href} data-testid={`brand-card-${id}`}>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5">
              Details ansehen
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}