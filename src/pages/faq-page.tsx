import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail,
  Clock,
  CreditCard,
  Calendar,
  Users,
  Shield,
  MapPin,
  Search,
  Star
} from "lucide-react";
import { Link } from "wouter";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: React.ReactNode;
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const faqData: FAQItem[] = [
    // Buchung & Bezahlung
    {
      id: "booking-1",
      category: "Buchung & Bezahlung",
      icon: <Calendar className="h-5 w-5" />,
      question: "Wie funktioniert die Buchung eines Erlebnisses?",
      answer: "Die Buchung ist ganz einfach: Wählen Sie Ihr gewünschtes Erlebnis aus, klicken Sie auf 'Jetzt buchen', wählen Sie Datum und Teilnehmerzahl, geben Sie Ihre Daten ein und bezahlen Sie sicher online. Sie erhalten sofort eine Bestätigung per E-Mail."
    },
    {
      id: "booking-2",
      category: "Buchung & Bezahlung",
      icon: <CreditCard className="h-5 w-5" />,
      question: "Welche Zahlungsmethoden werden akzeptiert?",
      answer: "Wir akzeptieren alle gängigen Kreditkarten (Visa, Mastercard, American Express), PayPal, SEPA-Lastschrift und Sofortüberweisung. Alle Zahlungen werden sicher verschlüsselt übertragen."
    },
    {
      id: "booking-3",
      category: "Buchung & Bezahlung",
      icon: <Clock className="h-5 w-5" />,
      question: "Kann ich meine Buchung stornieren oder ändern?",
      answer: "Ja, Stornierungen sind bis zu 24 Stunden vor dem Erlebnis kostenlos möglich. Für Änderungen kontaktieren Sie uns bitte direkt. Die Rückerstattung erfolgt automatisch auf Ihr ursprüngliches Zahlungsmittel."
    },
    {
      id: "booking-4",
      category: "Buchung & Bezahlung",
      icon: <MessageCircle className="h-5 w-5" />,
      question: "Erhalte ich eine Buchungsbestätigung?",
      answer: "Ja, Sie erhalten sofort nach der Buchung eine E-Mail-Bestätigung mit allen wichtigen Details: Datum, Uhrzeit, Adresse, Kontaktdaten des Partners und einem QR-Code für den einfachen Check-in vor Ort."
    },
    
    // Partner & Qualität
    {
      id: "partner-1",
      category: "Partner & Qualität",
      icon: <Shield className="h-5 w-5" />,
      question: "Wie werden die Partner ausgewählt?",
      answer: "Alle Partner werden von uns persönlich geprüft und besucht. Wir achten auf Qualität, Sicherheit, Kundenservice und Authentizität. Nur lokale Unternehmen mit nachgewiesener Zuverlässigkeit werden in unser Netzwerk aufgenommen."
    },
    {
      id: "partner-2",
      category: "Partner & Qualität",
      icon: <Star className="h-5 w-5" />,
      question: "Sind die Bewertungen echt?",
      answer: "Ja, alle Bewertungen stammen von verifizierten Kunden, die das Erlebnis tatsächlich gebucht und erlebt haben. Fake-Bewertungen werden automatisch erkannt und entfernt."
    },
    {
      id: "partner-3",
      category: "Partner & Qualität",
      icon: <Users className="h-5 w-5" />,
      question: "Was passiert, wenn ein Partner nicht verfügbar ist?",
      answer: "Falls ein Partner kurzfristig nicht verfügbar ist, benachrichtigen wir Sie sofort und bieten Ihnen alternative Termine oder vergleichbare Erlebnisse an. Eine vollständige Rückerstattung ist selbstverständlich möglich."
    },
    
    // Suche & Navigation
    {
      id: "search-1",
      category: "Suche & Navigation",
      icon: <Search className="h-5 w-5" />,
      question: "Wie finde ich das passende Erlebnis?",
      answer: "Nutzen Sie unsere intelligente Suche: Geben Sie Ihren Ort ein, wählen Sie aus über 10 Kategorien oder filtern Sie nach Preis, Bewertung und Teilnehmerzahl. Unsere Empfehlungen helfen Ihnen bei der Auswahl."
    },
    {
      id: "search-2",
      category: "Suche & Navigation",
      icon: <MapPin className="h-5 w-5" />,
      question: "In welchen Städten sind Sie verfügbar?",
      answer: "Aktuell bieten wir Erlebnisse in ganz Deutschland an, mit einem Schwerpunkt auf das Ruhrgebiet. Wir erweitern unser Angebot kontinuierlich um neue Städte und Regionen."
    },
    {
      id: "search-3",
      category: "Suche & Navigation",
      icon: <Calendar className="h-5 w-5" />,
      question: "Kann ich spontan buchen?",
      answer: "Ja, viele Erlebnisse können Sie auch kurzfristig buchen. Die Verfügbarkeit wird in Echtzeit angezeigt. Für Last-Minute-Buchungen am selben Tag empfehlen wir eine telefonische Rücksprache mit dem Partner."
    },
    
    // Konto & Service
    {
      id: "account-1",
      category: "Konto & Service",
      icon: <Users className="h-5 w-5" />,
      question: "Brauche ich ein Konto zum Buchen?",
      answer: "Nein, Sie können auch als Gast buchen. Ein Konto bietet jedoch Vorteile: Buchungshistorie, Favoriten speichern, schnellere Buchungen und exklusive Angebote für Stammkunden."
    },
    {
      id: "account-2",
      category: "Konto & Service",
      icon: <Phone className="h-5 w-5" />,
      question: "Wie erreiche ich den Kundenservice?",
      answer: "Unser Kundenservice ist Mo-Fr von 9-18 Uhr und Sa von 10-16 Uhr erreichbar. Per E-Mail: support@freizeitplus.de oder telefonisch unter 0800-123456. Wir antworten in der Regel innerhalb von 2 Stunden."
    },
    {
      id: "account-3",
      category: "Konto & Service",
      icon: <Shield className="h-5 w-5" />,
      question: "Wie sicher sind meine Daten?",
      answer: "Ihre Daten sind bei uns absolut sicher. Wir verwenden modernste SSL-Verschlüsselung, sind DSGVO-konform und geben keine Daten an Dritte weiter. Alle Zahlungsdaten werden nur verschlüsselt übertragen."
    }
  ];

  const categories = Array.from(new Set(faqData.map(item => item.category)));

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Buchung & Bezahlung":
        return <CreditCard className="h-5 w-5" />;
      case "Partner & Qualität":
        return <Shield className="h-5 w-5" />;
      case "Suche & Navigation":
        return <Search className="h-5 w-5" />;
      case "Konto & Service":
        return <Users className="h-5 w-5" />;
      default:
        return <HelpCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600/90 to-purple-800/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white">
              Häufige Fragen
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-200 via-white to-purple-200 bg-clip-text text-transparent">
              Wie können wir Ihnen helfen?
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Finden Sie schnell Antworten auf die häufigsten Fragen rund um FreizeitEngel. 
              Sollten Sie weitere Hilfe benötigen, kontaktieren Sie gerne unseren Kundenservice.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Category Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-4">Kategorien</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        const element = document.getElementById(`category-${category.replace(/\s+/g, '-')}`);
                        element?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex items-center w-full text-left p-3 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <div className="text-purple-600 mr-3">
                        {getCategoryIcon(category)}
                      </div>
                      <span className="text-sm font-medium">{category}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {categories.map((category) => (
                <div key={category} id={`category-${category.replace(/\s+/g, '-')}`}>
                  <div className="flex items-center mb-6">
                    <div className="text-purple-600 mr-3">
                      {getCategoryIcon(category)}
                    </div>
                    <h2 className="text-2xl font-bold text-purple-800">{category}</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {faqData
                      .filter(item => item.category === category)
                      .map((item) => (
                        <Card key={item.id} className="border border-gray-200">
                          <Collapsible 
                            open={openItems.includes(item.id)}
                            onOpenChange={() => toggleItem(item.id)}
                          >
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-purple-50 transition-colors">
                                <div className="flex items-center">
                                  <div className="text-purple-600 mr-4">
                                    {item.icon}
                                  </div>
                                  <h3 className="text-lg font-semibold text-purple-900 text-left">
                                    {item.question}
                                  </h3>
                                </div>
                                <div className="text-gray-400 ml-4">
                                  {openItems.includes(item.id) ? (
                                    <ChevronUp className="h-5 w-5" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5" />
                                  )}
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="px-6 pb-6 pt-0">
                                <p className="text-gray-600 leading-relaxed ml-9">
                                  {item.answer}
                                </p>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Haben Sie noch Fragen?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Unser Kundenservice hilft Ihnen gerne weiter. Wir sind für Sie da!
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <Phone className="h-8 w-8 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-purple-800">Telefon</h3>
                <p className="text-gray-600 text-sm mb-3">Mo-Fr 9-18 Uhr, Sa 10-16 Uhr</p>
                <p className="font-medium">0800-123456</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <Mail className="h-8 w-8 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-purple-800">E-Mail</h3>
                <p className="text-gray-600 text-sm mb-3">Antwort binnen 2 Stunden</p>
                {/* LEGAL-REVIEW: support e-mail (and the service hours in the FAQ answers) copied unchanged from the source project; needs owner confirmation. */}
                <p className="font-medium">support@freizeitplus.de</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <MessageCircle className="h-8 w-8 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-purple-800">Live Chat</h3>
                <p className="text-gray-600 text-sm mb-3">Sofortige Hilfe</p>
                <Button size="sm" className="mt-1 bg-purple-600 hover:bg-purple-700">Chat starten</Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Erlebnisse entdecken
              </Button>
            </Link>
            <Link href="/partner">
              <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                Partner werden
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}