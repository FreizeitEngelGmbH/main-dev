import { MapPin } from 'lucide-react';

/**
 * STATIC: recreated from EngelFolder's components/partner-location-map.tsx with the same export and
 * props. The original renders a Leaflet map (react-leaflet, leaflet, OpenStreetMap tiles, marker icons
 * from cdnjs); those packages are not installed and no remote tiles may load in this build. This
 * version shows the original's own "location" placeholder with the partner's address instead.
 */
interface PartnerLocationMapProps {
  latitude?: number | null;
  longitude?: number | null;
  partnerName: string;
  address?: string | null;
  city?: string | null;
}

export function PartnerLocationMap({ partnerName, address, city }: PartnerLocationMapProps) {
  return (
    <div className="bg-muted rounded-lg p-6 text-center h-full flex flex-col items-center justify-center" data-testid="map-no-location">
      <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
      <p className="text-sm font-medium">{partnerName}</p>
      {(address || city) && (
        <p className="text-sm text-muted-foreground">{[address, city].filter(Boolean).join(", ")}</p>
      )}
      <p className="text-xs text-muted-foreground mt-2">Karte nicht verfügbar</p>
    </div>
  );
}
