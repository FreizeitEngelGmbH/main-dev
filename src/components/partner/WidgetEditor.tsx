import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code2,
  Copy,
  Check,
  Monitor,
  Tablet,
  Smartphone,
  Palette,
  Eye,
  Settings,
  ShoppingCart,
  Calendar,
  List,
  Grid3X3,
  ExternalLink,
  Save
} from "lucide-react";

interface WidgetConfig {
  type: string;
  productId: string;
  showPrice: boolean;
  showImage: boolean;
  showDescription: boolean;
  showAvailability: boolean;
  buttonText: string;
  buttonColor: string;
  borderRadius: string;
  maxWidth: string;
  theme: string;
}

const defaultWidget: WidgetConfig = {
  type: "product",
  productId: "all",
  showPrice: true,
  showImage: true,
  showDescription: true,
  showAvailability: true,
  buttonText: "Jetzt buchen",
  buttonColor: "#7c3aed",
  borderRadius: "8",
  maxWidth: "600",
  theme: "light",
};

export default function WidgetEditor() {
  const [config, setConfig] = useState<WidgetConfig>(defaultWidget);
  const [copied, setCopied] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const { data: profile } = useQuery<any>({ queryKey: ["/api/partner/profile"] });
  const { data: experiences } = useQuery<any[]>({ queryKey: ["/api/partner/experiences"] });

  const shopUrl = profile?.id ? `${window.location.origin}/partners/${profile.id}` : "";

  const embedCode = `<!-- FreizeitEngel Widget -->
<div id="freizeitengel-widget" data-partner="${profile?.id || ''}" data-type="${config.type}" data-product="${config.productId}" data-theme="${config.theme}"></div>
<script src="${window.location.origin}/widget.js"></script>
<style>
  #freizeitengel-widget {
    max-width: ${config.maxWidth}px;
    border-radius: ${config.borderRadius}px;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
</style>`;

  const iframeCode = `<iframe
  src="${shopUrl}?embed=true&type=${config.type}&product=${config.productId}&theme=${config.theme}"
  width="100%"
  height="600"
  frameborder="0"
  style="max-width: ${config.maxWidth}px; border-radius: ${config.borderRadius}px; border: 1px solid #e5e7eb;"
></iframe>`;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewWidths: Record<string, string> = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-purple-600" />
            Widget Editor
          </CardTitle>
          <CardDescription>
            Erstellen Sie einbettbare Widgets für Ihre Website, um Angebote direkt auf Ihrer Seite zu verkaufen
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-600" />
                Widget-Einstellungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Widget-Typ</Label>
                <Select value={config.type} onValueChange={(v) => setConfig((p) => ({ ...p, type: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="catalog">
                      <div className="flex items-center gap-2">
                        <Grid3X3 className="h-4 w-4" />
                        Katalog-Widget (alle Angebote)
                      </div>
                    </SelectItem>
                    <SelectItem value="product">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Produkt-Widget (einzelnes Angebot)
                      </div>
                    </SelectItem>
                    <SelectItem value="calendar">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Kalender-Widget (Buchungskalender)
                      </div>
                    </SelectItem>
                    <SelectItem value="button">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Button-Widget (Buchungsbutton)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {config.type === "product" && (
                <div>
                  <Label>Angebot auswählen</Label>
                  <Select value={config.productId} onValueChange={(v) => setConfig((p) => ({ ...p, productId: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Angebot wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Angebote</SelectItem>
                      {experiences?.map((exp: any) => (
                        <SelectItem key={exp.id} value={exp.id.toString()}>
                          {exp.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              <div>
                <Label className="text-sm font-medium mb-2 block">Sichtbarer Inhalt</Label>
                <div className="space-y-3">
                  {[
                    { key: "showPrice" as const, label: "Preis anzeigen" },
                    { key: "showImage" as const, label: "Bild anzeigen" },
                    { key: "showDescription" as const, label: "Beschreibung anzeigen" },
                    { key: "showAvailability" as const, label: "Verfügbarkeit anzeigen" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <Label className="text-sm">{item.label}</Label>
                      <Switch
                        checked={config[item.key] as boolean}
                        onCheckedChange={(v) => setConfig((p) => ({ ...p, [item.key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4 text-gray-600" />
                Design
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Farbschema</Label>
                <Select value={config.theme} onValueChange={(v) => setConfig((p) => ({ ...p, theme: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Hell</SelectItem>
                    <SelectItem value="dark">Dunkel</SelectItem>
                    <SelectItem value="auto">Automatisch (System)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Button-Farbe</Label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    value={config.buttonColor}
                    onChange={(e) => setConfig((p) => ({ ...p, buttonColor: e.target.value }))}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={config.buttonColor}
                    onChange={(e) => setConfig((p) => ({ ...p, buttonColor: e.target.value }))}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>Button-Text</Label>
                <Input
                  value={config.buttonText}
                  onChange={(e) => setConfig((p) => ({ ...p, buttonText: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Maximale Breite (px)</Label>
                  <Input
                    value={config.maxWidth}
                    onChange={(e) => setConfig((p) => ({ ...p, maxWidth: e.target.value }))}
                    className="mt-1"
                    type="number"
                  />
                </div>
                <div>
                  <Label>Eckenradius (px)</Label>
                  <Input
                    value={config.borderRadius}
                    onChange={(e) => setConfig((p) => ({ ...p, borderRadius: e.target.value }))}
                    className="mt-1"
                    type="number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-600" />
                  Vorschau
                </CardTitle>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={previewDevice === "desktop" ? "default" : "ghost"}
                    className="h-8 px-3"
                    onClick={() => setPreviewDevice("desktop")}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={previewDevice === "tablet" ? "default" : "ghost"}
                    className="h-8 px-3"
                    onClick={() => setPreviewDevice("tablet")}
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={previewDevice === "mobile" ? "default" : "ghost"}
                    className="h-8 px-3"
                    onClick={() => setPreviewDevice("mobile")}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div
                  className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                    config.theme === "dark" ? "bg-gray-900" : "bg-white"
                  }`}
                  style={{
                    width: previewDevice === "desktop" ? "100%" : previewDevice === "tablet" ? "768px" : "375px",
                    maxWidth: "100%",
                    borderRadius: `${config.borderRadius}px`,
                  }}
                >
                  {config.type === "button" ? (
                    <div className="p-8 text-center">
                      <button
                        style={{ backgroundColor: config.buttonColor, borderRadius: `${config.borderRadius}px` }}
                        className="px-8 py-3 text-white font-semibold shadow-lg hover:opacity-90 transition-opacity"
                      >
                        {config.buttonText}
                      </button>
                    </div>
                  ) : config.type === "calendar" ? (
                    <div className="p-4">
                      <div className={`text-center mb-4 ${config.theme === "dark" ? "text-white" : ""}`}>
                        <h3 className="font-semibold text-lg">{profile?.companyName || "Ihr Angebot"}</h3>
                        <p className="text-sm text-gray-500">Wählen Sie einen Termin</p>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-sm">
                        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
                          <div key={d} className={`py-1 font-medium text-xs ${config.theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{d}</div>
                        ))}
                        {Array.from({ length: 31 }, (_, i) => (
                          <div
                            key={i}
                            className={`py-2 rounded cursor-pointer text-xs transition-colors ${
                              i === 14
                                ? "text-white font-bold"
                                : config.theme === "dark"
                                ? "text-gray-300 hover:bg-gray-700"
                                : "hover:bg-gray-100"
                            }`}
                            style={i === 14 ? { backgroundColor: config.buttonColor } : {}}
                          >
                            {i + 1}
                          </div>
                        ))}
                      </div>
                      <button
                        className="w-full mt-4 py-2.5 text-white font-semibold rounded-lg"
                        style={{ backgroundColor: config.buttonColor }}
                      >
                        {config.buttonText}
                      </button>
                    </div>
                  ) : (
                    <div className="p-4">
                      {config.showImage && (
                        <div className="h-40 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg mb-3 flex items-center justify-center">
                          <span className="text-purple-400 text-sm">Angebotsbild</span>
                        </div>
                      )}
                      <div className={config.theme === "dark" ? "text-white" : ""}>
                        <h3 className="font-semibold text-lg">{profile?.companyName || "Angebotsname"}</h3>
                        {config.showDescription && (
                          <p className="text-sm text-gray-500 mt-1">Beschreibung des Angebots mit allen wichtigen Details...</p>
                        )}
                        {config.showPrice && (
                          <div className="mt-3 flex items-baseline gap-1">
                            <span className="text-2xl font-bold" style={{ color: config.buttonColor }}>ab 12,50€</span>
                            <span className="text-xs text-gray-400">pro Person</span>
                          </div>
                        )}
                        {config.showAvailability && (
                          <Badge className="mt-2 bg-green-100 text-green-700 hover:bg-green-100">Verfügbar</Badge>
                        )}
                      </div>
                      <button
                        className="w-full mt-4 py-2.5 text-white font-semibold rounded-lg"
                        style={{ backgroundColor: config.buttonColor, borderRadius: `${Math.min(parseInt(config.borderRadius), 12)}px` }}
                      >
                        {config.buttonText}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Code2 className="h-4 w-4 text-gray-600" />
                Einbettungscode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="iframe">
                <TabsList className="mb-4">
                  <TabsTrigger value="iframe">iFrame</TabsTrigger>
                  <TabsTrigger value="script">JavaScript</TabsTrigger>
                </TabsList>
                <TabsContent value="iframe">
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <code className="text-green-400 text-xs font-mono whitespace-pre">{iframeCode}</code>
                  </div>
                  <Button variant="outline" className="mt-3" onClick={() => handleCopy(iframeCode)}>
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? "Kopiert!" : "Code kopieren"}
                  </Button>
                </TabsContent>
                <TabsContent value="script">
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <code className="text-green-400 text-xs font-mono whitespace-pre">{embedCode}</code>
                  </div>
                  <Button variant="outline" className="mt-3" onClick={() => handleCopy(embedCode)}>
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? "Kopiert!" : "Code kopieren"}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}