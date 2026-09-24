import { BrandsList } from "@/components/brands/brands-list";

export default function BrandsPage() {
  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="bg-primary text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Unsere Markenpartner
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90">
            Entdecken Sie die besten Anbieter für unvergessliche Freizeiterlebnisse in der DACH-Region
          </p>
        </div>
      </section>

      {/* Brands List Section */}
      <section className="py-8 md:py-12">
        <BrandsList />
      </section>

      {/* Info Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-4">Werden Sie Partner bei FreizeitEngel</h2>
            <p className="text-gray-600 mb-6">
              Sie sind ein Anbieter von Freizeitaktivitäten und möchten mehr Sichtbarkeit und Buchungen erhalten? 
              Werden Sie Partner bei FreizeitEngel und profitieren Sie von unserer wachsenden Community!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-5">
                <div className="text-2xl font-bold text-primary mb-2">1.</div>
                <h3 className="text-lg font-medium mb-2">Einfache Registrierung</h3>
                <p className="text-gray-600 text-sm">
                  Registrieren Sie sich als Partner und erstellen Sie Ihr Profil mit allen wichtigen Informationen.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-5">
                <div className="text-2xl font-bold text-primary mb-2">2.</div>
                <h3 className="text-lg font-medium mb-2">Angebote einstellen</h3>
                <p className="text-gray-600 text-sm">
                  Fügen Sie Ihre Erlebnisse und Aktivitäten hinzu, mit Beschreibungen, Bildern und Verfügbarkeiten.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-5">
                <div className="text-2xl font-bold text-primary mb-2">3.</div>
                <h3 className="text-lg font-medium mb-2">Buchungen erhalten</h3>
                <p className="text-gray-600 text-sm">
                  Freuen Sie sich über neue Kunden und verwalten Sie alle Buchungen direkt über unser System.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}