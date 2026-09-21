import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Store,
  Palette,
  FileText,
  Globe,
  CreditCard,
  ShoppingCart,
  Settings,
  Eye,
  ExternalLink,
  Copy,
  Check,
  Layout,
  Type,
  Image as ImageIcon,
  Mail,
  Receipt,
  Percent
} from "lucide-react";

interface ShopConfig {
  primaryColor: string;
  accentColor: string;
  headerText: string;
  footerText: string;
  showReviews: boolean;
  showAvailability: boolean;
  showMap: boolean;
  layout: string;
  currency: string;
  taxDisplay: string;
  emailConfirmation: boolean;
  customCss: string;
}

const defaultConfig: ShopConfig = {
  primaryColor: "#7c3aed",
  accentColor: "#10b981",
  headerText: "",
  footerText: "",
  showReviews: true,
  showAvailability: true,
  showMap: true,
  layout: "grid",
  currency: "EUR",
  taxDisplay: "brutto",
  emailConfirmation: true,
  customCss: "",
};

const shopTiles = [
  { id: "editor", title: "Shop Editor", description: "Anpassen des Shop-Designs und Layouts", icon: Palette, color: "bg-purple-100 text-purple-700" },
  { id: "display", title: "Angebotsdarstellung", description: "Einstellungen für die Anzeige Ihrer Angebote", icon: Layout, color: "bg-blue-100 text-blue-700" },
  { id: "pdf", title: "PDF Editor", description: "Buchungsbestätigungen und Tickets anpassen", icon: FileText, color: "bg-green-100 text-green-700" },
  { id: "integration", title: "Integration Website", description: "Shop auf Ihrer Website einbinden", icon: Globe, color: "bg-orange-100 text-orange-700" },
  { id: "tax", title: "Steueroptionen", description: "MwSt.-Sätze und Steueranzeige konfigurieren", icon: Receipt, color: "bg-red-100 text-red-700" },
  { id: "domain", title: "Shop Domain", description: "Eigene Domain für Ihren Shop", icon: Globe, color: "bg-cyan-100 text-cyan-700" },
  { id: "payment", title: "Zahlungsoptionen", description: "Zahlungsmethoden verwalten", icon: CreditCard, color: "bg-indigo-100 text-indigo-700" },
  { id: "orders", title: "Bestelloptionen", description: "Buchungsablauf und Bestätigungen", icon: ShoppingCart, color: "bg-amber-100 text-amber-700" },
];

