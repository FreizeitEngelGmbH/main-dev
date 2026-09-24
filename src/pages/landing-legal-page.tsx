import { type ReactNode } from "react";
import { Link } from "wouter";
// MISSING ASSET: the source imports @assets/image_1788894136118.png, which does not exist in EngelFolder either.
// Uses the same local logo substitute as the current landing page (src/pages/landing-page.tsx).
import logoPath from "@assets/email-logo.png";
// LEGAL-REVIEW: reference copy of the source app's landing-styled imprint/privacy texts (not routed; the
// public legal routes stay /imprint, /impressum, /datenschutz, /privacy, /terms, /agb). Company details
// and legal text are not production-approved and need owner confirmation.

type LandingLegalPageProps = {
  kind: "imprint" | "privacy";
};

function LegalSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="landing-legal-section">
      <h2>
        <span>{number}</span>
        {title}
      </h2>
      <div className="landing-legal-copy">{children}</div>
    </section>
  );
}

function LandingLegalFrame({
  title,
  eyebrow,
  intro,
  children,
}: {
  title: string;
  eyebrow: string;
    intro?: string;
  children: ReactNode;
}) {
  return (
    <main className="landing-legal-page">
      <style>{`
        .landing-legal-page{--ink:#11102e;--muted:#5e5975;--violet:#7028e8;--deep:#fcf9ff;min-height:100dvh;background:var(--deep);color:var(--ink);font-family:"DM Sans",sans-serif}
        .landing-legal-page .font-display{font-family:"Fraunces",Georgia,serif}
        .landing-legal-header{max-width:1220px;margin:auto;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;gap:24px}
        .landing-legal-brand img{display:block;width:142px;height:auto;filter:drop-shadow(0 12px 24px #44227720)}
        .landing-legal-back{color:var(--violet);font-size:12px;font-weight:800;text-decoration:none}
        .landing-legal-back:hover{text-decoration:underline}
        .landing-legal-hero{padding:62px 24px 58px;background:linear-gradient(135deg,#f2eaff 0%,#fcf9ff 58%,#e7f8f5 100%);border-top:1px solid #eee4fb;border-bottom:1px solid #e7def2}
        .landing-legal-hero-inner{max-width:920px;margin:auto}
        .landing-legal-eyebrow{color:var(--violet);font-size:10px;letter-spacing:.22em;text-transform:uppercase;font-weight:800}
        .landing-legal-hero h1{font-size:clamp(3.2rem,7vw,6.7rem);line-height:.88;letter-spacing:-.065em;margin:16px 0 20px}
        .landing-legal-hero p{max-width:650px;color:var(--muted);font-size:15px;line-height:1.65;margin:0}
        .landing-legal-content{max-width:920px;margin:auto;padding:18px 24px 70px}
        .landing-legal-section{padding:30px 0;border-bottom:1px solid #ded6e9}
        .landing-legal-section:last-child{border-bottom:0}
        .landing-legal-section h2{display:flex;align-items:baseline;gap:14px;color:var(--ink);font-size:clamp(1.45rem,3vw,2.15rem);line-height:1.1;letter-spacing:-.03em;margin:0 0 17px}
        .landing-legal-section h2 span{color:var(--violet);font-size:12px;letter-spacing:.08em;font-weight:800}
        .landing-legal-copy{color:#4f4965;font-size:14px;line-height:1.72}
        .landing-legal-copy p{margin:0 0 14px}
        .landing-legal-copy p:last-child{margin-bottom:0}
        .landing-legal-copy ul{margin:0 0 14px;padding-left:20px}
        .landing-legal-copy li{margin:4px 0}
        .landing-legal-copy strong{color:#29223d}
        .landing-legal-copy a{color:var(--violet);text-decoration:underline;text-underline-offset:2px}
        .landing-legal-note{margin:12px 0 0;padding:16px 18px;border-left:3px solid var(--violet);background:#f3ecff;color:#5f5578}
        .landing-legal-footer{max-width:920px;margin:auto;padding:24px;border-top:1px solid #ded6e9;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px;color:#817892;font-size:11px}
        .landing-legal-footer-links{display:flex;flex-wrap:wrap;gap:18px}
        .landing-legal-footer a{color:#817892;text-decoration:none}
        .landing-legal-footer a:hover{color:var(--violet);text-decoration:underline}
        @media(max-width:600px){.landing-legal-header{padding:14px 18px}.landing-legal-brand img{width:112px}.landing-legal-back{font-size:11px}.landing-legal-hero{padding:48px 18px 42px}.landing-legal-content{padding:8px 18px 48px}.landing-legal-section{padding:25px 0}.landing-legal-footer{margin:0 18px;padding:22px 0}}
      `}</style>

      <header className="landing-legal-header">
          <Link className="landing-legal-brand" href="/landing" aria-label="Zur FreizeitEngel Landingpage">
          <img src={logoPath} alt="FreizeitEngel" />
          </Link>
        <Link className="landing-legal-back" href="/landing">
          ← Zurück zur Startseite
        </Link>
      </header>

      <section className="landing-legal-hero">
        <div className="landing-legal-hero-inner">
          <p className="landing-legal-eyebrow">{eyebrow}</p>
          <h1 className="font-display">{title}</h1>
          {intro ? <p>{intro}</p> : null}
        </div>
      </section>

      <div className="landing-legal-content">
        {children}
      </div>

      <footer className="landing-legal-footer">
        <span>FreizeitEngel · Für freie Tage in deiner Nähe.</span>
        <nav className="landing-legal-footer-links" aria-label="Rechtliche Links">
          <Link href="/landing/impressum">Impressum</Link>
          <Link href="/landing/datenschutz">Datenschutz</Link>
        </nav>
      </footer>
    </main>
  );
}

