import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import logoImage from "@assets/FreizeitEngel_Logo.jpg";
import { resolveCategoryRoute } from "@/lib/activity-route-resolver";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src={logoImage} alt="FreizeitEngel Logo" className="h-18 mr-2 object-contain" />
            </div>
            <p className="text-gray-400 mb-4">
              Deine Plattform für alle Freizeitaktivitäten.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Schnelllinks</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/search" className="text-gray-400 hover:text-white transition">
                  Erlebnisse entdecken
                </Link>
              </li>
              <li>
                <Link href="/partner" className="text-gray-400 hover:text-white transition">
                  Partner werden
                </Link>
              </li>
              <li>
                <Link href="/auth" className="text-gray-400 hover:text-white transition">
                  Anmelden / Registrieren
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition">
                  Über uns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition">
                  Häufige Fragen
                </Link>
              </li>
              <li>
                <Link href="/lexikon" className="text-gray-400 hover:text-white transition">
                  Lexikon & Ratgeber
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kategorien</h3>
            <ul className="space-y-2">
              {/* STATIC: SPA Links to the search results instead of the source's
                  session-resetting window.location.href navigation. */}
              <li>
                <Link href={resolveCategoryRoute("Outdoor & Abenteuer")} className="text-gray-400 hover:text-white transition">
                  Outdoor & Abenteuer
                </Link>
              </li>
              <li>
                <Link href={resolveCategoryRoute("Kulinarische Erlebnisse")} className="text-gray-400 hover:text-white transition">
                  Kulinarische Erlebnisse
                </Link>
              </li>
              <li>
                <Link href={resolveCategoryRoute("Familienausflüge")} className="text-gray-400 hover:text-white transition">
                  Familienausflüge
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
            {/* LEGAL-REVIEW: placeholder contact details (Berlin address, info@freizeitplus.de, phone) differ from the company details on /imprint, /datenschutz and /agb. Needs owner confirmation. */}
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="text-gray-400 mt-1 mr-3 h-4 w-4" />
                <span className="text-gray-400">
                  Erlebnisstraße 42<br />10115 Berlin, Deutschland
                </span>
              </li>
              <li className="flex items-center">
                <Mail className="text-gray-400 mr-3 h-4 w-4" />
                <a
                  href="mailto:info@freizeitplus.de"
                  className="text-gray-400 hover:text-white transition"
                >
                  info@freizeitplus.de
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="text-gray-400 mr-3 h-4 w-4" />
                <a
                  href="tel:+4930123456789"
                  className="text-gray-400 hover:text-white transition"
                >
                  +49 30 123 456 789
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} FreizeitEngel. Alle Rechte vorbehalten.
            </p>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition">
                AGB
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition">
                Datenschutz
              </Link>
              <Link href="/imprint" className="text-gray-400 hover:text-white text-sm transition">
                Impressum
              </Link>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                Cookie-Einstellungen
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
