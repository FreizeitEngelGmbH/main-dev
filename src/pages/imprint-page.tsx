import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

/**
 * LEGAL-REVIEW: copied unchanged from the source project and NOT production-approved.
 * The company details on this page (FreizeitEngel GmbH, Heiliger Weg 60, 44135 Dortmund, +49 163 4216070,
 * info@freizeitengel.com, Amtsgericht Dortmund HRB 38546, USt-IdNr. DE6464651851,
 * managing directors Dalia Kaedi and Farset Kaedi) are unverified and conflict with the
 * placeholder contact block in components/layout/footer.tsx (Erlebnisstraße 42,
 * 10115 Berlin · info@freizeitplus.de · +49 30 123 456 789). The owner / legal
 * counsel must confirm them before release. Related: privacy-page.tsx,
 * imprint-page.tsx, terms-page.tsx.
 */

type ImprintSectionProps = {
  number: string;
  title: string;
  children: ReactNode;
};

function ImprintSection({ number, title, children }: ImprintSectionProps) {
  return (
    <section className="scroll-mt-8">
      <h2 className="text-2xl font-bold text-purple-800 mb-4">
        {number}. {title}
      </h2>
      <div className="space-y-4 text-gray-700 leading-relaxed">{children}</div>
    </section>
  );
}

export default function ImprintPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gradient-to-br from-purple-600/90 to-purple-800/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white">
              Rechtliches
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-200 via-white to-purple-200 bg-clip-text text-transparent">
              Impressum
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Angaben gemäß § 5 TMG und Informationen nach § 55 RStV für die
              Website www.freizeitengel.com
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10 border-b border-gray-200 pb-8">
          <h2 className="text-xl font-semibold text-purple-800 mb-3">
            Rechtliche Hinweise
          </h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Die nachfolgenden Informationen enthalten die gesetzlich
            vorgeschriebenen Angaben zur Anbieterkennzeichnung sowie wichtige
            rechtliche Hinweise zur Internetpräsenz der FreizeitEngel GmbH.
          </p>
          <p className="text-sm text-gray-500">
            Stand: September 2026 | Alle Angaben ohne Gewähr
          </p>
        </div>

        <div className="space-y-10">
          {/* LEGAL-REVIEW: provider, address, phone, e-mail, register entry, VAT ID and managing directors need owner confirmation. The VAT ID has 10 digits after "DE"; German VAT IDs have 9. */}
          <ImprintSection number="1" title="Diensteanbieter">
            <p>
              <strong>FreizeitEngel GmbH</strong>
              <br />
              Heiliger Weg 60
              <br />
              44135 Dortmund
              <br />
              Deutschland
            </p>
            <p>
              <strong>Kontakt:</strong>
              <br />
              Telefon:{" "}
              <a
                href="tel:+491634216070"
                className="text-purple-700 hover:underline"
              >
                +49 163 4216070
              </a>
              <br />
              E-Mail:{" "}
              <a
                href="mailto:info@freizeitengel.com"
                className="text-purple-700 hover:underline"
              >
                info@freizeitengel.com
              </a>
            </p>
            <p>
              <strong>Registerangaben:</strong>
              <br />
              Handelsregister: Amtsgericht Dortmund, HRB 38546
              <br />
              USt-IdNr.: DE6464651851
            </p>
            <p>
              <strong>Geschäftsführung:</strong>
              <br />
              Dalia Kaedi
              <br />
              Farset Kaedi
            </p>
          </ImprintSection>

          <ImprintSection number="2" title="Redaktionell Verantwortlicher">
            <p>
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
            </p>
            <p>
              Dalia Kaedi und Farset Kaedi
              <br />
              FreizeitEngel GmbH
              <br />
              Heiliger Weg 60
              <br />
              44135 Dortmund
            </p>
          </ImprintSection>

          <ImprintSection number="3" title="Zuständige Aufsichtsbehörde">
            <p>
              Bezirksregierung Arnsberg
              <br />
              Seibertzstraße 1
              <br />
              59821 Arnsberg
            </p>
            <p>
              Website:{" "}
              <a
                href="https://www.bezreg-arnsberg.nrw.de"
                className="text-purple-700 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.bezreg-arnsberg.nrw.de
              </a>
            </p>
          </ImprintSection>

          <ImprintSection number="4" title="EU-Streitschlichtung">
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-
              Streitbeilegung (OS) bereit:
            </p>
            <p>
              <strong>EU-Streitschlichtung:</strong>{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                className="text-purple-700 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p>
              Wir sind nicht verpflichtet, an Streitbeilegungsverfahren vor
              einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </ImprintSection>

          <ImprintSection number="5" title="Haftung für Inhalte">
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene
              Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
              verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter
              jedoch nicht unter der Verpflichtung, übermittelte oder
              gespeicherte fremde Informationen zu überwachen oder nach
              Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
              hinweisen.
            </p>
            <p>
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
              Informationen nach den allgemeinen Gesetzen bleiben hiervon
              unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem
              Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.
            </p>
          </ImprintSection>

          <ImprintSection number="6" title="Haftung für Links">
            <p>
              Unser Angebot enthält Links zu externen Webseiten Dritter, auf
              deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
              diese fremden Inhalte auch keine Gewähr übernehmen. Für die
              Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
              oder Betreiber der Seiten verantwortlich.
            </p>
            <p>
              Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf
              mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren
              zum Zeitpunkt der Verlinkung nicht erkennbar.
            </p>
          </ImprintSection>

          <ImprintSection number="7" title="Urheberrecht">
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
              diesen Seiten unterliegen dem deutschen Urheberrecht. Die
              Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
              Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
              schriftlichen Zustimmung des jeweiligen Autors beziehungsweise
              Erstellers.
            </p>
            <p>
              Downloads und Kopien dieser Seite sind nur für den privaten, nicht
              kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser
              Seite nicht vom Betreiber erstellt wurden, werden die
              Urheberrechte Dritter beachtet.
            </p>
            <p>
              <strong>Bildnachweise:</strong> Die verwendeten Bilder und
              Grafiken stammen aus eigenen Aufnahmen, von unseren Partnern zur
              Verfügung gestellten Materialien oder lizenzierten
              Stockfoto-Anbietern.
            </p>
          </ImprintSection>
        </div>

        <section className="mt-12 border-t border-gray-200 pt-8 text-gray-700 leading-relaxed">
          <h2 className="text-2xl font-bold text-purple-800 mb-4">
            Kontakt bei rechtlichen Fragen
          </h2>
          <p className="mb-4">
            Bei rechtlichen Fragen oder Hinweisen kontaktieren Sie uns gerne
            direkt unter{" "}
            <a
              href="mailto:info@freizeitengel.com"
              className="text-purple-700 hover:underline"
            >
              info@freizeitengel.com
            </a>{" "}
            oder{" "}
            <a
              href="tel:+491634216070"
              className="text-purple-700 hover:underline"
            >
              +49 163 4216070
            </a>
            .
          </p>
          <p className="space-x-4">
            <Link href="/privacy" className="text-purple-700 hover:underline">
              Datenschutz
            </Link>
            <Link href="/terms" className="text-purple-700 hover:underline">
              AGB
            </Link>
            <Link href="/faq" className="text-purple-700 hover:underline">
              Häufige Fragen
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}