function LandingImprintPage() {
  return (
    <LandingLegalFrame
      eyebrow="Rechtliches"
      title="Impressum"
    >
      <LegalSection number="01" title="Diensteanbieter">
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
          <strong>Geschäftsführung:</strong> Dalia Kaedi und Farset Kaedi
        </p>
        <p>
          <strong>Handelsregister:</strong> Amtsgericht Dortmund, HRB 38546
          <br />
          <strong>USt-IdNr.:</strong> DE6464651851
        </p>
      </LegalSection>

      <LegalSection number="02" title="Kontakt">
        <p>
          Telefon:{" "}
          <a href="tel:+4915232157654">+49 152 32157654</a>
          <br />
          E-Mail:{" "}
          <a href="mailto:info@freizeitengel.com">info@freizeitengel.com</a>
        </p>
      </LegalSection>

      <LegalSection number="03" title="Redaktionell Verantwortliche">
        <p>
          Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV sind Dalia Kaedi
          und Farset Kaedi.
        </p>
        <p>
          FreizeitEngel GmbH
          <br />
          Heiliger Weg 60
          <br />
          44135 Dortmund
        </p>
      </LegalSection>

      <LegalSection number="04" title="Zuständige Aufsichtsbehörde">
        <p>
          Bezirksregierung Arnsberg
          <br />
          Seibertzstraße 1
          <br />
          59821 Arnsberg
        </p>
        <p>
          <a
            href="https://www.bezreg-arnsberg.nrw.de"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.bezreg-arnsberg.nrw.de
          </a>
        </p>
      </LegalSection>

      <LegalSection number="05" title="EU-Streitschlichtung">
        <p>
          Die Europäische Kommission stellt eine Plattform zur
          Online-Streitbeilegung (OS) bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://ec.europa.eu/consumers/odr/
          </a>
        </p>
        <p>
          Wir sind nicht verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </LegalSection>

      <LegalSection number="06" title="Haftung für Inhalte und Links">
        <p>
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte
          auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
          §§ 8 bis 10 TMG sind wir nicht verpflichtet, übermittelte oder
          gespeicherte fremde Informationen zu überwachen.
        </p>
        <p>
          Unser Angebot kann Links zu externen Webseiten Dritter enthalten, auf
          deren Inhalte wir keinen Einfluss haben. Für diese Inhalte ist stets
          der jeweilige Anbieter oder Betreiber verantwortlich.
        </p>
      </LegalSection>

      <LegalSection number="07" title="Urheberrecht">
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen
          Seiten unterliegen dem deutschen Urheberrecht. Vervielfältigung,
          Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
          Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des
          jeweiligen Autors beziehungsweise Erstellers.
        </p>
        <p>
          Die verwendeten Bilder und Grafiken stammen aus eigenen Aufnahmen, von
          Partnern bereitgestellten Materialien oder lizenzierten
          Stockfoto-Anbietern.
        </p>
      </LegalSection>
    </LandingLegalFrame>
  );
}

