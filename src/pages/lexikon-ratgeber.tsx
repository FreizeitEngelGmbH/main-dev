import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search, BookOpen, ChevronDown, ChevronRight, ArrowLeft, Lightbulb,
  Shield, Heart, Users, Target, HelpCircle, Star, MapPin
} from "lucide-react";

interface LexikonArticle {
  question: string;
  answer: string;
  tags: string[];
}

interface LexikonCategory {
  name: string;
  icon: string;
  description: string;
  color: string;
  articles: LexikonArticle[];
}

const lexikonData: LexikonCategory[] = [
  {
    name: "Schwimmen",
    icon: "🏊",
    description: "Alles rund ums Schwimmen – von Technik über Sicherheit bis zu Tipps für Anfänger.",
    color: "bg-blue-50 border-blue-200",
    articles: [
      { question: "Schwimmen lernen ohne Angst – Tipps für Erwachsene", answer: "Viele Erwachsene haben nie richtig schwimmen gelernt oder haben Angst vor dem Wasser. Der wichtigste Schritt ist, sich in einem sicheren Umfeld an Wasser zu gewöhnen. Beginnen Sie im Nichtschwimmerbereich und gewöhnen Sie sich ans Untertauchen. Schwimmkurse für Erwachsene werden in fast jedem Schwimmbad angeboten – dort lernen Sie in kleinen Gruppen mit professioneller Anleitung. Atmen Sie bewusst und ruhig, und setzen Sie sich nicht unter Druck. Regelmäßigkeit ist der Schlüssel: Schon 2-3 Besuche pro Woche bringen schnelle Fortschritte.", tags: ["Anfänger", "Erwachsene", "Angst"] },
      { question: "Wie atmet man richtig beim Schwimmen als Anfänger?", answer: "Die richtige Atemtechnik ist die Grundlage guten Schwimmens. Atmen Sie über Wasser durch den Mund ein und unter Wasser durch Nase und Mund aus. Der häufigste Fehler: Die Luft unter Wasser anhalten. Stattdessen sollten Sie kontinuierlich ausatmen, sobald Ihr Gesicht im Wasser ist. Üben Sie zunächst am Beckenrand: Gesicht ins Wasser, langsam durch die Nase blubbern, Kopf drehen, einatmen. Beim Kraulschwimmen dreht man den Kopf seitlich zum Einatmen – nicht nach oben heben!", tags: ["Technik", "Anfänger", "Atmung"] },
      { question: "Warum ist die Wasserlage beim Schwimmen so wichtig?", answer: "Eine gute Wasserlage bedeutet, dass Ihr Körper möglichst flach und stromlinienförmig im Wasser liegt. Je flacher Sie liegen, desto weniger Widerstand erzeugen Sie und desto leichter gleiten Sie durchs Wasser. Wenn Ihre Beine absinken, müssen Sie deutlich mehr Kraft aufwenden. Tipps für eine gute Wasserlage: Blick nach unten richten (nicht nach vorne), Körperspannung halten, Beine nah an der Wasseroberfläche und den Bauchnabel Richtung Wasseroberfläche drücken.", tags: ["Technik", "Fortgeschritten"] },
      { question: "Häufige Technikfehler beim Schwimmen vermeiden", answer: "Die drei häufigsten Fehler bei Anfängern: 1) Kopf zu hoch halten – das lässt die Beine sinken. Lösung: Blick nach unten. 2) Zu schneller Beinschlag – kostet Energie, bringt wenig Vortrieb. Lösung: Lockerer, rhythmischer Beinschlag aus der Hüfte. 3) Zu kurze Gleitphase – hektisches Schwimmen verschwendet Kraft. Lösung: Nach jedem Armzug kurz gleiten lassen. Ein Schwimmkurs oder eine Videoanalyse kann helfen, eigene Fehler zu erkennen.", tags: ["Technik", "Fehler", "Anfänger"] },
      { question: "Wie bleibt man beim Schwimmen über Wasser ohne Panik?", answer: "Vertrauen in die eigene Auftriebsfähigkeit ist entscheidend. Der menschliche Körper schwimmt natürlich – besonders mit gefüllten Lungen. Üben Sie zunächst das Sternchen (Rückenlage, Arme und Beine ausgestreckt) im flachen Wasser. Wenn Panik aufkommt: Auf den Rücken drehen, tief einatmen, und sich treiben lassen. Wassertreten ist eine weitere wichtige Technik – abwechselnd mit den Beinen kreisförmig paddeln, Arme seitlich bewegen. Regelmäßiges Üben im Nichtschwimmerbereich baut Vertrauen auf.", tags: ["Sicherheit", "Anfänger", "Angst"] }
    ]
  },
  {
    name: "Museum",
    icon: "🏛️",
    description: "Tipps für den Museumsbesuch und Wissenswertes über die Museumswelt.",
    color: "bg-amber-50 border-amber-200",
    articles: [
      { question: "Was macht ein Museum besonders für Besucher?", answer: "Museen sind einzigartige Orte des Lernens und Staunens. Sie bewahren kulturelles Erbe, zeigen Originale und bieten Erlebnisse, die kein Buch oder Video ersetzen kann. Moderne Museen setzen auf interaktive Ausstellungen, Multimedia-Stationen und spezielle Kinderangebote. Ob Kunst, Naturkunde, Technik oder Geschichte – jedes Museum erzählt Geschichten und lädt zum Entdecken ein. Viele Museen bieten zudem Workshops, Führungen und Sonderausstellungen, die den Besuch immer wieder neu und spannend machen.", tags: ["Allgemein", "Kultur"] },
      { question: "Warum sind Museen wichtig für die Gesellschaft?", answer: "Museen erfüllen mehrere wichtige Funktionen: Sie bewahren unser kulturelles Gedächtnis, bilden Menschen aller Altersgruppen weiter und fördern den gesellschaftlichen Dialog. Sie machen Wissenschaft, Kunst und Geschichte für jeden zugänglich – unabhängig vom Bildungsstand. Museen stärken zudem die lokale Identität und den Tourismus. Für Kinder sind sie wertvolle Lernorte, die Neugier wecken und Zusammenhänge greifbar machen.", tags: ["Gesellschaft", "Bildung"] },
      { question: "Tipps für einen gelungenen Museumsbesuch", answer: "1) Planen Sie im Voraus: Informieren Sie sich über aktuelle Ausstellungen und Öffnungszeiten. 2) Weniger ist mehr: Konzentrieren Sie sich auf einige Bereiche statt alles zu sehen. 3) Audioguide nutzen: Er liefert spannende Hintergrundinformationen. 4) Mit Kindern: Viele Museen haben Rallyes oder spezielle Kinderprogramme. 5) Randzeiten nutzen: Unter der Woche oder nachmittags ist es oft leerer. 6) Bequeme Schuhe tragen – ein Museumsbesuch kann lang werden!", tags: ["Tipps", "Familie"] },
      { question: "Unterschied zwischen Museum und Ausstellung erklärt", answer: "Ein Museum ist eine permanente Institution, die Objekte sammelt, bewahrt, erforscht und ausstellt. Es hat eine feste Sammlung und einen Bildungsauftrag. Eine Ausstellung ist dagegen eine zeitlich begrenzte Präsentation zu einem bestimmten Thema – sie kann in einem Museum stattfinden, aber auch in Galerien, Messehallen oder öffentlichen Räumen. Museen haben oft sowohl eine Dauerausstellung (immer zu sehen) als auch wechselnde Sonderausstellungen.", tags: ["Wissen", "Unterschied"] },
      { question: "Wie funktioniert ein Museum hinter den Kulissen?", answer: "Hinter den Kulissen arbeiten Kuratoren (planen Ausstellungen), Restauratoren (pflegen und reparieren Objekte), Wissenschaftler (forschen an der Sammlung), Museumspädagogen (entwickeln Bildungsprogramme) und Techniker (bauen Ausstellungen auf). Die Sammlung eines Museums ist oft viel größer als das, was ausgestellt wird – oft sind nur 5-10% der Objekte sichtbar. Der Rest wird in Depots fachgerecht gelagert. Klimatisierung, Lichttechnik und Sicherheit spielen eine entscheidende Rolle.", tags: ["Hintergrund", "Wissen"] }
    ]
  },
  {
    name: "Zoo & Tierpark",
    icon: "🦁",
    description: "Wissenswertes über Zoos, Tierparks und tierische Erlebnisse.",
    color: "bg-green-50 border-green-200",
    articles: [
      { question: "Unterschied zwischen Zoo und Tierpark einfach erklärt", answer: "Ein Zoo (Zoologischer Garten) zeigt Tiere aus aller Welt, oft exotische Arten wie Löwen, Elefanten oder Giraffen, auf meist kleinerem Gelände mit aufwändig gestalteten Gehegen. Ein Tierpark ist in der Regel größer und naturnäher angelegt, mit Schwerpunkt auf heimischen oder europäischen Tieren. Die Gehege sind oft weitläufiger. In der Praxis werden die Begriffe aber oft synonym verwendet. Wildparks zeigen ausschließlich heimische Wildtiere in naturnahen Gehegen.", tags: ["Wissen", "Unterschied"] },
      { question: "Sind Zoos gut für Tiere? Vor- und Nachteile", answer: "Das ist eine vieldiskutierte Frage. Vorteile: Zoos leisten wichtige Arbeit im Artenschutz und Zuchtprogrammen für bedrohte Arten. Sie ermöglichen Forschung und Umweltbildung. Moderne Zoos investieren in artgerechte, naturnahe Gehege. Nachteile: Manche Tiere haben Platzmangel, Verhaltensstörungen oder leiden unter Stress. Die Qualität variiert stark zwischen Einrichtungen. Gute Zoos orientieren sich an den Richtlinien des Verbands der Zoologischen Gärten und setzen sich aktiv für Naturschutzprojekte ein.", tags: ["Diskussion", "Tierschutz"] },
      { question: "Was lernen Kinder im Zoo? Pädagogischer Wert", answer: "Zoos sind lebendige Klassenzimmer. Kinder lernen Tierarten, Lebensräume und Zusammenhänge in der Natur kennen. Sie entwickeln Empathie für Tiere und Verständnis für Artenschutz. Viele Zoos bieten Zooschule, Rallyes und Fütterungen mit Erklärungen. Der direkte Kontakt – Tiere sehen, hören und manchmal riechen – prägt stärker als jedes Buch. Studien zeigen, dass Zoobesuche das Umweltbewusstsein von Kindern nachhaltig fördern.", tags: ["Kinder", "Bildung"] },
      { question: "Wie funktioniert ein Tierpark hinter den Kulissen?", answer: "Tierpfleger beginnen ihren Tag früh mit Fütterung und Gesundheitschecks. Jedes Tier hat einen individuellen Futterplan. Tierärzte führen regelmäßige Untersuchungen durch. Die Gehegegestaltung wird von Biologen geplant, um natürliche Verhaltensweisen zu fördern (Enrichment). Zuchtprogramme werden international koordiniert – Zoos tauschen Tiere aus, um genetische Vielfalt zu sichern. Dazu kommen Verwaltung, Marketing, Gästebetreuung und Instandhaltung der Anlagen.", tags: ["Hintergrund", "Wissen"] },
      { question: "Warum gibt es Tierparks und Zoos überhaupt?", answer: "Die ersten Zoos waren königliche Menagerien zur Unterhaltung. Heute haben sie vier Hauptaufgaben: 1) Artenschutz – Zuchtprogramme für bedrohte Arten. 2) Forschung – Studien über Tierverhalten und Biologie. 3) Bildung – Umweltbewusstsein und Naturverständnis vermitteln. 4) Erholung – Menschen die Natur nahebringen. Ohne Zoos wären manche Arten bereits ausgestorben, etwa der Wisent oder das Przewalski-Pferd. Moderne Zoos verstehen sich als Naturschutzzentren.", tags: ["Geschichte", "Artenschutz"] }
    ]
  },
  {
    name: "Indoorspielplatz",
    icon: "🎪",
    description: "Tipps und Wissenswertes rund um Indoorspielplätze für Familien.",
    color: "bg-pink-50 border-pink-200",
    articles: [
      { question: "Wie sicher sind Indoorspielplätze für Kinder?", answer: "Indoorspielplätze in Deutschland unterliegen strengen Sicherheitsvorschriften (DIN EN 1176). Geräte werden regelmäßig vom TÜV geprüft. Weiche Böden, Polsterungen und Netze minimieren Verletzungsrisiken. Trotzdem sollten Eltern ihre Kinder im Blick behalten, besonders bei Kleinkindern unter 3 Jahren. Achten Sie auf: Altersempfehlungen an den Geräten, saubere und gepflegte Anlagen, ausreichend Personal. Die meisten Verletzungen entstehen durch Stürze – Socken mit Noppen geben besseren Halt.", tags: ["Sicherheit", "Kinder"] },
      { question: "Indoorspielplatz – Regeln und Verhalten für Kinder", answer: "Die wichtigsten Regeln: 1) Stoppersocken tragen (oft Pflicht). 2) Keine Schuhe auf den Spielgeräten. 3) Nicht drängeln oder schubsen auf Rutschen und Trampolinen. 4) Auf die Altersfreigabe der Bereiche achten. 5) Essen und Trinken nur in den vorgesehenen Bereichen. 6) Kleinere Kinder nicht allein in den Großgerätebereichen lassen. Die meisten Spielplätze haben Aufsichtspersonal, aber die Aufsichtspflicht liegt grundsätzlich bei den Eltern.", tags: ["Regeln", "Kinder"] },
      { question: "Was braucht man für den Besuch im Indoorspielplatz?", answer: "Packliste für den Indoorspielplatz: Stoppersocken (können oft auch vor Ort gekauft werden), bequeme Kleidung für die Kinder, Wechselkleidung (Kinder schwitzen!), eigene Trinkflasche, ggf. Snacks. Tipp: Manche Spielplätze haben Schließfächer – bringen Sie ein kleines Schloss mit. Schmuck und Uhren sollten Kinder ablegen. An Wochenenden und Ferientagen ist es voll – unter der Woche ist der Besuch entspannter.", tags: ["Tipps", "Vorbereitung"] },
      { question: "Indoorspielplatz – Vorteile bei schlechtem Wetter", answer: "Indoorspielplätze sind die perfekte Schlechtwetter-Alternative. Kinder können sich austoben, klettern, rutschen und springen – unabhängig von Regen, Kälte oder Hitze. Vorteile: Bewegung und Spaß bei jedem Wetter, Förderung motorischer Fähigkeiten, soziale Kontakte mit anderen Kindern, Eltern können sich entspannen (Café-Bereich). In NRW gibt es zahlreiche Indoorspielplätze in fast jeder Stadt – ideal für Familienausflüge bei schlechtem Wetter.", tags: ["Vorteile", "Familie", "Wetter"] },
      { question: "Wie fördert ein Indoorspielplatz die Entwicklung von Kindern?", answer: "Indoorspielplätze fördern gleich mehrere Entwicklungsbereiche: Motorik (Klettern, Balancieren, Springen stärkt Muskeln und Koordination), Sozialverhalten (Kinder lernen Teilen, Warten und Rücksichtnahme), Selbstvertrauen (Herausforderungen meistern, Höhen überwinden), Kreativität (Rollenspiele in Themenbereichen), Wahrnehmung (verschiedene Materialien, Farben und Formen). Besonders für Stadtkinder sind sie ein wichtiger Ausgleich zum oft bewegungsarmen Alltag.", tags: ["Entwicklung", "Kinder", "Förderung"] }
    ]
  },
  {
    name: "Freibad",
    icon: "☀️",
    description: "Freibad-Tipps für Familien – Sicherheit, Spaß und Gesundheit.",
    color: "bg-cyan-50 border-cyan-200",
    articles: [
      { question: "Freibad Öffnungszeiten – Tipps für Familien", answer: "Die meisten Freibäder in NRW öffnen von Mai bis September, je nach Wetter. Typische Öffnungszeiten: 6:00-20:00 Uhr. Tipp: Frühschwimmer-Zeiten (6-8 Uhr) sind ideal für ruhiges Schwimmen. Familien kommen am besten gegen 10 Uhr und sichern sich gute Liegeplätze. An heißen Tagen kann es ab Mittag sehr voll werden. Viele Freibäder bieten Saisonkarten an, die sich ab dem 10. Besuch lohnen. Informieren Sie sich online über aktuelle Belegung.", tags: ["Tipps", "Familie", "Zeiten"] },
      { question: "Sicher schwimmen im Freibad – worauf achten?", answer: "Sicherheitstipps fürs Freibad: 1) Kinder nie unbeaufsichtigt lassen, auch nicht mit Schwimmflügeln. 2) Vor dem Schwimmen abduschen (Hygiene + Körper ans Wasser gewöhnen). 3) Nicht mit vollem Magen ins Wasser. 4) Sonnenschutz nicht vergessen (wasserfeste Sonnencreme, nachcremen!). 5) Baderegeln beachten: Kein Rennen am Beckenrand, nicht in unbekannte Gewässer springen. 6) Bei Gewitter sofort das Wasser verlassen. Schwimmabzeichen geben Sicherheit – das Seepferdchen ist der erste Schritt.", tags: ["Sicherheit", "Kinder"] },
      { question: "Freibad für Kinder – Spiele und Spaß", answer: "Im Freibad gibt es viel zu entdecken: Rutschen, Sprungtürme, Strömungskanäle und Planschbecken für die Kleinsten. Spielideen: Tauchen nach Ringen, Staffelschwimmen, Wasserball oder einfach Planschen. Viele Freibäder haben Spielplätze und Liegewiesen für Pausen. Aufblasbare Spielzeuge, Taucherbrillen und Schwimmnudeln machen extra Spaß. Für größere Kinder: Schwimmabzeichen-Training ist ein tolles Ziel für den Sommer!", tags: ["Kinder", "Spaß", "Spiele"] },
      { question: "Gesundheitliche Vorteile vom Freibad-Besuch", answer: "Schwimmen ist ein Ganzkörpertraining, das Gelenke schont und Ausdauer aufbaut. Sonnenlicht (mit Schutz!) fördert die Vitamin-D-Produktion. Bewegung an der frischen Luft stärkt das Immunsystem. Schwimmen verbessert die Koordination, kräftigt die Muskulatur und ist gut fürs Herz-Kreislauf-System. Für Kinder: Es fördert die motorische Entwicklung und baut Stress ab. Tipp: Auch gemütliches Planschen hat positive Effekte auf die Gesundheit!", tags: ["Gesundheit", "Vorteile"] },
      { question: "Essen und Trinken im Freibad – was ist erlaubt?", answer: "Die Regeln variieren: In den meisten Freibädern dürfen Sie eigene Speisen und Getränke mitbringen, Glasflaschen sind aber oft verboten (Verletzungsgefahr). Packtipps: Viel Wasser (mindestens 2 Liter pro Person), Obst, belegte Brote, Müsliriegel. Vermeiden Sie schnell verderbliche Lebensmittel bei Hitze. Die meisten Freibäder haben auch einen Kiosk mit Pommes, Eis und Getränken. Tipp: Kühltasche mitnehmen und im Schatten lagern.", tags: ["Tipps", "Essen", "Praktisch"] }
    ]
  },
  {
    name: "Eissporthalle",
    icon: "⛸️",
    description: "Eislaufen für Anfänger und Familien – Tipps und Sicherheit.",
    color: "bg-indigo-50 border-indigo-200",
    articles: [
      { question: "Sicherheitstipps für Kinder in der Eissporthalle", answer: "Eislaufen macht Kindern großen Spaß, Sicherheit ist aber wichtig: 1) Helm tragen – besonders für Anfänger. Knie- und Handgelenkschoner sind empfehlenswert. 2) Handschuhe sind Pflicht (Schutz vor Schnittverletzungen durch Kufen). 3) Warm anziehen in Schichten (es wird trotz Bewegung kalt). 4) Am Rand bleiben, bis man sicher steht. 5) In Fahrtrichtung laufen, nicht gegen den Strom. 6) Lauflernhilfen (Pinguine) sind perfekt für den Einstieg.", tags: ["Sicherheit", "Kinder"] },
      { question: "Wie läuft das Eislaufen in der Eissporthalle ab?", answer: "Ablauf eines typischen Besuchs: 1) Eintrittskarte kaufen (oft 2-3 Stunden-Slots). 2) Schlittschuhe ausleihen oder eigene anziehen. 3) Auf die Eisfläche gehen – am Rand entlang für Anfänger. 4) Die Eisfläche wird regelmäßig mit der Eismaschine (Zamboni) neu aufbereitet – dann gibt es eine kurze Pause. Tipp: Anfänger sollten zunächst das Fallen üben – seitlich fallen und Hände schützen. Leih-Schlittschuhe sollten fest sitzen, aber nicht drücken.", tags: ["Ablauf", "Anfänger"] },
      { question: "Eissporthalle – Ausrüstung für Anfänger", answer: "Was Sie brauchen: Warme, bewegliche Kleidung (keine dicke Skijacke – man bewegt sich viel!), Handschuhe (Pflicht!), warme Socken (nicht zu dick, Schlittschuhe müssen gut sitzen), Helm für Kinder (empfohlen). Schlittschuhe können geliehen werden (ca. 3-5€), eigene lohnen sich ab 5+ Besuchen. Beim Kauf: Figur-Schlittschuhe für Anfänger (Zacken vorne helfen beim Bremsen), Hockey-Schlittschuhe für Fortgeschrittene.", tags: ["Ausrüstung", "Anfänger"] },
      { question: "Veranstaltungen und Kurse in der Eissporthalle", answer: "Eissporthallen bieten vielfältige Programme: Anfängerkurse für Kinder und Erwachsene, Eiskunstlauf-Training, Eishockey-Schnupperkurse und Eisdisco (abends mit Musik und Lichtern). In den Ferien gibt es oft spezielle Ferienprogramme. Kindergeburtstage auf dem Eis sind sehr beliebt. Viele Hallen haben auch öffentliches Laufen zu festen Zeiten und separate Trainingszeiten für Vereine.", tags: ["Kurse", "Events"] },
      { question: "Gesundheitliche Vorteile vom Eislaufen", answer: "Eislaufen ist ein exzellentes Training: Es verbessert Balance und Koordination, stärkt Bein- und Rumpfmuskulatur, fördert die Ausdauer und verbrennt 300-500 Kalorien pro Stunde. Es ist gelenkschonender als Joggen, da die Gleitbewegung weniger Stöße verursacht. Für Kinder fördert es Gleichgewichtssinn und Körpergefühl. Die kalte Luft in der Halle ist frisch und sauber. Tipp: Schon 30 Minuten Eislaufen pro Woche zeigen messbare Fitness-Verbesserungen.", tags: ["Gesundheit", "Fitness"] }
    ]
  },
  {
    name: "Freizeitpark",
    icon: "🎢",
    description: "Tipps für den perfekten Tag im Freizeitpark.",
    color: "bg-purple-50 border-purple-200",
    articles: [
      { question: "Sicherheit im Freizeitpark – Tipps für Eltern", answer: "Freizeitparks in Deutschland unterliegen strengen TÜV-Kontrollen. Trotzdem sollten Eltern beachten: 1) Mindestgröße und Altersbeschränkungen respektieren. 2) Sicherheitsbügel und Gurte richtig schließen lassen. 3) Einen Treffpunkt vereinbaren, falls man sich verliert. 4) Kinder unter 8 nur mit Begleitung auf größere Fahrgeschäfte. 5) Bei Vorerkrankungen (Herz, Rücken) Hinweisschilder beachten. 6) Sonnenschutz und genug Trinken nicht vergessen!", tags: ["Sicherheit", "Eltern", "Kinder"] },
      { question: "Freizeitpark – Spiele und Attraktionen für Kinder", answer: "Moderne Freizeitparks haben für jede Altersgruppe etwas: Für Kleinkinder (2-5): Karussells, Mini-Bahnen, Spielplätze und Wasserattraktionen. Für Kinder (6-12): Familien-Achterbahnen, Wildwasserbahnen, Abenteuerspielplätze und interaktive Rides. Für Teenager: Thrill-Rides, VR-Erlebnisse und Hochgeschwindigkeits-Achterbahnen. Tipp: Starten Sie mit den beliebtesten Attraktionen früh morgens – da sind die Wartezeiten am kürzesten.", tags: ["Kinder", "Attraktionen"] },
      { question: "Wie plant man einen Tag im Freizeitpark richtig?", answer: "Erfolgsplan: 1) Vorab online Tickets kaufen (günstiger + kein Schlange stehen). 2) Parkplan studieren und Must-Do-Attraktionen markieren. 3) Früh da sein (Parköffnung) – die erste Stunde hat die kürzesten Wartezeiten. 4) Gegen den Strom gehen – die meisten Besucher laufen rechts herum. 5) Mittagessen früh (11:30) oder spät (14:00) einplanen. 6) Shows und Pausen einplanen. 7) FastPass/Express-Optionen prüfen bei hoher Auslastung.", tags: ["Planung", "Tipps"] },
      { question: "Freizeitpark – Essen und Trinken: Was ist erlaubt?", answer: "Die Regeln variieren je nach Park: Viele Parks erlauben eigene Snacks und Getränke in nicht-gläsernen Behältern. Große Picknick-Körbe müssen oft am Eingang gelassen werden (Picknickbereiche am Parkplatz). Die Gastronomie im Park ist oft teuer (Pommes ~5€, Getränk ~4€). Spartipp: Trinkflasche mitnehmen und an Wasserspendern auffüllen. Einige Parks haben Souvenir-Becher mit günstigen Refills. Bei Allergien oder besonderen Ernährungsbedarfen: Vorab informieren.", tags: ["Essen", "Tipps", "Praktisch"] },
      { question: "Gesundheitliche Vorteile von Aktivitäten im Freizeitpark", answer: "Ein Freizeitpark-Tag hat überraschend positive Effekte: Man läuft durchschnittlich 10-15 km (10.000-20.000 Schritte). Adrenalin beim Achterbahnfahren kann Stresshormone abbauen. Gemeinsame Erlebnisse stärken Familienbindungen. Lachen und Spaß setzen Endorphine frei. Die Abwechslung zwischen Bewegung und Entspannung ist gut für Körper und Geist. Tipp: Bequeme Schuhe tragen – Ihre Füße werden es danken!", tags: ["Gesundheit", "Spaß"] }
    ]
  },
  {
    name: "Bowling",
    icon: "🎳",
    description: "Bowling-Tipps, Technik und Wissenswertes für Anfänger und Familien.",
    color: "bg-orange-50 border-orange-200",
    articles: [
      { question: "Wie verbessert man seine Bowling-Technik?", answer: "Die Grundtechnik: 1) Den richtigen Ball wählen – er sollte bequem in der Hand liegen (Daumen + 2 Finger). 2) 4-Schritt-Anlauf: Start etwa 4 Schritte vor der Foullinie. 3) Pendelbewegung – der Arm schwingt wie ein Pendel, nicht mit Kraft werfen. 4) Zielmarkierungen auf der Bahn nutzen (die Pfeile in der Mitte). 5) Follow-through – nach dem Loslassen den Arm in Zielrichtung weiterschwingen. Anfänger-Tipp: Zwischen dem 1. und 3. Pfeil zielen für einen Pocket-Treffer.", tags: ["Technik", "Anfänger"] },
      { question: "Bowling-Regeln für Anfänger einfach erklärt", answer: "Ein Bowling-Spiel hat 10 Frames. Pro Frame haben Sie 2 Würfe, um alle 10 Pins umzuwerfen. Strike = alle Pins im 1. Wurf (Bonus: nächste 2 Würfe dazu). Spare = alle Pins in 2 Würfen (Bonus: nächster Wurf dazu). Im 10. Frame gibt es bei Strike/Spare Zusatzwürfe. Die Foullinie darf nicht übertreten werden. Maximalpunktzahl: 300 (12 Strikes). Wichtige Etikette: Nur auf der eigenen Bahn spielen, dem Nachbarn Vorrang lassen, Leihschuhe tragen.", tags: ["Regeln", "Anfänger"] },
      { question: "Tipps und Tricks fürs Bowling spielen", answer: "Profi-Tipps: 1) Leichterer Ball = mehr Kontrolle (gerade für Anfänger). 2) Gerade Würfe zuerst meistern, dann Curve/Hook lernen. 3) Konsistente Startposition finden und markieren. 4) Nicht auf die Pins schauen, sondern auf die Pfeile auf der Bahn. 5) Locker bleiben – Verkrampfung führt zu schlechten Würfen. 6) Spare-Shooting systematisch üben. 7) Bowling-Schuhe geben den richtigen Gleiten-Effekt – barfuß oder in Socken funktioniert nicht!", tags: ["Tipps", "Tricks", "Fortgeschritten"] },
      { question: "Unterschied zwischen Bowling und Kegeln erklärt", answer: "Bowling verwendet 10 Pins, eine schwere Kugel mit Löchern und eine breite, geölte Bahn. Kegeln nutzt 9 Kegel (im Quadrat aufgestellt), eine kleinere, grifflose Kugel und eine engere Bahn. Beim Kegeln zählt man die umgeworfenen Kegel direkt, beim Bowling gibt es ein komplexeres Punktesystem mit Strikes und Spares. Bowling kommt aus den USA, Kegeln ist eine deutsche Tradition. Beide Sportarten gibt es als Freizeit- und Wettkampfvariante.", tags: ["Wissen", "Unterschied"] },
      { question: "Die gesundheitlichen Vorteile von Bowling", answer: "Bowling ist mehr als nur Spaß: Ein Spiel verbrennt ca. 150-300 Kalorien. Die Schwung- und Wurfbewegung stärkt Arm-, Schulter- und Beinmuskulatur. Die Konzentration auf Ziel und Technik fördert die Hand-Auge-Koordination. Als Gruppensport stärkt es soziale Bindungen und reduziert Stress. Bowling ist für alle Altersgruppen und Fitnesslevel geeignet – von Kindern bis Senioren. Viele Bowling-Center haben zudem Bumper-Bahnen für die Kleinsten.", tags: ["Gesundheit", "Vorteile"] }
    ]
  },
  {
    name: "Lasertag",
    icon: "🔫",
    description: "Alles über Lasertag – Strategie, Sicherheit und Spaß.",
    color: "bg-red-50 border-red-200",
    articles: [
      { question: "Was ist Lasertag und wie funktioniert es?", answer: "Lasertag ist ein teambasiertes Actionspiel in einer abgedunkelten Arena mit Hindernissen. Jeder Spieler trägt eine Weste mit Sensoren und einen Lasertag-Phaser (Infrarot, kein echter Laser – völlig ungefährlich!). Ziel: Gegenspieler an den Sensoren treffen und möglichst wenig selbst getroffen werden. Ein Spiel dauert meist 15-20 Minuten. Es gibt verschiedene Spielmodi: Team vs. Team, Free for All, Capture the Flag und mehr. Punkte werden digital gezählt.", tags: ["Grundlagen", "Erklärung"] },
      { question: "Tipps für den Einstieg ins Lasertag", answer: "Anfänger-Tipps: 1) Dunkle Kleidung tragen (man wird weniger gesehen). 2) Bequeme Schuhe für schnelle Bewegungen. 3) In Deckung bleiben und Hindernisse nutzen. 4) Nicht stehen bleiben – bewegte Ziele sind schwerer zu treffen. 5) Im Team kommunizieren und koordinieren. 6) Die Phaser-Genauigkeit ist begrenzt – näher ran! 7) Cardio-Fitness hilft – Lasertag ist anstrengender als man denkt!", tags: ["Tipps", "Anfänger"] },
      { question: "Sicherheitsregeln beim Lasertag", answer: "Lasertag ist sehr sicher: Die Phaser nutzen harmloses Infrarotlicht (wie eine TV-Fernbedienung). Regeln: 1) Nicht rennen (Sturzgefahr in der dunklen Arena). 2) Keinen Körperkontakt – kein Schubsen oder Festhalten. 3) Phaser nicht ins Gesicht richten (auch wenn harmlos – Blendgefahr). 4) Altersempfehlung beachten (meist ab 7-8 Jahren). 5) Personen mit Epilepsie sollten vorher fragen (Blitzlichter). Die meisten Arenen haben Schiedsrichter, die auf die Einhaltung achten.", tags: ["Sicherheit", "Regeln"] },
      { question: "Strategien und Taktiken beim Lasertag", answer: "Gewinnstrategien: 1) Flanken statt frontal angreifen. 2) Höhenpositionen sichern (Rampen, Plattformen). 3) Rücken zur Wand – nicht von hinten überraschen lassen. 4) Kurze Feuerstöße statt Dauerfeuer (mehr Präzision). 5) Nach dem Treffen kurz in Deckung – die Weste hat eine Abklingzeit. 6) Als Team: Einen Kundschafter, einen Verteidiger und Angreifer einteilen. 7) Bewegung ist Leben – stehende Ziele sind leichte Beute.", tags: ["Strategie", "Fortgeschritten"] },
      { question: "Lasertag für Kinder – ab welchem Alter?", answer: "Die meisten Lasertag-Arenen empfehlen ein Mindestalter von 7-8 Jahren. Ab diesem Alter können Kinder die Regeln verstehen und mit der Ausrüstung umgehen. Für jüngere Kinder sind die Phaser oft zu schwer und die dunkle Arena kann beängstigend sein. Viele Arenen bieten spezielle Kinder-Sessions mit hellerem Licht und einfacheren Spielmodi. Kindergeburtstage sind sehr beliebt – die meisten Arenen haben Partypakete mit Spielen, Pizza und Getränken.", tags: ["Kinder", "Alter"] }
    ]
  },
  {
    name: "Kletterpark",
    icon: "🧗",
    description: "Kletterpark und Kletterhalle – Tipps für sicheres Klettern.",
    color: "bg-emerald-50 border-emerald-200",
    articles: [
      { question: "Was ist ein Kletterpark einfach erklärt?", answer: "Ein Kletterpark (auch Hochseilgarten) ist eine Outdoor-Anlage mit Kletterparcours in Bäumen oder an Masten. Die Parcours bestehen aus Seilbrücken, Balancierbalken, Seilrutschen (Flying Fox) und anderen Hindernissen in verschiedenen Höhen (2-20 Meter). Man ist immer mit einem Sicherungssystem (Klettergurt + Karabiner) gesichert – herunterfallen ist unmöglich. Die Parcours sind nach Schwierigkeitsgrad eingeteilt, von Kinder-Parcours bis zum Extrem-Level.", tags: ["Grundlagen", "Erklärung"] },
      { question: "Tipps für den ersten Besuch im Kletterpark", answer: "Vorbereitung: 1) Sportliche, eng anliegende Kleidung tragen (keine weiten Teile, die sich verfangen). 2) Feste, geschlossene Schuhe (keine Sandalen!). 3) Lange Haare zusammenbinden. 4) Schmuck ablegen. 5) Die Einweisung aufmerksam verfolgen – sie ist Pflicht und erklärt das Sicherungssystem. 6) Mit dem leichtesten Parcours anfangen. 7) Zeit einplanen (2-3 Stunden sind normal). 8) Höhenangst? Kein Problem – man kann jederzeit abbrechen!", tags: ["Tipps", "Erster Besuch"] },
      { question: "Sicherheit im Kletterpark für Kinder und Anfänger", answer: "Moderne Kletterparks nutzen zwei Sicherungssysteme: das klassische System (2 Karabiner, selbst umhängen) und das kontinuierliche System (Karabiner bleibt auf einer Schiene – kann nie abgehängt werden). Das kontinuierliche System ist besonders sicher für Kinder. Altersempfehlung: Ab 6 Jahren mit Begleitperson, ab 10-12 allein (je nach Park). Gewichtsgrenzen beachten (meist 25-120 kg). Helm wird gestellt. Bei Gewitter wird der Park geschlossen.", tags: ["Sicherheit", "Kinder"] },
      { question: "Unterschied zwischen Kletterpark und Kletterhalle", answer: "Kletterpark (Hochseilgarten): Draußen, horizontale Parcours zwischen Bäumen, verschiedene Hindernisse in der Höhe, kein Klettererfahrung nötig. Kletterhalle (Boulderhalle): Drinnen, vertikale Kletterwände, man klettert nach oben, verschiedene Routen nach Schwierigkeit. Bouldern ist Klettern ohne Seil in Absprunghöhe (max. 4-5m) über Weichbodenmatten. Beides fördert Kraft, Koordination und Mut – aber auf ganz unterschiedliche Weise.", tags: ["Unterschied", "Wissen"] },
      { question: "Gesundheitliche Vorteile vom Klettern", answer: "Klettern ist ein Ganzkörpertraining: Es stärkt alle Muskelgruppen, besonders Arme, Schultern, Rücken und Rumpf. Es verbessert Koordination, Beweglichkeit und Gleichgewicht. Klettern fördert Problemlösungsfähigkeit (jede Route ist ein Puzzle). Es baut Stress ab und stärkt das Selbstvertrauen (Höhenangst überwinden). Für Kinder: Es fördert motorische Entwicklung, Konzentration und Mut. Klettern verbrennt 500-900 Kalorien pro Stunde.", tags: ["Gesundheit", "Fitness"] }
    ]
  },
  {
    name: "Escape Room",
    icon: "🔐",
    description: "Escape Rooms verstehen – Tipps, Strategien und Wissenswertes.",
    color: "bg-violet-50 border-violet-200",
    articles: [
      { question: "Was ist ein Escape Room – einfach erklärt", answer: "Ein Escape Room ist ein Gruppenspiel, bei dem 2-6 Spieler in einem thematisch gestalteten Raum eingeschlossen werden. Ziel: Durch das Lösen von Rätseln, Codes und Hinweisen innerhalb von 60 Minuten den Ausgang finden oder eine Mission erfüllen. Die Themen reichen von Gefängnisausbruch über Zombie-Apokalypse bis hin zu Detektivgeschichten. Man ist nie wirklich eingesperrt – es gibt immer einen Notausgang. Ein Spielleiter beobachtet und gibt bei Bedarf Tipps.", tags: ["Grundlagen", "Erklärung"] },
      { question: "Tipps für den ersten Besuch im Escape Room", answer: "1) Team zusammenstellen: 3-5 Spieler sind ideal – zu viele können chaotisch werden. 2) Kommunizieren! Teilt laut mit, was ihr findet. 3) Alles anfassen und untersuchen – Hinweise können überall versteckt sein. 4) Aufgaben aufteilen – nicht alle an einem Rätsel arbeiten. 5) Keine Gewalt – nichts muss aufgebrochen werden. 6) Hinweise nutzen, wenn ihr steckt (das ist kein Versagen!). 7) Spaß haben – der Weg ist das Ziel, nicht nur das Entkommen.", tags: ["Tipps", "Erster Besuch"] },
      { question: "Sicherheitsregeln im Escape Room", answer: "Escape Rooms sind absolut sicher: Der Raum kann jederzeit verlassen werden (Notausgang/Klopfzeichen). Spielleiter überwachen per Kamera und können eingreifen. Keine körperliche Anstrengung nötig. Für Kinder: Die meisten Räume sind ab 12 Jahren empfohlen, manche haben spezielle Kinderräume ab 8 Jahren. Bei Platzangst: Die Räume sind meist größer als erwartet, und man kann jederzeit raus. Personen mit Epilepsie sollten bei Blitzlicht-Räumen vorher nachfragen.", tags: ["Sicherheit", "Regeln"] },
      { question: "Unterschied zwischen Escape Room und Rätselspielen", answer: "Escape Rooms sind physische, immersive Erlebnisse: Man bewegt sich in einem echten Raum, berührt echte Objekte und löst mechanische und elektronische Rätsel im Team. Rätselspiele (Exit-Spiele, Brettspiele) sind Tisch-Adaptionen des Konzepts – sie nutzen Karten, Codes und Rätselhefte. Online-Escape-Games bieten digitale Varianten. Der große Unterschied: Das immersive Erlebnis – die Atmosphäre, der Zeitdruck und das gemeinsame Erlebnis im Raum sind einzigartig.", tags: ["Unterschied", "Wissen"] },
      { question: "Vorteile von Escape Rooms für Teamwork", answer: "Escape Rooms sind hervorragende Teambuilding-Aktivitäten: Sie fördern Kommunikation (man muss Funde teilen), Arbeitsteilung (verschiedene Rätsel gleichzeitig lösen), Problemlösung unter Druck (Zeitlimit), Führungsqualitäten (jemand muss koordinieren) und Kreativität (um die Ecke denken). Deshalb nutzen auch viele Unternehmen Escape Rooms für Firmenevents. Für Familien stärken sie den Zusammenhalt und zeigen, dass jeder etwas beitragen kann.", tags: ["Teamwork", "Vorteile"] }
    ]
  },
  {
    name: "Minigolf",
    icon: "⛳",
    description: "Minigolf-Tipps für besseres Spielen und mehr Spaß.",
    color: "bg-lime-50 border-lime-200",
    articles: [
      { question: "Wie verbessert man seine Zielgenauigkeit beim Minigolf?", answer: "Tipps für präziseres Spielen: 1) Pendeltechnik – den Schläger wie ein Pendel führen, Kraft aus den Schultern, nicht aus den Handgelenken. 2) Linie lesen – vor dem Schlag die Bahn studieren: Neigungen, Kurven, Hindernisse. 3) Kontrollierte Kraft – lieber zu sanft als zu hart schlagen. 4) Feste Standposition – schulterbreiter Stand, Gewicht gleichmäßig verteilt. 5) Am Ball bleiben – nach dem Schlag nicht sofort hochschauen. 6) Übung macht den Meister – die gleiche Bahn mehrfach spielen verbessert das Gefühl.", tags: ["Technik", "Tipps"] },
      { question: "Minigolf-Regeln einfach erklärt für Anfänger", answer: "Die wichtigsten Regeln: Jeder Spieler schlägt pro Bahn abwechselnd. Maximal 6-7 Schläge pro Bahn (je nach Anlage). Hole-in-One = 1 Schlag (Traum jedes Spielers!). Der Ball muss von der Abschlagmarkierung geschlagen werden. Wenn der Ball die Bahn verlässt: Strafschlag und neu auflegen. Der Spieler mit den wenigsten Gesamtschlägen gewinnt. Etikette: Andere Spieler nicht stören, Bahn frei machen nach dem Einlochen, Schläger nicht werfen!", tags: ["Regeln", "Anfänger"] },
      { question: "Strategie und Technik beim Minigolf", answer: "Fortgeschrittene Strategien: 1) Bande nutzen – oft ist der Weg über die Bande kürzer und sicherer als der direkte. 2) Backspin erzeugen – den Ball leicht von oben treffen für mehr Kontrolle. 3) Hindernisse als Führung nutzen – manchmal leitet ein Hindernis den Ball genau ins Loch. 4) Geschwindigkeit anpassen – zu schnell geschlagene Bälle springen über das Loch. 5) Auf Grün-Neigungen achten – der Ball folgt der Schwerkraft. 6) Die letzten Bahnen sind oft die schwierigsten – Konzentration bewahren.", tags: ["Strategie", "Fortgeschritten"] },
      { question: "Minigolf-Events und Turniere für Familien", answer: "Minigolf ist perfekt für Familienausflüge und Gruppenevents: Viele Anlagen bieten Kindergeburtstags-Pakete, Firmenevents und sogar Turniere an. Schwarzlicht-Minigolf ist besonders beliebt – die Bahnen leuchten im UV-Licht, eine ganz besondere Atmosphäre! Manche Anlagen kombinieren Minigolf mit Bistro oder Biergarten. Tipp: An Wochentagen ist es weniger voll und manchmal günstiger. Im Sommer bieten viele Anlagen Abend-Specials.", tags: ["Events", "Familie"] },
      { question: "Minigolf – Ausrüstung und Accessoires", answer: "Für den Freizeitbesuch: Schläger und Bälle werden gestellt, festes Schuhwerk reicht. Für regelmäßige Spieler: Eigene Minigolf-Bälle (ca. 5-15€) haben oft bessere Laufeigenschaften als Leihbälle. Spezielle Minigolf-Schläger (ab ca. 30€) bieten bessere Kontrolle. Kinder benötigen kürzere Schläger – die meisten Anlagen haben Kindergrößen. Sonnenschutz und Getränke nicht vergessen, besonders bei Outdoor-Anlagen!", tags: ["Ausrüstung", "Tipps"] }
    ]
  },
  {
    name: "Trampolinhalle",
    icon: "🤸",
    description: "Trampolinhalle – Sicherheit, Tricks und Fitness-Vorteile.",
    color: "bg-yellow-50 border-yellow-200",
    articles: [
      { question: "Trampolinhalle – Tricks und Techniken für Anfänger", answer: "Grundtechniken: 1) Gerader Sprung – Arme heben, Beine zusammen, Körperspannung. 2) Sitzlandung – kontrolliert auf den Po fallen und wieder hochspringen. 3) Kniesprung – auf die Knie landen (Polsterung!). 4) Bauchlandung – flach auf den Bauch fallen. Wichtig: Immer in der Mitte des Trampolins landen, nicht am Rand. Saltos nur mit Trainer-Anleitung! Die meisten Hallen bieten Anfängerkurse und Freestyle-Sessions. Mit etwas Übung werden auch Drehungen und Kombinationen möglich.", tags: ["Tricks", "Anfänger"] },
      { question: "Vorbereitung auf den Trampolinhallen-Besuch", answer: "Checkliste: Spezielle Stoppersocken (Pflicht – werden oft vor Ort verkauft, ca. 2-3€), bequeme Sportkleidung, Haargummi für lange Haare, Trinkflasche, kleines Handtuch. Vor dem Springen: 5-10 Minuten aufwärmen (Dehnübungen). Nicht mit vollem Magen springen – leichte Mahlzeit 1-2 Stunden vorher ist ideal. Tipp: 60-90 Minuten Session sind optimal – Trampolinspringen ist intensiver als man denkt!", tags: ["Vorbereitung", "Tipps"] },
      { question: "Trampolinhalle – Veranstaltungen und Kurse für Kinder", answer: "Trampolinhallen bieten vielfältige Programme: Kindergeburtstage (Partyraum + Springzeit), Fitness-Kurse (Trampolin-Aerobic), Freestyle-Sessions für Fortgeschrittene, Dodge-Ball auf Trampolinen, Ninja-Parcours und Basketball-Dunk-Bereiche. In den Ferien gibt es oft Camps und Workshops. Manche Hallen haben separate Kleinkindbereiche (unter 6 Jahre) mit kleineren Trampolinen und Schaumstoffgruben.", tags: ["Kurse", "Kinder", "Events"] },
      { question: "Wie fördert Trampolinspringen die Koordination?", answer: "Trampolinspringen ist ein exzellentes Training für Koordination und Gleichgewicht: Der Körper muss ständig seine Position im Raum kontrollieren (propriozeptives Training). Landung und Absprung erfordern Timing und Körperspannung. Drehungen und Tricks schulen die räumliche Wahrnehmung. Für Kinder: Es verbessert die motorische Entwicklung, Reaktionsfähigkeit und das Körpergefühl. Studien zeigen, dass 10 Minuten Trampolinspringen so effektiv sind wie 30 Minuten Joggen.", tags: ["Koordination", "Gesundheit"] },
      { question: "Trampolinhalle – Regeln und Sicherheitstipps für Eltern", answer: "Wichtige Regeln: 1) Nur eine Person pro Trampolin (Unfallrisiko bei Mehrfachbelegung!). 2) Stoppersocken sind Pflicht. 3) Kein Schmuck, Uhren oder Gegenstände in den Taschen. 4) Keine Saltos ohne Anleitung. 5) Bei Ermüdung Pause machen (Verletzungsrisiko steigt). 6) Altersbereiche beachten. 7) Kinder unter 6 in den Kleinkindbereich. Die häufigsten Verletzungen sind Verstauchungen durch falsche Landungen – daher immer in der Mitte des Trampolins landen.", tags: ["Sicherheit", "Regeln", "Eltern"] }
    ]
  },
  {
    name: "Kino",
    icon: "🎬",
    description: "Tipps für den Kinobesuch und Wissenswertes über die Filmwelt.",
    color: "bg-gray-100 border-gray-300",
    articles: [
      { question: "Was ist ein Kino – einfach erklärt", answer: "Ein Kino (auch Lichtspielhaus oder Filmtheater) ist ein Ort, an dem Filme auf einer großen Leinwand gezeigt werden. Moderne Kinos bieten Surround-Sound, 3D-Technik, IMAX-Leinwände und bequeme Sessel. Es gibt Multiplexe (viele Säle, aktuelle Blockbuster), Programmkinos (Independent-Filme, Klassiker) und Open-Air-Kinos (im Sommer draußen). Der Kinobesuch ist ein soziales Erlebnis – gemeinsam lachen, mitfiebern und eintauchen in andere Welten.", tags: ["Grundlagen", "Erklärung"] },
      { question: "Tipps für den ersten Kinobesuch", answer: "Praktische Tipps: 1) Tickets vorab online kaufen – bessere Platzwahl und kein Anstehen. 2) Mittelreihe, leicht hinten – hier ist Bild und Ton optimal. 3) 15 Minuten vor Filmstart da sein (Werbung + Trailer). 4) Handys lautlos stellen und weglegen! 5) Snacks: Popcorn und Getränke gehören dazu, aber leise essen. 6) Für Kinder: Altersfreigabe (FSK) beachten. 7) Toilettenbesuch vor dem Film einplanen. 8) Bei 3D-Filmen: Die 3D-Brille kann auch über einer normalen Brille getragen werden.", tags: ["Tipps", "Erster Besuch"] },
      { question: "Verhaltensregeln im Kino", answer: "Kino-Knigge: 1) Pünktlich sein – wer spät kommt, stört alle. 2) Handy komplett lautlos (nicht nur Vibration). 3) Nicht durch den Film reden – Flüstern reicht. 4) Jacken und Taschen unter den Sitz. 5) Nicht ständig aufstehen. 6) Müll mitnehmen oder ordentlich entsorgen. 7) Bei Kinderfilmen: Kinder vorher erklären, dass es dunkel und laut werden kann. 8) Reservierte Plätze respektieren. Die goldene Regel: Verhalten Sie sich so, wie Sie es sich von anderen wünschen!", tags: ["Regeln", "Etikette"] },
      { question: "Unterschied zwischen Kino, Filmtheater und Open-Air-Kino", answer: "Kino/Multiplex: Großes Gebäude mit mehreren Sälen, aktuelle Filme, modernste Technik (Dolby Atmos, IMAX), Snackbar. Filmtheater/Programmkino: Oft kleinere, charmante Säle, zeigt auch Independent-Filme, Klassiker und Originalversionen. Mehr Atmosphäre und Charakter. Open-Air-Kino: Filmvorführung unter freiem Himmel im Sommer, meist auf einer aufgestellten Leinwand. Besonders beliebt für Romantik-Filme und Klassiker. Picknick-Atmosphäre mit Liegestühlen oder Decken.", tags: ["Unterschied", "Wissen"] },
      { question: "Vorteile eines Kinobesuchs", answer: "Warum Kino besser ist als Streaming: 1) Die große Leinwand und der Raumklang bieten ein immersives Erlebnis, das kein TV ersetzen kann. 2) Gemeinsam lachen, weinen und mitfiebern stärkt soziale Bindungen. 3) Keine Ablenkung – 2 Stunden digitale Auszeit. 4) Neue Filme in bester Qualität erleben. 5) Es ist ein Erlebnis – Popcorn-Duft, das Licht geht aus, der Film beginnt. Für Familien: Kinderfilme gemeinsam im Kino zu erleben schafft bleibende Erinnerungen.", tags: ["Vorteile", "Erlebnis"] }
    ]
  },
  {
    name: "Tennis",
    icon: "🎾",
    description: "Tennis lernen – Technik, Platzarten und Gesundheit.",
    color: "bg-lime-50 border-lime-200",
    articles: [
      { question: "Tennis für Anfänger einfach erklärt", answer: "Tennis wird zwischen zwei (Einzel) oder vier Spielern (Doppel) auf einem rechteckigen Platz mit Netz gespielt. Ziel: Den Ball so über das Netz schlagen, dass der Gegner ihn nicht regelgerecht zurückspielen kann. Punktzählung: 0 (Love), 15, 30, 40, Spiel. 6 Spiele = 1 Satz. 2-3 Sätze zum Matchgewinn. Grundschläge: Vorhand (dominante Hand vorne), Rückhand (Schlag auf der schwachen Seite), Aufschlag (Service), Volley (am Netz). Ein Anfängerkurs vermittelt die Grundlagen in 5-10 Stunden.", tags: ["Anfänger", "Grundlagen"] },
      { question: "Tennis-Technik – Tipps für bessere Schläge", answer: "Schlüssel für gute Schläge: 1) Griffhaltung – Continental-Griff für Aufschlag und Volley, Eastern-Griff für Vorhand. 2) Beinarbeit – die Füße bewegen sich immer, Split-Step vor jedem Schlag. 3) Ausschwung – den Schläger über die Schulter ausschwingen. 4) Topspin erzeugen – von unten nach oben über den Ball wischen. 5) Den Ball im Aufsteigen treffen – gibt mehr Kontrolle. 6) Locker bleiben – ein verkrampfter Arm kostet Kontrolle und Kraft.", tags: ["Technik", "Tipps"] },
      { question: "Unterschied zwischen Tennisplatz-Belägen", answer: "Die vier Hauptbeläge: 1) Sand/Asche (Clay) – langsamer Ball, hoher Absprung, schont Gelenke, in Deutschland am häufigsten. 2) Hartplatz (Hard Court) – schnelles Spiel, gleichmäßiger Absprung, beliebt in den USA und Australien. 3) Rasen (Grass) – sehr schnelles Spiel, niedriger Absprung, Wimbledon-Belag. 4) Teppich/Indoor – künstlicher Belag für Hallenplätze, gleichmäßig und gelenkschonend. Für Anfänger: Sand ist am besten geeignet (verzeiht Fehler, schont Gelenke).", tags: ["Wissen", "Beläge"] },
      { question: "Gesundheitliche Vorteile von Tennis", answer: "Tennis ist ein hervorragender Sport für alle Altersgruppen: Es verbessert Ausdauer, Schnelligkeit und Koordination. Eine Stunde Tennis verbrennt 400-600 Kalorien. Es stärkt Herz-Kreislauf-System, Muskulatur und Knochen. Die ständigen Richtungswechsel trainieren Agilität und Reaktionsfähigkeit. Tennis fördert auch mentale Stärke und Konzentration. Sozial: Man trifft sich regelmäßig mit Partnern – der Sozialfaktor ist ein großer Vorteil. Tennis kann man bis ins hohe Alter spielen.", tags: ["Gesundheit", "Fitness"] },
      { question: "Tennis zuhause trainieren – Übungen ohne Platz", answer: "Auch ohne Tennisplatz kann man an seiner Technik arbeiten: 1) Schattentennis – Schlagbewegungen ohne Ball üben (Vorhand, Rückhand, Aufschlag). 2) Wandtennis – gegen eine Wand spielen (Garage, Sporthalle). 3) Beinarbeit-Drills – Seitwärts-Schritte, Split-Steps, Sprints. 4) Griffkraft trainieren – Tennisball drücken. 5) Koordination – Jonglieren oder Ball-Prellen mit dem Schläger. 6) Fitness – Seilspringen, Planks und Squats sind perfekt für Tennis-Fitness.", tags: ["Training", "Zuhause"] }
    ]
  },
  {
    name: "Padel",
    icon: "🏓",
    description: "Padel – der Trendsport aus Spanien einfach erklärt.",
    color: "bg-teal-50 border-teal-200",
    articles: [
      { question: "Was ist Padel – einfach erklärt", answer: "Padel ist eine Mischung aus Tennis und Squash. Es wird auf einem kleineren Platz (20x10m) mit Glaswänden gespielt, immer im Doppel (2 gegen 2). Der Schläger ist kürzer, ohne Saiten, mit Löchern. Der Ball ähnelt einem Tennisball, springt aber weniger. Das Besondere: Die Wände sind im Spiel! Der Ball darf von den Wänden abprallen und weitergespielt werden. Padel ist der am schnellsten wachsende Sport Europas – leicht zu lernen, schwer zu meistern, und macht sofort Spaß!", tags: ["Grundlagen", "Trendsport"] },
      { question: "Tipps für den Einstieg ins Padel", answer: "1) Schnupperkurs buchen – die Grundlagen lernen geht schnell (1-2 Stunden). 2) Ausrüstung wird meist geliehen (Schläger + Bälle). 3) Sportkleidung und saubere Hallenschuhe reichen. 4) Padel wird immer im Doppel gespielt – einen Partner mitbringen oder vor Ort finden. 5) Wichtigste Technik: Unterschnitt-Schläge und Volleys am Netz. 6) Die Wände nutzen – der Ball kommt zurück! 7) Position am Netz ist dominant – wer am Netz steht, gewinnt den Punkt.", tags: ["Anfänger", "Tipps"] },
      { question: "Sicherheitsregeln beim Padel für Anfänger", answer: "Padel ist ein sehr sicherer Sport. Die Glaswände halten Bälle im Spielfeld. Trotzdem: 1) Aufwärmen vor dem Spiel (5 Minuten Laufen + Dehnen). 2) Augenschutz ist empfehlenswert (schnelle Bälle auf engem Raum). 3) Saubere Indoor-Schuhe mit gutem Profil tragen (Rutschgefahr). 4) Schläger mit Handschlaufe sichern. 5) Abstand zum Partner halten beim Schwingen. 6) Trinkpausen einlegen – Padel ist intensiver als es aussieht.", tags: ["Sicherheit", "Anfänger"] },
      { question: "Unterschied zwischen Padel und Tennis", answer: "Die wichtigsten Unterschiede: Padel hat einen kleineren Platz mit Wänden, Tennis einen offenen großen Platz. Padel-Schläger sind kürzer und ohne Saiten, Tennisschläger sind länger mit Saiten. Padel wird immer im Doppel gespielt, Tennis auch als Einzel. Beim Padel sind die Wände im Spiel, beim Tennis nicht. Padel-Aufschlag: Unterhand, Tennis: Überhand. Padel ist leichter zu lernen und weniger kraftintensiv – perfekt für Einsteiger.", tags: ["Unterschied", "Tennis"] },
      { question: "Gesundheitliche Vorteile von Padel", answer: "Padel bietet zahlreiche Fitness-Vorteile: 400-600 Kalorien pro Stunde verbrennen. Es trainiert Ausdauer, Schnelligkeit und Reaktionsfähigkeit. Die kurzen Sprints und Richtungswechsel verbessern die Agilität. Weniger Gelenkbelastung als Tennis (kleinerer Platz, leichterer Schläger). Der Doppel-Aspekt fördert Teamwork und soziale Kontakte. Padel ist für alle Altersgruppen geeignet – von 8 bis 80 Jahren.", tags: ["Gesundheit", "Fitness"] }
    ]
  },
  {
    name: "Kartbahn",
    icon: "🏎️",
    description: "Kartfahren – Tipps, Sicherheit und Spaß für alle.",
    color: "bg-red-50 border-red-200",
    articles: [
      { question: "Was ist eine Kartbahn einfach erklärt", answer: "Eine Kartbahn ist eine spezielle Rennstrecke für Go-Karts – kleine, offene Rennwagen mit Motor. Indoor-Kartbahnen sind ganzjährig nutzbar, Outdoor-Bahnen bieten oft längere Strecken. Karts erreichen je nach Typ 30-80 km/h. Es gibt Kinder-Karts (ab 8 Jahren, ca. 30 km/h), Erwachsenen-Karts (bis 60 km/h) und Renn-Karts für Profis. Eine Session dauert meist 10-15 Minuten. Helme werden gestellt, Rennoveralls je nach Anlage.", tags: ["Grundlagen", "Erklärung"] },
      { question: "Tipps für den ersten Besuch auf der Kartbahn", answer: "1) Bequeme, geschlossene Schuhe tragen (flache Sohle ist ideal). 2) Lange Haare zusammenbinden (Helmhygiene). 3) Die Einweisung aufmerksam verfolgen – Fahnen-Signale und Überholregeln lernen. 4) Erste Runde langsam fahren (Strecke kennenlernen). 5) Ideallinie finden: Außen anbremsen, innen den Scheitel nehmen, außen herausbeschleunigen. 6) Sanft lenken – ruckartige Bewegungen kosten Speed. 7) Gas geben lernen: Gleichmäßig beschleunigen, nicht ruckartig.", tags: ["Tipps", "Erster Besuch"] },
      { question: "Sicherheit auf der Kartbahn für Anfänger und Kinder", answer: "Kartbahnen haben strenge Sicherheitsstandards: Helm ist Pflicht (wird gestellt), Leitplanken schützen, Streckenposten beobachten. Wichtig: 1) Sicherheitseinweisung ernst nehmen. 2) Flaggensignale beachten (Gelb = Vorsicht, Rot = Stopp). 3) Nicht absichtlich rammen. 4) Bei Dreher/Unfall: Im Kart sitzen bleiben, Hand heben. 5) Mindestgröße und -alter beachten (meist ab 8 Jahren, 1,30m). 6) Kinder fahren auf separaten Bahnen oder mit gedrosselten Karts.", tags: ["Sicherheit", "Kinder"] },
      { question: "Unterschied zwischen Outdoor und Indoor Kartbahn", answer: "Indoor-Kartbahnen: Elektrische Karts (leise, abgasfrei), kürzere Strecken, wetterunabhängig, oft mit Beleuchtung und Musik. Outdoor-Kartbahnen: Oft Benzin-Karts (lauter, schneller), längere Strecken, realistischeres Fahrgefühl, wetterabhängig. Preislich sind Indoor-Bahnen oft etwas teurer. Für Anfänger und Kinder sind Indoor-Bahnen mit E-Karts ideal – leiser, einfacher zu steuern und es riecht nicht nach Abgasen.", tags: ["Unterschied", "Wissen"] },
      { question: "Fahrtechnik auf der Kartbahn verbessern", answer: "Für schnellere Rundenzeiten: 1) Bremspunkt finden – so spät wie möglich, aber kontrolliert bremsen. 2) Ideallinie fahren – außen-innen-außen durch jede Kurve. 3) Blick voraus richten – immer den nächsten Kurveneingang anschauen. 4) Sanftes Lenken – je weniger Lenkbewegung, desto schneller. 5) Gas stehen lassen auf Geraden – maximale Geschwindigkeit nutzen. 6) Kurven verbinden – eine Kurve für die nächste vorbereiten. 7) Konstanz schlägt Einzelrunden – gleichmäßig schnelle Runden fahren.", tags: ["Technik", "Fortgeschritten"] }
    ]
  },
  {
    name: "Axtwerfen",
    icon: "🪓",
    description: "Axtwerfen – der Trend-Sport für Nervenkitzel und Präzision.",
    color: "bg-stone-100 border-stone-300",
    articles: [
      { question: "Wie trainiert man richtig für Axtwerfen?", answer: "Die richtige Technik: 1) Beidhändiger Griff am Ende des Stiels. 2) Axt über den Kopf heben, Arme gestreckt. 3) In einer flüssigen Bewegung nach vorne werfen – die Axt löst auf Augenhöhe. 4) Abstand zum Ziel: ca. 3-4 Meter (eine Umdrehung der Axt). 5) Nicht zu viel Kraft – Kontrolle ist wichtiger. 6) Gleichmäßige Bewegung ohne Rucken. Üben Sie zunächst ohne Ziel, nur um das Steckgefühl zu bekommen. Dann langsam Genauigkeit aufbauen.", tags: ["Technik", "Training"] },
      { question: "Axtwerfen – Ausrüstung für Anfänger", answer: "In Axtwerf-Arenen wird alles gestellt: Äxte, Zielscheiben und Sicherheitsausrüstung. Sie brauchen nur: Geschlossene Schuhe, bequeme Kleidung (Bewegungsfreiheit für die Arme), und gute Laune. Für zu Hause: Einsteiger-Wurfäxte kosten ab 20€ (leichter, ca. 800g). Profis werfen mit 1-1,5 kg Äxten. Wichtig: Nur auf offizielle Zielscheiben aus Weichholz (Pappel, Linde) werfen, nie auf Bäume!", tags: ["Ausrüstung", "Anfänger"] },
      { question: "Sicherheit beim Axtwerfen – worauf achten?", answer: "Axtwerfen ist bei Einhaltung der Regeln sehr sicher: 1) Nur werfen, wenn niemand im Wurfbereich steht. 2) Äxte nie mit der Schneide zu sich halten. 3) Sicherheitseinweisung ist Pflicht. 4) Alkoholgrenze beachten (die meisten Arenen: max. 2 Bier). 5) Geschlossene Schuhe tragen. 6) Nur die bereitgestellten Äxte verwenden. 7) Axt erst herausholen, wenn alle fertig geworfen haben. 8) Professionelle Arenen haben geschützte Wurfbahnen mit Sicherheitszonen.", tags: ["Sicherheit", "Regeln"] },
      { question: "Axtwerfen – Wettbewerbe und Regeln erklärt", answer: "Wettbewerbsregeln: Die Zielscheibe hat Ringe mit verschiedenen Punktwerten (Bullseye in der Mitte = höchste Punkte). Eine Runde besteht aus 5 Würfen pro Spieler. Der Clutch-Wurf (in die oberen Ecken) gibt Bonuspunkte. Es gibt Einzel- und Team-Wettbewerbe. Turnier-Format: Gruppenphase, dann K.O.-Runde. In Deutschland gibt es die WATL (World Axe Throwing League) mit offiziellen Regeln. Viele Arenen bieten Liga-Abende für regelmäßige Spieler.", tags: ["Wettbewerb", "Regeln"] },
      { question: "Zielgenauigkeit beim Axtwerfen verbessern", answer: "Präzisions-Training: 1) Immer vom gleichen Punkt werfen (Abstand markieren). 2) Konstanter Griff – jedes Mal gleich fassen. 3) Fluid Motion – die Wurfbewegung als eine durchgehende Bewegung ausführen. 4) Follow-through – den Arm in Richtung Ziel weiterbewegen. 5) Rotation kontrollieren – die Axt sollte genau eine Umdrehung machen. Wenn sie zu hoch steckt: Ein Schritt zurück. Zu tief: Ein Schritt vor. 6) Mentaler Fokus – auf das Ziel konzentrieren, nicht auf die Axt.", tags: ["Technik", "Präzision"] }
    ]
  },
  {
    name: "Reiten",
    icon: "🐴",
    description: "Reiten lernen – Einstieg, Sicherheit und Pferdeliebe.",
    color: "bg-amber-50 border-amber-200",
    articles: [
      { question: "Reiten für Anfänger einfach erklärt", answer: "Reiten bedeutet, auf dem Rücken eines Pferdes zu sitzen und es durch Hilfen (Beine, Hände, Gewicht, Stimme) zu lenken. Die drei Grundgangarten: Schritt (langsam, 4-Takt), Trab (mittelschnell, 2-Takt, hüpfend) und Galopp (schnell, 3-Takt). Anfänger beginnen an der Longe – das Pferd wird am Seil geführt, während der Reiter Balance und Sitz lernt. Ein Reitkurs umfasst typischerweise 10 Stunden. Kinder können ab 4-5 Jahren mit Ponyreiten beginnen.", tags: ["Anfänger", "Grundlagen"] },
      { question: "Sicherheitstipps beim Reiten für Kinder und Erwachsene", answer: "1) Reithelm ist absolute Pflicht (auch bei kurzem Ausritt). 2) Stiefel oder Schuhe mit Absatz tragen (verhindert Durchrutschen im Steigbügel). 3) Keine weite Kleidung (kann sich verfangen). 4) Sicherheitsweste für Anfänger und Kinder empfohlen. 5) Nie hinter ein Pferd stellen (Tritt-Gefahr). 6) Ruhig und selbstsicher auftreten (Pferde spüren Angst). 7) Erste Stunden nur unter Anleitung. 8) Richtig fallen lernen: Abrollen, nicht auf die Hände fallen.", tags: ["Sicherheit", "Kinder"] },
      { question: "Unterschied zwischen Reitarten: Dressur und Springreiten", answer: "Dressur: Die Kunst, das Pferd durch feine Hilfen zu gymnastizieren und harmonische Bewegungsabläufe zu zeigen. Wie Tanzen auf dem Pferd – Eleganz und Präzision stehen im Vordergrund. Springreiten: Reiter und Pferd überwinden einen Parcours aus Hindernissen (Sprünge) auf Zeit und ohne Fehler. Erfordert Mut und Timing. Weitere Reitarten: Westernreiten (entspannter, lockerer Stil), Vielseitigkeit (Dressur + Springen + Geländeritt), Voltigieren (Turnen auf dem Pferd).", tags: ["Reitarten", "Unterschied"] },
      { question: "Wie pflegt man Pferde richtig?", answer: "Grundpflege vor dem Reiten: 1) Putzen – mit Striegel kreisend groben Schmutz lösen, dann mit Kardätsche glätten. 2) Hufe auskratzen – Steine und Dreck entfernen. 3) Mähne und Schweif entwirren. Nach dem Reiten: Sattelstelle trockenreiben, verschwitzte Stellen abwaschen, Hufe kontrollieren. Fütterung: Heu ist die Grundlage, dazu Kraftfutter (Hafer, Müsli). Frisches Wasser muss immer verfügbar sein. Regelmäßig: Hufschmied (alle 6-8 Wochen), Zahnarzt, Impfungen.", tags: ["Pflege", "Pferde"] },
      { question: "Gesundheitliche Vorteile vom Reiten", answer: "Reiten trainiert den ganzen Körper: Rumpfmuskulatur und Balance werden ständig beansprucht. Es verbessert die Haltung (aufrechter Sitz), fördert Koordination und Reaktionsfähigkeit. Die Bewegung des Pferdes stimuliert die Tiefenmuskulatur. Psychische Vorteile: Der Umgang mit Pferden senkt Stress, fördert Empathie und Selbstvertrauen. Für Kinder: Reiten fördert Verantwortungsgefühl (Pferd versorgen), soziale Kompetenz und Naturverbundenheit. Therapeutisches Reiten wird auch in der Rehabilitation eingesetzt.", tags: ["Gesundheit", "Therapie"] }
    ]
  },
  {
    name: "Töpfern",
    icon: "🏺",
    description: "Töpfern lernen – Kreativität und Entspannung mit Ton.",
    color: "bg-orange-50 border-orange-200",
    articles: [
      { question: "Was ist Töpfern – einfach erklärt", answer: "Töpfern ist die Kunst, aus Ton Gefäße, Schalen, Figuren und andere Objekte zu formen. Die zwei Haupttechniken: 1) Handarbeit – Ton mit den Händen formen (Platten-, Wulst- oder Daumentechnik). 2) Drehscheibe – Ton auf einer rotierenden Scheibe formen (die klassische Technik). Nach dem Formen wird das Stück getrocknet und dann bei 900-1300°C im Ofen (Brennofen) gebrannt. Danach kann es glasiert (mit einer farbigen Glasur überzogen) und nochmals gebrannt werden.", tags: ["Grundlagen", "Erklärung"] },
      { question: "Tipps für den Einstieg ins Töpfern", answer: "1) Schnupperkurs buchen – viele Keramikstudios bieten 2-3 Stunden Workshops an. 2) Alles wird gestellt (Ton, Werkzeuge, Brennofen, Glasuren). 3) Alte Kleidung oder Schürze tragen – Ton fleckt. 4) Geduld mitbringen – die Drehscheibe braucht Übung. 5) Mit einfachen Formen anfangen (Schale, Tasse). 6) Ton feucht halten während der Arbeit. 7) Das fertige Stück muss trocknen + zweimal gebrannt werden – Abholung oft nach 2-3 Wochen.", tags: ["Anfänger", "Tipps"] },
      { question: "Hygiene und Sicherheit beim Töpfern", answer: "Grundregeln: 1) Hände nach dem Töpfern gründlich waschen (Tonstaub nicht einatmen). 2) Bei der Glasurarbeit: Handschuhe tragen und Glasuren nicht verschlucken. 3) Brennofen nur unter Aufsicht betreiben. 4) Scharfe Werkzeuge sicher aufbewahren. 5) Arbeitsplatz feucht wischen (Tonstaub binden). 6) Kinder ab 5 Jahren können unter Aufsicht töpfern. 7) Allergiker: Ton ist in der Regel gut verträglich, bei Empfindlichkeit Handschuhe nutzen.", tags: ["Sicherheit", "Hygiene"] },
      { question: "Unterschied zwischen Töpfern, Keramik und Modellieren", answer: "Töpfern: Speziell das Formen von Ton auf der Drehscheibe oder von Hand – fokus auf Gefäße. Keramik: Der Oberbegriff für alle aus Ton gebrannten Produkte (Geschirr, Fliesen, Skulpturen). Modellieren: Formen von beliebigen Materialien (Ton, Wachs, Plastilin) zu Figuren oder Objekten – muss nicht gebrannt werden. Steingut wird bei niedrigerer Temperatur gebrannt (porös), Steinzeug bei hoher Temperatur (wasserdicht), Porzellan bei sehr hoher Temperatur (fein, transluzent).", tags: ["Unterschied", "Wissen"] },
      { question: "Vorteile von Töpfern für Kreativität und Entspannung", answer: "Töpfern ist ein kreatives Ausgleichsprogramm: Die Konzentration auf den Ton hat einen meditativen Effekt und reduziert Stress. Es fördert Feinmotorik und räumliches Denken. Das Arbeiten mit den Händen aktiviert beide Gehirnhälften. Für Kinder: Es fördert Geduld, Kreativität und sensorische Wahrnehmung. Man erschafft etwas Greifbares – das fertige Stück ist ein Erfolgserlebnis. Töpfern ist auch therapeutisch wertvoll und wird in der Ergotherapie eingesetzt.", tags: ["Kreativität", "Entspannung", "Therapie"] }
    ]
  },
  {
    name: "Kinderbauernhof",
    icon: "🐑",
    description: "Kinderbauernhof – tierische Erlebnisse und Lernorte für Familien.",
    color: "bg-green-50 border-green-200",
    articles: [
      { question: "Kinderbauernhof – Aktivitäten und Tipps für Familien", answer: "Auf einem Kinderbauernhof können Kinder Tiere füttern, streicheln und pflegen. Typische Tiere: Ziegen, Schafe, Kaninchen, Hühner, Ponys und Esel. Viele Höfe bieten zusätzlich Ponyreiten, Traktor fahren, Heupressenbesichtigung und saisonale Aktivitäten wie Kartoffelernte oder Apfelsaft pressen. Packtipps: Feste Schuhe, wetterfeste Kleidung und Wechselkleidung für die Kleinen. Die meisten Kinderbauernhöfe haben Picknickbereiche und kleine Cafés.", tags: ["Aktivitäten", "Familie"] },
      { question: "Wie lernen Kinder auf einem Kinderbauernhof über Tiere?", answer: "Kinderbauernhöfe sind lebendige Lernorte: Kinder erfahren, wo Milch, Eier und Wolle herkommen. Sie lernen Verantwortung, indem sie Tiere füttern und pflegen. Der direkte Kontakt zu Tieren fördert Empathie und respektvollen Umgang mit Lebewesen. Viele Höfe bieten pädagogische Programme: Bauernhofführungen, Melkkurse und Tierpflege-Workshops. Besonders für Stadtkinder ist das ein unverzichtbares Erlebnis.", tags: ["Lernen", "Kinder", "Tiere"] },
      { question: "Sicherheit auf dem Kinderbauernhof für kleine Kinder", answer: "Wichtige Sicherheitsregeln: 1) Kinder nie allein mit großen Tieren (Ponys, Esel) lassen. 2) Tiere nicht von hinten erschrecken. 3) Nach dem Tierkontakt gründlich Hände waschen (Hygiene). 4) Festes Schuhwerk tragen (Huftritt-Gefahr). 5) Nur das bereitgestellte Futter verwenden. 6) Zäune und Absperrungen respektieren. 7) Kleinere Kinder (unter 3) immer an der Hand. Die meisten Höfe haben separate Streichelgehege mit besonders kinderfreundlichen Tieren.", tags: ["Sicherheit", "Kinder"] },
      { question: "Ferienangebote und Workshops auf Kinderbauernhöfen", answer: "In den Ferien bieten viele Kinderbauernhöfe spezielle Programme: Bauernhof-Camps (ganze Woche, 9-15 Uhr), Tierpflege-Praktika für ältere Kinder, Reitunterricht, Kreativ-Workshops (Filzen, Kerzengießen), Naturpädagogik und Ernte-Aktionen. Kindergeburtstage auf dem Bauernhof sind sehr beliebt – mit Schatzsuche, Ponyreiten und Lagerfeuer. In NRW gibt es zahlreiche Kinderbauernhöfe, viele mit ganzjährigem Programm.", tags: ["Ferien", "Workshops"] },
      { question: "Wie fördert ein Kinderbauernhof die Entwicklung von Kindern?", answer: "Der Kinderbauernhof fördert zahlreiche Entwicklungsbereiche: Motorik (Klettern, Reiten, Arbeiten mit Werkzeug), Naturverständnis (Kreisläufe der Natur begreifen), Sozialkompetenz (Zusammenarbeit, Rücksichtnahme), Verantwortung (für ein Lebewesen sorgen), Sensorik (verschiedene Texturen, Gerüche, Geräusche erleben). Studien zeigen, dass regelmäßiger Tierkontakt das Immunsystem stärkt und Allergien vorbeugen kann. Ein Bauernhofbesuch ist immer ein ganzheitliches Erlebnis.", tags: ["Entwicklung", "Förderung"] }
    ]
  },
  {
    name: "Kultur & Theater",
    icon: "🎭",
    description: "Theater, Kultur und Events – Tipps für unvergessliche Erlebnisse.",
    color: "bg-rose-50 border-rose-200",
    articles: [
      { question: "Theaterbesuch – Tipps für ein unvergessliches Erlebnis", answer: "So wird der Theaterbesuch perfekt: 1) Vorab über das Stück informieren (Handlung, Dauer, Pausen). 2) Dresscode beachten – bei Premieren etwas eleganter, bei Matineen leger. 3) Pünktlich erscheinen (Einlass oft 30 Minuten vor Beginn). 4) Handys komplett ausschalten. 5) Während der Vorstellung nicht reden oder rascheln. 6) Pause für Getränke nutzen. 7) Klatschen erst am Ende einer Szene oder des Akts. Für Kinder: Viele Theater bieten spezielle Familienstücke und Kindertheater.", tags: ["Tipps", "Theaterbesuch"] },
      { question: "Theaterpädagogik für Kinder und Jugendliche", answer: "Theaterpädagogik ist mehr als Schauspiel: Kinder lernen sich auszudrücken, Emotionen zu verstehen und Selbstbewusstsein aufzubauen. Typische Angebote: Theater-AGs in Schulen, Jugendtheater-Gruppen, Ferienwerkstätten und Improvisationstheater. Kinder üben Sprache, Körperausdruck und Teamwork. Viele Stadttheater bieten Workshops und Mitmach-Programme an. Theaterpädagogik wird auch therapeutisch eingesetzt – bei Schüchternheit, Sprachentwicklung und sozialen Kompetenzen.", tags: ["Kinder", "Bildung"] },
      { question: "Unterschiedliche Theaterformen und ihre Besonderheiten", answer: "Die wichtigsten Theaterformen: Schauspiel (gesprochenes Theater, Dramen und Komödien), Musiktheater/Oper (gesungene Handlung mit Orchester), Musical (Kombination aus Schauspiel, Gesang und Tanz), Ballett (Tanztheater ohne Worte), Puppentheater/Figurentheater (für Kinder und Erwachsene), Improvisationstheater (spontan, ohne festes Skript), Freilichttheater (Open-Air im Sommer). Jede Form hat ihren eigenen Reiz und spricht unterschiedliche Sinne an.", tags: ["Theaterformen", "Wissen"] },
      { question: "Was passiert hinter den Kulissen eines Theaters?", answer: "Ein Theaterbetrieb ist wie ein kleines Unternehmen: Der Regisseur leitet die künstlerische Umsetzung, der Dramaturg wählt Stücke aus und bearbeitet Texte. Bühnenbildner gestalten das Bühnenbild, Kostümbildner die Garderobe. Maskenbildner verwandeln Schauspieler mit Make-up und Perücken. Techniker bedienen Licht, Ton und Bühnenmaschinerie. Requisiteure sorgen für alle Gegenstände auf der Bühne. Eine typische Produktion braucht 6-8 Wochen Probenzeit.", tags: ["Hintergrund", "Wissen"] },
      { question: "Wie bereitet man sich auf eine Theateraufführung vor?", answer: "Vor dem Theaterbesuch: 1) Stück lesen oder Zusammenfassung ansehen – so versteht man die Handlung besser. 2) Bei Opern: Libretto (Text) vorher lesen, da oft in Originalsprache gesungen wird. 3) Bequeme, aber angemessene Kleidung wählen. 4) Tickets rechtzeitig buchen – gute Plätze im Parkett oder 1. Rang bieten die beste Sicht. 5) Restaurantbesuch vorher einplanen – nach der Vorstellung sind viele Lokale geschlossen. 6) Programmheft kaufen für Hintergrundinformationen.", tags: ["Vorbereitung", "Tipps"] }
    ]
  },
  {
    name: "Squash",
    icon: "🏸",
    description: "Squash – der intensive Racketsport für Fitness und Spaß.",
    color: "bg-blue-50 border-blue-200",
    articles: [
      { question: "Was ist Squash – einfach erklärt", answer: "Squash ist ein schneller Racketsport, der von zwei Spielern in einem geschlossenen Court (ca. 10x6m) gespielt wird. Der Ball wird gegen die Vorderwand geschlagen und darf nur einmal auf dem Boden aufkommen. Im Gegensatz zu Tennis stehen beide Spieler auf der gleichen Seite und wechseln sich ab. Ein Spiel geht über 3-5 Sätze bis 11 Punkte. Squash gilt als einer der gesündesten Sportarten – intensiv, schnell und ein exzellentes Ganzkörpertraining.", tags: ["Grundlagen", "Erklärung"] },
      { question: "Tipps für den Einstieg ins Squash", answer: "1) Schnupperstunde buchen – die Grundlagen lernt man in 1-2 Stunden. 2) Squash-Schläger und Bälle werden oft verliehen. 3) Sportkleidung und Hallenschuhe mit heller Sohle (Pflicht!). 4) Schutzbrille wird empfohlen (besonders für Anfänger). 5) Aufwärmen ist Pflicht – Squash ist sehr intensiv. 6) Bälle sind farbcodiert: Blauer Punkt = Anfänger (springt mehr), Doppelgelber Punkt = Profi (springt kaum). 7) Court-Etikette: Let-Bälle rufen, wenn der Gegner im Weg steht.", tags: ["Anfänger", "Tipps"] },
      { question: "Sicherheitsregeln beim Squash", answer: "Squash auf engem Raum erfordert besondere Vorsicht: 1) Schutzbrille tragen – Augenverletzungen sind die häufigste Gefahr. 2) Immer wissen, wo der Gegner steht, bevor man schlägt. 3) Let-Ball rufen, wenn man den Gegner treffen könnte. 4) Den Schläger kontrolliert schwingen – keine wilden Aushol-Bewegungen. 5) Gründlich aufwärmen (Sprunggelenke, Knie). 6) Genug trinken – man verliert enorm viel Flüssigkeit. 7) Bei Herz-Kreislauf-Problemen vorher ärztlich beraten lassen.", tags: ["Sicherheit", "Regeln"] },
      { question: "Unterschied zwischen Squash und Racquetball", answer: "Squash und Racquetball sehen ähnlich aus, unterscheiden sich aber: Der Squash-Court ist enger, der Ball kleiner und weniger springfreudig. Beim Squash muss der Ball die Vorderwand treffen, beim Racquetball sind alle Wände (auch Decke) im Spiel. Squash ist taktischer und erfordert mehr Laufarbeit, Racquetball ist schneller und kraftbetonter. In Deutschland ist Squash deutlich verbreiteter, Racquetball ist eher in den USA populär.", tags: ["Unterschied", "Wissen"] },
      { question: "Gesundheitliche Vorteile von Squash", answer: "Squash wurde von Forbes als gesündester Sport der Welt eingestuft: 700-1000 Kalorien pro Stunde werden verbrannt. Es trainiert Ausdauer, Kraft, Schnelligkeit, Koordination und Flexibilität – alles in einer Einheit. Die ständigen Richtungswechsel und Sprints verbessern die Agilität enorm. Squash fördert auch die mentale Fitness durch strategisches Denken unter Zeitdruck. Für alle Altersgruppen geeignet – die Intensität lässt sich über die Ballwahl anpassen.", tags: ["Gesundheit", "Fitness"] }
    ]
  },
  {
    name: "Gaming Center",
    icon: "🎮",
    description: "Gaming Center – moderne Spielwelten für alle Altersgruppen.",
    color: "bg-slate-100 border-slate-300",
    articles: [
      { question: "Was ist ein Gaming Center – einfach erklärt", answer: "Ein Gaming Center ist ein Ort, an dem man gegen Eintritt an High-End-Gaming-PCs, Konsolen oder VR-Stationen spielen kann. Moderne Gaming Center bieten: Multiplayer-Stationen, eSports-Arenen, VR-Erlebnisse, Retro-Gaming-Ecken und Racing-Simulatoren. Man spielt auf professioneller Hardware, die zu Hause oft zu teuer wäre. Die Atmosphäre ist sozial – man spielt mit und gegen andere Gamer vor Ort. Viele Center haben auch ein Bistro oder eine Lounge.", tags: ["Grundlagen", "Erklärung"] },
      { question: "Tipps für den ersten Besuch im Gaming Center", answer: "1) Vorab informieren: Welche Spiele und Plattformen werden angeboten? 2) Eigenes Headset mitbringen (hygienischer). 3) In Gruppen gehen macht mehr Spaß – viele Spiele sind Multiplayer. 4) Zeitlimit setzen – Gaming fesselt und die Zeit verfliegt. 5) Snacks und Getränke sind meist vor Ort erhältlich. 6) Eigene Gaming-Maus/Tastatur darf oft mitgebracht werden. 7) Verschiedene Genres ausprobieren – VR-Erlebnisse sind besonders beeindruckend für Erstbesucher.", tags: ["Tipps", "Erster Besuch"] },
      { question: "Alters- und Sicherheitsregeln im Gaming Center", answer: "Die meisten Gaming Center haben klare Regeln: Altersfreigabe der Spiele wird kontrolliert (USK-Einstufung). Kinder unter 12 oft nur mit Begleitperson. Jugendschutzgesetz wird beachtet (Aufenthaltsdauer, Uhrzeiten). VR-Erlebnisse haben oft ein Mindestalter von 8-12 Jahren (Schwindel, Übelkeit möglich). Tipps für Eltern: Vorher über das Angebot informieren, altersgerechte Spiele auswählen, Bildschirmpausen einplanen. Viele Center bieten spezielle Kinder-Sessions.", tags: ["Sicherheit", "Jugendschutz"] },
      { question: "Unterschied zwischen Gaming Center und VR-Arcade", answer: "Gaming Center: Breites Angebot an PC-, Konsolen- und Arcade-Spielen. Fokus auf klassisches Gaming und eSports. Längere Sessions (1-4 Stunden). VR-Arcade: Spezialisiert auf Virtual-Reality-Erlebnisse mit hochwertigen VR-Headsets und Tracking-Systemen. Erlebnisse dauern 15-30 Minuten pro Session. VR bietet immersive Welten (Achterbahn, Weltraum, Horror) – physische Bewegung gehört dazu. Manche Gaming Center kombinieren beides unter einem Dach.", tags: ["Unterschied", "VR"] },
      { question: "Vorteile eines Gaming Centers für Spielspaß und soziale Kontakte", answer: "Gaming Center bieten mehr als nur Spiele: 1) Soziales Erlebnis – gemeinsam spielen statt allein zu Hause. 2) Professionelle Hardware nutzen, die man sich nicht leisten müsste. 3) Neue Spiele und Genres ausprobieren vor dem Kauf. 4) eSports-Turniere und Events mit der Gaming-Community. 5) LAN-Party-Feeling mit Freunden. 6) Für Kindergeburtstage ein idealer Ort. 7) Gaming fördert Reaktionszeit, strategisches Denken und Teamwork. Viele Center veranstalten regelmäßige Community-Events.", tags: ["Vorteile", "Sozial"] }
    ]
  },
  {
    name: "Soccer / Fußball",
    icon: "⚽",
    description: "Soccer und Fußball – der beliebteste Sport für alle Altersgruppen.",
    color: "bg-green-50 border-green-200",
    articles: [
      { question: "Was ist Soccer – einfach erklärt", answer: "Soccer (oder Hallenfußball/Indoor-Fußball) bezeichnet das Fußballspielen in einer Halle oder auf einem Kleinfeld. Im Gegensatz zum klassischen Fußball auf dem Großfeld (11 gegen 11) spielt man Soccer meist 5 gegen 5 auf einem kleineren Platz mit Banden. Das Spiel ist schneller, technischer und es fallen mehr Tore. In Deutschland gibt es zahlreiche Soccer-Hallen, die stundenweise gemietet werden können – ideal für Freizeitteams, Firmensport und Kindergeburtstage.", tags: ["Grundlagen", "Erklärung"] },
      { question: "Tipps für den Einstieg ins Soccer-Spiel", answer: "1) Hallenschuhe mit heller Sohle sind Pflicht (keine Stollen!). 2) Sportkleidung und Schienbeinschoner empfohlen. 3) Teams vorher zusammenstellen (meist 5-8 Spieler pro Team). 4) Aufwärmen nicht vergessen – kurze Sprints und Dehnübungen. 5) Banden nutzen – der Ball prallt zurück und kann weitergespielt werden. 6) Kurze Pässe bevorzugen – der kleine Platz belohnt Technik, nicht weite Schüsse. 7) Torhüter braucht ein Knie-Polster (Hallenboden ist hart).", tags: ["Anfänger", "Tipps"] },
      { question: "Sicherheitsregeln beim Soccer", answer: "Wichtige Regeln: 1) Schienbeinschoner tragen. 2) Keine Grätsche im Hallenfußball (Verletzungsgefahr auf hartem Boden). 3) Faire Zweikämpfe – kein überharter Körpereinsatz. 4) Hallenschuhe mit gutem Profil (Rutschgefahr). 5) Aufwärmen vor dem Spiel. 6) Ausreichend trinken (Halle wird warm). 7) Bei Verletzungen sofort pausieren. 8) Brillenträger: Sportbrille oder Kontaktlinsen empfohlen. Die Banden sind gepolstert, trotzdem vorsichtig bei Wandkontakt.", tags: ["Sicherheit", "Regeln"] },
      { question: "Unterschied zwischen Soccer und klassischem Fußball", answer: "Hauptunterschiede: Spieleranzahl (Soccer: 5 vs. Fußball: 11), Spielfeldgröße (Soccer: ~40x20m vs. Fußball: ~100x65m), Banden statt Seitenaus, kürzere Spielzeit (2x 15-20 Min), kein Abseits, Einrollen statt Einwurf. Soccer ist technischer und schneller, da weniger Platz zum Ausweichen besteht. Fußball ist taktischer mit mehr Laufarbeit. Beide Varianten trainieren Koordination, Ausdauer und Teamplay.", tags: ["Unterschied", "Fußball"] },
      { question: "Gesundheitliche Vorteile von Soccer", answer: "Soccer ist ein exzellentes Ganzkörpertraining: 500-700 Kalorien pro Stunde, Training von Ausdauer, Schnelligkeit, Koordination und Reaktionsfähigkeit. Die konstante Bewegung auf dem kleinen Feld ist intensiver als normaler Fußball. Dazu kommt der Teamaspekt: Zusammenspiel fördert soziale Kompetenz und Kommunikation. Soccer kann das ganze Jahr indoor gespielt werden – kein Ausfall wegen Wetter. Geeignet für alle Fitnesslevel, da man die Intensität selbst bestimmt.", tags: ["Gesundheit", "Fitness"] }
    ]
  },
  {
    name: "Billiard",
    icon: "🎱",
    description: "Billiard spielen – Technik, Regeln und Strategietipps.",
    color: "bg-emerald-50 border-emerald-200",
    articles: [
      { question: "Was ist Billiard – einfach erklärt", answer: "Billiard ist ein Präzisionssport, bei dem Kugeln mit einem Queue (Spielstock) auf einem mit Tuch bespannten Tisch gestoßen werden. Ziel ist es, die farbigen Kugeln nach bestimmten Regeln in die Taschen (Löcher am Tischrand) zu versenken. Die drei Hauptvarianten: Pool (am verbreitetsten, 16 Kugeln auf kleinerem Tisch), Snooker (22 Kugeln, großer Tisch, sehr taktisch) und Karambolage (ohne Taschen, Kugeln müssen sich gegenseitig berühren).", tags: ["Grundlagen", "Erklärung"] },
      { question: "Tipps für den Einstieg ins Billiard", answer: "Anfänger-Tipps: 1) Richtige Queuehaltung: Hintere Hand locker am Griffende, vordere Hand bildet eine Brücke auf dem Tisch. 2) Tiefes Beugen: Kinn fast auf Queue-Höhe für bessere Zielgenauigkeit. 3) Gerade stoßen – das Queue muss sich exakt in einer Linie bewegen. 4) Weiße Kugel mittig treffen für gerade Stöße. 5) Leicht anfangen – erst gerade Stöße üben, dann Winkel. 6) Nicht zu fest stoßen – Kontrolle schlägt Kraft. 7) Kreide auf die Queue-Spitze auftragen für besseren Grip.", tags: ["Anfänger", "Technik"] },
      { question: "Verhaltens- und Spielregeln beim Billiard", answer: "Grundregeln beim 8-Ball (häufigste Variante): Nach dem Anstoß (Break) wird festgelegt, wer Volle (1-7) und wer Halbe (9-15) spielt. Wer zuerst alle eigenen Kugeln versenkt und dann die Schwarze (8) regelgerecht einlocht, gewinnt. Foul: Weiße in der Tasche, falsche Kugel zuerst berührt, oder keine Bande berührt. Etikette: Nicht auf den Tisch setzen, Queue nicht auf den Boden stellen, dem Gegner nicht im Weg stehen, leise sein beim Stoß des Gegners.", tags: ["Regeln", "Etikette"] },
      { question: "Unterschied zwischen Billiard, Pool und Snooker", answer: "Pool-Billiard: 16 Kugeln, 6 Taschen, kleiner Tisch (7-9 Fuß), am weitesten verbreitet in Deutschland. Varianten: 8-Ball, 9-Ball, 14/1. Snooker: 22 Kugeln (15 rote, 6 farbige, 1 weiße), großer Tisch (12 Fuß), kleinere Taschen, sehr taktisch und anspruchsvoll. Karambolage: Kein Tisch mit Taschen, 3 Kugeln, man muss die Spielkugel so stoßen, dass sie beide anderen berührt. Alle drei sind Billard-Varianten, aber mit sehr unterschiedlichem Spielgefühl.", tags: ["Unterschied", "Varianten"] },
      { question: "Billiard für Konzentration und Strategie", answer: "Billiard ist mehr als ein Kneipenspiel: Es trainiert Konzentration (jeder Stoß erfordert Fokus), räumliches Denken (Winkel, Banden, Position), strategische Planung (mehrere Stöße vorausdenken), Feinmotorik (präzise Bewegungen) und Geduld. Unter Stress ruhig bleiben und kluge Entscheidungen treffen – das sind Fähigkeiten, die auch im Alltag helfen. Billiard ist zudem einer der wenigen Sportarten, die man bis ins hohe Alter spielen kann. In Billiard-Clubs gibt es oft Liga-Spiele und Turniere.", tags: ["Konzentration", "Strategie"] }
    ]
  },
  {
    name: "Golf",
    icon: "🏌️",
    description: "Golf – der elegante Sport in der Natur für Einsteiger und Profis.",
    color: "bg-green-50 border-green-200",
    articles: [
      { question: "Was ist Golf – einfach erklärt", answer: "Golf ist ein Präzisionssport, bei dem ein Ball mit möglichst wenigen Schlägen vom Abschlag in ein Loch auf dem Grün gespielt wird. Ein Golfplatz hat 18 Bahnen (Löcher) mit unterschiedlichen Längen und Schwierigkeiten. Jede Bahn hat einen Par-Wert (die Anzahl Schläge, die ein guter Spieler brauchen sollte). Verschiedene Schläger für verschiedene Situationen: Driver (weit), Eisen (mittel), Wedge (kurz/hoch), Putter (auf dem Grün). Handicap zeigt das Spielniveau an.", tags: ["Grundlagen", "Erklärung"] },
      { question: "Golf für Anfänger – der Einstieg", answer: "So starten Sie mit Golf: 1) Schnupperkurs buchen (2-3 Stunden, ca. 30-50€, Ausrüstung wird gestellt). 2) Platzreife-Kurs absolvieren (ca. 5-10 Stunden, Pflicht für Spielen auf dem Platz). 3) Driving Range besuchen – hier übt man Abschläge. 4) Gebrauchte Schläger kaufen fürs Erste. 5) Golfkleidung: Poloshirt mit Kragen, lange Hose oder Bermuda, Golfschuhe. 6) Etikette lernen: Divots zurücklegen, Pitchmarken ausbessern, Vordermann nicht anspielen. Golf ist gesellig und entspannend zugleich.", tags: ["Anfänger", "Einstieg"] },
      { question: "Greenfee, Mitgliedschaft und Kosten beim Golf", answer: "Greenfee: Einmalige Gebühr für eine Runde (18 Löcher), ca. 30-100€ je nach Platz und Wochentag. Weekday ist günstiger als Weekend. Mitgliedschaft: Jahresbeitrag bei einem Golfclub (ca. 800-3000€), dafür unbegrenztes Spielen. Fernmitgliedschaft: Günstiger, aber beschränkte Spielrechte. Driving Range: Ballkorb ab 3-5€. Ausrüstung: Anfängerset ab 200€, Premium ab 1000€+. Tipp: Viele Plätze bieten After-Work-Tarife oder Twilight-Greenfees am Abend günstiger an.", tags: ["Kosten", "Greenfee"] },
      { question: "Gesundheitliche Vorteile von Golf", answer: "Golf ist überraschend gesund: Eine 18-Loch-Runde bedeutet 8-10 km Fußweg (4-5 Stunden an der frischen Luft). Es verbrennt 800-1500 Kalorien pro Runde. Der Schwung trainiert Rumpfmuskulatur, Koordination und Flexibilität. Gehen auf unebenem Gelände stärkt die Beinmuskulatur. Der mentale Aspekt: Konzentration, Geduld und Umgang mit Frustration werden geschult. Golf wird bis ins hohe Alter gespielt – es ist einer der gelenkschonendsten Sportarten. Studien zeigen: Golfer leben im Schnitt 5 Jahre länger.", tags: ["Gesundheit", "Fitness"] },
      { question: "Golf-Etikette und ungeschriebene Regeln", answer: "Die wichtigsten Etikette-Regeln: 1) Pünktlich zur Startzeit erscheinen. 2) Auf dem Grün nicht treten, wo andere putten. 3) Divots (ausgeschlagene Rasenstücke) zurücklegen. 4) Pitchmarken auf dem Grün mit der Pitchgabel ausbessern. 5) Vordere Spielgruppe nicht anspielen (Sicherheit!). 6) ‚Fore!' rufen bei Fehlschlägen in Richtung anderer Spieler. 7) Zügig spielen (Ready Golf). 8) Bunker nach dem Spiel harken. 9) Handys lautlos. Diese Regeln zeigen Respekt gegenüber Mitspielern und dem Platz.", tags: ["Etikette", "Regeln"] }
    ]
  },
  {
    name: "Sauna & Wellness",
    icon: "🧖",
    description: "Sauna und Wellness – Entspannung und Gesundheit für Körper und Geist.",
    color: "bg-amber-50 border-amber-200",
    articles: [
      { question: "Sauna für Anfänger – wie geht das richtig?", answer: "Der erste Saunabesuch: 1) Duschen und abtrocknen vor dem Saunagang. 2) Handtuch unterlegen (komplett, nichts berührt das Holz). 3) Unten anfangen (weniger heiß) und sich langsam steigern. 4) 8-15 Minuten pro Saunagang sind ideal für Anfänger. 5) Danach: Kalt abduschen oder ins Tauchbecken (fördert die Durchblutung). 6) Ruhen: 15-20 Minuten entspannen. 7) 2-3 Saunagänge pro Besuch sind optimal. 8) In Deutschland wird nackt sauniert (Handtuch um den Körper ist unüblich). Viel trinken (Wasser/Tee)!", tags: ["Anfänger", "Tipps"] },
      { question: "Verschiedene Saunaarten und ihre Wirkung", answer: "Finnische Sauna: 80-100°C, trockene Hitze, der Klassiker – intensiv und schweißtreibend. Bio-Sauna: 50-60°C, höhere Luftfeuchtigkeit, schonender für Kreislauf. Dampfbad: 40-50°C, 100% Luftfeuchtigkeit, gut für Atemwege und Haut. Infrarotkabine: 40-60°C, Wärmestrahlung statt heiße Luft, besonders gelenkschonend. Erdsauna: Holzbeheizt, authentisch, moderate Temperaturen. Eissauna: Kurzer Aufenthalt bei -10 bis -110°C, Kryotherapie. Jede Saunaart hat eigene Gesundheitsvorteile.", tags: ["Saunaarten", "Wirkung"] },
      { question: "Gesundheitliche Vorteile von regelmäßigem Saunieren", answer: "Sauna hat zahlreiche nachgewiesene Gesundheitseffekte: Stärkung des Immunsystems (regelmäßige Saunagänger haben weniger Erkältungen), Verbesserung der Durchblutung, Entschlackung über den Schweiß, Entspannung der Muskulatur, Stressabbau durch Endorphin-Ausschüttung, besserer Schlaf, Hautpflege (Poren öffnen sich). Studien zeigen: 2-3 Saunagänge pro Woche senken das Risiko für Herz-Kreislauf-Erkrankungen. Hinweis: Bei akuten Infekten, Herzkrankheiten oder Schwangerschaft vorher ärztlich beraten lassen.", tags: ["Gesundheit", "Vorteile"] },
      { question: "Sauna-Etikette in Deutschland", answer: "Die wichtigsten Regeln: 1) Nackt saunieren ist Standard (Badekleidung nur in gemischten Textilsaunen). 2) Immer ein großes Handtuch unterlegen – kein Schweiß aufs Holz. 3) Leise verhalten – Sauna ist Ruhebereich. 4) Aufgüsse nicht stören (Tür geschlossen halten). 5) Vor dem Betreten und nach dem Saunieren duschen. 6) Handtuch im Ruhebereich auslegen. 7) Kein Handy im Saunabereich. 8) Nicht starren – gegenseitiger Respekt. 9) Saunameister-Aufgüsse nicht verpassen – oft mit Duft und Show!", tags: ["Etikette", "Regeln"] },
      { question: "Wellness-Angebote – was gibt es außer Sauna?", answer: "Wellness-Oasen bieten viel mehr als nur Sauna: Massagen (Thai, Hot Stone, Schwedisch, Lomi Lomi), Gesichtsbehandlungen, Solebecken und Salzgrotten (gut für Atemwege), Whirlpools und Sprudelbecken, Hamam (türkisches Dampfbad mit Seifenmassage), Kneipp-Parcours (Warm-Kalt-Wechsel), Ayurveda-Behandlungen, Yoga- und Meditationskurse. Viele Thermen kombinieren Sauna, Bade- und Wellnesslandschaft. Ein Wellness-Tag ist das perfekte Geschenk für stressige Zeiten.", tags: ["Wellness", "Angebote"] }
    ]
  }
];

