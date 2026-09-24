import React from "react";

export interface Brand {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  logoColor: string;
  icon: React.ReactNode;
  foundedYear: number;
  location: string;
  website: string;
  specialty: string[];
  experienceCount: number;
  featuredImageUrl: string;
  tags: string[];
}

export const brands: Brand[] = [
  {
    id: "aquaventure",
    name: "AquaVenture",
    description: "Spezialist für Wassererlebnisse und Schwimmabenteuer in verschiedenen Schwierigkeitsgraden für die ganze Familie.",
    longDescription: `AquaVenture ist der führende Anbieter für außergewöhnliche Wassererlebnisse in der DACH-Region. Seit unserer Gründung im Jahr 2008 haben wir uns darauf spezialisiert, unvergessliche Wassererlebnisse für Menschen jeden Alters zu schaffen. 

Unsere modernen Schwimm- und Erlebnisbäder bieten eine perfekte Kombination aus Spaß, Erholung und Abenteuer. Mit über 15 Standorten in Deutschland, Österreich und der Schweiz sind wir immer in Ihrer Nähe.

Bei AquaVenture legen wir großen Wert auf Sicherheit und Qualität. Alle unsere Anlagen werden regelmäßig gewartet und entsprechen den höchsten Sicherheitsstandards. Unsere ausgebildeten Schwimmmeister und Rettungsschwimmer sorgen dafür, dass Sie Ihr Wassererlebnis sorgenfrei genießen können.

Entdecken Sie unsere vielfältigen Angebote - von aufregenden Wasserrutschen und Wellenbädern bis hin zu entspannenden Spa-Bereichen und Saunalandschaften. Für Kinder bieten wir spezielle Kinderbereiche mit altersgerechten Attraktionen und regelmäßigen Schwimmkursen.`,
    logoColor: "bg-blue-100",
    icon: (
      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
      </svg>
    ),
    foundedYear: 2008,
    location: "München, Deutschland",
    website: "www.aquaventure.com",
    specialty: ["Schwimmbäder", "Wasserparks", "Wellness-Bereiche", "Schwimmkurse"],
    experienceCount: 12,
    featuredImageUrl: "https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?q=80&w=2069&auto=format&fit=crop",
    tags: ["Wasser", "Schwimmen", "Familie", "Wellness", "Indoor"]
  },
  {
    id: "alpensport",
    name: "AlpenSport",
    description: "Ihr Experte für Outdoor-Abenteuer und Bergaktivitäten in den schönsten Regionen der Alpen.",
    longDescription: `AlpenSport ist seit 1995 der verlässliche Partner für unvergessliche Outdoor-Abenteuer in den Alpen. Mit Wurzeln in Innsbruck, Österreich, haben wir uns auf die Organisation von qualitativ hochwertigen Bergsport- und Naturerlebnissen spezialisiert.

Unser erfahrenes Team aus zertifizierten Bergführern, Wanderleitern und Outdoor-Experten kennt die Alpenregion wie keine andere und teilt die Leidenschaft für die Berge mit unseren Gästen. Jedes unserer Angebote wird mit Blick auf Sicherheit, Nachhaltigkeit und authentische Naturerlebnisse gestaltet.

Bei AlpenSport finden Sie ein breites Spektrum an Aktivitäten für jede Jahreszeit: Von geführten Wanderungen, Klettertouren und Mountainbike-Trails im Sommer bis hin zu Skitouren, Schneeschuhwanderungen und Eisklettern im Winter. Für Adrenalin-Liebhaber bieten wir außerdem Paragliding, Canyoning und Rafting-Abenteuer an.

Unsere Philosophie ist es, die Schönheit und Kraft der Alpenlandschaft auf respektvolle und nachhaltige Weise erlebbar zu machen. Wir arbeiten eng mit lokalen Gemeinschaften zusammen und unterstützen Umweltschutzprojekte in den Regionen, in denen wir tätig sind.`,
    logoColor: "bg-green-100",
    icon: (
      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    foundedYear: 1995,
    location: "Innsbruck, Österreich",
    website: "www.alpensport.at",
    specialty: ["Bergwandern", "Klettern", "Skifahren", "Mountainbiking"],
    experienceCount: 18,
    featuredImageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=400&q=80",
    tags: ["Berge", "Outdoor", "Abenteuer", "Sport", "Natur"]
  },
  {
    id: "cityfun",
    name: "CityFun",
    description: "Stadtabenteuer und kulturelle Erlebnisse in den aufregendsten Metropolen Deutschlands.",
    longDescription: `CityFun wurde 2012 mit einer klaren Mission gegründet: Das Beste aus dem urbanen Leben zugänglich zu machen und die versteckten Schätze deutscher Großstädte zu entdecken. Heute sind wir der führende Anbieter für Stadtabenteuer in mehr als 15 deutschen Metropolen.

Wir bieten eine Vielzahl an städtischen Erlebnissen, die weit über die üblichen Touristenpfade hinausgehen. Unsere Stadtführungen werden von lokalen Experten geleitet, die ihre Stadt mit Leidenschaft und umfassendem Wissen präsentieren. Von historischen Touren und Architekturführungen bis hin zu kulinarischen Entdeckungsreisen und Street-Art-Expeditionen – wir bieten für jeden Geschmack das passende Stadterlebnis.

Ein besonderes Highlight sind unsere interaktiven Stadt-Rallyes und Escape-Games, die in den urbanen Raum integriert sind. Diese Abenteuer kombinieren spannende Rätsel mit der Erkundung interessanter Stadtteile und sind sowohl für Touristen als auch für Einheimische ein unvergessliches Erlebnis.

Für Kulturbegeisterte organisieren wir exklusive Zugänge zu Museen, Theatern und Kulturveranstaltungen, oft mit Backstage-Führungen oder besonderen Einblicken, die dem regulären Besucher verborgen bleiben.

Nachhaltigkeit und soziale Verantwortung sind für uns zentrale Werte. Wir unterstützen lokale Geschäfte und Künstler und achten darauf, dass unsere Touren umweltfreundlich und sozial verträglich gestaltet werden.`,
    logoColor: "bg-amber-100",
    icon: (
      <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 22V12h6v10" />
      </svg>
    ),
    foundedYear: 2012,
    location: "Berlin, Deutschland",
    website: "www.cityfun.de",
    specialty: ["Stadtführungen", "Escape-Games", "Kulturelle Erlebnisse", "Kulinarische Touren"],
    experienceCount: 25,
    featuredImageUrl: "https://images.unsplash.com/photo-1518126045765-4dc4ca182e9f?q=80&w=2070&auto=format&fit=crop",
    tags: ["Stadt", "Kultur", "Führungen", "Essen", "Geschichte"]
  },
  {
    id: "kinowelt",
    name: "KinoWelt",
    description: "Premium-Kinoerlebnisse mit modernster Technik, luxuriösen Sitzen und exklusivem Service.",
    longDescription: `KinoWelt revolutioniert seit 2015 das Kinoerlebnis in der DACH-Region. Unser Konzept: Filme nicht nur schauen, sondern mit allen Sinnen erleben. In unseren Premium-Kinosälen vereinen wir modernste Technik mit außergewöhnlichem Komfort und persönlichem Service.

Alle KinoWelt-Standorte sind mit der neuesten Projektionstechnologie ausgestattet, darunter 4K-Laser-Projektoren und immersive Soundsysteme, die ein unvergleichliches audiovisuelles Erlebnis garantieren. Unsere elektromagnetisch verstellbaren Luxus-Liegesessel mit großzügigem Abstand bieten maximalen Komfort während der Vorstellung.

Das Gastronomiekonzept von KinoWelt geht weit über herkömmliches Kino-Popcorn hinaus. In unserer Lounge-Bar servieren wir erlesene Weine, kreative Cocktails und internationale Gourmet-Snacks, die bequem am Platz genossen werden können. Für besondere Anlässe bieten wir exklusive Pakete mit Champagner, Menüs und persönlichem Service.

Neben dem regulären Filmprogramm veranstalten wir regelmäßig spezielle Events wie Filmfestivals, Themenabende und Vorpremieren mit Gästen aus der Filmbranche. Unsere VIP-Lounges können für private Vorführungen und Firmenevents gebucht werden.

Die KinoWelt-Mitgliedschaft bietet treuen Kunden exklusive Vorteile wie vergünstigte Tickets, Vorverkaufsrechte für Premieren und besondere Einladungen zu exklusiven Events. Mit unserem KinoWelt Business Club sprechen wir gezielt Unternehmenskunden an, die ihren Mitarbeitern oder Kunden ein besonderes Erlebnis bieten möchten.`,
    logoColor: "bg-purple-100",
    icon: (
      <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    foundedYear: 2015,
    location: "Hamburg, Deutschland",
    website: "www.kinowelt.de",
    specialty: ["Premium-Kino", "VIP-Vorführungen", "Filmpremieren", "Themenabende"],
    experienceCount: 8,
    featuredImageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070&auto=format&fit=crop",
    tags: ["Kino", "Film", "Entertainment", "Premium", "VIP"]
  },
  {
    id: "actionzone",
    name: "ActionZone",
    description: "Adrenalingeladene Aktivitäten und Teambuilding-Events für Abenteuerlustige und Unternehmen.",
    longDescription: `ActionZone ist seit 2010 der ultimative Anbieter für Action und Adrenalin im deutschsprachigen Raum. Mit Hauptsitz in Frankfurt und Standorten in allen größeren Städten der DACH-Region bieten wir ein umfassendes Portfolio an aufregenden Aktivitäten für Einzelpersonen, Gruppen und Unternehmen.

Unser Konzept basiert auf der Überzeugung, dass außergewöhnliche Erlebnisse nicht nur Spaß machen, sondern auch persönliches Wachstum fördern und Teams zusammenschweißen. Alle ActionZone-Erlebnisse werden von erfahrenen Instruktoren geleitet, die höchste Sicherheitsstandards garantieren und gleichzeitig dafür sorgen, dass jeder Teilnehmer seine Grenzen erweitern kann.

Das Angebot von ActionZone umfasst Indoor- und Outdoor-Aktivitäten für jede Jahreszeit: Von Paintball, Lasertag und Indoor-Klettern bis hin zu Hochseilgärten, Quadtouren und Rafting. Besonders beliebt sind unsere Escape Rooms mit verschiedenen Schwierigkeitsgraden und thematischen Ausrichtungen.

Für Unternehmen haben wir spezielle Teambuilding-Programme entwickelt, die auf die spezifischen Bedürfnisse und Ziele des jeweiligen Teams zugeschnitten werden können. Diese kombinieren actionreiche Herausforderungen mit gezielten Reflexionsphasen und werden von qualifizierten Teamtrainern begleitet.

Mit unserem "Action Pass" bieten wir Vielnutzern attraktive Rabatte und exklusive Vorteile. Für besondere Anlässe wie Junggesellenabschiede, Geburtstage oder Firmenevents stellen wir maßgeschneiderte Pakete zusammen, die unvergessliche Erlebnisse garantieren.`,
    logoColor: "bg-red-100",
    icon: (
      <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    foundedYear: 2010,
    location: "Frankfurt, Deutschland",
    website: "www.actionzone.de",
    specialty: ["Paintball", "Escape Rooms", "Hochseilgärten", "Teambuilding"],
    experienceCount: 15,
    featuredImageUrl: "https://images.unsplash.com/photo-1526976668912-1a811878dd37?q=80&w=2070&auto=format&fit=crop",
    tags: ["Action", "Adrenalin", "Team", "Sport", "Abenteuer"]
  },
  {
    id: "sparelax",
    name: "SpaRelax",
    description: "Luxuriöse Wellness- und Spa-Erlebnisse für Entspannung und Erholung vom Alltag.",
    longDescription: `SpaRelax ist der führende Anbieter für exklusive Wellness-Erlebnisse in der DACH-Region. Seit unserer Gründung im Jahr 2007 haben wir uns der Mission verschrieben, Oasen der Ruhe und Entspannung inmitten des hektischen Alltags zu schaffen.

Unsere Premium-Wellness-Anlagen verbinden traditionelle Spa-Kultur mit innovativen Behandlungsmethoden und modernster Technik. Jeder SpaRelax-Standort ist einzigartig gestaltet und spiegelt die lokale Kultur und Umgebung wider, während gleichzeitig unsere hohen Standards in Bezug auf Qualität, Service und Nachhaltigkeit gewahrt bleiben.

Das Herzstück unseres Angebots sind großzügige Saunalandschaften mit verschiedenen Saunatypen, Dampfbädern, Tauchbecken und Ruhebereichen. Ergänzt wird dieses Angebot durch ein umfangreiches Portfolio an Behandlungen – von klassischen Massagen und Facials bis hin zu ganzheitlichen Anwendungen wie Ayurveda, Hot-Stone-Therapie und TCM.

Für diejenigen, die nach einem intensiveren Wellness-Erlebnis suchen, bieten wir mehrtägige Retreat-Programme an, die Entspannung, Bewegung, Ernährung und Achtsamkeit kombinieren. Diese Programme werden von erfahrenen Wellness-Coaches begleitet und können auf individuelle Bedürfnisse zugeschnitten werden.

Besonders stolz sind wir auf unsere exklusiven Private Spa Suiten, die für Paare oder kleine Gruppen reserviert werden können und absolute Privatsphäre garantieren. Diese Suiten verfügen über private Saunen, Whirlpools und Behandlungsräume sowie erstklassigen Service.`,
    logoColor: "bg-teal-100",
    icon: (
      <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    foundedYear: 2007,
    location: "Baden-Baden, Deutschland",
    website: "www.sparelax.de",
    specialty: ["Wellness-Pakete", "Massagen", "Sauna", "Beauty-Behandlungen"],
    experienceCount: 20,
    featuredImageUrl: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=2070&auto=format&fit=crop",
    tags: ["Wellness", "Spa", "Entspannung", "Massage", "Sauna"]
  },
];