function LandingPrivacyPage() {
  return (
    <LandingLegalFrame
      eyebrow="Datenschutz"
      title="Datenschutzerklärung"
      intro="Mit dieser Datenschutzerklärung informieren wir darüber, wie wir personenbezogene Daten verarbeiten, wenn Sie unsere Website oder App besuchen, ein Konto nutzen, Freizeitangebote entdecken oder buchen, als Freizeitpartner mit uns zusammenarbeiten oder Kontakt mit uns aufnehmen."
    >
      <LegalSection number="01" title="Verantwortliche Stelle">
        <p><strong>Stand:</strong> September 2026</p>
        <p>
          <strong>FreizeitEngel GmbH</strong><br />
          Heiliger Weg 60<br />
          44135 Dortmund<br />
          Deutschland
        </p>
        <p>
          E-Mail: <a href="mailto:info@freizeitengel.com">info@freizeitengel.com</a><br />
          Telefon: <a href="tel:+4915232157654">+49 152 32157654</a>
        </p>
      </LegalSection>

      <LegalSection number="02" title="Ihre Rechte">
        <p>
          Sie haben nach Maßgabe der gesetzlichen Voraussetzungen das Recht auf
          Auskunft über Ihre personenbezogenen Daten (Art. 15 DSGVO),
          Berichtigung unrichtiger Daten (Art. 16 DSGVO), Löschung (Art. 17
          DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO) und
          Datenübertragbarkeit (Art. 20 DSGVO).
        </p>
        <p>
          Soweit wir Daten auf Grundlage Ihrer Einwilligung verarbeiten, können
          Sie diese Einwilligung jederzeit mit Wirkung für die Zukunft
          widerrufen. Die Rechtmäßigkeit der Verarbeitung bis zum Widerruf
          bleibt davon unberührt.
        </p>
        <p>
          Sie können einer Verarbeitung auf Grundlage berechtigter Interessen
          aus Gründen, die sich aus Ihrer besonderen Situation ergeben,
          widersprechen (Art. 21 Abs. 1 DSGVO). Einer Verarbeitung Ihrer Daten
          für Direktwerbung können Sie jederzeit ohne Angabe von Gründen
          widersprechen (Art. 21 Abs. 2 DSGVO).
        </p>
        <p>
          Außerdem können Sie sich bei einer Datenschutzaufsichtsbehörde
          beschweren. Für Unternehmen mit Sitz in Nordrhein-Westfalen ist
          grundsätzlich die Landesbeauftragte für Datenschutz und
          Informationsfreiheit Nordrhein-Westfalen zuständig.
        </p>
      </LegalSection>

      <LegalSection number="03" title="Aufruf unserer Website und technische Protokolldaten">
        <p>
          <strong>Art und Zweck der Verarbeitung:</strong> Beim Aufruf unserer
          Website werden technisch erforderliche Daten verarbeitet. Dazu können
          insbesondere IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene
          Seite, Browser- und Geräteinformationen sowie Fehlermeldungen
          gehören. Wir benötigen diese Daten, um die Website bereitzustellen,
          Störungen zu erkennen und die Sicherheit unserer Systeme zu
          gewährleisten.
        </p>
        <p>
          <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO. Unser
          berechtigtes Interesse liegt im sicheren und funktionsfähigen Betrieb
          der Plattform.
        </p>
        <p>
          <strong>Empfänger:</strong> Je nach Betriebsumgebung können Replit als
          Infrastruktur- und Hostinganbieter sowie Neon als Datenbankdienst
          und weitere technische Dienstleister Zugriff auf technische Daten
          erhalten.
        </p>
        <p>
          <strong>Speicherdauer:</strong> Technische Protokolldaten werden nur
          so lange gespeichert, wie sie für den sicheren Betrieb, die
          Fehleranalyse oder die Untersuchung eines Sicherheitsvorfalls
          erforderlich sind, und anschließend gelöscht.
        </p>
      </LegalSection>

      <LegalSection number="04" title="Cookies und vergleichbare Technologien">
        <p>
          Wir verwenden technisch erforderliche Technologien, damit
          grundlegende Funktionen wie Anmeldung, Sitzungsverwaltung,
          Warenkorb, Sicherheit und Buchungsablauf funktionieren. Soweit wir
          darüber hinaus Analyse- oder Marketingtechnologien einsetzen,
          informieren wir im Einwilligungsdialog über Anbieter, Zwecke und
          Speicherdauer und holen eine erforderliche Einwilligung ein.
        </p>
        <p>
          Für das Speichern von Informationen auf Ihrem Gerät oder den Zugriff
          darauf gilt zusätzlich § 25 TDDDG. Technisch nicht erforderliche
          Zugriffe erfolgen grundsätzlich erst nach Ihrer Einwilligung.
        </p>
        <p>
          Aktuell setzen wir keine Analyse- oder Marketingtechnologien ein. Die
          Cookie-Auswahl wird lokal in Ihrem Browser gespeichert.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Nutzerkonto und Anmeldung">
        <p>
          <strong>Art und Zweck der Verarbeitung:</strong> Wenn Sie ein Konto
          erstellen oder sich anmelden, verarbeiten wir die von Ihnen
          angegebenen Daten, beispielsweise Name, E-Mail-Adresse, Anmeldedaten
          und gegebenenfalls Telefonnummer. Passwörter werden nicht im Klartext
          gespeichert.
        </p>
        <p>
          <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO, soweit
          die Verarbeitung zur Bereitstellung des Nutzerkontos erforderlich
          ist. Sicherheitsbezogene Verarbeitungen können zusätzlich auf Art. 6
          Abs. 1 lit. f DSGVO beruhen.
        </p>
        <p>
          <strong>Speicherdauer:</strong> Kontodaten speichern wir grundsätzlich
          für die Dauer des Nutzerkontos. Nach Löschung des Kontos entfernen
          wir die Daten, soweit keine gesetzlichen Aufbewahrungspflichten,
          offenen Buchungen oder berechtigten Ansprüche entgegenstehen.
        </p>
      </LegalSection>

      <LegalSection number="06" title="Suche nach Angeboten und Standortfunktionen">
        <p>
          Wenn Sie nach Freizeitangeboten suchen, verarbeiten wir Ihre
          Suchangaben, beispielsweise Ort, Kategorie und Datum, um passende
          Angebote anzuzeigen. Wenn Sie die Standortfreigabe Ihres Geräts
          aktivieren, können wir Ihren aktuellen Standort zur Anzeige von
          Angeboten in Ihrer Nähe verwenden. Sie können die Standortfreigabe
          jederzeit in den Einstellungen Ihres Geräts entziehen.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit die Verarbeitung
          zur Bereitstellung der angeforderten Suchfunktion erforderlich ist;
          bei freiwilliger Freigabe des Gerätestandorts gegebenenfalls Art. 6
          Abs. 1 lit. a DSGVO.
        </p>
        <p>
          Für eingebettete Kartendarstellungen verwenden wir OpenStreetMap und
          Leaflet. Wenn Sie einen externen Navigationsdienst über einen Link
          öffnen, gelten für dessen weitere Verarbeitung die
          Datenschutzhinweise des jeweiligen Anbieters.
        </p>
      </LegalSection>

      <LegalSection number="07" title="Buchungen und Voranmeldungen">
        <p>
          Bei einer Buchung oder Voranmeldung verarbeiten wir die für den
          Vorgang erforderlichen Daten. Dazu können Kontaktdaten, gebuchtes
          Angebot, Termin, Teilnehmerzahl, Preis, Buchungsstatus und Ihre
          Mitteilungen zur Buchung gehören. Die Verarbeitung dient der
          Vermittlung und technischen Abwicklung des Vorgangs, der Bestätigung
          sowie der Bearbeitung von Änderungen, Stornierungen und Rückfragen.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO für die Buchungs- und
          Vermittlungsleistung sowie Art. 6 Abs. 1 lit. c DSGVO für gesetzliche
          Aufbewahrungs- und Nachweispflichten.
        </p>
        <p>
          Wir übermitteln dem jeweiligen Freizeitpartner nur die Daten, die er
          zur Durchführung des gebuchten Angebots benötigt. Der jeweilige
          Partner verarbeitet Daten für die Durchführung seines Angebots
          grundsätzlich in eigener Verantwortung.
        </p>
        <p>
          Buchungsdaten speichern wir, solange dies für die Abwicklung,
          gesetzliche Pflichten und die Durchsetzung oder Abwehr von Ansprüchen
          erforderlich ist.
        </p>
      </LegalSection>

      <LegalSection number="08" title="Zahlungsabwicklung">
        <p>
          Wenn Sie ein kostenpflichtiges Angebot buchen, verarbeiten wir
          Zahlungs- und Transaktionsinformationen, um die Zahlung auszulösen,
          zuzuordnen, abzurechnen und gegebenenfalls eine Erstattung
          vorzunehmen. Sensible Zahlungsdaten können unmittelbar beim
          Zahlungsdienstleister verarbeitet werden.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO für die
          Zahlungsabwicklung und Art. 6 Abs. 1 lit. c DSGVO für gesetzliche
          Buchführungs- und Aufbewahrungspflichten. Maßnahmen gegen
          Zahlungsbetrug können auf Art. 6 Abs. 1 lit. f DSGVO beruhen.
        </p>
        <p>
          Für die Zahlungsabwicklung und Partnerauszahlungen setzen wir Stripe
          beziehungsweise Stripe Connect ein. Stripe kann Daten zusätzlich in
          eigener Verantwortung verarbeiten; hierzu gelten die
          Datenschutzhinweise von Stripe.
        </p>
      </LegalSection>

      <LegalSection number="09" title="Kommunikation und Support">
        <p>
          Wenn Sie uns per E-Mail, Formular, Telefon oder über eine
          Supportfunktion kontaktieren, verarbeiten wir Ihre Kontaktdaten und
          den Inhalt Ihrer Anfrage, um diese zu beantworten und gegebenenfalls
          Ihre Buchung oder Zusammenarbeit zu betreuen.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO bei vertragsbezogenen
          Anfragen; im Übrigen Art. 6 Abs. 1 lit. f DSGVO aufgrund unseres
          Interesses an der Bearbeitung von Anfragen.
        </p>
        <p>
          Für den E-Mail-Versand wird Resend eingesetzt. Wenn Sie den
          optionalen KI-Support oder Sprachassistenten nutzen, können Ihre
          Nachrichten, technische Sitzungsdaten und nach Ihrer
          Mikrofonfreigabe Audiodaten beziehungsweise Transkriptinformationen
          an OpenAI übertragen werden. Bitte geben Sie dort keine Passwörter,
          Zahlungsdaten oder besonderen Kategorien personenbezogener Daten ein.
        </p>
        <p>
          Wir löschen Anfragen, wenn ihre Bearbeitung abgeschlossen ist und
          keine Aufbewahrungspflicht oder ein berechtigter Bedarf zur
          Dokumentation mehr besteht.
        </p>
      </LegalSection>

      <LegalSection number="10" title="Freizeitpartner und Partnerportal">
        <p>
          Wenn Sie für einen Freizeitpartner tätig sind oder eine Partnerschaft
          anfragen, verarbeiten wir insbesondere Ihre geschäftlichen
          Kontaktdaten, Angaben zum Unternehmen und zu Angeboten, Vertrags- und
          Abrechnungsdaten sowie Daten zur Nutzung des Partnerportals. Dies
          dient der Prüfung und Durchführung der Zusammenarbeit, der Darstellung
          von Angeboten, der Buchungsabwicklung und der Kommunikation.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit Sie selbst
          Vertragspartner sind; bei Kontaktpersonen eines Unternehmens Art. 6
          Abs. 1 lit. f DSGVO; für gesetzliche Pflichten Art. 6 Abs. 1 lit. c
          DSGVO.
        </p>
        <p>
          Die Daten speichern wir für die Dauer der Zusammenarbeit und darüber
          hinaus, soweit gesetzliche Aufbewahrungspflichten oder offene
          Ansprüche bestehen.
        </p>
      </LegalSection>

      <LegalSection number="11" title="E-Mails und Benachrichtigungen">
        <p>
          Wir versenden erforderliche Nachrichten, etwa zur Kontobestätigung,
          Buchung, Zahlung, Stornierung oder Sicherheit des Kontos.
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO beziehungsweise bei
          sicherheitsbezogenen Nachrichten Art. 6 Abs. 1 lit. f DSGVO.
        </p>
        <p>
          Für Newsletter- und Launch-Anmeldungen speichern wir E-Mail-Adresse,
          optional den Namen und den Zeitpunkt der Anmeldung. Werbliche
          Nachrichten versenden wir nur auf Grundlage einer wirksamen
          Einwilligung, soweit keine andere gesetzliche Erlaubnis greift. Eine
          Einwilligung kann jederzeit mit Wirkung für die Zukunft widerrufen
          werden.
        </p>
        <p>
          Empfänger ist der für den Versand eingesetzte Dienstleister Resend.
          Die Anmeldedaten bleiben grundsätzlich bis zum Widerruf oder zur
          Abmeldung gespeichert, soweit keine gesetzlichen Pflichten oder
          offenen Vorgänge entgegenstehen.
        </p>
      </LegalSection>

      <LegalSection number="12" title="Analyse, Werbung und externe Inhalte">
        <p>
          Auf der Coming-Soon-Seite und der Plattform werden derzeit keine
          Analyse- oder Marketingtechnologien eingesetzt. Es werden daher
          insbesondere kein Google Analytics, Meta-Pixel, YouTube, Google Fonts
          oder reCAPTCHA vorsorglich eingebunden.
        </p>
        <p>
          Wenn künftig ein solcher Dienst hinzukommt, wird diese
          Datenschutzerklärung um Anbieter, Zweck, verarbeitete Daten,
          Rechtsgrundlage, Speicherdauer, Drittlandübermittlung und
          Widerrufsmöglichkeit ergänzt. Technisch nicht erforderliche Dienste
          werden erst nach einer erforderlichen Einwilligung geladen.
        </p>
      </LegalSection>

      <LegalSection number="13" title="Dienstleister und Datenübermittlung in Drittländer">
        <p>
          Wir setzen Dienstleister für den technischen Betrieb und die
          Erbringung unserer Leistungen ein. Soweit diese personenbezogene
          Daten in unserem Auftrag verarbeiten, schließen wir die gesetzlich
          erforderlichen Vereinbarungen zur Auftragsverarbeitung. Andere
          Empfänger können Daten in eigener Verantwortung verarbeiten, etwa
          Freizeitpartner oder Zahlungsdienstleister.
        </p>
        <p>
          Eine Übermittlung personenbezogener Daten außerhalb des Europäischen
          Wirtschaftsraums erfolgt nur, soweit sie für eingesetzte Dienste
          erforderlich und rechtlich zulässig ist. Dabei prüfen wir die jeweils
          anwendbare Grundlage, beispielsweise einen Angemessenheitsbeschluss
          oder geeignete vertragliche Garantien.
        </p>
        <p>
          Je nach aktivierter Funktion können insbesondere Stripe, Resend,
          OpenAI sowie von Partnern verbundene Kalenderdienste wie Google
          Calendar oder Microsoft Outlook Daten außerhalb des Europäischen
          Wirtschaftsraums verarbeiten. Für die weitere Verarbeitung gelten
          zusätzlich die Datenschutzinformationen des jeweiligen Anbieters.
        </p>
      </LegalSection>

      <LegalSection number="14" title="Datensicherheit und Änderungen">
        <p>
          Wir setzen technische und organisatorische Maßnahmen ein, um
          personenbezogene Daten vor unbefugtem Zugriff, Verlust und Missbrauch
          zu schützen. Dazu gehören insbesondere verschlüsselte
          Datenübertragungen, Passwort-Hashing, Sitzungs- und
          Zugriffskontrollen sowie die Begrenzung von Zugriffsrechten.
        </p>
        <p>
          Die Übertragung unserer Website erfolgt verschlüsselt über HTTPS.
          Keine Übertragung über das Internet und kein Speichersystem kann
          jedoch absolute Sicherheit garantieren.
        </p>
        <p>
          Wir aktualisieren diese Datenschutzerklärung, wenn sich unsere
          Dienste, Datenverarbeitungen oder rechtlichen Anforderungen ändern.
          Maßgeblich ist die jeweils auf unserer Website veröffentlichte
          Fassung.
        </p>
      </LegalSection>
    </LandingLegalFrame>
  );
}

export default function LandingLegalPage({ kind }: LandingLegalPageProps) {
  return kind === "imprint" ? <LandingImprintPage /> : <LandingPrivacyPage />;
}