import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Users, 
  MapPin, 
  Star, 
  Shield, 
  Clock, 
  CheckCircle, 
  Award,
  Target,
  Lightbulb,
  Globe
} from "lucide-react";
import { Link } from "wouter";

export default function AboutPage() {
  const stats = [
    { number: "26+", label: "Vertrauensvolle Partner", icon: <Users className="h-6 w-6" /> },
    { number: "Deutschland", label: "Bundesweit", icon: <Globe className="h-6 w-6" /> },
    { number: "100%", label: "Authentische Angebote", icon: <CheckCircle className="h-6 w-6" /> },
    { number: "24/7", label: "Online-Buchung", icon: <Clock className="h-6 w-6" /> }
  ];

  const values = [
    {
      icon: <Heart className="h-8 w-8 text-red-500" />,
      title: "Lokale Verbundenheit",
      description: "Wir fördern echte Begegnungen und unterstützen lokale Unternehmen deutschlandweit."
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-500" />,
      title: "Vertrauen & Sicherheit",
      description: "Alle Partner werden sorgfältig geprüft. Sichere Buchung und transparente Preise garantiert."
    },
    {
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      title: "Qualitätsversprechen",
      description: "Nur authentische Erlebnisse von verifizierten Partnern - keine künstlichen Angebote."
    },
    {
      icon: <Target className="h-8 w-8 text-green-500" />,
      title: "Persönliche Beratung",
      description: "Unser Team hilft bei der Auswahl des perfekten Erlebnisses für jeden Anlass."
    }
  ];

  const features = [
    "Einfache Online-Buchung in wenigen Klicks",
    "Sofortige Bestätigung per E-Mail",
    "Flexible Stornierungsbedingungen",
    "Persönlicher Kundensupport",
    "Sichere Zahlungsabwicklung",
    "Bewertungssystem für Transparenz"
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/90 to-primary-foreground/80 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white">
              Über FreizeitEngel
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Ihre lokalen Freizeiterlebnisse
              <span className="block text-primary-foreground/80">deutschlandweit</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              FreizeitEngel verbindet Sie mit authentischen Erlebnissen vor Ihrer Haustür. 
              Entdecken Sie vertrauensvolle Partner und erleben Sie Ihre Region neu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search">
                <Button size="lg" variant="secondary" className="text-primary">
                  Erlebnisse entdecken
                </Button>
              </Link>
              <Link href="/partner">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black bg-white text-black">
                  Partner werden
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-3 text-primary">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center mb-4">
              <Lightbulb className="h-6 w-6 text-primary mr-3" />
              <Badge variant="outline">Unsere Mission</Badge>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Echte Erlebnisse, echte Verbindungen
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              FreizeitEngel wurde aus der Überzeugung heraus gegründet, dass die besten Erlebnisse 
              oft direkt vor unserer Haustür warten. In einer Zeit, in der digitale Plattformen 
              mit künstlichen Angeboten überflutet werden, setzen wir auf Authentizität.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Jeder unserer Partner wird persönlich ausgewählt und geprüft. Von traditionellen 
              Schwimmbädern über moderne Kinos bis hin zu familiengeführten Bowlingcentern - 
              wir zeigen Ihnen die Vielfalt Ihrer Region.
            </p>
            <div className="flex items-center text-primary">
              <Globe className="h-5 w-5 mr-2" />
              <span className="font-medium">Deutschlandweite Expansion</span>
            </div>
          </div>
          
          <div className="space-y-6">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <Award className="h-6 w-6 text-primary mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Qualitätsversprechen</h3>
                    <p className="text-gray-600">
                      Alle Angebote stammen von verifizierten lokalen Partnern. 
                      Keine künstlichen oder aufgeblähten Erlebnisse.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">100% Transparent</h3>
                    <p className="text-gray-600">
                      Echte Preise, echte Bewertungen, echte Verfügbarkeiten. 
                      Was Sie sehen, ist das, was Sie bekommen.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Unsere Werte</Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Was uns antreibt
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Diese Prinzipien leiten uns bei allem, was wir tun - von der Partnerauswahl 
              bis zur Kundenbetreuung.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="outline" className="mb-4">Warum FreizeitEngel?</Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Einfach. Sicher. Lokal.
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Unsere Plattform macht es Ihnen leicht, die perfekten Freizeiterlebnisse 
              in Ihrer Nähe zu finden und zu buchen. Ohne Umwege, ohne Überraschungen.
            </p>
            
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 rounded-2xl">
            <div className="text-center">
              <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Made in Ruhrgebiet
              </h3>
              <p className="text-gray-600 mb-6">
                Als lokales Unternehmen kennen wir die Region und ihre Besonderheiten. 
                Wir leben hier, arbeiten hier und erleben hier.
              </p>
              <div className="flex justify-center space-x-4">
                <Badge variant="secondary">Dortmund</Badge>
                <Badge variant="secondary">Bochum</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Bereit für Ihr nächstes Erlebnis?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Entdecken Sie authentische Partner und einzigartige Erlebnisse 
            deutschlandweit. Jetzt sofort buchbar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button size="lg" variant="secondary" className="text-primary">
                Alle Erlebnisse ansehen
              </Button>
            </Link>
            <Link href="/partner">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black bg-white text-black">
                Als Partner anmelden
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}