export default function ShopKonfiguration() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [config, setConfig] = useState<ShopConfig>(defaultConfig);
  const [copied, setCopied] = useState(false);

  const { data: profile } = useQuery<any>({ queryKey: ["/api/partner/profile"] });

  const shopUrl = profile?.id ? `${window.location.origin}/partners/${profile.id}` : "";

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shopUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (activeSection) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setActiveSection(null)}>
            ← Zurück zur Übersicht
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <h2 className="text-lg font-semibold">
            {shopTiles.find((t) => t.id === activeSection)?.title}
          </h2>
        </div>

        {activeSection === "editor" && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-600" />
                Shop Design
              </CardTitle>
              <CardDescription>Passen Sie das Erscheinungsbild Ihres Shops an</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Primärfarbe</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <input
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) => setConfig((p) => ({ ...p, primaryColor: e.target.value }))}
                      className="w-10 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={config.primaryColor}
                      onChange={(e) => setConfig((p) => ({ ...p, primaryColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Akzentfarbe</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <input
                      type="color"
                      value={config.accentColor}
                      onChange={(e) => setConfig((p) => ({ ...p, accentColor: e.target.value }))}
                      className="w-10 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={config.accentColor}
                      onChange={(e) => setConfig((p) => ({ ...p, accentColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Header-Text</Label>
                <Input
                  value={config.headerText}
                  onChange={(e) => setConfig((p) => ({ ...p, headerText: e.target.value }))}
                  placeholder="Willkommenstext für Ihren Shop"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Footer-Text</Label>
                <Textarea
                  value={config.footerText}
                  onChange={(e) => setConfig((p) => ({ ...p, footerText: e.target.value }))}
                  placeholder="Impressum, Kontaktdaten, AGBs..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Layout</Label>
                <Select value={config.layout} onValueChange={(v) => setConfig((p) => ({ ...p, layout: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Rasteransicht</SelectItem>
                    <SelectItem value="list">Listenansicht</SelectItem>
                    <SelectItem value="cards">Kartenansicht</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Eigenes CSS (optional)</Label>
                <Textarea
                  value={config.customCss}
                  onChange={(e) => setConfig((p) => ({ ...p, customCss: e.target.value }))}
                  placeholder=".shop-header { ... }"
                  rows={4}
                  className="mt-1 font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "display" && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-blue-600" />
                Angebotsdarstellung
              </CardTitle>
              <CardDescription>Steuern Sie, welche Informationen in Ihren Angeboten angezeigt werden</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "showReviews" as const, label: "Bewertungen anzeigen", desc: "Kundenbewertungen unter Ihren Angeboten" },
                { key: "showAvailability" as const, label: "Verfügbarkeit anzeigen", desc: "Verfügbare Plätze/Termine anzeigen" },
                { key: "showMap" as const, label: "Karte anzeigen", desc: "Standort-Karte auf der Detailseite" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <Label className="text-sm font-medium">{item.label}</Label>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <Switch
                    checked={config[item.key] as boolean}
                    onCheckedChange={(v) => setConfig((p) => ({ ...p, [item.key]: v }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeSection === "integration" && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-orange-600" />
                Website-Integration
              </CardTitle>
              <CardDescription>Binden Sie Ihren FreizeitEngel-Shop in Ihre eigene Website ein</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Ihr Shop-Link</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={shopUrl} readOnly className="font-mono text-sm" />
                  <Button variant="outline" onClick={handleCopyUrl}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <a href={shopUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>

              <Separator />

              <div>
                <Label>iFrame Embed-Code</Label>
                <div className="mt-1 p-4 bg-gray-900 rounded-lg">
                  <code className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                    {`<iframe\n  src="${shopUrl}"\n  width="100%"\n  height="800"\n  frameborder="0"\n  style="border: none; border-radius: 8px;"\n></iframe>`}
                  </code>
                </div>
                <Button variant="outline" className="mt-2" onClick={() => {
                  navigator.clipboard.writeText(`<iframe src="${shopUrl}" width="100%" height="800" frameborder="0" style="border: none; border-radius: 8px;"></iframe>`);
                }}>
                  <Copy className="h-4 w-4 mr-2" />
                  Code kopieren
                </Button>
              </div>

              <Separator />

              <div>
                <Label>Direktlink-Button</Label>
                <div className="mt-1 p-4 bg-gray-900 rounded-lg">
                  <code className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                    {`<a href="${shopUrl}"\n   target="_blank"\n   style="display:inline-block; padding:12px 24px;\n          background:#7c3aed; color:white;\n          border-radius:8px; text-decoration:none;\n          font-weight:bold;">\n  Jetzt buchen auf FreizeitEngel\n</a>`}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "payment" && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-600" />
                Zahlungsoptionen
              </CardTitle>
              <CardDescription>Zahlungsmethoden für Ihren Shop</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Kreditkarte", desc: "Visa, Mastercard, American Express", active: true },
                { name: "SEPA-Lastschrift", desc: "Bankeinzug für DE/AT/CH", active: true },
                { name: "PayPal", desc: "PayPal-Zahlungen akzeptieren", active: false },
                { name: "Apple Pay / Google Pay", desc: "Mobile Zahlungen", active: false },
                { name: "Klarna", desc: "Rechnungskauf & Ratenzahlung", active: false },
                { name: "Vor Ort bezahlen", desc: "Zahlung an der Kasse", active: true },
              ].map((method) => (
                <div key={method.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">{method.name}</p>
                    <p className="text-xs text-gray-500">{method.desc}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={method.active ? "default" : "secondary"}>
                      {method.active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                    <Switch checked={method.active} />
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-500 mt-2">
                Zahlungen werden sicher über Stripe Connect abgewickelt. 11% Provision + MwSt. pro Buchung.
              </p>
            </CardContent>
          </Card>
        )}

        {activeSection === "tax" && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-red-600" />
                Steueroptionen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Preisanzeige</Label>
                <Select value={config.taxDisplay} onValueChange={(v) => setConfig((p) => ({ ...p, taxDisplay: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brutto">Bruttopreise (inkl. MwSt.)</SelectItem>
                    <SelectItem value="netto">Nettopreise (zzgl. MwSt.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm font-medium">Standard MwSt.-Sätze</p>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>• Regulär: 19%</p>
                  <p>• Ermäßigt: 7% (Eintrittskarten für kulturelle Veranstaltungen)</p>
                  <p>• Befreit: 0%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "orders" && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-amber-600" />
                Bestelloptionen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div>
                  <Label className="text-sm font-medium">E-Mail-Bestätigung</Label>
                  <p className="text-xs text-gray-500">Automatische Buchungsbestätigung per E-Mail</p>
                </div>
                <Switch
                  checked={config.emailConfirmation}
                  onCheckedChange={(v) => setConfig((p) => ({ ...p, emailConfirmation: v }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div>
                  <Label className="text-sm font-medium">QR-Code auf Ticket</Label>
                  <p className="text-xs text-gray-500">QR-Code zur Einlösung vor Ort</p>
                </div>
                <Switch checked={true} />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div>
                  <Label className="text-sm font-medium">Gastbuchung erlauben</Label>
                  <p className="text-xs text-gray-500">Kunden können ohne Registrierung buchen</p>
                </div>
                <Switch checked={true} />
              </div>
            </CardContent>
          </Card>
        )}

        {(activeSection === "pdf" || activeSection === "domain") && (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center text-gray-500">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Kommt bald</p>
              <p className="text-sm mt-1">Diese Funktion wird in Kürze verfügbar sein</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-purple-600" />
                Shop konfigurieren
              </CardTitle>
              <CardDescription>Passen Sie Ihren FreizeitEngel-Shop nach Ihren Wünschen an</CardDescription>
            </div>
            {shopUrl && (
              <a href={shopUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Shop ansehen
                </Button>
              </a>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {shopTiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <button
                  key={tile.id}
                  onClick={() => setActiveSection(tile.id)}
                  className="text-left p-4 border rounded-xl hover:shadow-md transition-all hover:border-purple-200 group bg-white"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${tile.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">{tile.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{tile.description}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}