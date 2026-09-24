import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Honest placeholder for features whose source-app pages need backend data this
 * build does not have yet (e.g. the customer profile with bookings, the community
 * blog). Reached from existing header/menu links so they no longer fall through to
 * the catch-all redirect. Styled like the "Gruppe nicht gefunden" card.
 */
export default function UnavailablePage({ title, description }: { title: string; description: string }) {
  return (
    <div className="min-h-[60vh] bg-gradient-to-br from-purple-50 via-white to-pink-50/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <h1 className="text-xl font-bold mb-2">{title}</h1>
          <p className="text-muted-foreground mb-4">{description}</p>
          <Link href="/home">
            <Button>Zur Startseite</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