export default function LexikonRatgeber() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    if (!searchTerm && !selectedCategory) return lexikonData;

    return lexikonData
      .filter(cat => {
        if (selectedCategory && cat.name !== selectedCategory) return false;
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        if (cat.name.toLowerCase().includes(term)) return true;
        return cat.articles.some(a =>
          a.question.toLowerCase().includes(term) ||
          a.answer.toLowerCase().includes(term) ||
          a.tags.some(t => t.toLowerCase().includes(term))
        );
      })
      .map(cat => {
        if (!searchTerm) return cat;
        const term = searchTerm.toLowerCase();
        if (cat.name.toLowerCase().includes(term)) return cat;
        return {
          ...cat,
          articles: cat.articles.filter(a =>
            a.question.toLowerCase().includes(term) ||
            a.answer.toLowerCase().includes(term) ||
            a.tags.some(t => t.toLowerCase().includes(term))
          )
        };
      })
      .filter(cat => cat.articles.length > 0);
  }, [searchTerm, selectedCategory]);

  const totalArticles = lexikonData.reduce((s, c) => s + c.articles.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/">
            <span className="inline-flex items-center text-purple-200 hover:text-white text-sm mb-4 cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-1" /> Zurück zur Startseite
            </span>
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Freizeit-Lexikon & Ratgeber</h1>
              <p className="text-purple-200 mt-1">
                {lexikonData.length} Kategorien · {totalArticles} Artikel · Tipps, Erklärungen & How-Tos
              </p>
            </div>
          </div>
          <div className="relative max-w-2xl mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-300" />
            <Input
              placeholder="Suche nach Thema, Frage oder Begriff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-6 text-lg bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:bg-white/20"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedCategory && (
          <div className="mb-6">
            <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)} className="text-purple-600">
              <ArrowLeft className="w-4 h-4 mr-1" /> Alle Kategorien anzeigen
            </Button>
          </div>
        )}

        {!selectedCategory && !searchTerm && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Kategorien durchstöbern</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {lexikonData.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`p-4 rounded-xl border-2 text-left hover:shadow-md transition-all ${cat.color} hover:scale-[1.02]`}
                >
                  <span className="text-2xl block mb-1">{cat.icon}</span>
                  <span className="font-semibold text-sm text-gray-900 block">{cat.name}</span>
                  <span className="text-xs text-gray-500">{cat.articles.length} Artikel</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {searchTerm && filteredCategories.length === 0 && (
          <div className="text-center py-16">
            <HelpCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700">Keine Ergebnisse gefunden</h3>
            <p className="text-gray-500 mt-2">Versuche einen anderen Suchbegriff oder stöbere durch die Kategorien.</p>
          </div>
        )}

        <div className="space-y-8">
          {filteredCategories.map((category) => (
            <div key={category.name}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{category.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                  <p className="text-gray-500 text-sm">{category.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                {category.articles.map((article, idx) => {
                  const articleKey = `${category.name}-${idx}`;
                  const isExpanded = expandedArticle === articleKey;

                  return (
                    <Card
                      key={articleKey}
                      className={`border shadow-sm cursor-pointer transition-all hover:shadow-md ${isExpanded ? 'ring-2 ring-purple-200' : ''}`}
                      onClick={() => setExpandedArticle(isExpanded ? null : articleKey)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            )}
                            <CardTitle className="text-base font-semibold leading-snug">
                              {article.question}
                            </CardTitle>
                          </div>
                          <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
                            {article.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs text-purple-600 border-purple-200">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardHeader>
                      {isExpanded && (
                        <CardContent className="pt-0 pb-5">
                          <div className="ml-8 pl-3 border-l-2 border-purple-200">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                              {article.answer}
                            </p>
                            <div className="flex gap-1 mt-4 flex-wrap">
                              {article.tags.map(tag => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs cursor-pointer hover:bg-purple-100"
                                  onClick={(e) => { e.stopPropagation(); setSearchTerm(tag); }}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 mb-8">
          <Card className="border-0 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-sm">
            <CardContent className="py-8 text-center">
              <Lightbulb className="h-10 w-10 text-purple-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Du hast eine Frage?</h3>
              <p className="text-gray-600 max-w-lg mx-auto">
                Unser Lexikon wird stetig erweitert. Entdecke spannende Freizeitaktivitäten
                in deiner Nähe und buche dein nächstes Erlebnis auf FreizeitEngel!
              </p>
              <Link href="/search">
                <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                  <MapPin className="w-4 h-4 mr-2" />
                  Erlebnisse in deiner Nähe finden
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}