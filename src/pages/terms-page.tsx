import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Shield, 
  Calendar, 
  CreditCard, 
  AlertCircle,
  CheckCircle,
  Users,
  Mail,
  Phone
} from "lucide-react";
import { Link } from "wouter";

/**
 * LEGAL-REVIEW: copied unchanged from the source project and NOT production-approved.
 * The company details on this page (FreizeitEngel GmbH, Heiliger Weg 60, 44135 Dortmund, info@freizeitengel.com,
 * +49 163 4216070, HRB 38546, USt-IdNr. DE6464651851) are unverified and conflict with the
 * placeholder contact block in components/layout/footer.tsx (Erlebnisstraße 42,
 * 10115 Berlin · info@freizeitplus.de · +49 30 123 456 789). The owner / legal
 * counsel must confirm them before release. Related: privacy-page.tsx,
 * imprint-page.tsx, terms-page.tsx.
 */

export default function TermsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600/90 to-purple-800/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white">
              Rechtliches
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-200 via-white to-purple-200 bg-clip-text text-transparent">
              Allgemeine Geschäftsbedingungen
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Diese Allgemeinen Geschäftsbedingungen regeln die Nutzung der FreizeitEngel-Plattform 
              und die Buchung von Erlebnissen über unsere Website.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Quick Overview */}
        <Card className="mb-8 border-l-4 border-l-purple-600">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-purple-600 mt-1 mr-4 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-purple-800 mb-3">Wichtige Hinweise</h2>
                <p className="text-gray-600 mb-4">
                  Durch die Nutzung unserer Plattform und das Buchen von Erlebnissen akzeptieren Sie diese 
                  Allgemeinen Geschäftsbedingungen. Bitte lesen Sie diese sorgfältig durch.
                </p>
                <p className="text-sm text-gray-500">
                  Stand: Januar 2025 | Diese AGBs gelten für alle Buchungen über FreizeitEngel.de
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="space-y-8">
          {/* 1. Geltungsbereich */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-purple-800">1. Geltungsbereich</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen der FreizeitEngel GmbH 
                  und Nutzern der Website www.freizeitengel.com sowie der zugehörigen mobilen Anwendungen.
                </p>
                <p>
                  FreizeitEngel vermittelt als Plattformbetreiber Erlebnisse und Aktivitäten lokaler Partner. 
                  Der Leistungsvertrag kommt direkt zwischen dem Kunden und dem jeweiligen Partner zustande.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 2. Vertragspartner */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-purple-800">2. Vertragspartner</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <div>
                  {/* LEGAL-REVIEW: names only Dalia Kaedi as "Geschäftsführerin" while privacy/imprint list Dalia and Farset Kaedi; "Stand: Januar 2025" and the FreizeitEngel.de domain also differ from the other legal pages. Needs owner confirmation. */}
                  <h3 className="font-semibold mb-2">FreizeitEngel GmbH</h3>
                  <p>Heiliger Weg 60<br />
                  44135 Dortmund<br />
                  Deutschland</p>
                </div>
                <div>
                  <p><strong>E-Mail:</strong> info@freizeitengel.com</p>
                  <p><strong>Telefon:</strong> +49 163 4216070</p>
                  <p><strong>Geschäftsführerin:</strong> Dalia Kaedi</p>
                  <p><strong>Handelsregister:</strong> Amtsgericht Dortmund HRB 38546</p>
                  <p><strong>USt-IdNr.:</strong> DE6464651851</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Buchung und Vertragsschluss */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <Calendar className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-purple-800">3. Buchung und Vertragsschluss</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="font-semibold">3.1 Buchungsvorgang</h3>
                <p>
                  Die Darstellung der Erlebnisse auf unserer Plattform stellt kein rechtlich bindendes Angebot dar, 
                  sondern eine Aufforderung zur Abgabe einer Bestellung (invitatio ad offerendum).
                </p>
                
                <h3 className="font-semibold">3.2 Vertragsschluss</h3>
                <p>
                  Mit dem Klick auf "Jetzt buchen" geben Sie ein verbindliches Angebot ab. Der Vertrag kommt 
                  mit der Bestätigung durch E-Mail und Bereitstellung des Buchungscodes zustande.
                </p>

                <h3 className="font-semibold">3.3 Verfügbarkeit</h3>
                <p>
                  Alle Angebote sind freibleibend und nur solange der Vorrat reicht. FreizeitEngel behält sich 
                  vor, bei nicht verfügbaren Terminen alternative Optionen anzubieten.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 4. Preise und Zahlung */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <CreditCard className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-purple-800">4. Preise und Zahlung</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="font-semibold">4.1 Preise</h3>
                <p>
                  Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer. 
                  Zusätzliche Kosten werden vor Abschluss der Buchung transparent ausgewiesen.
                </p>

                <h3 className="font-semibold">4.2 Zahlungsarten</h3>
                <p>
                  Folgende Zahlungsarten werden akzeptiert: Kreditkarte (Visa, Mastercard, American Express), 
                  PayPal, SEPA-Lastschrift und Sofortüberweisung.
                </p>

                <h3 className="font-semibold">4.3 Fälligkeit</h3>
                <p>
                  Der Rechnungsbetrag wird mit der Buchungsbestätigung zur Zahlung fällig. 
                  Bei Lastschrift erfolgt der Einzug 2-3 Werktage nach Buchung.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 5. Stornierung und Widerruf */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-purple-800">5. Stornierung und Widerruf</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="font-semibold">5.1 Kostenloses Storno</h3>
                <p>
                  Buchungen können bis zu 24 Stunden vor dem Erlebnistermin kostenlos storniert werden. 
                  Die Rückerstattung erfolgt automatisch auf das ursprüngliche Zahlungsmittel.
                </p>

                <h3 className="font-semibold">5.2 Kurzfristige Stornierung</h3>
                <p>
                  Bei Stornierungen weniger als 24 Stunden vor dem Termin oder bei Nichterscheinen 
                  wird der volle Betrag in Rechnung gestellt.
                </p>

                <h3 className="font-semibold">5.3 Ausnahmen</h3>
                <p>
                  Bei außergewöhnlichen Umständen (Krankheit, höhere Gewalt) prüfen wir kulante Lösungen. 
                  Kontaktieren Sie uns in diesen Fällen umgehend.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 6. Haftung */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-purple-800">6. Haftung und Gewährleistung</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="font-semibold">6.1 Vermittlerfunktion</h3>
                <p>
                  FreizeitEngel tritt ausschließlich als Vermittler auf. Für die Durchführung der Erlebnisse 
                  sind die jeweiligen Partner verantwortlich.
                </p>

                <h3 className="font-semibold">6.2 Haftungsbeschränkung</h3>
                <p>
                  FreizeitEngel haftet nur für Schäden, die auf vorsätzlichen oder grob fahrlässigen 
                  Pflichtverletzungen beruhen. Die Haftung für leichte Fahrlässigkeit ist ausgeschlossen.
                </p>

                <h3 className="font-semibold">6.3 Höchsthaftung</h3>
                <p>
                  Die Haftung ist in jedem Fall auf den Buchungswert des jeweiligen Erlebnisses beschränkt.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 7. Datenschutz */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-purple-800">7. Datenschutz</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  Der Schutz Ihrer persönlichen Daten ist uns wichtig. Detaillierte Informationen zur 
                  Datenerhebung und -verarbeitung finden Sie in unserer Datenschutzerklärung.
                </p>
                <p>
                  Ihre Daten werden ausschließlich zur Vertragsabwicklung und nach den Bestimmungen 
                  der DSGVO verarbeitet.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 8. Schlussbestimmungen */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-purple-800">8. Schlussbestimmungen</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="font-semibold">8.1 Änderungen</h3>
                <p>
                  FreizeitEngel behält sich vor, diese AGB zu ändern. Änderungen werden rechtzeitig 
                  per E-Mail mitgeteilt und gelten als genehmigt, wenn nicht binnen 14 Tagen widersprochen wird.
                </p>

                <h3 className="font-semibold">8.2 Anwendbares Recht</h3>
                <p>
                  Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts.
                </p>

                <h3 className="font-semibold">8.3 Gerichtsstand</h3>
                <p>
                  Gerichtsstand für alle Streitigkeiten ist Dortmund, sofern der Kunde Kaufmann, 
                  juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen ist.
                </p>

                <h3 className="font-semibold">8.4 Salvatorische Klausel</h3>
                <p>
                  Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit 
                  der übrigen Bestimmungen unberührt.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <Card className="mt-12 bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-purple-800 mb-4">Fragen zu den AGB?</h2>
              <p className="text-gray-600 mb-6">
                Bei Fragen zu diesen Geschäftsbedingungen stehen wir Ihnen gerne zur Verfügung.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center text-purple-700">
                  <Mail className="h-5 w-5 mr-2" />
                  <span>info@freizeitengel.com</span>
                </div>
                <div className="flex items-center text-purple-700">
                  <Phone className="h-5 w-5 mr-2" />
                  <span>+49 163 4216070</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <Link href="/faq">
                  <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                    Häufige Fragen
                  </Button>
                </Link>
                <Link href="/search">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Erlebnisse entdecken
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}