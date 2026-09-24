import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Eye,
  Lock,
  Database,
  Users,
  Mail,
  Phone,
  FileText,
  Settings,
  CheckCircle,
  CreditCard,
  MessageCircle,
  MapPin,
  Globe2,
  Clock3,
} from "lucide-react";
import { Link } from "wouter";

/**
 * LEGAL-REVIEW: copied unchanged from the source project and NOT production-approved.
 * The company details on this page (FreizeitEngel GmbH, Heiliger Weg 60, 44135 Dortmund, managing directors,
 * info@freizeitengel.com, +49 163 4216070) are unverified and conflict with the
 * placeholder contact block in components/layout/footer.tsx (Erlebnisstraße 42,
 * 10115 Berlin · info@freizeitplus.de · +49 30 123 456 789). The owner / legal
 * counsel must confirm them before release. Related: privacy-page.tsx,
 * imprint-page.tsx, terms-page.tsx.
 */

type SectionProps = {
  number: string;
  title: string;
  icon: typeof Shield;
  children: ReactNode;
  id?: string;
};

function PrivacySection({ number, title, icon: Icon, children, id }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-8">
      <div className="flex items-center mb-4">
        <Icon className="h-6 w-6 text-purple-600 mr-3 flex-shrink-0" />
        <h2 className="text-2xl font-bold text-purple-800">{number}. {title}</h2>
      </div>
      <div className="space-y-4 text-gray-700 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gradient-to-br from-purple-600/90 to-purple-800/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white">
              Datenschutz
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-200 via-white to-purple-200 bg-clip-text text-transparent">
              Datenschutzerklärung
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Wir informieren dich darüber, welche personenbezogenen Daten FreizeitEngel
              verarbeitet, wofür wir sie benötigen und welche Rechte du hast.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10 border-b border-gray-200 pb-8">
          <h2 className="text-xl font-semibold text-purple-800 mb-3">
            Deine Rechte im Überblick
          </h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Du hast insbesondere das Recht auf Auskunft, Berichtigung, Löschung,
            Einschränkung der Verarbeitung und Datenübertragbarkeit. Du kannst einer
            Verarbeitung widersprechen und eine Einwilligung jederzeit mit Wirkung für
            die Zukunft widerrufen.
          </p>
          <p className="text-sm text-gray-500">
            Stand: September 2026 · Diese Erklärung beschreibt die derzeit im
            FreizeitEngel-Code vorgesehenen Funktionen.
          </p>
        </div>

        <div className="space-y-10">
          {/* LEGAL-REVIEW: controller name, address, managing directors, e-mail and phone need owner confirmation. */}
          <PrivacySection number="1" title="Verantwortlicher" icon={Users}>
            <div>
              <h3 className="font-semibold mb-2">Verantwortlich für die Datenverarbeitung:</h3>
              <p>
                FreizeitEngel GmbH<br />
                Heiliger Weg 60<br />
                44135 Dortmund<br />
                Deutschland
              </p>
            </div>
            <div>
              <p><strong>Geschäftsführung:</strong> Dalia Kaedi und Farset Kaedi</p>
              <p><strong>E-Mail:</strong> <a className="text-purple-700 hover:underline" href="mailto:info@freizeitengel.com">info@freizeitengel.com</a></p>
              <p><strong>Telefon:</strong> +49 163 4216070</p>
              <p><strong>Datenschutzanfragen:</strong> <a className="text-purple-700 hover:underline" href="mailto:info@freizeitengel.com">info@freizeitengel.com</a></p>
            </div>
          </PrivacySection>

          <PrivacySection number="2" title="Geltungsbereich und Zwecke" icon={Eye}>
            <p>
              Diese Datenschutzerklärung gilt für die Website www.freizeitengel.com,
              die Plattformfunktionen und die darüber erreichbaren Formulare, Konten,
              Buchungs- und Kommunikationsfunktionen.
            </p>
            <p>
              Wir verarbeiten personenbezogene Daten, um die Plattform technisch
              bereitzustellen, Nutzerkonten zu verwalten, Erlebnisse zu vermitteln,
              Anfragen und Buchungen zu bearbeiten, Zahlungen abzuwickeln, E-Mails zu
              versenden, Support zu leisten und die Sicherheit unserer Dienste zu
              gewährleisten.
            </p>
            <p>
              Wir verarbeiten nur Daten, die für den jeweiligen Zweck erforderlich sind
              oder die du uns freiwillig übermittelst.
            </p>
          </PrivacySection>

          <PrivacySection number="3" title="Website, Hosting und technische Daten" icon={Globe2}>
            <p>
              Beim Aufruf unserer Website werden technisch erforderliche Daten
              verarbeitet. Dazu können IP-Adresse, Datum und Uhrzeit, angeforderte
              Seiten und Dateien, Referrer-URL, Browser- und Geräteinformationen sowie
              technische Fehler- und Sicherheitsinformationen gehören.
            </p>
            <p>
              Diese Verarbeitung dient der sicheren und funktionsfähigen Bereitstellung
              der Website. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser
              berechtigtes Interesse besteht im sicheren Betrieb und der Fehleranalyse.
            </p>
            <p>
              Die Anwendung nutzt eine serverseitige PostgreSQL-Datenbank. Je nach
              Betriebsumgebung können dafür Replit als Infrastruktur- und Hostinganbieter
              sowie Neon als Datenbankdienst eingesetzt werden. Die jeweiligen Anbieter
              können technische Zugriffsdaten im Rahmen ihrer eigenen
              Datenschutzinformationen verarbeiten.
            </p>
          </PrivacySection>

          <PrivacySection number="4" title="Nutzerkonto und Anmeldung" icon={Lock}>
            <p>
              Für ein Nutzerkonto verarbeiten wir insbesondere Benutzername,
              E-Mail-Adresse und vollständigen Namen. Optional können Profilbild und
              weitere Kontoeinstellungen hinzukommen. Das Passwort wird nicht im
              Klartext gespeichert, sondern als Passwort-Hash.
            </p>
            <p>
              Für Anmeldung und Login-Status verwenden wir eine serverseitige Sitzung
              mit einem technisch erforderlichen Session-Cookie. Die Sitzung wird
              grundsätzlich nach spätestens sieben Tagen automatisch beendet; eine
              frühere Abmeldung ist jederzeit möglich.
            </p>
            <p>
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit das Konto zur
              Bereitstellung der gewünschten Funktionen erforderlich ist.
            </p>
          </PrivacySection>

          <PrivacySection number="5" title="Partnerkonten und Partneranfragen" icon={Users}>
            <p>
              Wenn du dich als Freizeitpartner bewirbst oder ein Partnerkonto nutzt,
              verarbeiten wir Unternehmensname, Ansprechpartner, E-Mail-Adresse,
              Telefonnummer, Standort- und Adressdaten, Kategorie, Beschreibung,
              Website sowie Angebots- und Vertragsdaten.
            </p>
            <p>
              Diese Daten benötigen wir zur Prüfung und Verwaltung der Partnerschaft,
              zur Veröffentlichung von Angeboten, zur Kommunikation und zur Abrechnung.
              Bei einer Anfrage können die von dir eingegebenen Kontaktdaten und der
              Nachrichtentext an den ausgewählten Freizeitpartner weitergegeben werden.
            </p>
            <p>
              Rechtsgrundlagen sind Art. 6 Abs. 1 lit. b DSGVO für die Anbahnung und
              Durchführung der Partnerschaft sowie Art. 6 Abs. 1 lit. f DSGVO für die
              Kommunikation mit Ansprechpartnern.
            </p>
          </PrivacySection>

          <PrivacySection number="6" title="Anfragen, Buchungen und Erlebnisse" icon={FileText}>
            <p>
              Bei einer Anfrage oder Buchung verarbeiten wir die hierfür erforderlichen
              Angaben. Dazu gehören insbesondere Name, E-Mail-Adresse, optionale
              Telefonnummer, ausgewähltes Erlebnis und Partner, Standort, Termin,
              Start- und Endzeit, Teilnehmerzahl, Preis, Buchungsstatus,
              Buchungsnummer sowie Nachrichten und Sonderwünsche.
            </p>
            <p>
              Buchungen können je nach Angebot auch als Gast möglich sein. Dann wird
              kein dauerhaftes Nutzerkonto angelegt, die für die konkrete Buchung
              erforderlichen Daten werden aber trotzdem gespeichert und verarbeitet.
            </p>
            <p>
              Wir verwenden diese Daten zur Vermittlung an den jeweiligen Partner,
              Durchführung und Verwaltung der Buchung, für Bestätigungen, Erinnerungen,
              Stornierungen, Rückerstattungen und den Kundenservice. Rechtsgrundlage ist
              grundsätzlich Art. 6 Abs. 1 lit. b DSGVO.
            </p>
            <p>
              Der jeweilige Freizeitpartner kann die übermittelten Buchungsdaten zur
              Durchführung des Erlebnisses in eigener datenschutzrechtlicher
              Verantwortung weiterverarbeiten.
            </p>
          </PrivacySection>

          <PrivacySection number="7" title="Zahlungen und Stripe" icon={CreditCard}>
            <p>
              Für kostenpflichtige Buchungen und Partnerauszahlungen setzen wir Stripe
              beziehungsweise Stripe Connect ein. Dabei können Buchungsbetrag, Währung,
              Zahlungs- und Transaktionsstatus, Zahlungsreferenzen, Kontakt- und
              Rechnungsdaten, Rückerstattungen und Zahlungsstreitigkeiten verarbeitet
              werden.
            </p>
            <p>
              Vollständige Kartendaten werden über die Zahlungsoberfläche von Stripe
              verarbeitet und nicht von FreizeitEngel als vollständige Kartennummer
              gespeichert. Stripe kann für die Zahlungsabwicklung weitere
              Dienstleister und verbundene Unternehmen einsetzen.
            </p>
            <p>
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO für die Zahlung und
              Buchungsabwicklung sowie Art. 6 Abs. 1 lit. c DSGVO für gesetzliche
              Aufbewahrungs- und Nachweispflichten. Für Details gilt ergänzend die
              Datenschutzerklärung von Stripe.
            </p>
          </PrivacySection>

          <PrivacySection number="8" title="E-Mails und Newsletter" icon={Mail}>
            <p>
              Wir versenden erforderliche E-Mails, etwa zur Registrierung, Anmeldung,
              Buchungsbestätigung, Änderung oder Stornierung einer Buchung sowie zu
              sicherheitsrelevanten Vorgängen. Dafür verarbeiten wir die Empfängeradresse
              und die für die jeweilige Nachricht erforderlichen Buchungs- oder
              Kontodaten.
            </p>
            <p>
              Für Newsletter- und Launch-Anmeldungen speichern wir E-Mail-Adresse,
              optional den Namen und den Zeitpunkt der Anmeldung. Werbliche Nachrichten
              versenden wir nur auf Grundlage einer wirksamen Einwilligung, soweit keine
              andere gesetzliche Erlaubnis greift. Eine Einwilligung kann jederzeit mit
              Wirkung für die Zukunft widerrufen werden.
            </p>
            <p>
              Für den E-Mail-Versand wird Resend eingesetzt. Resend kann die für den
              Versand erforderlichen Empfänger- und Nachrichtendaten verarbeiten.
              Rechtsgrundlagen sind Art. 6 Abs. 1 lit. b DSGVO für erforderliche
              Servicenachrichten und Art. 6 Abs. 1 lit. a DSGVO für Newsletter, soweit
              eine Einwilligung erforderlich ist.
            </p>
          </PrivacySection>

          <PrivacySection number="9" title="KI-Support und Sprachassistent" icon={MessageCircle}>
            <p>
              Die Plattform bietet einen optionalen KI-Support-Chat. Wenn du ihn nutzt,
              werden deine Nachrichten, eine technische Sitzungskennung und der von dir
              übermittelte Kontext gespeichert, damit die Unterhaltung fortgesetzt,
              beantwortet und bei Bedarf ausgewertet werden kann. Eine freiwillige
              Zufriedenheitsbewertung kann ebenfalls gespeichert werden.
            </p>
            <p>
              Für die Antwortgenerierung wird OpenAI eingesetzt. Bitte gib in den
              KI-Funktionen keine besonderen Kategorien personenbezogener Daten,
              Passwörter, Zahlungsdaten oder andere vertrauliche Informationen ein.
            </p>
            <p>
              Der optionale Sprachassistent wird erst aktiviert, wenn du ihn ausdrücklich
              öffnest und deinem Browser Zugriff auf das Mikrofon erlaubst. Dann werden
              Audiodaten in Echtzeit an OpenAI übertragen. Sitzungskennung, Dauer,
              Gesprächsmetadaten und – soweit im Assistenten erfasst – Gesprächs-
              beziehungsweise Transkriptinformationen können zur Bearbeitung und
              Qualitätssicherung gespeichert werden.
            </p>
            <p>
              Rechtsgrundlage für die Nutzung dieser freiwilligen Funktionen ist Art. 6
              Abs. 1 lit. b DSGVO, soweit du sie zur Beantwortung einer Anfrage nutzt,
              beziehungsweise Art. 6 Abs. 1 lit. a DSGVO, soweit eine Einwilligung
              erforderlich ist. Weitere Informationen findest du in den
              Datenschutzinformationen von OpenAI.
            </p>
          </PrivacySection>

          <PrivacySection number="10" title="Standortsuche und lokale Speicherung" icon={MapPin}>
            <p>
              Wenn du die Suche nach Angeboten in deiner Nähe ausdrücklich aktivierst,
              kann der Browser nach deiner Berechtigung den ungefähren Gerätestandort
              ermitteln. Die Koordinaten werden verwendet, um passende Angebote in der
              Nähe anzuzeigen.
            </p>
            <p>
              Die zuletzt ermittelte Position wird im <code>sessionStorage</code> deines
              Browsers zwischengespeichert und endet grundsätzlich mit der Browsersitzung.
              Du kannst die Standortberechtigung jederzeit in den Einstellungen deines
              Browsers widerrufen.
            </p>
          </PrivacySection>

          <PrivacySection number="11" title="Cookies und ähnliche Technologien" icon={Settings} id="cookies">
            <p>
              Wir setzen derzeit nur technisch erforderliche Cookies und lokale
              Speichertechnologien ein, um Session-Verwaltung, Login-Status und gewünschte
              Funktionen der Website bereitzustellen. Dazu gehören das serverseitige
              Session-Cookie für den Login und der lokale Speicher für die Cookie-Auswahl
              sowie einzelne Funktionseinstellungen der Website.
            </p>
            <p>
              Zusätzlich können die ausgeblendete Installationsaufforderung,
              Buchungsdaten für die Bestätigungsseite oder die zuletzt angeforderte
              Standortposition im Browser gespeichert werden. Standortdaten werden nur
              nach einer ausdrücklichen Browser-Berechtigung verwendet. Diese Einträge
              werden nicht als Nutzerkonto auf unseren Server übertragen.
            </p>
            <p>
              Aktuell sind keine Analyse- oder Marketingtechnologien eingebunden. Falls
              künftig ein solcher Dienst hinzukommt, wird er erst nach einer passenden
              Einwilligung geladen. Die Auswahl wird getrennt nach den Kategorien
              „Analyse“ und „Marketing“ gespeichert; „Nur notwendige“ deaktiviert beide
              optionalen Kategorien.
            </p>
            <p>
              Du kannst deine Auswahl jederzeit über den Link „Einstellungen anzeigen“
              im Cookie-Hinweis oder über die Einstellungen deines Browsers ändern.
            </p>
          </PrivacySection>

          <PrivacySection number="12" title="Optionale Kalenderanbindungen" icon={Clock3}>
            <p>
              Partner können – sofern die Funktion aktiviert wird – Kalenderdienste wie
              Google Calendar oder Microsoft Outlook verbinden. Dabei können
              Zugriffstokens und Kalenderereignisse verarbeitet werden, um
              Verfügbarkeiten und Buchungstermine zu synchronisieren.
            </p>
            <p>
              Eine solche Verbindung erfolgt nur auf Veranlassung des jeweiligen
              Partners. Sie kann im Partner- beziehungsweise Administrationsbereich
              getrennt und widerrufen werden. Für die weitere Verarbeitung durch Google
              oder Microsoft gelten deren Datenschutzbestimmungen.
            </p>
          </PrivacySection>

          <PrivacySection number="13" title="Empfänger und Übermittlungen" icon={Database}>
            <p>
              Personenbezogene Daten werden nur weitergegeben, wenn dies für die
              genannten Zwecke erforderlich ist, du eingewilligt hast oder eine
              gesetzliche Verpflichtung besteht. Empfänger können insbesondere sein:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>der jeweils gebuchte oder angefragte Freizeitpartner,</li>
              <li>Zahlungsdienstleister wie Stripe,</li>
              <li>Hosting-, Datenbank- und IT-Dienstleister,</li>
              <li>E-Mail-Dienstleister wie Resend,</li>
              <li>KI-Dienstleister wie OpenAI bei Nutzung der KI-Funktionen,</li>
              <li>verbundene Kalenderdienste bei einer aktivierten Partneranbindung,</li>
              <li>Behörden, Gerichte oder andere Stellen, soweit wir dazu verpflichtet sind.</li>
            </ul>
            <p>
              Bei Dienstleistern, die Daten in unserem Auftrag verarbeiten, schließen wir
              – soweit erforderlich – Verträge nach Art. 28 DSGVO. Je nach Dienst,
              Anbieterstruktur und Standort können Daten auch außerhalb des Europäischen
              Wirtschaftsraums verarbeitet werden. Dann gelten die dafür vorgesehenen
              Garantien der DSGVO, insbesondere ein Angemessenheitsbeschluss oder
              Standardvertragsklauseln, soweit anwendbar.
            </p>
          </PrivacySection>

          <PrivacySection number="14" title="Speicherdauer und Löschung" icon={Database}>
            <p>
              Wir speichern personenbezogene Daten nur so lange, wie sie für den
              jeweiligen Zweck benötigt werden. Danach löschen oder anonymisieren wir
              sie, sofern keine gesetzlichen Aufbewahrungspflichten, offene Buchungen,
              Rückerstattungen, Zahlungsstreitigkeiten oder die Geltendmachung,
              Ausübung oder Verteidigung von Ansprüchen entgegenstehen.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Kontodaten: grundsätzlich bis zur Löschung des Kontos.</li>
              <li>Buchungs-, Zahlungs- und Rechnungsdaten: nach den jeweils geltenden gesetzlichen Aufbewahrungspflichten.</li>
              <li>Newsletterdaten: bis zum Widerruf oder zur Abmeldung, danach soweit erforderlich als Sperr- oder Nachweisvermerk.</li>
              <li>Support- und Sprachsitzungen: nur so lange, wie sie für Support, Sicherheit, Qualitätssicherung oder Anspruchsprüfung erforderlich sind.</li>
              <li>Standort- und Cookie-Auswahl im Browser: nach den oben beschriebenen Browser- oder Speichereinstellungen.</li>
            </ul>
          </PrivacySection>

          <PrivacySection number="15" title="Deine Rechte" icon={CheckCircle}>
            <p>Du hast nach Maßgabe der gesetzlichen Voraussetzungen insbesondere folgende Rechte:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Auskunft über die zu deiner Person gespeicherten Daten,</li>
              <li>Berichtigung unrichtiger oder Vervollständigung unvollständiger Daten,</li>
              <li>Löschung oder Einschränkung der Verarbeitung,</li>
              <li>Datenübertragbarkeit der von dir bereitgestellten Daten,</li>
              <li>Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen,</li>
              <li>Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft.</li>
            </ul>
            <p>
              Zur Ausübung deiner Rechte genügt eine Nachricht an{" "}
              <a className="text-purple-700 hover:underline" href="mailto:info@freizeitengel.com">
                info@freizeitengel.com
              </a>
              . Du hast außerdem das Recht, dich bei einer Datenschutzaufsichtsbehörde
              zu beschweren. Zuständig für Nordrhein-Westfalen ist insbesondere die{" "}
              <a
                className="text-purple-700 hover:underline"
                href="https://www.ldi.nrw.de/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen
              </a>
              .
            </p>
          </PrivacySection>

          <PrivacySection number="16" title="Datensicherheit" icon={Shield}>
            <p>
              Wir schützen personenbezogene Daten mit angemessenen technischen und
              organisatorischen Maßnahmen vor unbefugtem Zugriff, Verlust, Veränderung
              und Missbrauch. Dazu gehören unter anderem verschlüsselte
              Datenübertragungen, Passwort-Hashing, Sitzungs- und Zugriffskontrollen
              sowie die Begrenzung von Zugriffsrechten.
            </p>
            <p>
              Keine Übertragung über das Internet und kein Speichersystem kann jedoch
              absolute Sicherheit garantieren.
            </p>
          </PrivacySection>

          <PrivacySection number="17" title="Änderungen dieser Datenschutzerklärung" icon={FileText}>
            <p>
              Wir passen diese Datenschutzerklärung an, wenn sich die Plattform,
              eingesetzte Dienste, Verarbeitungszwecke oder rechtliche Anforderungen
              ändern. Es gilt jeweils die auf dieser Seite veröffentlichte aktuelle
              Fassung.
            </p>
            <p>
              Diese Erklärung sollte vor dem produktiven Einsatz und nach jeder Änderung
              an Dienstleistern oder Datenflüssen rechtlich geprüft werden.
            </p>
          </PrivacySection>
        </div>

        <section className="mt-12 border-t border-gray-200 pt-8 text-gray-700 leading-relaxed">
          <h2 className="text-2xl font-bold text-purple-800 mb-4">
            Fragen zum Datenschutz?
          </h2>
          <p className="mb-4">
            Bei Fragen oder zur Ausübung deiner Rechte kannst du uns direkt kontaktieren:
          </p>
          <p className="mb-6">
            <a className="inline-flex items-center text-purple-700 hover:underline mr-5" href="mailto:info@freizeitengel.com">
              <Mail className="h-5 w-5 mr-2" />
              info@freizeitengel.com
            </a>
            <a className="inline-flex items-center text-purple-700 hover:underline" href="tel:+491634216070">
              <Phone className="h-5 w-5 mr-2" />
              +49 163 4216070
            </a>
          </p>
          <p className="space-x-4">
            <Link href="/imprint" className="text-purple-700 hover:underline">Impressum</Link>
            <Link href="/terms" className="text-purple-700 hover:underline">AGB</Link>
            <a href="#cookies" className="text-purple-700 hover:underline">Cookie-Informationen</a>
          </p>
        </section>
      </div>
    </div>
  );
}